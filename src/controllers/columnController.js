import { StatusCodes } from 'http-status-codes'
import { columnService } from '~/services/columnService'

const createNew = async (req, res, next) => {
  try {
    const createdColoumn = await columnService.createNew(req.body)
    res.status(StatusCodes.CREATED).json(createdColoumn)
  } catch (error) { next(error) }
}

export const columnController = {
  createNew
}
