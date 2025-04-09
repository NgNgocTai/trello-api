import { columnModel } from '~/models/columnModel'

const createNew = async (data) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const newColumn = { ...data }
    const createdColumn = await columnModel.createNew(newColumn)
    //Lấy bản ghi board sau khi gọi (tùy mục đích có cần bước này không)
    const getNewColumn = await columnModel.findOneById(createdColumn.insertedId)
    //...
    return getNewColumn
} catch (error) {
    throw error
  }
}

export const columnService= {
  createNew
}