import { Repository } from 'typeorm'
import {
  BookingHistoryParams,
  BookServiceDto,
  Service,
  ServiceBooking,
  ServiceFilterDto,
  UpdateServiceDto,
} from '../../../models/service'
import { AppDataSource } from '../../../data-source'
import { User } from '../../../models/user'
import { NotFound } from '../../../common/errors/not-found'
import { Forbidden } from '../../../common/errors/forbiden'
import { ErrorMessages } from '../../../common/errors/error-messages'

export interface IServiceManagmentRepo {
  createService(params: Partial<Service>, providerId: string): Promise<Service>
  getService(id: string): Promise<Service | null>
  existsByName(name: string): Promise<boolean>
  bookService(params: BookServiceDto): Promise<string>
  listServices(
    filter: ServiceFilterDto,
  ): Promise<{ services: Service[]; total: number }>
  updateService(id: string, updateData: UpdateServiceDto): Promise<Service>
  deleteService(id: string): void
  getServiceBooking(bookingId: string): Promise<ServiceBooking | null>
  cancelBooking(id: string): void
  getBookingHistory(
    filter: BookingHistoryParams,
  ): Promise<{ serviceBookings: ServiceBooking[]; total: number }>
}

export class ServiceManagmentRepository implements IServiceManagmentRepo {
  private serviceRepo: Repository<Service>
  private serviceBookingRepo: Repository<ServiceBooking>

  constructor() {
    this.serviceRepo = AppDataSource.getRepository(Service)
    this.serviceBookingRepo = AppDataSource.getRepository(ServiceBooking)
  }
  existsByName(name: string): Promise<boolean> {
    return this.serviceRepo.exists({ where: { name } })
  }
  async deleteService(id: string) {
    await this.serviceRepo.delete({ id })
  }

  async listServices(
    filter: ServiceFilterDto,
  ): Promise<{ services: Service[]; total: number }> {
    const queryBuilder = this.serviceRepo
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.serviceProvider', 'serviceProvider')

    if (filter.name) {
      queryBuilder.andWhere('service.name ILIKE :name', {
        name: `%${filter.name}%`,
      })
    }

    if (filter.description) {
      queryBuilder.andWhere('service.description ILIKE :description', {
        description: `%${filter.description}%`,
      })
    }

    if (filter.minFee) {
      queryBuilder.andWhere('service.fee >= :minFee', { minFee: filter.minFee })
    }

    if (filter.maxFee) {
      queryBuilder.andWhere('service.fee <= :maxFee', { maxFee: filter.maxFee })
    }

    if (filter.serviceProviderId) {
      queryBuilder.andWhere('service.serviceProvider.id = :serviceProviderId', {
        serviceProviderId: filter.serviceProviderId,
      })
    }

    const page = filter.page
    const limit = filter.limit
    queryBuilder.skip((page - 1) * limit).take(limit)

    queryBuilder.orderBy('service.created_at', 'DESC')
    const total = await queryBuilder.getCount()

    const services = await queryBuilder.getMany()

    return { services, total }
  }

  async updateService(
    id: string,
    updateData: UpdateServiceDto,
  ): Promise<Service> {
    const service = await this.serviceRepo.findOneBy({ id })

    if (!service) {
      throw new NotFound(ErrorMessages.resource_not_found)
    }

    if (updateData.name) service.name = updateData.name
    if (updateData.description) service.description = updateData.description
    if (updateData.fee !== undefined) service.fee = updateData.fee

    return await this.serviceRepo.save(service)
  }
  async createService(params: Partial<Service>, providerId: string) {
    const service = await this.serviceRepo.create({
      serviceProvider: { id: providerId },
      ...params,
    })
    return this.serviceRepo.save(service)
  }

  async getService(id: string) {
    return this.serviceRepo.findOne({
      where: {
        id,
      },
      relations: ['bookings', 'serviceProvider'],
    })
  }

