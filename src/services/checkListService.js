/* eslint-disable no-useless-catch */
import { checkItemModel } from '~/models/checkItemModel.js'
import { checkListModel } from '../models/checkListModel.js'
import mongoose from 'mongoose'
import { cardModel } from '~/models/cardModel.js'

const createNew = async (reqBody) => {
  try {
    const newCheckList = {
      ...reqBody
    }
    const createdCheckList = await checkListModel.create(newCheckList)
    const createdCheckListObject = await checkListModel.findById(createdCheckList._id)
      .select('-_destroy -__v')
      .lean()

    // Thêm thuộc tính cards với giá trị là một mảng rỗng

    createdCheckListObject.checkItems = []

    return createdCheckListObject
  } catch (error) { throw error }
}

const update = async (checkListId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    await checkListModel.findByIdAndUpdate(
      new mongoose.Types.ObjectId(checkListId),
      updateData,
      { new: true }
    )
    const createdCheckListObject = await checkListModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(checkListId),
          _destroy: false
        }
      }, {
        $lookup: {
          from: 'checkitems',
          localField: '_id',
          foreignField: 'checkListId',
          as: 'checkItems'
        }
      }
    ])
    return createdCheckListObject[0] || null

  } catch (error) {
    throw error
  }
}

const getDetail = async (checkListId) => {
  try {

    const updatedCheckList = await checkListModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(checkListId)
        }
      },
      {
        $lookup: {
          from: 'checkitems',
          localField: '_id',
          foreignField: 'checkListId',
          as: 'checkItems'
        }
      }
    ])
    return updatedCheckList

  } catch (error) {
    throw error
  }
}
const deleteItem = async (checkListId) => {
  try {
    await checkListModel.findByIdAndDelete(
      new mongoose.Types.ObjectId(checkListId)
    )
    await checkItemModel.deleteMany({
      checkListId: checkListId
    })
    await cardModel.updateMany(
      {},
      { $pull: { checkListOrderIds: checkListId } }
    )

    return { deleteResult: 'Check List deleted succesfully!' }
  } catch (error) { throw error }
}

export const checkListService = {
  createNew,
  update,
  getDetail,
  deleteItem
}
