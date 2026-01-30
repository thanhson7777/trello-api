import ApiError from '~/utils/ApiError'
import { userModel } from '~/models/userModel'
import { boardModel } from '~/models/boardModel'
import { invitationModel } from '~/models/invitationModel'
import { pickUser } from '~/utils/formatters'
import { StatusCodes } from 'http-status-codes'
import { INVATATION_TYPE, BOARD_INVATION_STATUS } from '~/utils/constants'

const createNewBoardInvitation = async (reqBody, inviterId) => {
  try {
    // Người gửi lời mời (lấy id theo token ở bên controllor)
    const inviter = await userModel.findOneById(inviterId)
    // Người được mời (lấy theo email được gửi lên từ frontend)
    const invitee = await userModel.findOneByEmail(reqBody.inviteeEmail)
    // Board được người gửi đến người nhận
    const board = await boardModel.findOneById(reqBody.boardId)

    // reject nếu không tồn tại 1 trong 3 trường hợp trên
    if (!inviter || !invitee || !board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Inviter, Invitee or Board not found!')
    }

    // Những data cần thiết để thêm vào db
    const newInvatationData = {
      inviterId,
      inviteeId: invitee._id.toString(),
      type: INVATATION_TYPE.BOARD_INVITATION,
      boardInvitation: {
        boardId: board._id.toString(),
        status: BOARD_INVATION_STATUS.PENDING
      }
    }

    // Gọi tới Model để lưu trữ vào trong db
    const createdInvatation = await invitationModel.createNewBoardInvitation(newInvatationData)
    const getInvatation = await invitationModel.findOneById(createdInvatation.insertedId)

    // Trả về các thông tin khác:...
    const resInvitation = {
      ...getInvatation,
      board,
      inviter: pickUser(inviter),
      invitee: pickUser(invitee)
    }
    return resInvitation
  } catch (error) { throw error }
}

export const invatationService = {
  createNewBoardInvitation
}
