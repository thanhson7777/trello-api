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

export const invitationController = {
  createNewBoardInvitation
}
