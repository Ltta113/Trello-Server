import express from 'express'
import { columnValidation } from '~/validations/columnValidation.js'
import { columnController } from '~/controllers/columnController.js'
import { verifyAccessToken } from '~/middlewares/verifyToken'
import { checkUserPermissionColumn } from '~/middlewares/checkUserPermission'

const Router = express.Router()

Router.use(verifyAccessToken)
Router.route('/')
  .post([columnValidation.createNew], columnController.createNew)
Router.use('/:id', checkUserPermissionColumn)
Router.route('/:id')
  .put(columnValidation.update, columnController.update)
  .delete(columnValidation.deleteItem, columnController.deleteItem)

export const columnRoute = Router