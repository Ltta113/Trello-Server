/* eslint-disable no-unused-vars */
import { StatusCodes } from 'http-status-codes'
import { commentService } from '~/services/commentService.js'

const createNew = async (req, res, next) => {
  try {
    const createComment = await commentService.createNew(req.body)

    res.status(StatusCodes.CREATED).json(createComment)
  } catch (error) { next(error) }
}
const update = async (req, res, next) => {
  try {
    const comment = await commentService.update(req.params.id, req.body)

    res.status(StatusCodes.OK).json(comment)
  } catch (error) { next(error) }
}
const deleteItem = async (req, res, next) => {
  try {
    const result = await commentService.deleteItem(req.params.id)

    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

export const commentController = {
  createNew,
  update,
  deleteItem
}