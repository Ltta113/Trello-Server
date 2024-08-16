/* eslint-disable no-unused-vars */
import { StatusCodes } from 'http-status-codes'
import { attachmentService } from '~/services/attachmentService.js'

const createNew = async (req, res, next) => {
  try {
    const attachment = await attachmentService.createNew(req.body, req.file, req.user)

    res.status(StatusCodes.CREATED).json(attachment)
  } catch (error) { next(error) }
}
const update = async (req, res, next) => {
  try {
    const attachment = await attachmentService.update(req.params.id, req.body)

    res.status(StatusCodes.OK).json(attachment)
  } catch (error) { next(error) }
}
const getDetail = async (req, res, next) => {
  try {
    const attachment = await attachmentService.getDetail(req.params.id)

    res.status(StatusCodes.OK).json(attachment)
  } catch (error) { next(error) }
}
const getAllByCardId = async (req, res, next) => {
  try {
    const attachments = await attachmentService.getAllByCardId(req.params.id)

    res.status(StatusCodes.OK).json(attachments)
  } catch (error) { next(error) }
}
const deleteItem = async (req, res, next) => {
  try {
    const result = await attachmentService.deleteItem(req.params.id)

    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

export const attachmentController = {
  createNew,
  update,
  getDetail,
  deleteItem,
  getAllByCardId
}