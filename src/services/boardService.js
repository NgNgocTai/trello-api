import { StatusCodes } from 'http-status-codes'
import { slugify } from '~/utils/formatters'
import { boardModel } from '~/models/boardModel'
import ApiError from '~/utils/ApiError'
import { cloneDeep } from 'lodash'
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
    //CloneDeep để tạo ra cái mới như cái board lúc đầu, không làm ảnh hưởng tới cái cũ
    const resBoard = cloneDeep(board)
    resBoard.columns.forEach(column => {
      column.cards = resBoard.cards.filter(card => card.columnId.toString() === column._id.toString())
    })
    delete resBoard.cards
    return resBoard
  } catch (error) {
    throw error
  }
}
export const boardService = {
  createNew, getDetails
}