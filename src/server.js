/* eslint-disable no-console */
import express from 'express'
import { CONNECT_DB, GET_DB } from '~/config/mongodb'

const START_SERVER = () => {
  const app = express()

  const hostname = 'localhost'
  const port = 8017

  app.get('/', async (req, res) => {
    console.log(await GET_DB().listCollections().toArray())
    res.end('<h1>Hello World!</h1><hr>')
  })

  app.listen(port, hostname, () => {
    console.log(`3. Hello thanh son, I am running at http://${hostname}:${port}/`)
  })
}

// Chỉ khi kết nối đến database thành công thì mới start server backend lên
(async () => {
  try {
    console.log('1. Connecting to MongoDB Cloud Atlas...')
    await CONNECT_DB()
    console.log('2. Connected to MongoDB cloud Atlas')
    START_SERVER()
  } catch (error) {
    console.log(error)
    process.exit(0)
  }
})()

// // Chỉ khi kết nối đến database thành công thì mới start server backend lên
// console.log('1. Connecting to MongoDB Cloud Atlas...')
// CONNECT_DB()
//   .then(() => console.log('2. Connected to MongoDB cloud Atlas'))
//   .then(() => START_SERVER())
//   .catch(error => {
//     console.log(error)
//     process.exit(0)
//   })

