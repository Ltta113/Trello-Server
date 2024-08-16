/* eslint-disable no-useless-catch */
import { userModel } from '~/models/userModel'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/middlewares/ApiError'
import { generateAccessToken, generateRefreshToken } from '~/middlewares/jwt'
import sendMail from '~/utils/sendMail'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import { uploadFileToFirebase, deleteFileFromFirebase } from './uploadService.js'

const register = async (reqBody) => {
  try {
    // Kiểm tra xem email đã được đăng ký chưa
    const existingUser = await userModel.findOne({ email: reqBody.email })
    if (existingUser) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email đã được đăng ký')
    }
    // Tạo token và lưu vào cookie
    const user = await userModel.create({
      ...reqBody
    })
    // Tạo nội dung email
    const html = `
      Xin vui lòng click vào link dưới đây để thay đổi mật khẩu của bạn.
      Link này sẽ hết hạn sau 15 phút kể từ bây giờ.
      <a href="${process.env.URL_SERVER}/v1/users/finalregister/${user.createdToken}">Click here</a>
    `

    const data = {
      email: reqBody.email,
      html,
      subject: 'Hoàn tất đăng kí'
    }

    // Gửi email
    await sendMail(data)

    // Gửi phản hồi thành công
    return 'Hãy kiểm tra email để kích hoạt tài khoản'

  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message)
  }
}
const finalRegister = async (req, res) => {
  try {
    const { token } = req.params
    const user = await userModel.findOne({ createdToken: token })

    if (!user) {
      return res.redirect(`${process.env.URL_CLIENT}/finalRegister/false`)
    }
    const tokenExpiresDate = Date.now()

    // Kiểm tra xem token đã hết hạn chưa
    if (+user.createdTokenExpires <= +tokenExpiresDate) {
      await user.deleteOne()

      return res.redirect(`${process.env.URL_CLIENT}/finalRegister/false`)
    }

    // Cập nhật thông tin người dùng
    user.createdToken = undefined
    user.createdTokenExpires = undefined
    user.isBlocked = false
    await user.save()


    // Chuyển hướng sau khi hoàn tất xác thực
    return res.redirect(`${process.env.URL_CLIENT}/finalRegister/true`)

  } catch (error) {
    // Xử lý lỗi
    return res.redirect(`${process.env.URL_CLIENT}/finalRegister/false`)
  }
}

const authenticateUser = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await userModel.findOne({ email })
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy người dùng')
    }
    if (user.isBlocked === true) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Chưa xác thực tài khoản')
    }
    const isPasswordCorrect = await user.isCorrectPassword(password)
    if (!isPasswordCorrect) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Sai mật khẩu')
    }
    else {
      const accessToken = generateAccessToken(user._id, user.role)
      const refreshToken = generateRefreshToken(user._id)
      const data = await userModel.findByIdAndUpdate(user._id, { refreshToken }, { new: true }).select('-role -password')
      // eslint-disable-next-line no-unused-vars

      res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 })
      return {
        accessToken,
        data
      }
    }
  } catch (error) { throw error }
}

const generatePasswordChangedToken = async (userId) => {
  const user = await userModel.findById(userId)
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
  }
  return user.createPasswordChangedToken()
}

const getCurrent = async (req) => {
  const { _id } = req.user
  const user = await userModel.findOne({ _id }).select('-refreshToken -password -role')
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
  }
  return user
}

export const logout = async (req, res) => {
  try {
    const cookie = req.cookies

    if (!cookie || !cookie.refreshToken) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No refreshToken')
    }

    await userModel.findOneAndUpdate({ refreshToken: cookie.refreshToken }, { refreshToken: '' }, { new: true })
    res.clearCookie('refreshToken', { httpOnly: true, secure: true })

    res.status(StatusCodes.OK).json('Logout successfully')
  } catch (error) { throw error }
}

