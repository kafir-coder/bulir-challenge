import { RequestContext } from '../models/request'
import { CreateUserDto, UpdateUserdto, User } from '../models/user'

export interface IUserSvc {
  createUser(ctx: RequestContext, params: CreateUserDto): Promise<User>
  getUser(ctx: RequestContext, id: string): Promise<User>
  getBalance(ctx: RequestContext, id: string): Promise<number>
  profile(ctx: RequestContext): Promise<User>
  updateUser(ctx: RequestContext, id: string, params: UpdateUserdto): void
}
