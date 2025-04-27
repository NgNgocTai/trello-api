import { columnModel } from '~/models/columnModel'
import { boardModel } from '~/models/boardModel'
import { cardModel } from '~/models/cardModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
const createNew = async (data) => {
  try {
    const newColumn = { ...data }
    const createdColumn = await columnModel.createNew(newColumn)
    //Lấy bản ghi column sau khi gọi (tùy mục đích có cần bước này không)
    const getNewColumn = await columnModel.findOneById(createdColumn.insertedId)

    //Xử lý phần thêm columnId vào columnOrderIds ở đây(không xử lý ở tầng model do model chỉ nên làm việc với csdl)
    if (getNewColumn) {
      //Xử lý cấu trúc data trước khi trả về cho frontend
      getNewColumn.cards = []
      await boardModel.pushColumnOrderIds(getNewColumn)
    }
    return getNewColumn
} catch (error) {
    throw error
  }
}
const updateColumn = async (columnId, reqBody) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const updateData = {
      ...reqBody,
      updatedAt:Date.now()
    }
    const resColumn = await columnModel.updateColumn(columnId, updateData)
    return resColumn
  } catch (error) {
    throw error
  }
}
const deleteColumn = async (columnId) => {
  // eslint-disable-next-line no-useless-catch
  try {
    //Xóa columnId ra khỏi columnOrderIds
    const targetColumn = await columnModel.findOneById(columnId)
    if (!targetColumn) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Column not found')
    }
    console.log('🚀 ~ deleteColumn ~ targetColumn:', targetColumn)
    //Xoa column
    await columnModel.deleteOneColumnById(columnId)
    //Xoa toàn bộ card thuộc column trên
    await cardModel.deleteManyCardByColumnId(columnId)
    await boardModel.pullColumnOrderIds(targetColumn)
    //Trả về message kết quả ra màn hình
    const resColumn = { deleteMessage:'Column and its cards deleted sucessfully' }
    return resColumn
  } catch (error) {
    throw error
  }
}
export const columnService= {
  createNew,
  updateColumn,
  deleteColumn
}