import express from 'express'
import upload from '~/config/upload'
import { attachmentController } from '~/controllers/attachmentController'
import { verifyAccessToken } from '~/middlewares/verifyToken'

const Router = express.Router()

Router.route('/')
  .post(verifyAccessToken, upload.single('file'), attachmentController.createNew)
Router.route('/all/:id')
  .get(verifyAccessToken, attachmentController.getAllByCardId)
Router.route('/:id')
  .get(verifyAccessToken, attachmentController.getDetail)
  .put(verifyAccessToken, attachmentController.update)
  .delete(verifyAccessToken, attachmentController.deleteItem)
// Router.route('/')
//   .get([verifyAccessToken], boardController.getAllBoardOwner)
//   .post([verifyAccessToken, boardValidation.createNew], boardController.createNew)
// Router.route('/mem')
//   .get([verifyAccessToken], boardController.getAllBoardMember)
// Router.route('/:id')
//   .get([verifyAccessToken, checkUserPermissionBoard], boardController.getDetails)
//   .put([verifyAccessToken, checkUserPermissionBoard], boardValidation.update, boardController.update)
// Router.route('/support/moving_card')
//   .put([verifyAccessToken, checkUserPermissionCard], boardValidation.moveCardToDiffColumn, boardController.moveCardToDiffColumn)

export const attachmentRoute = Router