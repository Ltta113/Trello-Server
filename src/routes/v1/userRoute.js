import express from 'express'
import { userValidation } from '~/validations/userValidation'
import { useController } from '~/controllers/userController'
import { verifyAccessToken } from '~/middlewares/verifyToken'
import { userService } from '~/services/userService'
import upload from '~/config/upload'

const Router = express.Router()

Router.route('/')
  //   .get(useController.getAllBoard)
  .post(userValidation.register, useController.register)
Router.route('/finalregister/:token')
  .get(userService.finalRegister)
Router.route('/current')
  .get(verifyAccessToken, useController.getCurrent)
  .put(verifyAccessToken, userService.updateUser)
Router.route('/login')
  .post(userValidation.login, useController.login)
Router.route('/checkPassword')
  .put(verifyAccessToken, userService.checkPassword)
Router.route('/logout')
  .get(verifyAccessToken, userService.logout)
Router.route('/avatar')
  .put(verifyAccessToken, upload.single('image'), userService.uploadAvatar)
  .delete(verifyAccessToken, userService.deleteAvatar)
Router.route('/refreshToken')
  .post(userService.refreshAccessToken)
Router.route('/forgotPassword')
  .post(userService.forgotPassword)
Router.route('/confirmResetPassword')
  .post(userService.resetPassword)
Router.route('/reset-password/:token')
  .get(userService.checkTokenResetPassword)


export const userRoute = Router