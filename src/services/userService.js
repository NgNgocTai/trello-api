
import { userModel } from '~/models/userModel'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { pickUser } from '~/utils/formatters'

const createNew = async (reqBody) => {
  try {
    // Kiểm tra xem email đã tồn tại hay chưa
    const existedUser = await userModel.findOneByEmail(reqBody.email)
    if (existedUser) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email already exists.')
    }

    //Tạo data để lưu vào database
    //nameFromEmail sẽ là tên người dùng được tạo từ email
    const nameFromEmail = reqBody.email.split('@')[0]
    const newUserData = {
      email:reqBody.email,
      password:bcryptjs.hashSync(reqBody.password, 8), // Mã hóa mật khẩu
      username:nameFromEmail,
      displayName:nameFromEmail,
      verifyToken: uuidv4()// Tạo token xác thực duy nhất
    }

    //Lưu user vào database
    const createdUser = await userModel.createNew(newUserData)
    const getNewUser = await userModel.findOneById(createdUser.insertedId)

    //Gửi email cho người dùng xác thực

    // return kết quả cho Controller
    return pickUser(getNewUser)

  } catch (error) {throw (error)}
}

export const userService = {
  createNew
}