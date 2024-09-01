import { start } from './api/api'
import express from 'express'
import { serviceBookingHandlers } from './api/service-booking'
import morgan from 'morgan'
import { userHandlers } from './api/user'
import { authHandlers } from './api/auth'
import errorHandler from './common/middleware/error-handling'
import authenticateJWT from './utils/http/middleware/jwt'
import helmet from 'helmet'
import { rateLimiter } from './common/middleware/rate-limiter'
const app = express()

start().catch((e) => {
  console.log(e)
})

app.use(helmet())
app.use(express.json())
app.use(morgan('combined'))
app.use(rateLimiter)

app.use('/auth', authHandlers)
app.use('/services', authenticateJWT, serviceBookingHandlers)
app.use('/users', userHandlers)

app.use(errorHandler)

app.listen(process.env.PORT || 8080, () => {
  console.log(`App listening on port ${process.env.PORT || 8080}`)
})
