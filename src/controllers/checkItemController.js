/* eslint-disable no-unused-vars */
import { StatusCodes } from 'http-status-codes'
import { checkItemService } from '~/services/checkItemService.js'

const createNew = async (req, res, next) => {
  try {
    const createCheckItem = await checkItemService.createNew(req.body)

    res.status(StatusCodes.CREATED).json(createCheckItem)
  } catch (error) { next(error) }
}
const update = async (req, res, next) => {
  try {
    const checkItem = await checkItemService.update(req.params.id, req.body)

    res.status(StatusCodes.OK).json(checkItem)
  } catch (error) { next(error) }
}
const getDetail = async (req, res, next) => {
  try {
    const checkItem = await checkItemService.getDetail(req.params.id)

    res.status(StatusCodes.OK).json(checkItem)
  } catch (error) { next(error) }
}
const deleteItem = async (req, res, next) => {
  try {
    const result = await checkItemService.deleteItem(req.params.id)

    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

export const checkItemController = {
  createNew,
  update,
  getDetail,
  deleteItem
}