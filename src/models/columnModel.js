import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { getDb } from '~/config/mongodb.js'
import { ObjectId } from 'mongodb'

// Define Collection (name & schema)
const COLUMN_COLLECTION_NAME = 'columns'
const COLUMN_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  title: Joi.string().required().min(3).max(50).trim().strict(),
  cardOrderIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})
//Chỉ định ra Fields mà không muốn cập nhật trong hàm update(tránh trường hợp bên client đẩy lên các field ko nên update)
const INVALID_UPDATE_FIELDS =['id', 'createdAt','boardId']

const validateBeforeCreate = async(data) => {
  return await COLUMN_COLLECTION_SCHEMA.validateAsync(data, { abortEarly:false })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    //Sau khi validate dữ liệu hợp lệ rồi chuẩn bị nhét vào db thì đổi dữ liệu id từ string --> objectId
    const createdColumn = await getDb().collection(COLUMN_COLLECTION_NAME).insertOne({
      ...validData,
      boardId:new ObjectId(validData.boardId)
    })
    return createdColumn
  } catch (error) {
    throw new Error(error) 
  }
}

const findOneById = async(id) => {
  try {
    const result = await getDb().collection(COLUMN_COLLECTION_NAME).findOne({
      _id:new ObjectId(id)
    })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const pushCardOrderIds = async (card) => {
  try {
    const updateColumn = await getDb().collection(COLUMN_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(card.columnId) },
      {
        $push: {
          cardOrderIds: new ObjectId(card._id)
        }
      },
      { returnDocument: 'after' }
    )
    return updateColumn
  } catch (error) {
    throw new Error(error)
  }
}
const updateColumn = async (columnId, updateData) => {
  try {
    //Lọc những fields chúng ta không cho phép cập nhật linh tinh
    Object.keys(updateData).forEach(fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })
    //Đối với dữ liệu liên quan objectId thì sửa ở đây, phải fix lại ko thì cardOrderIds sau khi kéo thả sẽ là String hết, do FE đẩy lên là String mà
    if (updateData.cardOrderIds) {
      updateData.cardOrderIds = updateData.cardOrderIds.map(_id => (new ObjectId(_id)))
    }

    const updatedColumn = await getDb().collection(COLUMN_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(columnId) },
      {
        $set:updateData
      },
      { returnDocument: 'after' } // native driver nên dùng returnDocument thay vì new
    )
    return updatedColumn
  } catch (error) {
    throw new Error(error)
  }
}
const deleteOneColumnById = async (columnId) => {
  try {
    const result = await getDb().collection(COLUMN_COLLECTION_NAME).deleteOne( { _id: new ObjectId(columnId) })
    console.log(result)
    return result
  } catch (error) {
    throw new Error(error)
  }
}
export const columnModel = {
  COLUMN_COLLECTION_NAME,
  COLUMN_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  pushCardOrderIds,
  updateColumn,
  deleteOneColumnById
}