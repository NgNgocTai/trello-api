import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

const createNew = async (req, res, next) => {
  //validate du lieu gui len tu FE
  const correctCondition = Joi.object({
    title: Joi.string().required().min(3).max(50).trim().strict().messages({
      'any.required': 'Title is required (trungquandev)',
      'string.empty': 'Title is not allowed to be empty (trungquandev)',
      'string.min': 'Title min 3 chars (trungquandev)',
      'string.max': 'Title max 50 chars (trungquandev)',
      'string.trim': 'Title must not have leading or trailing whitespace (trungquandev)'
    }),
    description:Joi.string().required().min(3).max(256).trim().strict()
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly:false })
    //validate dữ liệu xong xuôi hợp lệ thì cho request đi tiếp sang controller
    next()
    // res.status(StatusCodes.CREATED).json({ message:'Note: API post list post' })
  } catch (err) {
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, err.message)
    //Thay việc trả về client thủ công bằng cách đưa err vào next để xử lý lỗi tập trung ở middleware
    next(customError)
    // res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
    //   errors: new Error(err).message
    // })
}

}

export const boardValidation = {
  createNew
}
