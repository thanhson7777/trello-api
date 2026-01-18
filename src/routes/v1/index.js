/*
 */
import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { boardRoute } from './boardRoute'
import { columnRoute } from './columnRoute'
import { cardRoute } from './cardRoute'
import { userRoute } from './userRoute'


const Router = express.Router()

// Check apis v1/status
Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'APIs V1 are ready to use' })
})

// Những API liên quan đến board
Router.use('/boards', boardRoute)

// Những API liên quan đến column
Router.use('/columns', columnRoute)

// Những API liên quan đến card
Router.use('/cards', cardRoute)

// Những API liên quan đến users
Router.use('/users', userRoute)

export const APIs_V1 = Router
