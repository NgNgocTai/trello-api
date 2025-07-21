import Joi from 'joi'
import ApiError from '~/utils/ApiError'
import StatusCodes from 'http-status-codes'
import { EMAIL_RULE, EMAIL_RULE_MESSAGE, PASSWORD_RULE, PASSWORD_RULE_MESSAGE } from '~/utils/validators'

const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    email: Joi.string().required().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
    password: Joi.string().required().pattern(PASSWORD_RULE).message(PASSWORD_RULE_MESSAGE),
  })

  try {
    // abortEarly: false giúp Joi trả về tất cả các lỗi nó tìm thấy, thay vì dừng lại ở lỗi đầu tiên
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    // Nếu có lỗi validation từ Joi, bắt lỗi và gửi phản hồi lỗi
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error.message)))
  }
}

export const userValidation = {
  createNew
}