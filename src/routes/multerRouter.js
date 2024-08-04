import { Router } from 'express'
import { insertImg } from '../controllers/multerController.js'
//import upload from '../config/multer.js'
import { uploadDocs, uploadPerfs, uploadProd } from '../config/multer.js'
const multerRouter = Router()

//multerRouter.post('/', upload.single('product'), insertImg)
multerRouter.post('/profiles', uploadPerfs.single('profile'), insertImg);
multerRouter.post('/docs', uploadDocs.single('doc'), insertImg);
multerRouter.post('/products', uploadProd.single('product'), insertImg);

export default multerRouter