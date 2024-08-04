import { Router } from 'express'
import * as productController from '../controllers/productsController.js'
//import { getProducts, getProduct, createProduct, updateProduct, deleteProduct } from '../controllers/productsController.js'

const productsRouter = Router()

productsRouter.get('/', productController.getProducts);

productsRouter.get('/:pid', productController.getProduct)

productsRouter.post('/', productController.createProduct)

productsRouter.put('/:pid', productController.updateProduct)

productsRouter.delete('/:pid', productController.deleteProduct)

export default productsRouter
