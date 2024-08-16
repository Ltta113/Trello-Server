import { Schema, model } from 'mongoose'
import { columnModel } from './columnModel'
import { checkListModel } from './checkListModel'
import { commentModel } from './commentModel'

const cardSchema = new Schema({
  boardId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  columnId: {
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
  description: {
    type: String,
    trim: true,
    default: ''
  },
  checkListOrderIds: {
    type: [Schema.Types.ObjectId],
    ref: 'CheckList',
    default: []
  },
  cover: {
    idAttachment: {
      type: Schema.Types.ObjectId,
      default: null
    },
    idCloudImage: {
      type: String,
      default: null
    },
    color: {
      type: String,
      default: null
    },
    size: {
      type: String,
      enum: ['full', 'half'],
      default: 'full'
    },
    brightness: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    }
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
cardSchema.pre('save', async function (next) {
  try {
    await columnModel.findByIdAndUpdate(
      this.columnId,
      { $push: { cardOrderIds: this._id } }
    )
    next()
  } catch (error) {
    next(error)
  }
})
cardSchema.pre('deleteMany', { document: false, query: true }, async function (next) {
  const cards = await this.model.find(this.getFilter())
  const cardIds = cards.map(card => card._id)

  // Xóa tất cả các CheckList liên quan
  await checkListModel.deleteMany({ cardId: { $in: cardIds } })

  await commentModel.deleteMany({ cardId: { $in: cardIds } })

  // Cập nhật các cột để loại bỏ cardIds
  await columnModel.updateMany({}, { $pullAll: { cardOrderIds: cardIds } })

  next()
})

export const cardModel = model('Card', cardSchema)
