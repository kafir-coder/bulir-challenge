import { Column, Entity, ManyToOne, OneToMany } from 'typeorm'
import { User } from './user'
import {
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator'
import { Base, Pagination } from './base'

@Entity()
export class Service extends Base {
  @Column()
  name: string

  @Column('text')
  description: string

  @Column('decimal')
  fee: number

  @ManyToOne(() => User, (user) => user.services)
  serviceProvider: User

  @OneToMany(() => ServiceBooking, (booking) => booking.service)
  bookings: ServiceBooking[]
}

@Entity()
export class ServiceBooking extends Base {
  @Column()
  bookingDate: Date

  @Column()
  status: 'pending' | 'cancelled'

  @ManyToOne(() => User, (user) => user.bookings)
  client: User

  @ManyToOne(() => Service, (service) => service.bookings)
  service: Service

  @ManyToOne(() => User, (user) => user.bookings)
  serviceProvider: User
}

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsNotEmpty()
  description: string

  @IsNumber()
  @IsNotEmpty()
  fee: number
}

export class BookServiceDto {
  @IsOptional()
  @IsUUID()
  serviceId: string

  @IsOptional()
  @IsUUID()
  clientId: string

  @ValidateIf((o) => typeof o.bookingDate === 'string')
  @IsNotEmpty()
  @IsISO8601()
  bookingDate: Date
}

export class BookingHistoryParams extends Pagination {
  serviceProviderId: string
  clientId: string
}

export class ServiceFilterDto extends Pagination {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  s?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsNumber()
  minFee?: number

  @IsOptional()
  @IsNumber()
  maxFee?: number

  @IsOptional()
  @IsString()
  serviceProviderId?: string
}

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export class UpdateServiceDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsNumber()
  fee?: number
}
