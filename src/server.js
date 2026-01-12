/* eslint-disable no-console */
import express from 'express'
import cors from 'cors'
import { corsOptions } from './config/cors'
import exitHook from 'async-exit-hook'
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb'
import { env } from '~/config/environment'
import { APIs_V1 } from '~/routes/v1'
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware'

const START_SERVER = () => {
  const app = express()

  // Xử lí cors
  app.use(cors(corsOptions))

  // Enable req.body json data
  app.use(express.json())

  // Use APIs V1
  app.use('/v1', APIs_V1)

  // Midleware xử lí lỗi tập trung
  app.use(errorHandlingMiddleware)

  // Đây là môi trường Production (Render)
  if (env.BUILD_MODE === 'production') {
    // Render sẽ tự sinh PORT
    app.listen(process.env.PORT, () => {
      console.log(`3. PRODUCTION: Hello ${env.AUTHOR}, Backend server is running successfully at Port: ${process.env.PORT}`)
    })
  } else {
    // Đây là môi trường dev
    app.listen(env.LOCAL_DEV_APP_PORT, env.LOCAL_DEV_APP_HOST, () => {
      console.log(`3. DEV: Hello ${env.AUTHOR}, Backend server is running successfully at Port: http://${env.LOCAL_DEV_APP_HOST}:${env.LOCAL_DEV_APP_PORT}/`)
    })
  }


  // Thực hiện các tác vụ cleanup trước khi dừng server
  exitHook(() => {
    console.log('4. Disconnecting from MongoDB Cloud Atlas')
    CLOSE_DB()
    console.log('5. Disconnected from MongoDB Cloud Atlas')
  })
}

// Chỉ khi kết nối đến database thành công thì mới start server backend lên
// IIFE
(async () => {
  try {
    console.log('1. Connecting to MongoDB Cloud Atlas...')
    await CONNECT_DB()
    console.log('2. Connected to MongoDB cloud Atlas')
    // Khởi động server backend sau khi kết nối tới database thành công
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

