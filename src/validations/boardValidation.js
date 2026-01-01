/*
 */
import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'

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
    })
  })

  try {
    // abortEarly: false khi muốn trả về tất cả các lỗi, mặc định sẽ là true
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    // Nếu validate dữ liệu hợp lệ thì cho request đi qua controller
    next()
  } catch (error) {
    // console.log(error)
    // console.log(new Error(error))
    res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
      errors: new Error(error).message
    })
  }

}

export const boardValidation = {
  createNew
}
