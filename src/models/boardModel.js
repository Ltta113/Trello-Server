import { Schema, model } from 'mongoose'
import { colorsLabel } from '~/utils/colorsLabel'
import { labelModel } from './labelModel'

const boardSchema = new Schema({
  title: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
    trim: true
  },
  type: {
    type: String,
    default: 'public',
    required: true
  },
  ownerIds: {
    type: [Schema.Types.ObjectId],
    ref: 'User',
    default: []
  },
  memberIds: {
    type: [Schema.Types.ObjectId],
    ref: 'User',
    default: []
  },
  slug: {
    type: String,
    required: true,
    minlength: 3,
    trim: true
  },
  description: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 256,
    trim: true
  },
  columnOrderIds: {
    type: [Schema.Types.ObjectId],
    ref: 'Column',
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
boardSchema.pre('save', async function (next) {
  try {
    await Promise.all(colorsLabel.map(color =>
      labelModel.create({ boardId: this._id, color: color.name })
    ))
    next()
  } catch (error) {
    next(error)
  }
})

export const boardModel = model('Board', boardSchema)

