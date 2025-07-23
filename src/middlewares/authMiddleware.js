import { StatusCodes } from 'http-status-codes'
import { JwtProvider } from '~/providers/JwtProvider'
import { env } from '~/config/environment'
import ApiError from '~/utils/ApiError'

// Middleware này sẽ đảm nhiệm việc quan trọng: Xác thực JWT accessToken nhận được từ phía FE có hợp lệ hay không
const isAuthorized = async (req, res, next) => {
  //Lấy accessToken client gửi lên ( được gửi tự động kèm theo request nhờ withCredientials)
  const clientAccessToken = req?.cookies?.accessToken
  if (!clientAccessToken) {
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized! (Token not found)'))
    return
  }
  try {
    //Thực hiện giải mã verify token xem có hợp lệ không
    const accessTokenDecoded = await JwtProvider.verifyToken(clientAccessToken, env.ACCESS_TOKEN_SECRET_SIGNATURE)
    // console.log('accessTokenDecoded: ', accessTokenDecoded) //Trả ra payload của token (nội dung gán vào token)

    //Lưu thông tin được giải mã vào req để truyền cho các tầng sau tiếp tục dùng
    req.jwtDecoded = accessTokenDecoded

    //Đẩy tiếp sang tầng tiếp theo
    next()

  } catch (error) {
    console.log("🚀 ~ isAuthorized ~ error:", error)
    //Nếu accessToken hết hạn -> trả về mã GONE (410) cho FE gọi api refreshToken
    if (error?.message?.includes('jwt expired')) {
      next(new ApiError(StatusCodes.GONE, 'Need to refresh token'))
      return
    }
    //Nếu accessToken không hợp lệ vì các lý do khác --> trả về lỗi luôn
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized!'))
    return
  }
}

export const authMiddleware = { isAuthorized }