import { ref, deleteObject, uploadBytes, getDownloadURL } from 'firebase/storage'
import { StatusCodes } from 'http-status-codes'
import { storage } from '~/config/firebase.js'
import ApiError from '~/middlewares/ApiError.js'

export const uploadFileToFirebase = async (fileBuffer, fileName, metadata) => {
  const fileRef = ref(storage, `trello/${fileName}`)

  try {
    const snapshot = await uploadBytes(fileRef, fileBuffer, metadata)
    const downloadUrl = await getDownloadURL(snapshot.ref)
    return downloadUrl
  } catch (error) {
    throw new ApiError(StatusCodes.BAD_REQUEST, `Failed to upload file: ${error}`)
  }
}

export const deleteFileFromFirebase = async (filePath) => {
  const fileRef = ref(storage, `trello/${filePath}`)

  try {
    await deleteObject(fileRef)
  } catch (error) {
    throw new ApiError(StatusCodes.BAD_REQUEST, `Failed to delete file: ${error.message}`)
  }
}
