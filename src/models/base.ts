import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator'
import {
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity()
export class Base {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updated_at: Date

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date
}

export enum SortDirections {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class Pagination {
  @IsOptional()
  @IsNumber()
  @Min(1)
  page: number = 1

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit: number = 10

  @IsOptional()
  sortBy?: string

  @IsOptional()
  @IsEnum(SortDirections)
  sortDirection?: SortDirections
}
