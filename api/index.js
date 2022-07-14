
import express from 'express';

import {
    create
} from '../controllers/index.js';

//validators
const router = express.Router();

router.get('/', create);

export default router;