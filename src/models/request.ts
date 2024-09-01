export interface RequestContext {
  user?: TokenPayload
}

export enum UserRole {
  Client = 'Client',
  ServiceProvider = 'ServiceProvider',
}

declare module 'express-serve-static-core' {
  interface Request {
    context?: RequestContext
  }
}

export interface TokenPayload {
  id: string
  email: string
  nif?: string
  role: UserRole
}
