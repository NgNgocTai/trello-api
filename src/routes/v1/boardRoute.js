import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { boardValidation } from '~/validations/boardValidation'
import { boardController } from '~/controllers/boardController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

//authMiddleware để đảm bảo accessToken của user phải hợp lệ đã (login thành công) thì mới được thực hiện các tác vụ sau
Router.route('/')
  .get(authMiddleware.isAuthorized, (req, res) => {
    res.status(StatusCodes.OK).json({ message:'Note : API get list post' })
  })
  .post(authMiddleware.isAuthorized, boardValidation.createNew, boardController.createNew)

Router.route('/:id')
  .get(authMiddleware.isAuthorized, boardController.getDetails)
  .put(authMiddleware.isAuthorized, boardValidation.updateBoard, boardController.updateBoard) //update

//API hỗ trợ việc di chuyển card giữa 2 column khác nhau 
Router.route('/supports/moving_cards')
  .put(authMiddleware.isAuthorized, boardValidation.moveCardToDifferentColumn, boardController.moveCardToDifferentColumn)
export const boardRoute = Router
