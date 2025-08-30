import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { getDb } from '~/config/mongodb.js'
import { ObjectId } from 'mongodb'
import { EMAIL_RULE, EMAIL_RULE_MESSAGE } from '~/utils/validators'
// Define Collection (name & schema)
const CARD_COLLECTION_NAME = 'cards'
const CARD_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  columnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),

  title: Joi.string().required().min(3).max(50).trim().strict(),
  description: Joi.string().optional(),
  cover: Joi.string().default(null),
  memberIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),
  // Dữ liệu comments của Card chúng ta sẽ học cách nhúng -- embedded -- vào bản ghi Card luôn như dưới đây:
  comments: Joi.array().items({
    userId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    userEmail: Joi.string().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
    userAvatar: Joi.string(),
    userDisplayName: Joi.string(),
    content: Joi.string(),
    // Chỗ này lưu ý vì dùng hàm $push để thêm comment nên không set default Date.now luôn giống hàm
    // insertOne khi create được.
    commentedAt: Joi.date().timestamp()
  }).default([]),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})
//Chỉ định ra Fields mà không muốn cập nhật trong hàm update(tránh trường hợp bên client đẩy lên các field ko nên update)
const INVALID_UPDATE_FIELDS =['id', 'createdAt', 'boardId']

const validateBeforeCreate = async(data) => {
  return await CARD_COLLECTION_SCHEMA .validateAsync(data, { abortEarly:false })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    //Biến đổi dữ liệu id từ string --> objectId
    const createdCard = await getDb().collection(CARD_COLLECTION_NAME).insertOne({
      ...validData,
      boardId:new ObjectId(validData.boardId),
      columnId:new ObjectId(validData.columnId)
    })
    return createdCard
  } catch (error) {
    throw new Error(error)
  }
}
const findOneById = async(cardId) => {
  try {
    const result = await getDb().collection(CARD_COLLECTION_NAME).findOne({
      _id:new ObjectId(cardId)
    })
    return result
  } catch (error) {
    throw new Error(error)
  }
}
const updateCard = async (cardId, updateData) => {
  try {
    //Lọc những fields chúng ta không cho phép cập nhật linh tinh
    Object.keys(updateData).forEach(fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })

    //Xu ly lien quan toi objectId
    if (updateData.columnId) {
      updateData.columnId = new ObjectId(updateData.columnId)
    }

    const updatedCard = await getDb().collection(CARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(cardId) },
      {
        $set:updateData
      },
      { returnDocument: 'after' }
    )
    return updatedCard
  } catch (error) {
    throw new Error(error)
  }
}
const deleteManyCardByColumnId= async(columnId) => {
  try {
    const result = await getDb().collection(CARD_COLLECTION_NAME).deleteMany(
      { columnId: new ObjectId(columnId) }
    )
    console.log(result)
    return result
  } catch (error) {
    throw new Error(error)
  }
}

/**
 * Đẩy một phần tử comment vào đầu mảng comments!
 * – Trong JS, ngược lại với push (thêm phần tử vào cuối mảng) sẽ là unshift (thêm phần tử vào đầu mảng), trong mongo dung $push, nhưng bọc data vào Array để trong $each và chỉ định $position: 0
 */
const unshiftNewComment = async (cardId, commentData) => {
  try {
    const result = await getDb().collection(CARD_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(cardId) },
        {
          $push: {
            comments: {
              $each: [commentData],
              $position: 0
            }
          }
        },
        { returnDocument: 'after' } // Trả về document sau khi update
      )

    return result
  } catch (error) {
    throw new Error(error)
  }
}


export const cardModel = {
  CARD_COLLECTION_NAME,
  CARD_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  updateCard,
  deleteManyCardByColumnId,
  unshiftNewComment
}