import { StatusCodes } from 'http-status-codes'
import { slugify } from '~/utils/formatters'
import { boardModel } from '~/models/boardModel'
import ApiError from '~/utils/ApiError'
import { cloneDeep } from 'lodash'
import { columnModel } from '~/models/columnModel'
import { cardModel } from '~/models/cardModel'
import { DEFAULT_ITEMS_PER_PAGE, DEFAULT_PAGE } from '~/utils/constants'
const createNew = async (userId, reqBody) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }
    const createdBoard = await boardModel.createNew(userId, newBoard)
    // console.log(createdBoard)

    //Lấy bản ghi board sau khi gọi (tùy mục đích có cần bước này không)
    const getNewBoard = await boardModel.findOneById(createdBoard.insertedId)
    return getNewBoard
} catch (error) {
    throw error
  }
}

const getDetails = async (userId, boardId) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const board = await boardModel.getDetails(userId, boardId)
    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found')
    }
    //CloneDeep để tạo ra cái mới như cái board lúc đầu, không làm ảnh hưởng tới cái cũ
    //Đoạn này phải format lại ctdl cho giống cấu trúc bên FE(board{column{card}}) còn lấy ở models thì column với card đang đồng cấp
    const resBoard = cloneDeep(board)
    resBoard.columns.forEach(column => {
      // column.cards = resBoard.cards.filter(card => card.columnId.toString() === column._id.toString())
      column.cards = resBoard.cards.filter(card => card.columnId.equals(column._id)) // mongoDB ho tro equal cho objectId
    })
    delete resBoard.cards
    return resBoard
  } catch (error) {
    throw error
  }
}

const getBoards = async (userId, page, itemsPerPage) => {
  try {
    //Nếu không tồn tại page hoặc itemsPerPage thì dùng giá trị mặc định
    if (!page) page = DEFAULT_PAGE
    if (!itemsPerPage) itemsPerPage = DEFAULT_ITEMS_PER_PAGE
    const result = await boardModel.getBoards(userId, parseInt(page, 10), parseInt(itemsPerPage, 10))
    return result
  } catch (error) {
    throw error
  }
}
const updateBoard = async (boardId, reqBody) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const updateData = {
      ...reqBody,
      updatedAt:Date.now()
    }
    const resBoard = await boardModel.updateBoard(boardId, updateData)
    return resBoard
  } catch (error) {
    throw error
  }
}

const moveCardToDifferentColumn = async (reqBody) => {
  try {
    //  B1: Cập nhật mảng cardOrderIds của Column ban đầu chứa nó (Hiểu bản chất là xóa cái _id của Card ra khỏi mảng)
    await columnModel.updateColumn(reqBody.prevColumnId, { cardOrderIds:reqBody.prevCardOrderIds, updatedAt:Date.now() })
    //  B2: Cập nhật mảng cardOrderIds của Column tiếp theo (Hiểu bản chất là thêm _id của Card vào mảng)
    await columnModel.updateColumn(reqBody.nextColumnId, { cardOrderIds:reqBody.nextCardOrderIds, updatedAt:Date.now() })
    //  B3: Cập nhật lại trường columnId mới của cái Card đã kéo
    await cardModel.updateCard(reqBody.currentCardId, { columnId:reqBody.nextColumnId })

    return { moveCardToDifferentColumn:'Sucessfully' }
  } catch (error) {
    throw error
  }
}

export const boardService = {
  createNew, getDetails, updateBoard,moveCardToDifferentColumn,getBoards
}