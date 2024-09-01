import dotenv from 'dotenv'

dotenv.config()

export const jwt_secret = process.env.JWT_SECRET || ''
export const token_expiration_time = process.env.JWT_EXPIRATION || ''
export const max_request_per_second = process.env.MAX_REQUEST_PER_SEC || ''
