import Joi from "joi";

const categories = ['eletronicos', 'roupas', 'moveis', 'livros', 'veiculos', 'musicas', 'esportes', 'brinquedos', 'ferramentas', 'artes'];

export const productSchema = Joi.object({
    name: Joi.string().max(255).required(),
    price: Joi.number().integer().required(),
    description: Joi.string().max(255).required(),
    category: Joi.string().valid(...categories).required()
  });

export const prodImageSchema = Joi.object({
    imageUrl: Joi.string().uri().required(),
    isMain: Joi.boolean().required(),
  });

export const handleMainImage = Joi.object({
    newMainImage: Joi.number().integer().required()
})