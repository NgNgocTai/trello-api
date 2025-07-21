
import { userModel } from '~/models/userModel'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { pickUser } from '~/utils/formatters'
import { WEBSITE_DOMAIN } from '~/utils/constants'
import { ResendProvider } from '~/providers/ResendProvider'

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
    const verificationLink = `${WEBSITE_DOMAIN}/account/verification?email=${getNewUser.email}&token=${getNewUser.verifyToken}`

    const to = getNewUser.email
    const subject = 'Trello MERN Stack Advanced: Please verify your email before using our services!'

    const html = `
        <h3>Here is your verification link:</h3>
        <h3>${verificationLink}</h3>
        <h3>Sincerely,<br/>– Ngoctaidev – Một Lập Trình Viên –</h3>
    `
    const emailResponse = await ResendProvider.sendEmail({ to, subject, html })
    console.log("🚀 ~ createNew ~ emailResponse:", emailResponse)
    // return kết quả cho Controller
    return pickUser(getNewUser)

  } catch (error) {throw (error)}
}

export const userService = {
  createNew
}