/* eslint-disable no-unused-vars */
import { StatusCodes } from 'http-status-codes'
import { cardService } from '~/services/cardService'

const createNew = async (req, res, next) => {
  try {
    const createCard = await cardService.createNew(req.body)
    const { _destroy, __v, ...data } = createCard.toObject()

    res.status(StatusCodes.CREATED).json(data)
  } catch (error) { next(error) }
}
const update = async (req, res, next) => {
  try {
    const card = await cardService.update(req.params.id, req.body)

    res.status(StatusCodes.OK).json(card)
  } catch (error) { next(error) }
}
const getDetail = async (req, res, next) => {
  try {
    const card = await cardService.getDetail(req.params.id)

    res.status(StatusCodes.OK).json(card)
  } catch (error) { next(error) }
}
const deleteItem = async (req, res, next) => {
  try {
    const result = await cardService.deleteItem(req.params.id)

    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}
const moveCheckItemToDiff = async (req, res, next) => {
  try {
    const result = await cardService.moveCheckItemToDiff(req.body)

    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

export const cardController = {
  createNew,
  update,
  getDetail,
  deleteItem,
  moveCheckItemToDiff
}