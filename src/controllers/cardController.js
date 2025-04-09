import { StatusCodes } from 'http-status-codes'
import { cardService } from '~/services/cardService'
const createNew = async (req, res, next) => {
  try {
    //Tiếp đến là điều hướng dữ liệu sang tầng service
    const createdCard = await cardService.createNew(req.body)
    res.status(StatusCodes.CREATED).json(createdCard)
  } catch (err) {
    next(err)
}}

export const cardController = { createNew }