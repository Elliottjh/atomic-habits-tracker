import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import prisma from '../db/prisma.js'
import { sendVerificationEmail } from '../utils/email.js'

const router = express.Router()

export default router
