import { jwt_secret, token_expiration_time } from '../../config'
import { IAuthSvc } from '../../interfaces/auth'
import { LoginDto } from '../../models/auth'
import { IUserRepo } from '../user/repository/repository'
import bcrypt from 'bcryptjs'
import * as jwt from 'jsonwebtoken'
import { Unauthorized } from '../../common/errors/unathourized'
import { RequestContext } from '../../models/request'
export class AuthSvc implements IAuthSvc {
  constructor(private readonly userRepo: IUserRepo) {}
  async login(_ctx: RequestContext, params: LoginDto) {
    let user

    if (params.nif) {
      user = await this.userRepo.getUserByNif(params.nif)
    } else {
      user = await this.userRepo.getByEmail(params.email)
    }
    if (!user) {
      throw new Unauthorized('User not found')
    }

    const isPasswordValid = await bcrypt.compare(params.password, user.password)
    if (!isPasswordValid) {
      throw new Unauthorized('Password is not valid')
    }

    const payload = { id: user.id, email: user.email, role: user.role }

    const token = jwt.sign(payload, jwt_secret, {
      expiresIn: token_expiration_time,
    })

    return {
      accessToken: token,
      expiresIn: token_expiration_time,
    }
  }
}
