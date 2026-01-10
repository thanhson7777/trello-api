/* eslint-disable no-useless-catch */
/*
 */
import { slugify } from '~/utils/formatters'
import { boardModel } from '~/models/boardModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'

const createNew = async (reqBody) => {
  try {
    // Xử lí logic dữ liệu tùy đặc thù dự án
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }

    // Gọi tới tầng Model để xử lí bản ghi newBoard vào trong database
    const createdBoard = await boardModel.createNew(newBoard)
    // console.log('createdBoard: ', createdBoard)

    // Lấy bản ghi board sau khi gọi (tùy mục đích và tùy theo dự án)
    const getNewBoard = await boardModel.findOneById(createdBoard.insertedId)
    // console.log('getNewBoard: ', getNewBoard)

    // Làm thêm các xử lý khác với collection tùy đặc thù dự án
    // Gửi email, notification cho admin khi có board mới được tạo

    // Trả về kết quả, LUÔN PHẢI CÓ RETURN trong service
    return getNewBoard
  } catch (error) {
    throw error
  }
}

const getDetails = async (boardId) => {
  try {
    // console.log(boardId)
    const board = await boardModel.getDetails(boardId)
    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!!')
    }

    // 1. Deep clone ra một cái mới để xử lí, không ảnh hưởng đến board ban đầu
    const resBoard = cloneDeep(board)
    // 2. Đưa card về đúng column
    resBoard.columns.forEach(column => {
      // Trong MongoDb  có suport method .equal cho kiểu objectId
      column.cards = resBoard.cards.filter(card => card.columnId.equals(column._id))

      // do id của card có kiểu dữ liệu là objectId nên phải chuyển sang string để so sánh của javascript
      // column.cards = resBoard.cards.filter(card => card.columnId.toString() === column._id.toString())
    })

    // 3. Xóa mảng card khỏi board ban đầu
    delete resBoard.cards

    return resBoard
  } catch (error) { throw error }
}

const update = async (boardId, resBody) => {
  try {
    const updateData = {
      ...resBody,
      updatedAt: Date.now()
    }
    const updatedBoard = await boardModel.update(boardId, updateData)

    return updatedBoard
  } catch (error) { throw error }
}

export const boardService = {
  createNew,
  getDetails,
  update
}
