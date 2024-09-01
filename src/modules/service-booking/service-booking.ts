import { IServiceManagmentSvc } from '../../interfaces/service-managment'
import {
  CreateServiceDto,
  Service,
  BookServiceDto,
  ServiceBooking,
  BookingHistoryParams,
} from '../../models/service'
import { IServiceManagmentRepo } from './repository/repository'
import { NotFound } from '../../common/errors/not-found'
import { Forbidden } from '../../common/errors/forbiden'
import { RequestContext, UserRole } from '../../models/request'
const { randomUUID } = require('crypto')

export class ServiceManagmentSvc implements IServiceManagmentSvc {
  constructor(private readonly repo: IServiceManagmentRepo) {}
  async createService(
    ctx: RequestContext,
    params: CreateServiceDto,
  ): Promise<Service> {
    if (ctx.user?.role != UserRole.ServiceProvider) {
      throw new Forbidden('must be a service provider')
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
      throw new NotFound('service not found')
    }
    return service
  }

  async bookService(ctx: RequestContext, params: BookServiceDto) {
    if (ctx.user?.role !== UserRole.Client) {
      throw new Forbidden('must be a client')
    }

    const currentDate = new Date()
    const bookingDate = new Date(params.bookingDate)

    if (bookingDate < currentDate) {
      throw new Forbidden('Cannot book a service with a past date.')
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
      throw new NotFound('booking not found')
    }

    if (
      booking.client.id !== ctx.user?.id &&
      ctx.user?.role !== UserRole.ServiceProvider
    ) {
      throw new Forbidden('must be the owner or a service provider')
    }

    return booking
  }

  async cancelServiceBooking(ctx: RequestContext, bookingId: string) {
    const booking = await this.repo.getServiceBooking(bookingId)

    if (!booking) {
      throw new NotFound('booking not found')
    }

    if (booking.client.id !== ctx.user?.id) {
      throw new Forbidden('must be the owner')
    }
    await this.repo.cancelBooking(booking.id)
  }
  async getBookingHistory(
    _ctx: RequestContext,
    params: BookingHistoryParams,
  ): Promise<ServiceBooking[]> {
    return this.repo.getBookingHistory(params)
  }
}
