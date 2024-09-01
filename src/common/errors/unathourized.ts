export class Unauthorized extends Error {
  isUnauthorized: boolean = true
  constructor(message: string) {
    super()
    this.name = 'Unauthorized'
    this.message = message
    this.isUnauthorized = true
  }
}
