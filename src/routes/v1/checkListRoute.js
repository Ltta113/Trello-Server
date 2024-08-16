import express from 'express'
import { checkListValidation } from '~/validations/checkListValidation.js'
import { checkListController } from '~/controllers/checkListController.js'
import { verifyAccessToken } from '~/middlewares/verifyToken'
import { checkUserPermissionCheckList } from '~/middlewares/checkUserPermission'

const Router = express.Router()

Router.use(verifyAccessToken)
Router.route('/')
  .post([checkListValidation.createNew], checkListController.createNew)
Router.use('/:id', checkUserPermissionCheckList)
Router.route('/:id')
  .get(checkListController.getDetail)
  .put(checkListController.update)
  .delete(checkListController.deleteItem)

export const checkListRoute = Router