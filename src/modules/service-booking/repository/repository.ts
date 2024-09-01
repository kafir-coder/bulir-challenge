import { Repository } from 'typeorm'
import {
  BookingHistoryParams,
  BookServiceDto,
  CreateServiceDto,
  Service,
  ServiceBooking,
  SortDirections,
} from '../../../models/service'
import { AppDataSource } from '../../../data-source'
import { User } from '../../../models/user'
import { NotFound } from '../../../common/errors/not-found'
import { Forbidden } from '../../../common/errors/forbiden'

export interface IServiceManagmentRepo {
  createService(params: Partial<Service>, providerId: string): Promise<Service>
  getService(id: string): Promise<Service | null>
  bookService(params: BookServiceDto): Promise<string>
  getServiceBooking(bookingId: string): Promise<ServiceBooking | null>
  cancelBooking(id: string): void
  getBookingHistory(params: BookingHistoryParams): Promise<ServiceBooking[]>
}

export class ServiceManagmentRepository implements IServiceManagmentRepo {
  private serviceRepo: Repository<Service>
  private serviceBookingRepo: Repository<ServiceBooking>

  constructor() {
    this.serviceRepo = AppDataSource.getRepository(Service)
    this.serviceBookingRepo = AppDataSource.getRepository(ServiceBooking)
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
          throw new NotFound('Service or Client not found')
        }

        const serviceProvider = await transactionalEntityManager.findOneBy(
          User,
          {
            id: service.serviceProvider.id,
          },
        )
        if (!serviceProvider) {
          throw new NotFound('Service Provider not found')
        }

        const serviceFee = Number(service.fee)
        const clientBalance = Number(client.balance)
        const serviceProviderBalance = Number(serviceProvider.balance)

        if (clientBalance < serviceFee) {
          throw new Forbidden('Insufficient balance')
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
          throw new NotFound('Booking not found')
        }

        if (booking.status === 'cancelled') {
          throw new Forbidden('Booking is already cancelled')
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

  async getBookingHistory({
    page = 1,
    limit = 10,
    sortBy = 'id',
    sortDirection = SortDirections.DESC,
  }: BookingHistoryParams): Promise<ServiceBooking[]> {
    const offset = (page - 1) * limit

    const bookings = await this.serviceBookingRepo.find({
      order: {
        [sortBy]: sortDirection,
      },
      skip: offset,
      take: limit,
      relations: ['service', 'client', 'serviceProvider'],
    })

    return bookings
  }
}
