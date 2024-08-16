/* eslint-disable no-useless-catch */
import { labelModel } from '~/models/labelModel.js'
import mongoose from 'mongoose'

const createNew = async (reqBody) => {
  try {
    const newLabel = {
      ...reqBody
    }
    const createdLabel = await labelModel.create(newLabel)

    return createdLabel
  } catch (error) { throw error }
}

const update = async (labelId, reqBody) => {
  try {
    const updateData = {
      ...reqBody
    }
    const updatedLabel = await labelModel.findByIdAndUpdate(
      new mongoose.Types.ObjectId(labelId),
      updateData,
      { new: true }
    )
    return updatedLabel

  } catch (error) {
    throw error
  }
}

const getDetail = async (labelId) => {
  try {

    const updatedLabel = await labelModel.findById(
      new mongoose.Types.ObjectId(labelId)
    )
    return updatedLabel

  } catch (error) {
    throw error
  }
}
const deleteItem = async (labelId) => {
  try {
    await labelModel.findByIdAndDelete(
      new mongoose.Types.ObjectId(labelId)
    )

    return { deleteResult: 'Label deleted succesfully!' }
  } catch (error) { throw error }
}
const getAllBoardLabel = async (boardId) => {
  try {
    // Tìm tất cả các label theo boardId
    const labels = await labelModel.find({ boardId: boardId }).exec()
    return labels
  } catch (error) { throw error }
}
const addLabel = async (labelId, reqBody) => {
  try {
    const { cardId } = reqBody
    // Cập nhật label bằng cách thêm cardId vào listCard
    const updatedLabel = await labelModel.findByIdAndUpdate(
      labelId,
      { $addToSet: { listCard: cardId } }, // Sử dụng $addToSet để tránh trùng lặp
      { new: true, runValidators: true } // Trả về tài liệu đã cập nhật và kiểm tra tính hợp lệ
    ).exec()

    return updatedLabel
  } catch (error) { throw error }
}

export const labelService = {
  createNew,
  update,
  getDetail,
  deleteItem,
  getAllBoardLabel,
  addLabel
}
