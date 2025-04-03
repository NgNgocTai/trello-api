import express from 'express'
import exitHook from 'async-exit-hook'
import { closeDb, connectDb, getDb } from '~/config/mongodb'
import { env } from '~/config/environment'
import { APIs_V1 } from '~/routes/v1/index'

const startServer = () => {
  const app = express()
  // Đã được lưu trong biến môi trường hết rồi
  // const hostname = 'localhost'
  // const port = 8017

  //Enable req.body json data
  app.use(express.json())

  app.use('/v1', APIs_V1)

  app.listen(env.APP_PORT, env.APP_HOST, () => {
    // eslint-disable-next-line no-console
    console.log(`3. Hello Ngọc Tài Dev, I am running at http://${ env.APP_HOST }:${ env.APP_PORT }/`)
  })

  //Thực hiện tác vụ clean up trước khi dừng server, giúp chỉ dừng server trong trường hợp đặc bt: ctrl C, error,..
  exitHook(() => {
    console.log('4. Đang ngắt kết nối tới MongoDB Cloud Atlas...')
    closeDb().then(() => {
      console.log('5. Đã ngắt kết nối tới MongoDB Cloud Atlas')
      process.exit()
    })
  })
}

// Chỉ khi Kết nối tới Database thành công thì mới Start Server Back-end lên.
// Immediately-invoked / Anonymous Async Functions (IIFE)
//C2
(async () => {
  try {
    console.log('1. Connecting to MongoDB Cloud Atlas...')
    await connectDb()
    console.log('2. Connected to MongoDB Cloud Atlas!')
    startServer()
  } catch (error) {
    console.error(error)
    process.exit(0)
  }
})()


//C1
// connectDb()
//   .then(console.log('Connected to mongoDb'))
//   .then(() => startServer())
//   .catch(error =>{
//     console.log(error)
//     //out 
//     process.exit(0)
//   })

