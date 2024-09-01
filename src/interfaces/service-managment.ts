import { RequestContext } from '../models/request'
import {
  BookingHistoryParams,
  BookServiceDto,
  CreateServiceDto,
  Service,
  ServiceBooking,
} from '../models/service'
export interface IServiceManagmentSvc {
  createService(ctx: RequestContext, params: CreateServiceDto): Promise<Service>
  getService(ctx: RequestContext, id: string): Promise<Service>
  bookService(ctx: RequestContext, params: BookServiceDto): void
  cancelServiceBooking(ctx: RequestContext, serviceId: string): void
  getBookingHistory(
    ctx: RequestContext,
    params: BookingHistoryParams,
  ): Promise<ServiceBooking[]>
  getBooking(ctx: RequestContext, bookingId: string): Promise<ServiceBooking>
}
