import { NextFunction, Request, Response, Router } from 'express'
import { serviceBookingSvc } from './api'
import { constants } from 'http2'
import {
  BookingHistoryParams,
  BookServiceDto,
  CreateServiceDto,
} from '../models/service'
import { validate } from 'class-validator'
import { RequestContext } from '../models/request'
const router = Router()

export const createService = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ctx = req.context as unknown as RequestContext
    const dto = Object.assign(new CreateServiceDto(), req.body)
    const errors = await validate(dto)
    if (errors.length > 0) {
      return res.status(constants.HTTP_STATUS_BAD_REQUEST).json(errors)
    }
    const service = await serviceBookingSvc.createService(ctx, dto)
    return res.status(constants.HTTP_STATUS_CREATED).json(service)
  } catch (error) {
    next(error)
  }
}

export const getService = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ctx = req.context as unknown as RequestContext
    const service = await serviceBookingSvc.getService(ctx, req.params.id)
    return res.status(constants.HTTP_STATUS_OK).json(service)
  } catch (error) {
    next(error)
  }
}

export const bookService = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ctx = req.context as unknown as RequestContext
    const dto = Object.assign(new BookServiceDto(), req.query) as BookServiceDto
    const errors = await validate(dto)
    if (errors.length > 0) {
      return res.status(constants.HTTP_STATUS_BAD_REQUEST).json(errors)
    }

    const booking = await serviceBookingSvc.bookService(ctx, {
      clientId: ctx.user?.id!,
      serviceId: req.params.id,
      bookingDate: dto.bookingDate,
    })
    return res.status(constants.HTTP_STATUS_OK).json(booking)
  } catch (error) {
    next(error)
  }
}

export const cancelBooking = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ctx = req.context as unknown as RequestContext
    await serviceBookingSvc.cancelServiceBooking(ctx, req.params.bid)
    return res.sendStatus(constants.HTTP_STATUS_OK)
  } catch (error) {
    next(error)
  }
}

export const getBooking = async (req: Request, res: Response) => {
  const ctx = req.context as unknown as RequestContext
  const booking = await serviceBookingSvc.getBooking(ctx, req.params.bid)
  res.status(constants.HTTP_STATUS_OK).json(booking)
}

export const getBookingHistory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ctx = req.context as unknown as RequestContext

    const dto = Object.assign(
      new BookingHistoryParams(),
      req.query,
    ) as BookingHistoryParams

    const errors = await validate(dto)
    if (errors.length > 0) {
      return res.status(constants.HTTP_STATUS_BAD_REQUEST).json(errors)
    }
    const history = await serviceBookingSvc.getBookingHistory(ctx, dto)
    res.status(constants.HTTP_STATUS_OK).json(history)
  } catch (error) {
    next(error)
  }
}

router.post('', createService)
router.get('/:id', getService)
router.post('/:id/book', bookService)
router.post('/:id/book/:bid/cancel', cancelBooking)
router.get('/:id/book/history', getBookingHistory)
router.get('/:id/book/:bid', getBooking)

export const serviceBookingHandlers = router
