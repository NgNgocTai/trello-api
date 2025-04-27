import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const createNew = async (req, res, next) => {
  //validate du lieu gui len tu FE
  const correctCondition = Joi.object({
    title: Joi.string().required().min(3).max(50).trim().strict(),
    boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly:false })
    next()
  } catch (err) {
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, err.message)
    next(customError)
}
}

const updateColumn = async (req, res, next) => {
  //update thi bo required di
  const correctCondition = Joi.object({
    title: Joi.string().min(3).max(50).trim().strict(),
    boardId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    cardOrderIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([])
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly:false, allowUnknown:true })
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
}}

const deleteColumn = async (req, res, next) => {
  //update thi bo required di
  const correctCondition = Joi.object({
    id:Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  })

  try {
    await correctCondition.validateAsync(req.params)
    next()
  } catch (err) {
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, err.message)
    next(customError)
}}
export const columnValidation = {
  createNew,
  updateColumn,
  deleteColumn
}
