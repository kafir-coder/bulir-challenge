import { IServiceManagmentSvc } from '../../interfaces/service-managment'
import {
  CreateServiceDto,
  Service,
  BookServiceDto,
  ServiceBooking,
  BookingHistoryParams,
  UpdateServiceDto,
  ServiceFilterDto,
} from '../../models/service'
import { IServiceManagmentRepo } from './repository/repository'
import { NotFound } from '../../common/errors/not-found'
import { Forbidden } from '../../common/errors/forbiden'
import { RequestContext, UserRole } from '../../models/request'
import { ErrorMessages } from './error-messages'
const { randomUUID } = require('crypto')

export class ServiceManagmentSvc implements IServiceManagmentSvc {
  constructor(private readonly repo: IServiceManagmentRepo) {}

  async deleteService(ctx: RequestContext, id: string) {
    const service = await this.getService(ctx, id)

    if (service.serviceProvider.id !== ctx.user?.id) {
      throw new Forbidden(ErrorMessages.unable_to_delete_booking)
    }

    await this.repo.deleteService(id)
  }

  async createService(
    ctx: RequestContext,
    params: CreateServiceDto,
  ): Promise<Service> {
    if (ctx.user?.role != UserRole.ServiceProvider) {
      throw new Forbidden(ErrorMessages.must_be_a_service_provider)
    }

    const exists = await this.repo.existsByName(params.name)
    if (exists) {
      throw new Forbidden(ErrorMessages.service_already_exists)
    }
    const serviceId = randomUUID() as string
    return this.repo.createService(
      {
        id: serviceId,
        name: params.name,
        description: params.description,
        fee: params.fee,
      },
      ctx.user?.id,
    )
  }
  async getService(ctx: RequestContext, id: string): Promise<Service> {
    const service = await this.repo.getService(id)

    if (!service) {
      throw new NotFound(ErrorMessages.resource_not_found)
    }
    return service
  }

  async updateService(
    ctx: RequestContext,
    id: string,
    dto: UpdateServiceDto,
  ): Promise<Service> {
    return await this.repo.updateService(id, dto)
  }

  async listServices(
    ctx: RequestContext,
    filters: ServiceFilterDto,
  ): Promise<{ services: Service[]; total: number }> {
    if (ctx.user?.role === UserRole.ServiceProvider) {
      filters.serviceProviderId = ctx.user?.id
    }
    return await this.repo.listServices(filters)
  }

  async bookService(ctx: RequestContext, params: BookServiceDto) {
    if (ctx.user?.role !== UserRole.Client) {
      throw new Forbidden(ErrorMessages.must_be_a_client)
    }

    const currentDate = new Date()
    const bookingDate = new Date(params.bookingDate)

    if (bookingDate < currentDate) {
      throw new Forbidden(ErrorMessages.cannot_book_past_date)
    }

    const bookingId = await this.repo.bookService(params)

    return this.getBooking(ctx, bookingId)
  }

  async getBooking(
    ctx: RequestContext,
    bookingId: string,
  ): Promise<ServiceBooking> {
    const booking = await this.repo.getServiceBooking(bookingId)

    if (!booking) {
      throw new NotFound(ErrorMessages.resource_not_found)
    }

    if (booking.client?.id !== ctx.user?.id) {
      throw new Forbidden(ErrorMessages.must_be_the_booking_owner)
    }

    return booking
  }

  async cancelServiceBooking(ctx: RequestContext, bookingId: string) {
    const booking = await this.repo.getServiceBooking(bookingId)

    if (!booking) {
      throw new NotFound(ErrorMessages.resource_not_found)
    }

    if (booking.client.id !== ctx.user?.id) {
      throw new Forbidden(ErrorMessages.only_owner_can_cancel)
    }
    await this.repo.cancelBooking(booking.id)
  }
  async getBookingHistory(
    ctx: RequestContext,
    params: BookingHistoryParams,
  ): Promise<{ serviceBookings: ServiceBooking[]; total: number }> {
    if (ctx.user?.role === UserRole.Client) {
      params.clientId = ctx.user.id
    } else {
      params.serviceProviderId = ctx.user?.id!
    }
    return this.repo.getBookingHistory(params)
  }
}
