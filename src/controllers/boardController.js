import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { boardService } from '~/services/boardService'
const createNew = async (req, res, next) => {
  try {
    //Tiếp đến là điều hướng dữ liệu sang tầng service
    const userId = req.jwtDecoded._id
    const createdBoard = await boardService.createNew(userId, req.body)

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
    const userId = req.jwtDecoded._id
    const boardId = req.params.id
    const board = await boardService.getDetails(userId, boardId)

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
    const result = await boardService.getBoards(userId, page, itemsPerPage)

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