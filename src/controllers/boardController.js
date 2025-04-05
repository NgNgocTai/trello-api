import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { boardService } from '~/services/boardService'
const createNew = async (req, res, next) => {
  try {
    console.log('req.body:' + req.body)
    console.log('req.body: ', req.body)
    console.log('req.query: ', req.query)
    console.log('req.params: ', req.params)
    // console.log('req.files: ', req.files)
    // console.log('req.cookies: ', req.cookies)
    // console.log('req.jwtDecoded: ', req.jwtDecoded)
    //Tiếp đến là điều hướng dữ liệu sang tầng service
    const createdBoard = await boardService.createNew(req.body)

    // throw new ApiError(StatusCodes.BAD_GATEWAY, 'Khong on roi')
    //Có kết quả thì trả về Client
    res.status(StatusCodes.CREATED).json(createdBoard)
  } catch (err) {
    next(err) // Chuyển qua middleware xử lý lỗi tập trung 
    // res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    //   error:err.message
    // })
}}
export const boardController = { createNew }