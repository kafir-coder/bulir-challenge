export class BadRequest extends Error {
  isBadRequest = false
  constructor(message: string) {
    super()
    this.name = 'BadRequest'
    this.message = message
    this.isBadRequest = true
  }
}
