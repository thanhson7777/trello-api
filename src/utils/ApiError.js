// Định nghĩa class ApiError kế thừa  class error có sẵn
class ApiError extends Error {
  constructor(statusCode, message) {
    // Gọi tới hàm khởi tạo của lớp cha để sử dụng được this,
    super(message)

    // Tên của cái custom Error này, nếu không có thì mặc định của nó là Error
    this.name = 'ApiError'

    // Gấn thêm http status code ở đây
    this.statusCode = statusCode
    // Ghi lại stack trace để thuận tiện debug
    Error.captureStackTrace(this, this.constructor)
  }
}

export default ApiError
