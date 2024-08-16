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
    description: Joi.string().required().min(3).max(256).trim().strict().messages({
      'any.required': 'Description is required',
      'string.empty': 'Description is not allowed to be empty',
      'string.min': 'Description min 3 chars',
      'string.max': 'Description max 256 chars',
      'string.trim': 'Description must not have leading or trailing whitespace'
    })
  })
  try {
    await correctionCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}
const update = async (req, res, next) => {
  const correctionCondition = Joi.object({
    title: Joi.string().min(3).max(50).trim().strict(),
    description: Joi.string().min(3).max(256).trim().strict(),
    columnOrderIds: Joi.array().items(
      Joi.string().pattern(/^[0-9a-fA-F]{24}$/).message({ 'string.pattern.base': 'Your string is fails to match the Object Id pattern!' })
    )
  })
  try {
    await correctionCondition.validateAsync(req.body, {
      abortEarly: false,
      allowUnknown: true
    })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}
const moveCardToDiffColumn = async (req, res, next) => {
  const correctionCondition = Joi.object({
    cardId: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/).message({ 'string.pattern.base': 'Your string is fails to match the Object Id pattern!' }),
    prevColumnId: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/).message({ 'string.pattern.base': 'Your string is fails to match the Object Id pattern!' }),
    prevCardOrderIds: Joi.array().required().items(
      Joi.string().pattern(/^[0-9a-fA-F]{24}$/).message({ 'string.pattern.base': 'Your string is fails to match the Object Id pattern!' })
    ),
    nextColumnId: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/).message({ 'string.pattern.base': 'Your string is fails to match the Object Id pattern!' }),
    nextCardOrderIds: Joi.array().required().items(
      Joi.string().pattern(/^[0-9a-fA-F]{24}$/).message({ 'string.pattern.base': 'Your string is fails to match the Object Id pattern!' })
    )
  })
  try {
    await correctionCondition.validateAsync(req.body, {
      abortEarly: false
    })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const boardValidation = {
  createNew,
  update,
  moveCardToDiffColumn
}