import { randomUUID } from 'crypto'
import { IUserSvc } from '../../interfaces/user'
import { CreateUserDto, User } from '../../models/user'
import { IUserRepo } from './repository/repository'
import bcrypt from 'bcryptjs'
import { BadRequest } from '../../common/errors/bad-request'
import { NotFound } from '../../common/errors/not-found'
import { RequestContext, UserRole } from '../../models/request'
import { ErrorMessages } from '../../common/errors/error-messages'
export class UserSvc implements IUserSvc {
  constructor(private readonly repo: IUserRepo) {}

  async createUser(ctx: RequestContext, params: CreateUserDto) {
    const emailExists = await this.repo.emailExists(params.email)

    if (emailExists) {
      throw new BadRequest(ErrorMessages.user_already_exists)
    }

    if (params.role === UserRole.ServiceProvider) {
      const nifExists = await this.repo.nifExists(params.nif)
      if (nifExists) {
        throw new BadRequest(ErrorMessages.user_already_exists)
      }
    }

    const hashedPassword = await bcrypt.hash(params.password as string, 10)
    const userId = randomUUID() as string
    return this.repo.createUser({
      id: userId,
      fullName: params.fullname,
      nif: params.nif,
      email: params.email,
      password: hashedPassword,
      role: params.role,
      balance: params.balance,
    })
  }

  async profile(ctx: RequestContext) {
    const user = await this.getUser(ctx, ctx.user?.id!)
    return user
  }
  async getUser(_ctx: RequestContext, id: string) {
    const user = await this.repo.getUser(id)

    if (!user) {
      throw new NotFound(ErrorMessages.resource_not_found)
    }

    return user
  }
  async getBalance(_ctx: RequestContext, id: string) {
    const balance = await this.repo.getBalance(id)

    if (!balance) {
      throw new NotFound(ErrorMessages.resource_not_found)
    }
    return balance
  }
}
