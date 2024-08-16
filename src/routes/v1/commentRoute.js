import express from 'express'
import { commentController } from '~/controllers/commentController'
// import { verifyAccessToken } from '~/middlewares/verifyToken'

const Router = express.Router()

Router.route('/')
  .post(commentController.createNew)
Router.route('/:id')
  .put(commentController.update)
  .delete(commentController.deleteItem)

export const commentRoute = Router