import * as express from "express";
import {checkText} from '../controllers/imagesController';
const router = express.Router();


router.post('/checkText', checkText);

module.exports = router;