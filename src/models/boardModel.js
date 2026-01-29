import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validator'
import { BOARD_TYPES } from '~/utils/constants'
import { columnModel } from './columnModel'
import { cardModel } from './cardModel'
import { pagingSkipValue } from '~/utils/algorithms'
import { userModel } from './userModel'


// Define Collection ( name, schema)
const BOARD_COLLECTION_NAME = 'boards'
const BOARD_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(50).trim().strict(),
  slug: Joi.string().required().min(3).trim().strict(),
  description: Joi.string().required().min(3).max(256).trim().strict(),

  type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE).required(),

  columnOrderIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),

  // admin của board
  ownerIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),

  // Thành viên của board
  memberIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

// Chỉ định những trường không cho phép update
const INVALID_UPDATE_FIELDS = ['_id', 'createdAt']

const validateBeforeCreate = async (data) => {
  return await BOARD_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (userId, data) => {
  try {
    const validData = await validateBeforeCreate(data)

    const newBoardToAdd = {
      ...validData,
      ownerIds: [new ObjectId(String(userId))]
    }

    // console.log('validData: ', validData)

    // const createdBoard = await GET_DB().collection(BOARD_COLLECTION_NAME).insertOne(validData)
    // return createdBoard
    return await GET_DB().collection(BOARD_COLLECTION_NAME).insertOne(newBoardToAdd)
  } catch (error) { throw new Error(error) }
}

const findOneById = async (id) => {
  try {
    // console.log('Id: ', id)
    // const testId = new ObjectId(String(id))
    // console.log('tesstId: ', testId)
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOne({ _id: new ObjectId(String(id)) })
    return result
  } catch (error) { throw new Error(error) }
}

// Query tổng hợp (aggregate) lấy toàn bộ columns và cards thuộc về board
const getDetails = async (userId, boardId) => {
  try {
    // const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOne({ _id: new ObjectId(String(id)) })
    const queryConditions = [
      { _id: new ObjectId(String(boardId)) },
      { _destroy: false },
      {
        $or: [
          { ownerIds: { $all: [new ObjectId(String(userId))] } },
          { memberIds: { $all: [new ObjectId(String(userId))] } }
        ]
      }
    ]

    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).aggregate([
      { $match: { $and: queryConditions } },
      {
        $lookup: {
          from: columnModel.COLUMN_COLLECTION_NAME,
          localField: '_id',
          foreignField: 'boardId',
          as: 'columns'
        }
      },
      {
        $lookup: {
          from: cardModel.CARD_COLLECTION_NAME,
          localField: '_id',
          foreignField: 'boardId',
          as: 'cards'
        }
      },
      {
        $lookup: {
          from: userModel.USER_COLLECTION_NAME,
          localField: 'ownerIds',
          foreignField: '_id',
          as: 'owners',
          // pipeline trong lookup để xử lí một hoặc nhiều luồng cần thiết
          // $project để chỉ định một số field không cần lấy bằng cách gán nó bằng 0
          pipeline: [{ $project: { 'password': 0, 'verifyToken': 0 } }]
        }
      },
      {
        $lookup: {
          from: userModel.USER_COLLECTION_NAME,
          localField: 'memberIds',
          foreignField: '_id',
          as: 'members',
          pipeline: [{ $project: { 'password': 0, 'verifyToken': 0 } }]
        }
      }

    ]).toArray()
    // console.log('result: ', result)
    return result[0] || null
  } catch (error) { throw new Error(error) }
}

// Thêm một giá trị  columnId vào cuối mảng columnOrderIds
const pushColumnOrderIds = async (column) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(column.boardId)) },
      { $push: { columnOrderIds: new ObjectId(String(column._id)) } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw new Error(error) }
}

// Dùng toàn tử pull trong mongodb để lấy phần tử ra khởi mảng rồi xóa nó đi
const pullColumnOrderIds = async (column) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(column.boardId)) },
      { $pull: { columnOrderIds: new ObjectId(String(column._id)) } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw new Error(error) }
}

const update = async (boardId, updateData) => {
  try {
    // Lọc những field mà không cho phép cập nhật
    Object.keys(updateData).forEach(fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })

    // Cần phải biến đổi nếu dữ liệu đó liên quan đến ObjectId
    if (updateData.columnOrderIds) {
      updateData.columnOrderIds = updateData.columnOrderIds.map(_id => (new ObjectId(String(_id))))
    }

    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(boardId)) },
      { $set: updateData },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw new Error(error) }
}

const getBoards = async (userId, page, itemsPerPage) => {
  try {
    const queryConditions = [
      // dk 01: board chua bị xóa
      { _destroy: false },
      //dk 02: đối tượng userId gửi request phải thuộc 1 trong hai mảng: ownerIds hoặc memberIds (sử dụng toán tử $all của mongodb)
      {
        $or: [
          { ownerIds: { $all: [new ObjectId(String(userId))] } },
          { memberIds: { $all: [new ObjectId(String(userId))] } }
        ]
      }
    ]

    const query = await GET_DB().collection(BOARD_COLLECTION_NAME).aggregate(
      [
        { $match: { $and: queryConditions } },
        // sort title (mặc định sẽ theo chuẩn bản mã ASCII)
        { $sort: { title: 1 } },
        // $facet để xử lí nhiều luồng trong một query
        {
          $facet: {
            // Luồng 1: query board
            'queryBoards': [
              { $skip: pagingSkipValue(page, itemsPerPage) }, // Bỏ qua số lượng bản ghi của những page trước đó
              { $limit: itemsPerPage } // Giới hạn số lượng bản ghi board hiển thị trên 1 trang
            ],
            // Luồng 2: query đếm tổng số tất cả bản ghi có trong db và trả về trong biến countedAllBoards
            'queryTotalBoards': [{ $count: 'countedAllBoards' }]
          }
        }
      ],
      // Thuộc tính collation locale để fix việc hàm sort của mongodb chữ B sẽ đứng trước a theo bảng mã ASCII
      { collation: { locale: 'en' } }
    ).toArray()
    // console.log('query', query)

    // aggregate sẽ trả về một mảng, trong đó phần tử đầu tiên sẽ là json object chứa giá trị
    const res = query[0]

    return {
      boards: res.queryBoards || [],
      totalBoards: res.queryTotalBoards[0]?.countedAllBoards || 0
    }
  } catch (error) { throw new Error(error) }
}

export const boardModel = {
  BOARD_COLLECTION_NAME,
  BOARD_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getDetails,
  pushColumnOrderIds,
  pullColumnOrderIds,
  update,
  getBoards
}
