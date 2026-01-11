/*
 */
import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { BOARD_TYPES } from '~/utils/constants'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validator'

const createNew = async (req, res, next) => {
  // Note: Mặc định chúng ta không cần custom message ở phía backend vì ở phía Frontend đã validate và custom rồi
  // Backend chỉ cần validate để trả về giá trị chính xác, và trả về message của thư viện là được và ĐIỀU QUAN TRỌNG LÀ: Backend luôn luôn validate dữ liệu vì đây là điểm cuối cùng trước khi lưu vào database (đảm bảo về bảo mật và sự chuẩn xác của dữ liệu)
  // Và điều tốt nhất là luôn validata cả ở frontend lẫn backend
  const correctCondition = Joi.object({
    // trim phải đi kèm với strict
    title: Joi.string().required().min(3).max(50).trim().strict().messages({
      'any.required': 'Title is required',
      'string.empty': 'Title is not alowed to be empty',
      'string.min': 'Title length must be at least 3 characters long',
      'string.max': 'Title length must be less than or equal to 50 characters long',
      'string.trim': 'Title must not have leading or trailing whitespace'
    }),
    description: Joi.string().required().min(3).max(256).trim().strict().messages({
      'any.required': 'Description is required',
      'string.empty': 'Description is not alowed to be empty',
      'string.min': 'Description length must be at least 3 characters long',
      'string.max': 'Description length must be less than or equal to 50 characters long',
      'string.trim': 'Description must not have leading or trailing whitespace'
    }),
    type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE).required()
  })

  try {
    // abortEarly: false khi muốn trả về tất cả các lỗi, mặc định sẽ là true
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    // Nếu validate dữ liệu hợp lệ thì cho request đi qua controller
    next()
  } catch (error) {
    // console.log(error)
    // console.log(new Error(error))
    // const errorMessage = new Error(error).message
    // const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}
const update = async (req, res, next) => {
  // Khi update thì không cần require
  const correctCondition = Joi.object({
    title: Joi.string().min(3).max(50).trim().strict(),
    description: Joi.string().min(3).max(256).trim().strict(),
    type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE),
    columnOrderIds: Joi.array().items(
      Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    )
  })

  try {
    await correctCondition.validateAsync(req.body, {
      abortEarly: false,
      allowUnknown: true
    })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}
export const boardValidation = {
  createNew,
  update
}
