/* eslint-disable no-unused-vars */
import { StatusCodes } from 'http-status-codes'
import { boardService } from '~/services/boardService.js'

const createNew = async (req, res, next) => {
  try {
    const createBoard = await boardService.createNew(req.body, req.user)
    const { _destroy, __v, ...data } = createBoard.toObject()

    res.status(StatusCodes.CREATED).json(data)
  } catch (error) { next(error) }
}
const getAllBoardOwner = async (req, res, next) => {
  try {
    const boards = await boardService.getAllBoardOwner(req.user)

    res.status(StatusCodes.OK).json(boards)
  } catch (error) { next(error) }
}
const getAllBoardMember = async (req, res, next) => {
  try {
    const boards = await boardService.getAllBoardMember(req.user)

    res.status(StatusCodes.OK).json(boards)
  } catch (error) { next(error) }
}

const getDetails = async (req, res, next) => {
  try {
    const board = await boardService.getDetails(req.params.id, req.user)

    res.status(StatusCodes.OK).json(board)
  } catch (error) { next(error) }
}
const update = async (req, res, next) => {
  try {
    const board = await boardService.update(req.params.id, req.body)

    res.status(StatusCodes.OK).json(board)
  } catch (error) { next(error) }
}
const moveCardToDiffColumn = async (req, res, next) => {
  try {
    const result = await boardService.moveCardToDiffColumn(req.body)

    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

export const boardController = {
  createNew,
  getDetails,
  getAllBoardMember,
  getAllBoardOwner,
  update,
  moveCardToDiffColumn
}