import { Schema, model } from 'mongoose'
import { cardModel } from './cardModel'
import { checkItemModel } from './checkItemModel'

const checkListSchema = new Schema({
  cardId: {
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
  description: {
    type: String,
    trim: true,
    default: ''
  },
  listItemOrderIds: {
    type: [Schema.Types.ObjectId],
    ref: 'ListItem',
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
checkListSchema.pre('save', async function (next) {
  try {
    await cardModel.findByIdAndUpdate(
      this.cardId,
      { $push: { checkListOrderIds: this._id } }
    )
    next()
  } catch (error) {
    next(error)
  }
})
checkListSchema.pre('deleteMany', { document: false, query: true }, async function(next) {
  const checkLists = await this.model.find(this.getFilter())
  const checkListIds = checkLists.map(checkList => checkList._id)

  // Xóa tất cả các CheckItem liên quan
  await checkItemModel.deleteMany({ checkListId: { $in: checkListIds } })

  next()
})

export const checkListModel = model('CheckList', checkListSchema)
