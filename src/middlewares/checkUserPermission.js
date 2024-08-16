import mongoose from 'mongoose'
import { boardModel } from '~/models/boardModel' // Import boardModel từ file tương ứng
import { StatusCodes } from 'http-status-codes'
import ApiError from './ApiError' // Đảm bảo bạn có lớp ApiError để xử lý lỗi tùy chỉnh
import { columnModel } from '~/models/columnModel'
import { cardModel } from '~/models/cardModel'
import { checkListModel } from '~/models/checkListModel'
import { checkItemModel } from '~/models/checkItemModel'
import { labelModel } from '~/models/labelModel'

export const checkBoard = async (boardId, userId) => {
  const board = await boardModel.findOne({
    _id: new mongoose.Types.ObjectId(boardId),
    _destroy: false,
    $or: [
      { ownerIds: userId },
      { memberIds: userId }
    ]
  })

  if (!board) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'You do not have permission to access this')
  }
}

export const checkUserPermissionBoard = async (req, res, next) => {
  const boardId = req.params.id || req.body.boardId
  const userId = req.user._id

  try {
    await checkBoard(boardId, userId)
    next()
  } catch (error) {
    next(error)
  }
}
export const checkUserPermissionColumn = async (req, res, next) => {
  const columnId = req.params.id || req.body.columnId
  const userId = req.user._id

  try {
    const column = await columnModel.findOne({
      _id: new mongoose.Types.ObjectId(columnId),
      _destroy: false
    })

    if (!column) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Column not found')
    }

    await checkBoard(column.boardId, userId)
    next()
  } catch (error) {
    next(error)
  }
}
export const checkUserPermissionLabel = async (req, res, next) => {
  const labelId = req.params.id || req.body.labelId
  const userId = req.user._id

  try {
    const label = await labelModel.findOne({
      _id: new mongoose.Types.ObjectId(labelId)
    })

    if (!label) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'label not found')
    }

    await checkBoard(label.boardId, userId)
    next()
  } catch (error) {
    next(error)
  }
}
export const checkUserPermissionCard = async (req, res, next) => {
  const cardId = req.params.id || req.body.cardId
  const userId = req.user._id

  try {
    const card = await cardModel.findOne({
      _id: new mongoose.Types.ObjectId(cardId),
      _destroy: false
    })
    await checkBoard(card.boardId, userId)
    next()
  } catch (error) {
    next(error)
  }
}
export const checkUserPermissionCheckList = async (req, res, next) => {
  const checkListId = req.params.id || req.body.checkListId
  const userId = req.user._id

  try {
    const checkList = await checkListModel.findOne({
      _id: new mongoose.Types.ObjectId(checkListId),
      _destroy: false
    })
    await checkBoard(checkList.boardId, userId)
    next()
  } catch (error) {
    next(error)
  }
}
export const checkUserPermissionCheckItem = async (req, res, next) => {
  const checkItemId = req.params.id || req.body.checkItemId
  const userId = req.user._id

  try {
    const checkItem = await checkItemModel.findOne({
      _id: new mongoose.Types.ObjectId(checkItemId),
      _destroy: false
    })
    await checkBoard(checkItem.boardId, userId)
    next()
  } catch (error) {
    next(error)
  }
}

