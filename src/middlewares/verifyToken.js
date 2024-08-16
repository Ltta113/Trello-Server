import jwt from 'jsonwebtoken'
import ApiError from './ApiError'
import { StatusCodes } from 'http-status-codes'

export const verifyAccessToken = async (req, res, next) => {
  try {
    if (req?.headers?.authorization?.startsWith('Bearer')) {
      const token = req.headers.authorization.split(' ')[1]
      jwt.verify(token, process.env.JWT_TOKEN, (err, decode) => {
        if (err) {
          throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid access token')
        }
        req.user = decode
        next()
      })
    } else {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Require authentication!!!')
    }
  } catch (error) {
    next(error)
  }
}
