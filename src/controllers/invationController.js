import { StatusCodes } from 'http-status-codes'
import { invatationService } from '~/services/invatationService'

const createNewBoardInvitation = async (req, res, next) => {
  try {
    // tìm user gửi request mời use khác vào board
    const inviterId = req.jwtDecoded._id
    const resInvatation = await invatationService.createNewBoardInvitation(req.body, inviterId)
    res.status(StatusCodes.CREATED).json(resInvatation)
  } catch (error) { next(error) }
}

const getInvitations = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const resInvitations = await invatationService.getInvitations(userId)
    res.status(StatusCodes.OK).json(resInvitations)
  } catch (error) { next(error) }
}

const updateBoardInvitation = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id

    const { invitationId } = req.params
    const { status } = req.body

    const updatedInvitation = await invatationService.updateBoardInvitation(userId, invitationId, status)
    res.status(StatusCodes.OK).json(updatedInvitation)
  } catch (error) { next(error) }
}

export const invitationController = {
  createNewBoardInvitation,
  getInvitations,
  updateBoardInvitation
}
