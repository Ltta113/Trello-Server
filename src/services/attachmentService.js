/* eslint-disable no-useless-catch */
import { attachmentModel } from '~/models/attachmentModel.js'
import { uploadFileToFirebase, deleteFileFromFirebase } from './uploadService.js'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { cardModel } from '~/models/cardModel.js'

dotenv.config()

const createNew = async (reqBody, file, reqUser) => {
  try {
    let newAttachment = {
      ...reqBody,
      userId: reqUser._id
    }
    if (file) {
      const fileBuffer = file.buffer
      const fileName = `${Date.now()}-${file.originalname}`
      const metadata = {
        contentType: file.mimetype
      }

      try {
        const filebaseUrl = await uploadFileToFirebase(fileBuffer, fileName, metadata)
        newAttachment = {
          ...newAttachment,
          fileName: fileName,
          mimeType: file.mimetype,
          url: filebaseUrl,
          name: newAttachment.name && newAttachment.name.trim() !== '' ? newAttachment.name : file.originalname
        }
      } catch (error) {
        throw error
      }
    }
    else if (reqBody.url) {
      const response = await fetch(`https://api.linkpreview.net/?key=${process.env.LINKPREVIEW_API}&q=${encodeURIComponent(reqBody.url)}`)
      const data = await response.json()
      if (data.title !== '' && data.description !== '')
        newAttachment = {
          ...newAttachment,
          fileName: data.title,
          mimeType: '',
          url: data.url,
          name: data.title
        }
      else {
        const imageResponse = await fetch(reqBody.url)
        const arrayBuffer = await imageResponse.arrayBuffer()
        const metadata = {
          contentType: imageResponse.headers.get('Content-Type') || 'image/jpeg' // Lấy contentType từ headers hoặc mặc định
        }
        const fileName = `photo-${Date.now()}.${metadata.contentType.split('/')[1]}`

        try {
          const filebaseUrl = await uploadFileToFirebase(arrayBuffer, fileName, metadata)
          newAttachment = {
            ...newAttachment,
            fileName: fileName,
            mimeType: metadata.contentType,
            url: filebaseUrl,
            name: newAttachment.name && newAttachment.name.trim() !== '' ? newAttachment.name : fileName
          }
        } catch (error) {
          throw error
        }
      }
    }

    const createdAttachment = await attachmentModel.create(newAttachment)
    return createdAttachment
  } catch (error) {
    throw error
  }
}

const update = async (attachmentId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    const updatedLabel = await attachmentModel.findByIdAndUpdate(
      new mongoose.Types.ObjectId(attachmentId),
      updateData,
      { new: true }
    )
    return updatedLabel

  } catch (error) {
    throw error
  }
}

const getDetail = async (attachmentId) => {
  try {

    const updatedLabel = await attachmentModel.findById(
      new mongoose.Types.ObjectId(attachmentId)
    )
    return updatedLabel

  } catch (error) {
    throw error
  }
}
const getAllByCardId = async (cardId) => {
  try {

    const updatedLabel = await attachmentModel.find({
      cardId: new mongoose.Types.ObjectId(cardId)
    })
    return updatedLabel

  } catch (error) {
    throw error
  }
}
const deleteItem = async (attachmentId) => {
  try {
    const attachment = await attachmentModel.findById(
      new mongoose.Types.ObjectId(attachmentId)
    )
    const card = await cardModel.findById(
      new mongoose.Types.ObjectId(attachment.cardId)
    )
    if (attachment.mimeType)
      await deleteFileFromFirebase(attachment.fileName)
    if (card.cover && attachment._id.equals(card.cover.idAttachment)) {
      await card.updateOne({ $set: { 'cover.idAttachment': null } })
    }

    await attachment.deleteOne()

    return { deleteResult: 'Attachment deleted succesfully!' }
  } catch (error) { throw error }
}

export const attachmentService = {
  createNew,
  update,
  getDetail,
  deleteItem,
  getAllByCardId
}
