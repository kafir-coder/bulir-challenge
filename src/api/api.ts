import { AppDataSource } from '../data-source'
import { IAuthSvc } from '../interfaces/auth'
import { IServiceManagmentSvc } from '../interfaces/service-managment'
import { IUserSvc } from '../interfaces/user'
import { AuthSvc } from '../modules/auth/auth'
import { ServiceManagmentRepository } from '../modules/service-booking/repository/repository'
import { ServiceManagmentSvc } from '../modules/service-booking/service-booking'
import { UserRepo } from '../modules/user/repository/repository'
import { UserSvc } from '../modules/user/user'

export let serviceBookingSvc: IServiceManagmentSvc
export let userSvc: IUserSvc
export let authSvc: IAuthSvc

export const start = async () => {
  AppDataSource.initialize()
    .then(() => {
      console.log('Data Source has been initialized!')
    })
    .catch((err) => {
      console.error('Error during Data Source initialization:', err)
    })

  const userRepo = new UserRepo()
  userSvc = new UserSvc(userRepo)

  const serviceManagmentRepository = new ServiceManagmentRepository()
  serviceBookingSvc = new ServiceManagmentSvc(serviceManagmentRepository)

  authSvc = new AuthSvc(userRepo)
}
