import multer from 'multer'
import { LIMIT_COMMON_FILE_SIZE, ALLOW_COMMON_FILE_TYPES } from '~/utils/validator'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

// Kiểm tra xem file nào được chấp nhận
const customFileFilter = (req, file, callback) => {
  // console.log('Multer file:', file)
  // Trong multer kiểm tra dữ liệu bằng mimetype
  if (!ALLOW_COMMON_FILE_TYPES.includes(file.mimetype)) {
    const errorMessage = 'File type is invalid. Only accept jpg, jpeg and png'
    return callback(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage), null)
  }

  return callback(null, true)
}

// function upload file
const upload = multer({
  limits: { fileSize: LIMIT_COMMON_FILE_SIZE },
  fileFilter: customFileFilter
})

export const multerUploadMiddleWare = { upload }
