import { userModel } from '~/models/userModel'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { pickUser } from '~/utils/formatters'
import { WEBSITE_DOMAIN } from '~/utils/constants'
import { BrevoProvider } from '~/providers/BrevoProvider'
import { env } from '~/config/environment'
import { JwtProvider } from '~/providers/JwtProvider'

const createNew = async (reqBody) => {
  try {
    // Kiểm tra xem email đã tồn tại trong hệ thống hay chưa
    const existUser = await userModel.findOneByEmail(reqBody.email)
    if (existUser) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email aldready exists!!')
    }
    // Tạo data để lưu vào database
    // Cắt chuỗi email từ @ và lấy phần tử đầu tiên
    const nameFromEmail = reqBody.email.split('@')[0]
    const newUser = {
      email: reqBody.email,
      password: bcryptjs.hashSync(reqBody.password, 8),
      username: nameFromEmail,
      displayName: nameFromEmail,
      verifyToken: uuidv4()
    }

    // Thực hiện lưu thông tin user vào trong database
    const createdUser = await userModel.createNew(newUser)
    const getNewUser = await userModel.findOneById(createdUser.insertedId)

    // Gửi email cho người dùng để xác thực tài khoản
    const verifyctionLink = `${WEBSITE_DOMAIN}/account/verifycation?email=${getNewUser.email}&token=${getNewUser.verifyToken}`
    const customSubject = 'Trello: please verify your email before using our services!'
    const htmlContent = `
      <h3>Here is your verify link: </h3>
      <h3>${verifyctionLink}</h3>
      <h3>Thanks,<br/> Trello - Thanh Sơn</h3>
    `

    // Gọi tới Provider gửi mail
    await BrevoProvider.sendEmail(getNewUser.email, customSubject, htmlContent)

    // Trả dữ liệu về cho contrller
    return pickUser(getNewUser)
  } catch (error) { throw error }
}

const verifyAccount = async (reqBody) => {
  try {
    // Query user  tron database
    const existUser = await userModel.findOneByEmail(reqBody.email)

    // Các bước kiểm tra cần thiết
    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    if (existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is already active!')
    if (reqBody.token !== existUser.verifyToken) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Token is invalid!')

    // Update lại thông tin user để verify tài khoản
    const updateData = {
      isActive: true,
      verifyToken: null
    }
    // Update thông tin user
    const updatedUser = await userModel.update(existUser._id, updateData)

    // Trả về cho fontend những thông tin cần thiết
    return pickUser(updatedUser)
  } catch (error) { throw error }
}

const login = async (reqBody) => {
  try {
    // Query user  tron database
    const existUser = await userModel.findOneByEmail(reqBody.email)

    // Các bước kiểm tra cần thiết
    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    if (!existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is not active!, Please check your email and verify your email before logging in!')

    if (!bcryptjs.compareSync(reqBody.password, existUser.password)) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your Eamil and Password is incorrect!')
    }

    // Tạo token đăng nhập để trả về cho frontend
    // Thông tin đính kèm trong JWT sẽ bao gồm _id và email của user
    const userInfo = {
      _id: existUser._id,
      email: existUser.email
    }

    // Tạo ra 2 loại token là accessToKen và refreshToken để trả về phía cho frontend
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      // 5 // 5 giây
      env.ACCESS_TOKEN_LIFE
    )

    const refreshToken = await JwtProvider.generateToken(
      userInfo,
      env.REFRESH_TOKEN_SECRET_SIGNATURE,
      // 15
      env.REFRESH_TOKEN_LIFE
    )

    // Trả về thông tin của user kèm theo 2 token vừa tạo ra
    return { accessToken, refreshToken, ...pickUser(existUser) }
  } catch (error) { throw error }
}

const refreshToken = async (clientRefreshToken) => {
  try {
    // verify refresh token xem có hợp lệ không
    const refreshTokenDecoded = await JwtProvider.verifyToken(clientRefreshToken, env.REFRESH_TOKEN_SECRET_SIGNATURE)

    // Lấy thông tin của user (vì thông tin này là unique và cố định) sau khi giải mã không cần query tới db
    const userInfo = {
      _id: refreshTokenDecoded._id,
      email: refreshTokenDecoded.email
    }

    // Tạo access token mới
    const accessToKen = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      // 5 // 5 giây để test access token hết hạn
      env.ACCESS_TOKEN_LIFE
    )

    return { accessToKen }
  } catch (error) { throw error }
}

export const userService = {
  createNew,
  verifyAccount,
  login,
  refreshToken
}
