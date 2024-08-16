/* eslint-disable no-useless-catch */
import { checkListModel } from '~/models/checkListModel.js'
import { checkItemModel } from '../models/checkItemModel.js'
import mongoose from 'mongoose'

const createNew = async (reqBody) => {
  try {
    const newCheckItem = {
      ...reqBody
    }
    const createdCheckItem = await checkItemModel.create(newCheckItem)

    return createdCheckItem
  } catch (error) { throw error }
}

const update = async ( checkItemId, reqBody ) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    const updatedCheckItem = await checkItemModel.findByIdAndUpdate(
      new mongoose.Types.ObjectId(checkItemId),
      updateData,
      { new: true }
    )
    return updatedCheckItem

  } catch (error) {
    throw error
  }
}

const getDetail = async ( checkItemId ) => {
  try {

    const updatedCheckItem = await checkItemModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(checkItemId)
        }
      }
    //   {
    //     $lookup: {
    //       from: 'checkItems',
    //       localField: '_id',
    //       foreignField: 'checkupdatedCheckItemId',
    //       as: 'checkItems'
    //     }
    //   }
    ])
    return updatedCheckItem

  } catch (error) {
    throw error
  }
}
const deleteItem = async (checkItemId) => {
  try {
    await checkItemModel.findByIdAndDelete(
      new mongoose.Types.ObjectId(checkItemId)
    )
    await checkListModel.updateMany(
      {},
      { $pull: { listItemOrderIds: checkItemId } }
    )

    return { deleteResult: 'Check Item deleted succesfully!' }
  } catch (error) { throw error }
}

export const checkItemService = {
  createNew,
  update,
  getDetail,
  deleteItem
}
