/* eslint-disable no-useless-catch */
/*
 */
import { slugify } from '~/utils/formatters'

const createNew = async (reqBody) => {
  try {
    // Xử lí logic dữ liệu tùy đặc thù dự án
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }

    // Gọi tới tầng Model để xử lí bản ghi newBoard vào trong database
    //
    // Làm thêm các xử lý khác với collection tùy đặc thù dự án
    // Gửi email, notification cho admin khi có board mới được tạo

    // Trả về kết quả, LUÔN PHẢI CÓ RETURN trong service
    return newBoard
  } catch (error) {
    throw error
  }
}

export const boardService = {
  createNew
}
