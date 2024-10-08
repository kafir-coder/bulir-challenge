import { DataSource } from 'typeorm'
import { User } from './models/user'
import { Service, ServiceBooking } from './models/service'
import dotenv from 'dotenv'
import { isTypeScriptFile } from './utils/helpers/is-ts-file'
dotenv.config()
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [User, Service, ServiceBooking],
  migrations: isTypeScriptFile()
    ? ['src/migrations/*.ts'] // In development, use TypeScript
    : ['dist/migrations/*.js'],
  synchronize: false,
  logging: false,
})
