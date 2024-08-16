import { Schema, model } from 'mongoose'
import { boardModel } from './boardModel'
import { cardModel } from './cardModel'

const columnSchema = new Schema({
  boardId: {
    type: Schema.Types.ObjectId,
    ref: 'Board',
    required: true
  },
  title: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
    trim: true
  },
  cardOrderIds: {
    type: [Schema.Types.ObjectId],
    ref: 'Card',
    default: []
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
columnSchema.pre('save', async function (next) {
  try {
    await boardModel.findByIdAndUpdate(
      this.boardId,
      { $push: { columnOrderIds: this._id } }
    )
    next()
  } catch (error) {
    next(error)
  }
})
columnSchema.pre('deleteMany', async function (next) {
  await cardModel.deleteMany({ columnId: this._id })
  next()
})

export const columnModel = model('Column', columnSchema)
