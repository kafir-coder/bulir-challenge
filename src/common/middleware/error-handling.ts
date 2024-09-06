import { Request, Response, NextFunction } from 'express'
import { CustomError } from '../errors/error.interface'

function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const error = err as unknown as CustomError

  if (error.isBadRequest) {
    return res.status(400).json({ error: err.message })
  }
  if (error.isNotFound) {
    return res.status(404).json({ error: err.message })
  }

  if (error.isForbidden) {
    return res.status(403).json({ error: err.message })
  }

  if (error.isUnauthorized) {
    return res.status(401).json({ error: err.message })
  }
  return res.status(500).json({ error: 'Internal server error porra' })
}

export default errorHandler
