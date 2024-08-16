import { Schema, model } from 'mongoose'
import { checkListModel } from './checkListModel'

const checkItemSchema = new Schema({
  checkListId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  boardId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  title: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
    trim: true
  },
  state: {
    type: String,
    enum: ['incomplete', 'complete', 'expired'],
    default: 'incomplete'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: null
  },
  _destroy: {
    type: Boolean,
    default: false
  }
})
checkItemSchema.pre('save', async function (next) {
  try {
    await checkListModel.findByIdAndUpdate(
      this.checkListId,
      { $push: { listItemOrderIds: this._id } }
    )
    next()
  } catch (error) {
    next(error)
  }
})

export const checkItemModel = model('CheckItem', checkItemSchema)
