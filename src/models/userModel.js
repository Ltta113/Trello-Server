import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import crypto from 'crypto'


const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 50
  },
  lastname: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 3
  },
  role: {
    type: String,
    default: 'user'
  },
  avatar: {
    contentType: String,
    url: String
  },
  isBlocked: {
    type: Boolean,
    default: true
  },
  refreshToken: {
    type: String
  },
  createdToken: {
    type: String
  },
  createdTokenExpires: {
    type: String
  },
  passwordChangeAt: {
    type: String
  },
  passwordResetToken: {
    type: String
  },
  passwordResetExpires: {
    type: String
  }
}, { timestamps: true })

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next()
  }
  const salt = bcrypt.genSaltSync(10)
  this.password = await bcrypt.hash(this.password, salt)
  const resetToken = crypto.randomBytes(32).toString('hex')
  this.createdToken = crypto.createHash('sha256').update(resetToken).digest('hex')
  this.createdTokenExpires = Date.now() + 15 * 60 * 1000
})

userSchema.methods = {
  isCorrectPassword: async function (password) {
    return await bcrypt.compare(password, this.password)
  },
  createPasswordChangedToken: function () {
    const resetToken = crypto.randomBytes(32).toString('hex')
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    this.passwordResetExpires = Date.now() + 15 * 60 * 1000
    return resetToken
  }
}

export const userModel = mongoose.model('User', userSchema)