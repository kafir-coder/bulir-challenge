import rateLimit from 'express-rate-limit'
import { max_request_per_second } from '../../config'

export const rateLimiter = rateLimit({
  max: max_request_per_second as unknown as number,
  message: 'You have exceeded the 100 requests in 24 hrs limit!',
  standardHeaders: true,
  legacyHeaders: false,
})
