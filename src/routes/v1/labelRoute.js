import express from 'express'
import { labelController } from '~/controllers/labelController'
import { checkUserPermissionBoard, checkUserPermissionLabel } from '~/middlewares/checkUserPermission'
import { verifyAccessToken } from '~/middlewares/verifyToken'

const Router = express.Router()

Router.use(verifyAccessToken)
Router.route('/')
  .post(labelController.createNew)
Router.route('/all/:id')
  .get(checkUserPermissionBoard, labelController.getAllBoardLabel)
Router.route('/add/:id')
  .put(checkUserPermissionLabel, labelController.addLabel)
Router.use('/:id', checkUserPermissionLabel)
Router.route('/:id')
  .get(labelController.getDetail)
  .put(labelController.update)
  .delete(labelController.deleteItem)

export const labelRoute = Router