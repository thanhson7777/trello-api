/*
 */
import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { boardRouter } from './boardRoute'

const Router = express.Router()

// Check apis v1/status
Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'APIs V1 are ready to use' })
})

// Những API liên quan đến board
Router.use('/board', boardRouter)

export const APIs_V1 = Router
