import { StatusCodes } from 'http-status-codes'
import { columnService } from '~/services/columnService'
const createNew = async (req, res, next) => {
  try {
    //Tiếp đến là điều hướng dữ liệu sang tầng service
    const createdColumn = await columnService.createNew(req.body)
    res.status(StatusCodes.CREATED).json(createdColumn)
  } catch (err) {
    next(err)
}}
const updateColumn = async (req, res, next) => {
  try {
    const columnId = req.params.id
    const column = await columnService.updateColumn(columnId, req.body)

    res.status(StatusCodes.OK).json(column)
  } catch (error) {
    next(error)
  }
}
export const columnController = { createNew, updateColumn }