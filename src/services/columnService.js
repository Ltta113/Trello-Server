/* eslint-disable no-useless-catch */
import { cardModel } from '~/models/cardModel.js'
import { columnModel } from '../models/columnModel.js'
import mongoose from 'mongoose'
import { boardModel } from '~/models/boardModel.js'

const createNew = async (reqBody) => {
  try {
    const newColumn = {
      ...reqBody
    }

    const createdColumn = await columnModel.create(newColumn)
    const createdColumnObject = await columnModel.findById(createdColumn._id)
      .select('-_destroy -__v')
      .lean()

    // Thêm thuộc tính cards với giá trị là một mảng rỗng
    createdColumnObject.cards = []
    return createdColumnObject
  } catch (error) { throw error }
}
const update = async ( columnId, reqBody ) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    await columnModel.findByIdAndUpdate(
      new mongoose.Types.ObjectId(columnId),
      updateData,
      { new: true }
    )
    const createdColumnObject = await columnModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(columnId),
          _destroy: false
        }
      }, {
        $lookup: {
          from: 'cards',
          localField: '_id',
          foreignField: 'columnId',
          as: 'cards'
        }
      }
    ])

    return createdColumnObject[0] || null

  } catch (error) {
    throw error
  }
}
const deleteItem = async (columnId) => {
  try {
    await columnModel.findByIdAndDelete(
      new mongoose.Types.ObjectId(columnId)
    )
    await cardModel.deleteMany({ columnId: columnId })

    await boardModel.updateMany(
      {},
      { $pull: { columnOrderIds: columnId } }
    )

    return { deleteResult : 'Column and its Cards deleted succesfully!' }
  } catch (error) { throw error }
}

export const columnService = {
  createNew,
  update,
  deleteItem
}
