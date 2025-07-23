
import { userModel } from '~/models/userModel'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { pickUser } from '~/utils/formatters'
import { WEBSITE_DOMAIN } from '~/utils/constants'
import { ResendProvider } from '~/providers/ResendProvider'
import { JwtProvider } from '~/providers/JwtProvider'
import { env } from '~/config/environment'
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
    console.log('🚀 ~ createNew ~ emailResponse:', emailResponse)
    // return kết quả cho Controller
    return pickUser(getNewUser)

  } catch (error) {throw (error)}
}

const verifyAccount = async (reqBody) => {
  try {
    //Ktra xem co user trong db chua
    const existUser = await userModel.findOneByEmail(reqBody.email)
    //Các bước kiểm tra cần thiết
    if (!existUser)
      throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found')
    if (existUser.isActive)
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is already activated')
    if (reqBody.token!== existUser.verifyToken) 
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Token is invalid')

    // Cập nhật thông tin cần thiết để verify account
    const updateData = {
      isActive:true,
      verifyToken:null
    }
    //Thực hiện update thông tin cho user
    const updatedUser = await userModel.update(existUser._id, updateData)

    return pickUser(updatedUser)
  } catch (error) {throw error}
}

const login = async (reqBody) => {
  // Authentication (Xác thực)
  try {
    //Ktra xem co user trong db chua
    const existUser = await userModel.findOneByEmail(reqBody.email)
    //Các bước kiểm tra cần thiết
    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found')
    if (!existUser.isActive)
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is not activated yet, please verify your account')
    if (!bcryptjs.compareSync(reqBody.password, existUser.password)) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your email or password is incorrect')
    }

    /*Nếu mọi thứ ok thì bắt đầu tạo Tokens đăng nhập để trả về cho phía FE - Authorization (phân quyền)*/
    // Tạo thông tin để đính kèm trong JWT Token bao gồm _id và email của user
    const userInfo = {
      _id:existUser._id,
      email:existUser.email
    }

    // Tạo ra 2 loại token, accessToken và refreshToken để trả về cho phía FE
    const accessToken = await JwtProvider.generateToken(userInfo, env.ACCESS_TOKEN_SECRET_SIGNATURE, env.ACCESS_TOKEN_LIFE)

    const refreshToken = await JwtProvider.generateToken(userInfo, env.REFRESH_TOKEN_SECRET_SIGNATURE, env.REFRESH_TOKEN_LIFE)

    // Trả về thông tin của user kèm theo 2 cái token vừa tạo ra
    return { accessToken, refreshToken, ...pickUser(existUser) }
  } catch (error) {
    throw error
  }
}

const refreshToken = async (clientRefreshToken) => {
  try {
    // Verify, giải mã cái refresh token xem có hợp lệ không
    const refreshTokenDecoded = await JwtProvider.verifyToken(clientRefreshToken, env.REFRESH_TOKEN_SECRET_SIGNATURE)

    // Lay thong tin nguoi dung tu refreshToken, ko can query vo db
    const userInfo = {
      _id: refreshTokenDecoded._id,
      email: refreshTokenDecoded.email
    }

    // Tạo AccessToken mới từ thông tin lấy được ra
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      env.ACCESS_TOKEN_LIFE // 1 tiếng
    )

    return { accessToken }
  } catch (error) {
    throw error
  }
}

export const userService = {
  createNew,
  verifyAccount,
  login,
  refreshToken
}