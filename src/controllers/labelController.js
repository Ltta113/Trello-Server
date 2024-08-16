/* eslint-disable no-unused-vars */
import { StatusCodes } from 'http-status-codes'
import { labelService } from '~/services/labelService.js'

const createNew = async (req, res, next) => {
  try {
    const createCheckList = await labelService.createNew(req.body)

    res.status(StatusCodes.CREATED).json(createCheckList)
  } catch (error) { next(error) }
}
const update = async (req, res, next) => {
  try {
    const label = await labelService.update(req.params.id, req.body)

    res.status(StatusCodes.OK).json(label)
  } catch (error) { next(error) }
}
const getDetail = async (req, res, next) => {
  try {
    const label = await labelService.getDetail(req.params.id)

    res.status(StatusCodes.OK).json(label)
  } catch (error) { next(error) }
}
const deleteItem = async (req, res, next) => {
  try {
    const result = await labelService.deleteItem(req.params.id)

    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}
const getAllBoardLabel = async (req, res, next) => {
  try {
    const label = await labelService.getAllBoardLabel(req.params.id)

    res.status(StatusCodes.OK).json(label)
  } catch (error) { next(error) }
}
const addLabel = async (req, res, next) => {
  try {
    const label = await labelService.addLabel(req.params.id, req.body)

    res.status(StatusCodes.OK).json(label)
  } catch (error) { next(error) }
}

export const labelController = {
  createNew,
  update,
  getDetail,
  deleteItem,
  getAllBoardLabel,
  addLabel
}