import express from 'express'
import { checkItemValidation } from '~/validations/checkItemValidation.js'
import { checkItemController } from '~/controllers/checkItemController.js'
import { verifyAccessToken } from '~/middlewares/verifyToken'
import { checkUserPermissionCheckItem } from '~/middlewares/checkUserPermission'

const Router = express.Router()

Router.use(verifyAccessToken)
Router.route('/')
  .post([checkItemValidation.createNew], checkItemController.createNew)

Router.use('/:id', checkUserPermissionCheckItem)
Router.route('/:id')
  .get(checkItemController.getDetail)
  .put(checkItemController.update)
  .delete(checkItemController.deleteItem)

export const checkItemRoute = Router