export const refreshAccessToken = async (req, res) => {
  try {
    const cookie = req.cookies

    if (!cookie || !cookie.refreshToken) {
      res.status(StatusCodes.NOT_FOUND).json('No refreshToken')
    }
    if (cookie.refreshToken) {
      const decodedToken = jwt.verify(cookie.refreshToken, process.env.JWT_TOKEN)
      const response = await userModel.findOne({ _id: decodedToken._id, refreshToken: cookie.refreshToken })
      if (response) {
        const newAccessToken = generateAccessToken(response._id, response.role)
        res.status(StatusCodes.OK).json({ newAccessToken })
      } else {
        res.clearCookie('refreshToken', { httpOnly: true, secure: true })
        res.status(StatusCodes.BAD_REQUEST).json('Refresh token not matched')
      }
    }
  } catch (error) {
    throw error
  }
}

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(StatusCodes.NOT_FOUND).json('Vui lòng nhập Email')
    }

    const user = await userModel.findOne({ email })

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json('Email chưa được đăng ký')
    }

    const resetToken = user.createPasswordChangedToken()
    await user.save()

    const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Yêu cầu đặt lại mật khẩu</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      padding: 20px;
      border-radius: 5px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    h1 {
      font-size: 24px;
      color: #333;
    }
    p {
      font-size: 16px;
      color: #666;
    }
    a.button {
      display: inline-block;
      font-size: 16px;
      color: #ffffff;
      background-color: #007bff;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 5px;
      text-align: center;
    }
    a.button:hover {
      background-color: #0056b3;
    }
    .footer {
      margin-top: 20px;
      font-size: 14px;
      color: #999;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Xin chào,</h1>
    <p>Chúng tôi đã nhận được yêu cầu đặt mật khẩu mới cho tài khoản Atlassian này: <strong>${email}</strong>.</p>
    <p>
      Xin vui lòng click vào liên kết dưới đây để thay đổi mật khẩu của bạn. Liên kết này sẽ hết hạn sau 15 phút kể từ bây giờ:
    </p>
    <p>
      <a href="${process.env.URL_SERVER}/v1/users/reset-password/${resetToken}" class="button">Đặt mật khẩu</a>
    </p>
    <p class="footer">Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
  </div>
</body>
</html>
`

    const data = {
      email,
      html,
      subject: 'Đặt lại mật khẩu'
    }

    await sendMail(data)

    return res.status(StatusCodes.OK).json('Vui lòng check mail của bạn')
  } catch (error) {
    throw error
  }
}

export const checkTokenResetPassword = async (req, res) => {
  try {
    const { token } = req.params

    const passwordResetToken = crypto.createHash('sha256').update(token).digest('hex')

    if (!token) {
      return res.redirect(`${process.env.URL_CLIENT}/resetPassword/false`)
    }


    const user = await userModel.findOne({
      passwordResetToken,
      passwordResetExpires: { $gt: Date.now() }
    })

    if (!user) {
      return res.redirect(`${process.env.URL_CLIENT}/resetPassword/false`)
    }
    return res.redirect(`${process.env.URL_CLIENT}/resetPassword/true?token=${encodeURIComponent(token)}`)
  } catch (error) {
    return res.redirect(`${process.env.URL_CLIENT}/resetPassword/false`)
  }
}
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body

    const passwordResetToken = crypto.createHash('sha256').update(token).digest('hex')

    if (!token) {
      return res.status(StatusCodes.NOT_FOUND, 'Lỗi')
    }

    const user = await userModel.findOne({
      passwordResetToken
    })

    user.passwordResetExpires = undefined
    user.passwordResetToken = undefined
    user.passwordChangeAt = Date.now()
    user.password = password
    user.save()

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND, 'Lỗi')
    }
    return res.status(StatusCodes.OK, 'Đổi mật khẩu thành công')
  } catch (error) {
    return res.status(StatusCodes.NOT_FOUND, error.message)
  }
}
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded!' })
    }
    if (req.file) {
      const { _id } = req.user
      const fileBuffer = req.file.buffer
      const fileName = `avatar/avatar_${_id}`
      const metadata = {
        contentType: req.file.mimetype
      }

      try {
        const filebaseUrl = await uploadFileToFirebase(fileBuffer, fileName, metadata)
        const user = await userModel.findOneAndUpdate(
          { _id: _id },
          { avatar: { url: filebaseUrl, contentType: req.file.mimetype } },
          { new: true }
        ).select('-refreshToken -password')
        return res.status(StatusCodes.OK).json(user)

      } catch (error) {
        throw error
      }
    }

  } catch (error) {
    throw error
  }
}
const deleteAvatar = async (req, res) => {
  try {
    const { _id } = req.user
    await deleteFileFromFirebase(`avatar/avatar_${_id}`)
    await userModel.findByIdAndUpdate(_id, {
      avatar: {
        url: '',
        contentType: ''
      }
    }, { new: true }).select('-refreshToken -password -role')

    return res.status(StatusCodes.OK).json({ deleteResult: 'Avatar deleted succesfully!' })
  } catch (error) { throw error }
}
export const updateUser = async (req, res) => {
  try {
    const { _id } = req.user

    const updateData = { ...req.body }
    if (updateData.password) {
      const salt = bcrypt.genSaltSync(10)
      updateData.password = await bcrypt.hash(updateData.password, salt)
    }

    const user = await userModel.findByIdAndUpdate(_id, updateData, { new: true }).select('-refreshToken -password -role')

    return res.status(StatusCodes.OK).json(user)
  } catch (error) {
    throw error
  }
}
const checkPassword = async (req, res) => {
  try {
    const { password, newPassword } = req.body
    const { _id } = req.user
    const user = await userModel.findById(_id)
    if (!user) {
      res.status(StatusCodes.NOT_FOUND).json('Không tìm thấy người dùng')
    }
    if (!newPassword || !password) {
      res.status(StatusCodes.NOT_FOUND).json('Thiếu trường mật khẩu')
    }

    const isPasswordCorrect = await user.isCorrectPassword(password)
    if (!isPasswordCorrect) {
      res.status(StatusCodes.UNAUTHORIZED).json('Mật khẩu hiện tại không đúng')
    }
    else {
      const salt = bcrypt.genSaltSync(10)
      const changePassword = await bcrypt.hash(newPassword, salt)
      const user = await userModel.findByIdAndUpdate(_id, { password: changePassword }, { new: true }).select('-refreshToken -password -role')

      res.status(StatusCodes.OK).json(user)
    }
  } catch (error) { throw error }
}

export const userService = {
  authenticateUser,
  generatePasswordChangedToken,
  register,
  getCurrent,
  finalRegister,
  logout,
  refreshAccessToken,
  forgotPassword,
  checkTokenResetPassword,
  resetPassword,
  uploadAvatar,
  deleteAvatar,
  updateUser,
  checkPassword
}
