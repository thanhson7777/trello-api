import { StatusCodes } from 'http-status-codes'
import { JwtProvider } from '~/providers/JwtProvider'
import { env } from '~/config/environment'
import ApiError from '~/utils/ApiError'

// Middleware này sẽ có nhiệm vụ là: xác thực cái jwt accessToken nhận được từ phía frontend (từ authorizeAxios.js - withCredentials) có hợp lệ hay không
const isAuthorized = async (req, res, next) => {
  // Lấy accessToken nằm trong request cookie từ phía client gửi lên (từ authorizeAxios.js - withCredentials)
  const clientAccessToken = req.cookies?.accessToken

  // Nếu clientAccessToken không tồn tại thì trả về lỗi
  if (!clientAccessToken) {
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized! Token not found!'))
    return
  }

  try {
    // Bước 1: Thực hiện giải mã token xem có hợp lệ hay không
    const accessTokenDecoded = await JwtProvider.verifyToken(clientAccessToken, env.ACCESS_TOKEN_SECRET_SIGNATURE)
    // console.log('🚀 ~ isAuthorized ~ accessTokenDecoded:', accessTokenDecoded)
    // Bước 2: Nếu như token hợp lệ thì cần phải lưu thông tin giải mã được vào cái req.jwtDecoded, để sử dụng cho các tầng cần xử lí phía sau
    req.jwtDecoded = accessTokenDecoded
    // Bước 3: Cho phép request đi tiếp
    next()
  } catch (error) {
    // console.log('🚀 ~ isAuthorized ~ error:', error)
    // Nếu accesToken bị hết hàn thì cần trả về lỗi cụ thể (GONE - 410) để frontend gọi api refreshToken
    if (error?.message?.includes('jwt expired')) {
      next(new ApiError(StatusCodes.GONE, 'Need to refresh token!'))
      return
    }

    // Các lỗi khác ngoài accessToken hết hạn thì đều trả về lỗi 401 cho frontend gọi api sign out
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized!'))
  }

}

export const authMiddleware = {
  isAuthorized
}
