import { StatusCodes } from 'http-status-codes'
import { slugify } from '~/utils/formatters'
import { boardModel } from '~/models/boardModel'
import ApiError from '~/utils/ApiError'
const createNew = async (data) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const newBoard = {
      ...data,
      slug: slugify(data.title)
    }
    const createdBoard = await boardModel.createNew(newBoard)
    // console.log(createdBoard)

    //Lấy bản ghi board sau khi gọi (tùy mục đích có cần bước này không)
    const getNewBoard = await boardModel.findOneById(createdBoard.insertedId)
    return getNewBoard
} catch (error) {
    throw error
  }
}

const getDetails = async (id) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const board = await boardModel.getDetails(id)
    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found')
    }
    return board
  } catch (error) {
    throw error
  }
}
export const boardService = {
  createNew, getDetails
}