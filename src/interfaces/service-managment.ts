import { RequestContext } from '../models/request'
import {
  BookingHistoryParams,
  BookServiceDto,
  CreateServiceDto,
  Service,
  ServiceBooking,
  ServiceFilterDto,
  UpdateServiceDto,
} from '../models/service'
export interface IServiceManagmentSvc {
  createService(ctx: RequestContext, params: CreateServiceDto): Promise<Service>
  getService(ctx: RequestContext, id: string): Promise<Service>
  updateService(
    ctx: RequestContext,
    id: string,
    dto: UpdateServiceDto,
  ): Promise<Service>
  listServices(
    ctx: RequestContext,
    filters: ServiceFilterDto,
  ): Promise<{ services: Service[]; total: number }>
  deleteService(ctx: RequestContext, id: string): void
  bookService(ctx: RequestContext, params: BookServiceDto): void
  cancelServiceBooking(ctx: RequestContext, serviceId: string): void
  getBookingHistory(
    ctx: RequestContext,
    params: BookingHistoryParams,
  ): Promise<{ serviceBookings: ServiceBooking[]; total: number }>
  getBooking(ctx: RequestContext, bookingId: string): Promise<ServiceBooking>
}
