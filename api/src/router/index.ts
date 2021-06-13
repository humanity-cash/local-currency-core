import express from 'express'
import { settlements } from './settlements'

export const router = express()

router.use(settlements)