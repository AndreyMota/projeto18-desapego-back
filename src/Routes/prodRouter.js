import { Router } from "express";
import validateAuth from "../Middlewares/validateAuth.js";
import { deleteProd, getProdsById, getProducts, getProdutoById, postProdImages, postProdNewMain, postProducts } from "../Controllers/prodController.js";
import validateSchema from "../Middlewares/validateSchema.js";
import { handleMainImage, prodImageSchema, productSchema } from "../Schemas/prodSchemas.js";

const prodRouter = Router();

prodRouter.get('/products', validateAuth, getProducts);
prodRouter.get('/products/:id', getProdutoById)
prodRouter.post('/products', validateAuth, validateSchema(productSchema), postProducts);
prodRouter.post('/products/:id/images/', validateAuth, validateSchema(prodImageSchema), postProdImages);
prodRouter.post('/products/:id/images/:idImage', validateAuth, postProdNewMain);
prodRouter.get('/products/:id/images', validateAuth)
prodRouter.delete('/products/:id', validateAuth, deleteProd);
prodRouter.get('/user/products', validateAuth, getProdsById)

export default prodRouter;