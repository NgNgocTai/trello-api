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

const getDetails = async (req, res, next) => {
  try {
    const boardId = req.params.id
    const board = await boardService.getDetails(boardId)

    res.status(StatusCodes.OK).json(board)
  } catch (error) {
    next(error)
  }
}
const getBoards = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    //Lấy params là page và itemsPerPage truyền trong query từ url
    const { page, itemsPerPage } = req.query
    const result = boardService.getBoards(userId, page, itemsPerPage)

    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const updateBoard = async (req, res, next) => {
  try {
    const boardId = req.params.id
    const board = await boardService.updateBoard(boardId, req.body)

    res.status(StatusCodes.OK).json(board)
  } catch (error) {
    next(error)
  }
}
const moveCardToDifferentColumn = async (req, res, next) => {
  try {
    const result = await boardService.moveCardToDifferentColumn(req.body)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}
export const boardController = { createNew, getDetails, updateBoard, moveCardToDifferentColumn, getBoards }