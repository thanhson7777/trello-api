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

const getInvitations = async (userId) => {
  try {
    const getInvitations = await invitationModel.findByUser(userId)

    // Do giá trị của dữ liệu là mảng chứa 1 phần từ, nên trước khi trả dữ liệu về cho frontend, thì biến đổi thành kiểu dữ liệu json object
    const resInvitation = getInvitations.map(i => ({
      ...i,
      inviter: i.inviter[0] || {},
      invitee: i.invitee[0] || {},
      board: i.board[0] || {}
    }))
    // const resInvitation = getInvitations.map(i => {
    //   return {
    //     ...i,
    //     inviter: i.inviter[0] || {},
    //     invitee: i.invitee[0] || {},
    //     board: i.board[0] || {}
    //   }
    // })
    return resInvitation
  } catch (error) { throw error }
}

const updateBoardInvitation = async (userId, invitationId, status) => {
  try {
    // Tìm bản ghi invitation trong model
    const getInvitation = await invitationModel.findOneById(invitationId)
    if (!getInvitation) throw new ApiError(StatusCodes.NOT_FOUND, 'Invitation not found')

    // Lấy tất cả thông tin của board
    const boardId = getInvitation.boardInvitation.boardId
    const getboard = await boardModel.findOneById(boardId)
    if (!getboard) throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found')

    // Kiểm tra nếu status là accept mà user đó đã có trong board (là owner hoặc member)
    // Chuyển mảng ownerIds và memberIds từ kiểu ObjectId về kiểu string
    const boardOwnerAndMemberIds = [...getboard.ownerIds, ...getboard.memberIds].toString()
    if (status === BOARD_INVATION_STATUS.ACCEPTED && boardOwnerAndMemberIds.includes(userId)) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'You are already a member this board')
    }

    // update bản ghi invitation
    const updateData = {
      boardInvitation: {
        ...getInvitation.boardInvitation,
        status: status
      }
    }

    // Cập nhập lại status trong bản ghi invitation
    const updatedInvitation = await invitationModel.update(invitationId, updateData)
    // Nếu accept thì thêm userId vào trong trường memberIds của board
    if (updatedInvitation.boardInvitation.status === BOARD_INVATION_STATUS.ACCEPTED) {
      await boardModel.pushMemberIds(boardId, userId)
    }

    return updatedInvitation
  } catch (error) { throw error }
}

export const invatationService = {
  createNewBoardInvitation,
  getInvitations,
  updateBoardInvitation
}
