import { LoginDto } from '../models/auth'
import { RequestContext } from '../models/request'

export interface IAuthSvc {
  login(ctx: RequestContext, params: LoginDto): Promise<Record<string, any>>
}
