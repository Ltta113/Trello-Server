/* eslint-disable no-unused-vars */
import { StatusCodes } from 'http-status-codes'
import { checkListService } from '~/services/checkListService.js'

const createNew = async (req, res, next) => {
  try {
    const createCheckList = await checkListService.createNew(req.body)

    res.status(StatusCodes.CREATED).json(createCheckList)
  } catch (error) { next(error) }
}
const update = async (req, res, next) => {
  try {
    const checkList = await checkListService.update(req.params.id, req.body)

    res.status(StatusCodes.OK).json(checkList)
  } catch (error) { next(error) }
}
const getDetail = async (req, res, next) => {
  try {
    const checkList = await checkListService.getDetail(req.params.id)

    res.status(StatusCodes.OK).json(checkList)
  } catch (error) { next(error) }
}
const deleteItem = async (req, res, next) => {
  try {
    const result = await checkListService.deleteItem(req.params.id)

    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

export const checkListController = {
  createNew,
  update,
  getDetail,
  deleteItem
}