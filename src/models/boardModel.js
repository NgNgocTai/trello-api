import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { getDb } from '~/config/mongodb.js'
import { ObjectId } from 'mongodb'
import { BOARD_TYPES } from '~/utils/constants'
import { columnModel } from '~/models/columnModel'
import { cardModel } from '~/models/cardModel'
import { pagingSkipValue } from '~/utils/algorithms'
import { userModel } from '~/models/userModel'

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
  ownerIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),
  memberIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})
//Chỉ định ra Fields mà không muốn cập nhật trong hàm update(tránh trường hợp bên client đẩy lên các field ko nên update)
const INVALID_UPDATE_FIELDS =['id', 'createdAt']

const validateBeforeCreate = async(data) => {
  return await BOARD_COLLECTION_SCHEMA.validateAsync(data, { abortEarly:false })
}

const createNew = async (userId, data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const createdBoard = await getDb().collection(BOARD_COLLECTION_NAME).insertOne(
      { ...validData, ownerIds:[new ObjectId(userId)] })
    return createdBoard
  } catch (error) {
    throw new Error(error) // new Error để lấy dc cả StackTrace, error không thì không lấy được
  }
}

//Chỉ để lấy board không thôi
const findOneById = async(boardId) => {
  try {
    const result = await getDb().collection(BOARD_COLLECTION_NAME).findOne({
      _id:new ObjectId(boardId)
    })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

//Query tổng hợp (aggregate) để lấy toàn bô column, card thuộc về board
const getDetails = async(userId, boardId) => {
  try {
    //Điều kiện
    const queryConditions = [
      { _id: new ObjectId(boardId) },
      //Board chưa bị xóa
      { _destroy:false },
      //user thực hiện request phải nằm trong owner hoặc member
      { $or:[
        { ownerIds: { $all: [new ObjectId(userId)] } },
        { memberIds: { $all: [new ObjectId(userId)] } }
      ] }
    ]
    // const result = await getDb().collection(BOARD_COLLECTION_NAME).findOne({ _id:new ObjectId(id) })
    const result = await getDb().collection(BOARD_COLLECTION_NAME).aggregate([
      { $match: { $and:queryConditions } },
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
      },
      // Join ra danh sách owners
      {
        $lookup: {
          from: userModel.USER_COLLECTION_NAME,
          localField: 'ownerIds',
          foreignField: '_id',
          as: 'owners',
          // pipeline để xử lý 1 hoặc nhiều luồng cần thiết
          // $projec để chỉ định vài field không muốn trả về bằng cách gán giá trị là 0
          pipeline: [
            { $project: { password: 0, verifyToken: 0 } }
          ]
        }
      },

      // Join ra danh sách members
      {
        $lookup: {
          from: userModel.USER_COLLECTION_NAME,
          localField: 'memberIds',
          foreignField: '_id',
          as: 'members',
          pipeline: [
            { $project: { password: 0, verifyToken: 0 } }
          ]
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
    //Lọc những fields chúng ta không cho phép cập nhật linh tinh
    Object.keys(updateData).forEach(fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })
    //Đối với dữ liệu liên quan objectId thì sửa ở đây, phải fix lại ko thì columnOrderIds sau khi kéo thả sẽ là String hết, do FE đẩy lên là String mà
    if (updateData.columnOrderIds) {
      updateData.columnOrderIds = updateData.columnOrderIds.map(_id => (new ObjectId(_id)))
    }
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
// Lấy 1 phần tử columnId ra khỏi mảng columnOrderIds
const pullColumnOrderIds = async (column) => {
  try {
    const updateBoard = await getDb()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(column.boardId) }, // tìm board theo id
        {
          $pull: { columnOrderIds: new ObjectId(column._id) }
        },
        { returnDocument: 'after' } // trả về document mới sau update
      )

    return updateBoard
  } catch (error) {
    throw new Error(error)
  }
}

const getBoards = async (userId, page, itemsPerPage) => {
  try {
    //Điều kiện
    const queryConditions = [
      //Board chưa bị xóa
      { _destroy:false },
      //user thực hiện request phải nằm trong owner hoặc member
      { $or:[
        { ownerIds: { $all: [new ObjectId(userId)] } },
        { memberIds: { $all: [new ObjectId(userId)] } }
      ] }
    ]

    const query = await getDb().collection(BOARD_COLLECTION_NAME).aggregate([
      { $match:{ $and:queryConditions } },
      //sort title board theo thứ tự từ A-->Z
      { $sort: { title:1 } },
      //Xử lý nhiều luồng trong một query
      { $facet: {
        //Luồng thứ nhất: Query Boards
        'queryBoards':[
          { $skip: pagingSkipValue(page, itemsPerPage) },
          { $limit: itemsPerPage } // Giới hạn số lượng bản ghi trả về trên một page
        ],
        //Luồng thứ hai: Query đếm số tổng bản ghi boards trong db và trả kqua vào biến countedAllBoards
        'queryTotalBoards':[{ $count:'countedAllBoards' }]
      } }
    ],
    { collation:{ locale:'en' } }
    ).toArray()
    console.log('query:', query)
    const res = query[0]
    // console.log('Boards result:', res.queryBoards, 'Total:', res.queryTotalBoards[0]?.countedAllBoards)

    return {
      boards:res.queryBoards || [],
      totalBoards:res.queryTotalBoards[0]?.countedAllBoards|| 0
    }

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
  updateBoard,
  pullColumnOrderIds,
  getBoards
}
