import { Schema, model } from 'mongoose'

const commentSchema = new Schema({
  cardId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
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

export const commentModel = model('Comment', commentSchema)
