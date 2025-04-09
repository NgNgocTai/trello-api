import { columnModel } from '~/models/columnModel'
import { boardModel } from '~/models/boardModel'
const createNew = async (data) => {
  try {
    const newColumn = { ...data }
    const createdColumn = await columnModel.createNew(newColumn)
    //Lấy bản ghi board sau khi gọi (tùy mục đích có cần bước này không)
    const getNewColumn = await columnModel.findOneById(createdColumn.insertedId)
    //Xử lý phần thêm columnId vào columnOrderIds ở đây(không xử lý ở tầng model do model chỉ nên làm việc với csdl)

    if(getNewColumn) {
      //Xử lý cấu trúc data trước khi trả về cho frontend
      getNewColumn.cards = []
      await boardModel.pushColumnOrderIds(getNewColumn)
    }
    return getNewColumn.value
} catch (error) {
    throw error
  }
}

export const columnService= {
  createNew
}