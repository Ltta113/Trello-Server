import express from 'express'
import { boardValidation } from '~/validations/boardValidation.js'
import { boardController } from '~/controllers/boardController.js'
import { verifyAccessToken } from '~/middlewares/verifyToken'
import { checkUserPermissionBoard, checkUserPermissionCard } from '~/middlewares/checkUserPermission'

const Router = express.Router()

Router.route('/')
  .get([verifyAccessToken], boardController.getAllBoardOwner)
  .post([verifyAccessToken, boardValidation.createNew], boardController.createNew)
Router.route('/mem')
  .get([verifyAccessToken], boardController.getAllBoardMember)
Router.route('/:id')
  .get([verifyAccessToken, checkUserPermissionBoard], boardController.getDetails)
  .put([verifyAccessToken, checkUserPermissionBoard], boardValidation.update, boardController.update)
Router.route('/support/moving_card')
  .put([verifyAccessToken, checkUserPermissionCard], boardValidation.moveCardToDiffColumn, boardController.moveCardToDiffColumn)

export const boardRoute = Router