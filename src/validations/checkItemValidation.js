import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../middlewares/ApiError.js'

const createNew = async (req, res, next) => {
  const correctionCondition = Joi.object({
    title: Joi.string().required().min(3).max(50).trim().strict().messages({
      'any.required': 'Title is required',
      'string.empty': 'Title is not allowed to be empty',
      'string.min': 'Title min 3 chars',
      'string.max': 'Title max 50 chars',
      'string.trim': 'Title must not have leading or trailing whitespace'
    }),
    checkListId: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/).messages({
      'string.pattern.base': 'Your string is fails to match the Object Id pattern!',
      'any.required': 'Check List Id is required',
      'string.empty': 'Check List Id is not allowed to be empty'
    }),
    boardId: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/).messages({
      'string.pattern.base': 'Your string is fails to match the Object Id pattern!',
      'any.required': 'Board Id is required',
      'string.empty': 'Board Id is not allowed to be empty'
    })
  })
  try {
    await correctionCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const checkItemValidation = {
  createNew
}