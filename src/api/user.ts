import { NextFunction, Request, Response, Router } from 'express'
import { userSvc } from './api'
import { constants } from 'http2'
import { validate } from 'class-validator'
import { CreateUserDto, UpdateUserdto } from '../models/user'
import { RequestContext } from '../models/request'
import authenticateJWT from '../utils/http/middleware/jwt'
const router = Router()

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ctx = req.context as unknown as RequestContext
    const dto = Object.assign(new CreateUserDto(), req.body) as CreateUserDto
    dto.updateNif()
    const errors = await validate(dto)

    if (errors.length > 0) {
      return res.status(constants.HTTP_STATUS_BAD_REQUEST).json(errors)
    }
    const user = await userSvc.createUser(ctx, dto)
    return res.status(constants.HTTP_STATUS_CREATED).json(user)
  } catch (error) {
    next(error)
  }
}

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ctx = req.context as unknown as RequestContext
    const id = req.params.id
    const user = await userSvc.getUser(ctx, id)
    return res.status(constants.HTTP_STATUS_CREATED).json(user)
  } catch (error) {
    next(error)
  }
}

export const profile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ctx = req.context as unknown as RequestContext
    const user = await userSvc.profile(ctx)
    return res.status(constants.HTTP_STATUS_OK).json(user)
  } catch (error) {
    next(error)
  }
}
export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ctx = req.context as unknown as RequestContext

    const dto = Object.assign(new UpdateUserdto(), req.body) as UpdateUserdto

    const errors = await validate(dto)
    if (errors.length > 0) {
        return res.status(constants.HTTP_STATUS_BAD_REQUEST).json(errors)
      }

    const user = await userSvc.updateUser(ctx, req.params.id, dto)
    return res.status(constants.HTTP_STATUS_OK).json(user)
  } catch (error) {
    next(error)
  }
}
router.post('', createUser)
router.get('/profile', authenticateJWT, profile)
router.get('/:id', getUser)
router.patch("/:id", authenticateJWT, updateUser)

export const userHandlers = router
