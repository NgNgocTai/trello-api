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

const validateBeforeCreate = async(data) => {
  return await COLUMN_COLLECTION_SCHEMA.validateAsync(data, { abortEarly:false })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    //Biến đổi dữ liệu id từ string --> objectId
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

export const columnModel = {
  COLUMN_COLLECTION_NAME,
  COLUMN_COLLECTION_SCHEMA,
  createNew,
  findOneById
}