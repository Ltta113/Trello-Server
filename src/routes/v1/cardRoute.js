import express from 'express'
import { cardValidation } from '~/validations/cardValidation.js'
import { cardController } from '~/controllers/cardController.js'
import { verifyAccessToken } from '~/middlewares/verifyToken'
import { checkUserPermissionCard, checkUserPermissionCheckItem } from '~/middlewares/checkUserPermission'

const Router = express.Router()

Router.use(verifyAccessToken)
Router.route('/')
  .post([cardValidation.createNew], cardController.createNew)
Router.route('/support/move_checkItem')
  .put(checkUserPermissionCheckItem, cardValidation.moveCheckItemToDiff, cardController.moveCheckItemToDiff)

Router.use('/:id', checkUserPermissionCard)
Router.route('/:id')
  .get(cardController.getDetail)
  .put(cardController.update)
  .delete(cardController.deleteItem)

export const cardRoute = Router