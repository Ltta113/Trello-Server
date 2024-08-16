/* eslint-disable no-unused-vars */
/* eslint-disable no-useless-catch */
import { slugify } from '../utils/formatter.js'
import { boardModel } from '../models/boardModel.js'
import ApiError from '../middlewares/ApiError.js'
import { StatusCodes } from 'http-status-codes'
import mongoose from 'mongoose'
import { cloneDeep } from 'lodash'
import { columnModel } from '~/models/columnModel.js'
import { cardModel } from '~/models/cardModel.js'

const createNew = async (reqBody, reqUser) => {
  try {
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title),
      ownerIds: [reqUser._id]
    }

    const createdBoard = await boardModel.create(newBoard)

    return createdBoard
  } catch (error) { throw error }
}
const getAllBoardOwner = async (reqUser) => {
  try {
    const boards = await boardModel.find({
      ownerIds: { $in: [reqUser._id] }
    })

    return boards
  } catch (error) { throw error }
}
const getAllBoardMember = async (reqUser) => {
  try {
    const boards = await boardModel.find({
      memberIds: { $in: [reqUser._id] }
    })

    return boards
  } catch (error) { throw error }
}
const getDetails = async (boardId, reqUser) => {
  try {
    const board = await boardModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(boardId),
          _destroy: false,
          $or: [
            { ownerIds: { $in: [new mongoose.Types.ObjectId(reqUser._id)] } },
            { memberIds: { $in: [new mongoose.Types.ObjectId(reqUser._id)] } }
          ]
        }
      },
      {
        $lookup: {
          from: 'columns',
          localField: '_id',
          foreignField: 'boardId',
          as: 'columns'
        }
      },
      {
        $lookup: {
          from: 'cards',
          localField: '_id',
          foreignField: 'boardId',
          as: 'cards'
        }
      },
      {
        $lookup: {
          from: 'labels',
          localField: '_id',
          foreignField: 'boardId',
          as: 'labels'
        }
      },
      {
        $lookup: {
          from: 'attachments',
          localField: 'cards._id',
          foreignField: 'cardId',
          as: 'attachments'
        }
      },
      {
        $addFields: {
          cards: {
            $map: {
              input: '$cards',
              as: 'card',
              in: {
                $mergeObjects: [
                  '$$card',
                  {
                    attachments: {
                      $filter: {
                        input: '$attachments',
                        as: 'attachment',
                        cond: { $eq: ['$$attachment.cardId', '$$card._id'] }
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      },
      {
        $lookup: {
          from: 'comments',
          localField: 'cards._id',
          foreignField: 'cardId',
          as: 'comments'
        }
      },
      {
        $addFields: {
          cards: {
            $map: {
              input: '$cards',
              as: 'card',
              in: {
                $mergeObjects: [
                  '$$card',
                  {
                    comments: {
                      $filter: {
                        input: '$comments',
                        as: 'comment',
                        cond: { $eq: ['$$comment.cardId', '$$card._id'] }
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      }
    ])
    if (board.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found')
    }

    const resBoard = cloneDeep(board[0])
    resBoard.columns.forEach(column => {
      column.cards = resBoard.cards.filter(card => card.columnId.toString() === column._id.toString())
    })

    delete resBoard.cards

    return resBoard || null
  } catch (error) {
    throw error
  }
}
const update = async (boardId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    await boardModel.findByIdAndUpdate(
      new mongoose.Types.ObjectId(boardId),
      updateData,
      { new: true }
    )

    // Sau đó sử dụng aggregate để lấy dữ liệu đầy đủ
    const updatedBoard = await boardModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(boardId),
          _destroy: false
        }
      },
      {
        $lookup: {
          from: 'columns',
          localField: '_id',
          foreignField: 'boardId',
          as: 'columns'
        }
      },
      {
        $lookup: {
          from: 'cards',
          localField: '_id',
          foreignField: 'boardId',
          as: 'cards'
        }
      },
      {
        $lookup: {
          from: 'labels',
          localField: '_id',
          foreignField: 'boardId',
          as: 'labels'
        }
      },
      {
        $lookup: {
          from: 'attachments',
          localField: 'cards._id',
          foreignField: 'cardId',
          as: 'attachments'
        }
      },
      {
        $addFields: {
          cards: {
            $map: {
              input: '$cards',
              as: 'card',
              in: {
                $mergeObjects: [
                  '$$card',
                  {
                    attachments: {
                      $filter: {
                        input: '$attachments',
                        as: 'attachment',
                        cond: { $eq: ['$$attachment.cardId', '$$card._id'] }
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      },
      {
        $lookup: {
          from: 'comments',
          localField: 'cards._id',
          foreignField: 'cardId',
          as: 'comments'
        }
      },
      {
        $addFields: {
          cards: {
            $map: {
              input: '$cards',
              as: 'card',
              in: {
                $mergeObjects: [
                  '$$card',
                  {
                    comments: {
                      $filter: {
                        input: '$comments',
                        as: 'comment',
                        cond: { $eq: ['$$comment.cardId', '$$card._id'] }
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      }
    ])

    if (!updatedBoard.length) {
      return null
    }

    const resBoard = cloneDeep(updatedBoard[0])
    resBoard.columns.forEach(column => {
      column.cards = resBoard.cards.filter(card => card.columnId.toString() === column._id.toString())
    })

    delete resBoard.cards

    return resBoard
  } catch (error) {
    throw error
  }
}
const moveCardToDiffColumn = async (reqBody) => {
  try {
    const { cardId, prevColumnId, prevCardOrderIds, nextColumnId, nextCardOrderIds } = reqBody

    await columnModel.findByIdAndUpdate(
      new mongoose.Types.ObjectId(prevColumnId),
      {
        cardOrderIds: prevCardOrderIds,
        updatedAt: Date.now()
      },
      { new: true }
    )
    await columnModel.findByIdAndUpdate(
      new mongoose.Types.ObjectId(nextColumnId),
      {
        cardOrderIds: nextCardOrderIds,
        updatedAt: Date.now()
      },
      { new: true }
    )
    await cardModel.findByIdAndUpdate(
      new mongoose.Types.ObjectId(cardId),
      {
        columnId: nextColumnId,
        updatedAt: Date.now()
      },
      { new: true }
    )

    return { updateResult: 'Succesfully' }
  } catch (error) {
    throw error
  }
}

export const boardService = {
  createNew,
  getDetails,
  getAllBoardOwner,
  getAllBoardMember,
  update,
  moveCardToDiffColumn
}
