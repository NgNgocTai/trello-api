import express from 'express'
import { boardRoutes } from '~/routes/v1/boardRoute'
import { columnRoutes } from '~/routes/v1/columnRoute'
import { cardRoutes } from '~/routes/v1/cardRoute'
const Router = express.Router()

// Board Apis
Router.use('/boards', boardRoutes)

// Column Apis
Router.use('/columns', columnRoutes)

// Card Apis
Router.use('/cards', cardRoutes)
// //Check status
// Router.get('/status', (req, res) => {
//   res.status(StatusCodes.OK).json({
//     message:'APIs v1 is ready to use'
//   })
// })

export const APIs_V1 = Router
