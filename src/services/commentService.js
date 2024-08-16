/* eslint-disable no-useless-catch */
import { commentModel } from '../models/commentModel.js'
import mongoose from 'mongoose'

const createNew = async (reqBody) => {
  try {
    const newComment = {
      ...reqBody
    }
    const createdComment = await commentModel.create(newComment)

    return createdComment
  } catch (error) { throw error }
}

const update = async ( commentId, reqBody ) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    const updatedComment = await commentModel.findByIdAndUpdate(
      new mongoose.Types.ObjectId(commentId),
      updateData,
      { new: true }
    )
    return updatedComment

  } catch (error) {
    throw error
  }
}

const deleteItem = async (commentId) => {
  try {
    await commentModel.findByIdAndDelete(
      new mongoose.Types.ObjectId(commentId)
    )

    return { deleteResult: 'Comment deleted succesfully!' }
  } catch (error) { throw error }
}

export const commentService = {
  createNew,
  update,
  deleteItem
}
