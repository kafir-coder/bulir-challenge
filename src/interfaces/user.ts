import { RequestContext } from '../models/request'
import { CreateUserDto, User } from '../models/user'

export interface IUserSvc {
  createUser(ctx: RequestContext, params: CreateUserDto): Promise<User>
  getUser(ctx: RequestContext, id: string): Promise<User>
  getBalance(ctx: RequestContext, id: string): Promise<number>
}
