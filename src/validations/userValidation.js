import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/middlewares/ApiError'

const register = async (req, res, next) => {
  const correctionCondition = Joi.object({
    firstname: Joi.string().required().min(1).max(50).trim().strict().messages({
      'any.required': 'Firstname is required',
      'string.empty': 'Firstname is not allowed to be empty',
      'string.min': 'Firstname must be at least {#limit} characters',
      'string.max': 'Firstname must be less than or equal to {#limit} characters',
      'string.trim': 'Firstname must not have leading or trailing whitespace'
    }),
    lastname: Joi.string().required().min(1).max(50).trim().strict().messages({
      'any.required': 'Lastname is required',
      'string.empty': 'Lastname is not allowed to be empty',
      'string.min': 'Lastname must be at least {#limit} characters',
      'string.max': 'Lastname must be less than or equal to {#limit} characters',
      'string.trim': 'Lastname must not have leading or trailing whitespace'
    }),
    email: Joi.string().required().email().messages({
      'any.required': 'Email is required',
      'string.empty': 'Email is not allowed to be empty',
      'string.email': 'Email must be a valid email address'
    }),
    password: Joi.string().required().min(3).max(50).messages({
      'any.required': 'Password is required',
      'string.empty': 'Password is not allowed to be empty',
      'string.min': 'Password must be at least {#limit} characters',
      'string.max': 'Password must be less than or equal to {#limit} characters'
    })
  })
  try {
    await correctionCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}
const login = async (req, res, next) => {
  const correctionCondition = Joi.object({
    email: Joi.string().required().email().messages({
      'string.empty': 'Email is not allowed to be empty',
      'string.email': 'Email must be a valid email address'
    }),
    password: Joi.string().required().min(3).max(50).messages({
      'any.required': 'Password is required',
      'string.empty': 'Password is not allowed to be empty'
    })
  })
  try {
    await correctionCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const userValidation = {
  register,
  login
}