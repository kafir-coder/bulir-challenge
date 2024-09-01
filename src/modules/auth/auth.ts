import { jwt_secret } from '../../config'
import { IAuthSvc } from '../../interfaces/auth'
import { LoginDto } from '../../models/auth'
import { IUserRepo } from '../user/repository/repository'
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import { Unauthorized } from '../../common/errors/unathourized'
import { RequestContext } from '../../models/request'
export class AuthSvc implements IAuthSvc {
  constructor(private readonly userRepo: IUserRepo) {}
  async login(
    _ctx: RequestContext,
    params: LoginDto,
  ): Promise<Record<string, any>> {
    // Find user by email
    const user = await this.userRepo.getByEmail(params.email)

    if (!user) {
      throw new Unauthorized('User not found')
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(params.password, user.password)
    if (!isPasswordValid) {
      throw new Unauthorized('kkkkk')
    }

    // Generate JWT token
    const payload = { id: user.id, email: user.email, role: user.role }

    const token = jwt.sign(payload, jwt_secret, { expiresIn: '1h' })

    // Return token payload
    return {
      accessToken: token,
      expiresIn: 3600, // 1 hour
    }
  }
}
