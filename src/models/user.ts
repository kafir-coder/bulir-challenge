import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { Service, ServiceBooking } from './service'
import {
  IsDecimal,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateIf,
} from 'class-validator'
import { Base } from './base'
import { UserRole } from './request'

@Entity()
export class User extends Base {
  @Column()
  fullName: string

  @Column({ nullable: true })
  nif: string

  @Column({ unique: true })
  email: string

  @Column()
  password: string

  @Column()
  role: UserRole

  @Column()
  balance: number

  @OneToMany(() => Service, (service) => service.serviceProvider)
  services: Service[]

  @OneToMany(() => ServiceBooking, (booking) => booking.client)
  bookings: ServiceBooking[]
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  fullname: string

  @IsEmail()
  @IsNotEmpty()
  email: string

  @IsString()
  @IsNotEmpty()
  password: string

  @IsString()
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole

  @ValidateIf((o) => o.role === UserRole.ServiceProvider)
  @IsString()
  @IsNotEmpty()
  nif: string

  @IsNumber()
  @IsNotEmpty()
  balance: number

  updateNif() {
    if (this.role === UserRole.Client) {
      this.nif = ''
    }
  }
}
