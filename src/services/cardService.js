/* eslint-disable no-useless-catch */
import { cardModel } from '../models/cardModel.js'
import mongoose from 'mongoose'
import { cloneDeep } from 'lodash'
import { checkListModel } from '~/models/checkListModel.js'
import { columnModel } from '~/models/columnModel.js'
import { checkItemModel } from '~/models/checkItemModel.js'
import { labelModel } from '~/models/labelModel.js'

const createNew = async (reqBody) => {
  try {
    const newCard = {
      ...reqBody
    }

    const createdCard = await cardModel.create(newCard)

    return createdCard
  } catch (error) { throw error }
}

const update = async (cardId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    await cardModel.findByIdAndUpdate(
      new mongoose.Types.ObjectId(cardId),
      updateData,
      { new: true }
    )
    const updatedCard = await cardModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(cardId)
        }
      },
      {
        $lookup: {
          from: 'checklists',
          localField: '_id',
          foreignField: 'cardId',
          as: 'checkLists'
        }
      },
      {
        $lookup: {
          from: 'checkitems',
          localField: 'checkLists._id',
          foreignField: 'checkListId',
          as: 'checkItems'
        }
      },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'cardId',
          as: 'comments'
        }
      },
      {
        $lookup: {
          from: 'attachments',
          localField: '_id',
          foreignField: 'cardId',
          as: 'attachments'
        }
      }
    ])

    if (!updatedCard.length) {
      return null
    }

    const res = cloneDeep(updatedCard[0])
    res.checkLists.forEach(checkList => {
      checkList.checkItems = res.checkItems.filter(checkItem => checkItem.checkListId.toString() === checkList._id.toString())
    })
    const labels = await labelModel.find({
      listCard: cardId
    }).exec()

    res.labels = labels

    delete res.checkItems

    return res

  } catch (error) {
    throw error
  }
}

const getDetail = async (cardId) => {
  try {

    const updatedCard = await cardModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(cardId)
        }
      },
      {
        $lookup: {
          from: 'checklists',
          localField: '_id',
          foreignField: 'cardId',
          as: 'checkLists'
        }
      },
      {
        $lookup: {
          from: 'checkitems',
          localField: 'checkLists._id',
          foreignField: 'checkListId',
          as: 'checkItems'
        }
      },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'cardId',
          as: 'comments'
        }
      },
      {
        $lookup: {
          from: 'attachments',
          localField: '_id',
          foreignField: 'cardId',
          as: 'attachments'
        }
      }
    ])

    if (!updatedCard.length) {
      return null
    }

    const res = cloneDeep(updatedCard[0])
    res.checkLists.forEach(checkList => {
      checkList.checkItems = res.checkItems.filter(checkItem => checkItem.checkListId.toString() === checkList._id.toString())
    })
    const labels = await labelModel.find({
      listCard: cardId
    }).exec()

    res.labels = labels

    delete res.checkItems

    return res
  } catch (error) {
    throw error
  }
}

const deleteItem = async (cardId) => {
  try {
    await cardModel.findByIdAndDelete(
      new mongoose.Types.ObjectId(cardId)
    )
    await checkListModel.deleteMany({
      cardId: cardId
    })
    await columnModel.updateMany(
      {},
      { $pull: { cardOrderIds: cardId } }
    )

    return { deleteResult: 'Card and its Check List deleted succesfully!' }
  } catch (error) { throw error }
}

const moveCheckItemToDiff = async (reqBody) => {
  try {
    const { checkItemId, prevCheckListId, prevCheckItemOrderIds, nextCheckListId, nextCheckItemOrderIds } = reqBody
    await checkListModel.findByIdAndUpdate(
      new mongoose.Types.ObjectId(prevCheckListId),
      {
        listItemOrderIds: prevCheckItemOrderIds,
        updatedAt: Date.now()
      },
      { new: true }
    )
    await checkListModel.findByIdAndUpdate(
      new mongoose.Types.ObjectId(nextCheckListId),
      {
        listItemOrderIds: nextCheckItemOrderIds,
        updatedAt: Date.now()
      },
      { new: true }
    )
    await checkItemModel.findByIdAndUpdate(
      new mongoose.Types.ObjectId(checkItemId),
      {
        checkListId: nextCheckListId,
        updatedAt: Date.now()
      },
      { new: true }
    )

    return { updateResult: 'Succesfully' }
  } catch (error) {
    throw error
  }
}

export const cardService = {
  createNew,
  update,
  getDetail,
  deleteItem,
  moveCheckItemToDiff
}
