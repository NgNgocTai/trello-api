
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    //Ghi lại Stack Trace để thuận tiện cho việc debug
    Error.captureStackTrace(this,this.constructor)
  }
}
export default ApiError