export class Forbidden extends Error {
  isForbidden = false
  constructor(message: string) {
    super()
    this.name = 'Forbidden'
    this.message = message
    this.isForbidden = true
  }
}
