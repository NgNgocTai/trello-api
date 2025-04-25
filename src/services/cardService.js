import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'
const createNew = async (data) => {
  try {
    const newCard = { ...data }
    const createdCard = await cardModel.createNew(newCard)
    //Lấy bản ghi board sau khi gọi (tùy mục đích có cần bước này không)
    const getNewCard = await cardModel.findOneById(createdCard.insertedId)
    //Xử lý đoạn thêm cardId vào cardOrderIds ở đây
    if (getNewCard) {
      await columnModel.pushCardOrderIds(getNewCard)
    }
    return getNewCard
} catch (error) {
    throw error
  }
}

export const cardService = {
  createNew
}