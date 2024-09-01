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
import { Base } from './base'

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

export enum SortDirections {
  ASC = 'ASC',
  DESC = 'DESC',
}
export class BookingHistoryParams {
  @IsOptional()
  page?: number

  @IsOptional()
  limit?: number

  @IsOptional()
  sortBy?: string

  @IsOptional()
  @IsEnum(SortDirections)
  sortDirection?: SortDirections
}
