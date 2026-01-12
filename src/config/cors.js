import { WHITELIST_DOMAINS } from '~/utils/constants'
import { env } from '~/config/environment'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

// Cấu hình CORD option
export const corsOptions = {
  origin: function (origin, callback) {
    // Cho phép việc gọi API bằng Postman trên môi trường dev
    if (env.BUILD_MODE === 'dev') {
      return callback(null, true)
    }

    // Kiểm tra xem origin có phải là domain được chấp nhận hay không
    if (WHITELIST_DOMAINS.includes(origin)) {
      return callback(null, true)
    }

    // Ngược lại là trường hợp production

    // Nếu domain không được chấp nhập thì sẽ trả về lỗi
    return callback(new ApiError(StatusCodes.FORBIDDEN, `${origin} not allowed by our cors publicy`))
  },
  optionsSuccessStatus: 200,
  // Cors sẽ chấp nhận cookie từ request
  credentials: true
}
