import { NextFunction, Request, Response, Router } from 'express'
import { authSvc } from './api'
import { constants } from 'http2'
import { validate } from 'class-validator'
import { LoginDto } from '../models/auth'
import { RequestContext } from '../models/request'
const router = Router()

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ctx = req.context as unknown as RequestContext
    const dto = Object.assign(new LoginDto(), req.body) as LoginDto

    const errors = await validate(dto)

    if (errors.length > 0) {
      return res.status(constants.HTTP_STATUS_BAD_REQUEST).json(errors)
    }
    const user = await authSvc.login(ctx, dto)
    return res.status(constants.HTTP_STATUS_OK).json(user)
  } catch (e) {
    next(e)
  }
}

router.post('/login', login)

export const authHandlers = router
