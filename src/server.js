/* eslint-disable no-console */
import dotenv from 'dotenv'
import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { corsOptions } from './config/cors.js'
import { dbConnect } from './config/mongodb.js'
import { APIs_V1 } from './routes/v1/index.js'
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware.js'
// Load environment variables from .env file
dotenv.config()

const START_SERVER = () => {

  const app = express()
  const PORT = process.env.APP_PORT || 5000

  // Middleware
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true, limit: '30mb' }))
  app.use(cors(corsOptions))
  app.use(cookieParser())

  app.use('/v1', APIs_V1)

  app.use(errorHandlingMiddleware)

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
  })
}

// Connect to MongoDB and start server
dbConnect().then(() => {
  START_SERVER()
}).catch(err => {
  console.error('Error connecting to MongoDB:', err.message)
})