  async bookService(params: BookServiceDto) {
    const { serviceId, bookingDate, clientId } = params
    const bookingId = await this.serviceRepo.manager.transaction(
      async (transactionalEntityManager) => {
        const service = await transactionalEntityManager.findOne(Service, {
          where: { id: serviceId },
          relations: ['serviceProvider'],
        })

        const client = await transactionalEntityManager.findOneBy(User, {
          id: clientId,
        })
        if (!service || !client) {
          throw new NotFound(ErrorMessages.resource_not_found)
        }

        const serviceProvider = await transactionalEntityManager.findOneBy(
          User,
          {
            id: service.serviceProvider.id,
          },
        )
        if (!serviceProvider) {
          throw new NotFound(ErrorMessages.resource_not_found)
        }

        const serviceFee = Number(service.fee)
        const clientBalance = Number(client.balance)
        const serviceProviderBalance = Number(serviceProvider.balance)

        if (clientBalance < serviceFee) {
          throw new Forbidden(ErrorMessages.insufficient_balance)
        }

        client.balance = clientBalance - serviceFee
        serviceProvider.balance = serviceProviderBalance + serviceFee

        const booking = this.serviceBookingRepo.create({
          service,
          client,
          serviceProvider,
          bookingDate,
          status: 'pending',
        })

        await transactionalEntityManager.save(User, [client, serviceProvider])
        const savedBooking = await transactionalEntityManager.save(
          ServiceBooking,
          booking,
        )

        return savedBooking.id
      },
    )

    return bookingId
  }

  async getServiceBooking(bookingId: string): Promise<ServiceBooking | null> {
    const booking = await this.serviceBookingRepo.findOne({
      where: { id: bookingId },
      relations: ['service', 'client', 'serviceProvider'],
    })
    return booking
  }

  async cancelBooking(bookingId: string) {
    await this.serviceRepo.manager.transaction(
      async (transactionalEntityManager) => {
        const booking = await transactionalEntityManager.findOne(
          ServiceBooking,
          {
            where: { id: bookingId },
            relations: ['client', 'serviceProvider', 'service'],
          },
        )

        if (!booking) {
          throw new NotFound(ErrorMessages.resource_not_found)
        }

        if (booking.status === 'cancelled') {
          throw new Forbidden(ErrorMessages.already_cancelled_booking)
        }

        booking.status = 'cancelled'
        await transactionalEntityManager.save(ServiceBooking, booking)

        const serviceFee = Number(booking.service.fee)
        if (booking) {
          booking.serviceProvider.balance -= serviceFee
          await transactionalEntityManager.save(User, booking.serviceProvider)
        }

        if (booking.client) {
          booking.client.balance += serviceFee
          await transactionalEntityManager.save(User, booking.client)
        }
      },
    )
  }

  async getBookingHistory(
    filter: BookingHistoryParams,
  ): Promise<{ serviceBookings: ServiceBooking[]; total: number }> {
    const queryBuilder = this.serviceBookingRepo
      .createQueryBuilder('serviceBooking')
      .leftJoinAndSelect('serviceBooking.client', 'client')
      .leftJoinAndSelect('serviceBooking.serviceProvider', 'serviceProvider')
      .leftJoinAndSelect('serviceBooking.service', 'service')

    if (filter.clientId) {
      queryBuilder.andWhere('serviceBooking.client.id = :clientId', {
        clientId: filter.clientId,
      })
    }

    if (filter.serviceProviderId) {
      queryBuilder.andWhere(
        'serviceBooking.serviceProvider.id = :serviceProviderId',
        {
          serviceProviderId: filter.serviceProviderId,
        },
      )
    }

    const page = filter.page
    const limit = filter.limit
    queryBuilder.skip((page - 1) * limit).take(limit)

    const total = await queryBuilder.getCount()
    queryBuilder.orderBy('serviceBooking.created_at', 'DESC')

    const serviceBookings = await queryBuilder.getMany()

    return { serviceBookings, total }
  }
}
