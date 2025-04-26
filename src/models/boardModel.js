import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { getDb } from '~/config/mongodb.js'
import { ObjectId } from 'mongodb'
import { BOARD_TYPES } from '~/utils/constants'
import { columnModel } from '~/models/columnModel'
import { cardModel } from '~/models/cardModel'
// Define Collection (name & schema)
const BOARD_COLLECTION_NAME = 'boards'
const BOARD_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(50).trim().strict(),
  slug: Joi.string().required().min(3).trim().strict(),
  description: Joi.string().required().min(3).max(256).trim().strict(),
  type:Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE).required(),
  columnOrderIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const validateBeforeCreate = async(data) => {
  return await BOARD_COLLECTION_SCHEMA.validateAsync(data, { abortEarly:false }) 
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const createdBoard = await getDb().collection(BOARD_COLLECTION_NAME).insertOne(validData)
    return createdBoard
  } catch (error) {
    throw new Error(error) // new Error để lấy dc cả StackTrace, error không thì không lấy được 
  }
}

//Chỉ để lấy board không thôi
const findOneById = async(id) => {
  try {
    const result = await getDb().collection(BOARD_COLLECTION_NAME).findOne({
      _id:new ObjectId(id)
    })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

//Query tổng hợp (aggregate) để lấy toàn bô column, card thuộc về board
const getDetails = async(id) => {
  try {
    // const result = await getDb().collection(BOARD_COLLECTION_NAME).findOne({ _id:new ObjectId(id) })
    const result = await getDb().collection(BOARD_COLLECTION_NAME).aggregate([
      { $match: { 
        _id: new ObjectId(id),
        _destroy: false
      } },
      {
        $lookup:
          {
            from:columnModel.COLUMN_COLLECTION_NAME,
            localField: '_id',
            foreignField: 'boardId',
            as: 'columns'
          }
      },
      {
        $lookup:
          {
            from:cardModel.CARD_COLLECTION_NAME,
            localField: '_id',
            foreignField: 'boardId',
            as: 'cards'
          }
      }
    ]).toArray()
    // console.log(result) // Tự động lấy ra thêm 2 trường là columns:[] và cards:[]
    return result[0] || null
  } catch (error) {
    throw new Error(error)
  }
}

const pushColumnOrderIds = async (column) => {
  try {
    const updateBoard = await getDb().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(column.boardId) },
      {
        $push: {
          columnOrderIds: new ObjectId(column._id)
        }
      },
      { returnDocument: 'after' } // native driver nên dùng returnDocument thay vì new
    )
    return updateBoard
  } catch (error) {
    throw new Error(error)
  }
}

const updateBoard = async (boardId, updateData) => {
  try {
    const updatedBoard = await getDb().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(boardId) },
      {
        $set:updateData
      },
      { returnDocument: 'after' } // native driver nên dùng returnDocument thay vì new
    )
    return updatedBoard
  } catch (error) {
    throw new Error(error)
  }
}
export const boardModel = {
  BOARD_COLLECTION_NAME,
  BOARD_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getDetails,
  pushColumnOrderIds,
  updateBoard
}
