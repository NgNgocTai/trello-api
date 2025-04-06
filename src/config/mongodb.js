import { MongoClient, ServerApiVersion } from 'mongodb'
import { env } from '~/config/environment'

//Khởi tạo riêng 1 database instanse = null (do ta đã connect đâu)
let trelloDatabaseInstance = null

//Khởi tạo đối tượng MongoClient để connect với mongodb
const mongoClientInstance = new MongoClient(env.MONGODB_URI, {
  serverApi:{
    version:ServerApiVersion.v1,
    strict:true,
    deprecationErrors:true
  }
})
export const connectDb = async() =>{
  //Gọi kết nối tới mongodb atlas với URI đã khai báo
  await mongoClientInstance.connect()
  //Kết nối thành công thì gán lại vào biến db 
  trelloDatabaseInstance = mongoClientInstance.db(env.DATABASE_NAME)
}
//funtion này để export ra trelloDatabaseInstance sau khi đã connect tới mongo để có thể dùng ở nhiều nơi khác 
//func nay chi dc goi sau khi ket noi mongodb thanh cong
export const getDb = () => {
  if (!trelloDatabaseInstance)
    throw new Error('must connect to db first')
  return trelloDatabaseInstance
}

//Đóng kết nối db khi cần
export const closeDb = async () => {
  await mongoClientInstance.close()
}