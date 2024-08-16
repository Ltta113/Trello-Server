import { Schema, model } from 'mongoose'

const attachmentSchema = new Schema({
  cardId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  name: {
    type: String,
    trim: true,
    default: ''
  },
  fileName: {
    type: String,
    trim: true,
    default: ''
  },
  mimeType: {
    type: String,
    default: ''
  },
  url: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

export const attachmentModel = model('Attachment', attachmentSchema)
