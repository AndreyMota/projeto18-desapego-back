import { Router } from "express";
import validateAuth from "../Middlewares/validateAuth.js";
import { getProducts, postProdImages, postProdNewMain, postProducts } from "../Controllers/prodController.js";
import validateSchema from "../Middlewares/validateSchema.js";
import { handleMainImage, prodImageSchema, productSchema } from "../Schemas/prodSchemas.js";

const prodRouter = Router();

prodRouter.get('/products', validateAuth, getProducts);
prodRouter.post('/products', validateAuth, validateSchema(productSchema), postProducts);
prodRouter.post('/products/:id/images/', validateAuth, validateSchema(prodImageSchema), postProdImages);
prodRouter.post('/products/:id/images/:idImage', validateAuth, postProdNewMain);

export default prodRouter;