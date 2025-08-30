import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'

const createNew = async (data) => {
  try {
    const newCard = { ...data }
    const createdCard = await cardModel.createNew(newCard)
    //Lấy bản ghi card sau khi gọi (tùy mục đích có cần bước này không)
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

const update = async (cardId, reqBody, cardCoverFile, userInfo) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    let updatedCard = {}
    if (cardCoverFile) {
      //Trường hợp upload file lên cloudinary
      const uploadResult = await CloudinaryProvider.streamUpload(cardCoverFile.buffer, 'card-covers')
      // console.log('🚀 ~ update ~ uploadResult:', uploadResult)

      //Lưu lại url của cái file ảnh vào trong db
      updatedCard = await cardModel.updateCard(cardId, {
        cover: uploadResult.secure_url
      })
      //Trường hợp cập nhật comment thì xử lý riêng
    } else if (updateData.commentToAdd) {
      //Tạo dữ liệu để thêm vào db, cần bổ sung những field cần thiết
      const commentData = {
        ...updateData.commentToAdd,
        commentedAt:Date.now(),
        userId:userInfo._id,
        userEmail:userInfo.email
      }

      updatedCard = await cardModel.unshiftNewComment(cardId, commentData)
    }
    else {
      //Các trường hợp update chung như title, description
      updatedCard = await cardModel.updateCard(cardId, updateData)
    }

    return updatedCard
  } catch (error) { throw error }
}

export const cardService = {
  createNew, update
}