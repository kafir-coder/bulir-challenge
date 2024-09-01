import { Request, NextFunction, Response } from 'express'

import jwt from 'jsonwebtoken'
import { TokenPayload } from '../../../models/request'

const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Authentication token is missing' })
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' })
    }
    req.context = {
      user: user as TokenPayload,
    }

    next()
  })
}

export default authenticateJWT
