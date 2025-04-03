import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { boardRoutes } from '~/routes/v1/boardRoute'
const Router = express.Router()

// Board Apis
Router.use('/boards', boardRoutes)

//Check status
Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({
    message:'APIs v1 is ready to use'
  })
})

export const APIs_V1 = Router
