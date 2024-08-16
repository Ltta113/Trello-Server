import { Schema, model } from 'mongoose'

const labelSchema = new Schema({
  boardId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  title: {
    type: String,
    trim: true,
    default: ''
  },
  color: {
    type: String,
    trim: true,
    default: 'none'
  },
  listCard: {
    type: [Schema.Types.ObjectId],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

export const labelModel = model('Label', labelSchema)
