import { StatusCodes } from 'http-status-codes'
import { env } from '~/config/environment'

// Midleware xử lí lỗi tập trung trong ứng dụng backend NodeJS
export const errorHandlingMiddleware = (err, req, res, next) => {
  // Nếu dev không cẩn thân thiếu statusCode thì mặc định sẽ để INTERNAL_SERVER_ERROR (500)
  if (!err.statusCode) err.statusCode = StatusCodes.INTERNAL_SERVER_ERROR

  // Tạo ra biến muốn kiểm soát những gì trả về (resposeError)
  const responseError = {
    statusCode: err.statusCode,
    message: err.message || StatusCodes[err.statusCode], // Nếu lỗi mà khong có message thì lấy reasonPhrases chuẩn theo statusCode
    stack: err.stack
  }

  // console.log('responseError: ', responseError)

  // Chỉ khi trong môi trường dev thì để stack trace để dễ dàng trong việc debug, không thì xóa đi
  // console.log('env.BUILD_MODE: ', env.BUILD_MODE)
  if (env.BUILD_MODE !== 'dev') delete responseError.stack

  // Trả resposeError vè phía frontend
  res.status(responseError.statusCode).json(responseError)
}
