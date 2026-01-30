import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validator'
import { INVATATION_TYPE, BOARD_INVATION_STATUS } from '~/utils/constants'

const INVATATION_COLLECTION_NAME = 'invatations'
const INVATATION_COLLECTION_SCHEMA = Joi.object({
  inviterId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  inviteeId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  type: Joi.string().required().valid(...Object.values(INVATATION_TYPE)),

  // Lời mời là board thì lưu thêm dữ liệu boardInvitation(optional)
  boardInvitation: Joi.object({
    boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    status: Joi.string().required().valid(...Object.values(BOARD_INVATION_STATUS))
  }).optional(),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

// Chỉ định ra những field mà không cho phép cập nhật trong update
const INVALID_UPDATE_FIELDS = ['_id', 'inviterId', 'inviteeId', 'type', 'createdAt']

const validateBeforeCreate = async (data) => {
  return await INVATATION_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNewBoardInvitation = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    // Biến đổi một số dữ liệu liên quan đến ObjectId
    const newInvitationToAdd = {
      ...validData,
      inviterId: new ObjectId(String(validData.inviterId)),
      inviteeId: new ObjectId(String(validData.inviteeId))
    }

    // Nếu tồn tại dữ liệu boardInvitation thì update boardId
    if (validData.boardInvitation) {
      newInvitationToAdd.boardInvitation = {
        ...validData.boardInvitation,
        boardId: new ObjectId(String(validData.boardInvitation.boardId))
      }
    }

    // Gọi insert vào db
    const createdInvitation = await GET_DB().collection(INVATATION_COLLECTION_NAME).insertOne(newInvitationToAdd)
    return createdInvitation
  } catch (error) { throw new Error(error) }
}

const findOneById = async (invatationId) => {
  try {
    const result = await GET_DB().collection(INVATATION_COLLECTION_NAME).findOne({ _id: new ObjectId(String(invatationId)) })
    return result
  } catch (error) { throw new Error(error) }
}

const update = async (invatationId, updateData) => {
  try {
    Object.keys(updateData).forEach(fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })

    // Cần phải biến đổi nếu dữ liệu đó liên quan đến ObjectId
    if (updateData.boardInvitation) {
      updateData.boardInvitation = {
        ...updateData.boardInvitation,
        boardId: new ObjectId(String(updateData.boardInvitation.boardId))
      }
    }

    const result = await GET_DB().collection(INVATATION_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(invatationId)) },
      { $set: updateData },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw new Error(error) }
}

export const invitationModel = {
  INVATATION_COLLECTION_NAME,
  INVATATION_COLLECTION_SCHEMA,
  createNewBoardInvitation,
  findOneById,
  update
}

