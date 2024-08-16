import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { boardRoute } from './boardRoute.js'
import { userRoute } from './userRoute.js'
import { columnRoute } from './columnRoute.js'
import { cardRoute } from './cardRoute.js'
import { checkListRoute } from './checkListRoute.js'
import { checkItemRoute } from './checkItemRoute.js'
import { commentRoute } from './commentRoute.js'
import { labelRoute } from './labelRoute.js'
import { attachmentRoute } from './attachmentRoute.js'

const Router = express.Router()

Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'APIs v1 has ready to use' })
})

Router.use('/boards', boardRoute)
Router.use('/users', userRoute)
Router.use('/columns', columnRoute)
Router.use('/cards', cardRoute)
Router.use('/checkLists', checkListRoute)
Router.use('/checkItems', checkItemRoute)
Router.use('/comments', commentRoute)
Router.use('/labels', labelRoute)
Router.use('/attachments', attachmentRoute)

export const APIs_V1 = Router