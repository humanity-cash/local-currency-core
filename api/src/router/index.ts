import express from 'express';
import { settlements } from './settlements';

const router = express();

router.use('settlements', settlements);

export default router;