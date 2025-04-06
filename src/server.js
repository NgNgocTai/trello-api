import express from 'express'
import exitHook from 'async-exit-hook'
import { closeDb, connectDb } from '~/config/mongodb.js'
import { env } from '~/config/environment'
import { APIs_V1 } from '~/routes/v1/index'
import { StatusCodes } from 'http-status-codes'
import { errorHandlingMiddleware } from './middlewares/errorHandlingMiddleware'

const startServer = () => {
  const app = express()

  // Enable req.body JSON data
  app.use(express.json())

  app.use('/v1', APIs_V1)

  // Middleware xử lý lỗi tập trung
  app.use(errorHandlingMiddleware)

  app.listen(env.APP_PORT, env.APP_HOST, () => {
    console.log(`3. Hello Ngọc Tài Dev, I am running at http://${env.APP_HOST}:${env.APP_PORT}/`)
  })

  // Clean up trước khi dừng server
  exitHook(async () => {
    try {
      console.log('4. Đang ngắt kết nối tới MongoDB Cloud Atlas...')
      await closeDb()
      console.log('5. Đã ngắt kết nối tới MongoDB Cloud Atlas')
      process.exit()
    } catch (error) {
      console.error('Error while closing MongoDB connection:', error)
      process.exit(1)
    }
  })
}

// Kết nối MongoDB và start server
(async () => {
  try {
    console.log('1. Connecting to MongoDB Cloud Atlas...')
    await connectDb()
    console.log('2. Connected to MongoDB Cloud Atlas!')
    startServer()
  } catch (error) {
    console.error('Error during MongoDB connection:', error)
    process.exit(0)
  }
})()
