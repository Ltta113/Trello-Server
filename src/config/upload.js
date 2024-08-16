import multer from 'multer'
import { allowedMimeTypes } from '~/utils/mimeTypes'


const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Không hỗ trợ định dạng tệp này'), false)
  }
}

const upload = multer({
  storage:  multer.memoryStorage(),
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
})

export default upload