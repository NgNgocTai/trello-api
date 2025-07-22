import express from 'express'
import { boardRoute } from '~/routes/v1/boardRoute'
import { columnRoute } from '~/routes/v1/columnRoute'
import { cardRoute } from '~/routes/v1/cardRoute'
import { userRoute } from '~/routes/v1/userRoute'
const Router = express.Router()

// Board Apis
Router.use('/boards', boardRoute)

// Column Apis
Router.use('/columns', columnRoute)

// Card Apis
Router.use('/cards', cardRoute)

// User Apis
Router.use('/users', userRoute)


export const APIs_V1 = Router
