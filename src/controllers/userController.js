/* eslint-disable no-unused-vars */
import { StatusCodes } from 'http-status-codes'
import { userModel } from '~/models/userModel'
import { userService } from '~/services/userService'

const register = async (req, res, next) => {
  try {
    const data = await userService.register(req.body, res)

    res.status(StatusCodes.CREATED).json(data)

  } catch (error) {
    next(error)
  }
}
const login = async (req, res, next) => {
  try {
    const data = await userService.authenticateUser(req, res)

    res.status(StatusCodes.OK).json(data)

  } catch (error) {
    next(error)
  }
}
const getCurrent = async (req, res, next) => {
  try {
    const data = await userService.getCurrent(req)

    res.status(StatusCodes.OK).json(data)

  } catch (error) {
    next(error)
  }
}

export const useController = {
  register,
  login,
  getCurrent
}