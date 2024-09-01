export class NotFound extends Error {
  isNotFound: boolean
  constructor(message: string) {
    super()
    this.name = 'NotFound'
    this.message = message
    this.isNotFound = true
  }
}
