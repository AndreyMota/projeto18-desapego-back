import db from "../Database/databaseConnection.js";

export async function getProducts(req, res) {
    try {
        const result = await db.query("SELECT * FROM products");
        res.send(result);
    } catch (err) {
        res.status(500).send(err.message);
    }
}

export async function postProducts(req, res) {
    try {
        const { name, price, description, category } = req.body;
        const userId = res.locals.userId;
        const resultUser = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    
        if (resultUser.rowCount < 1) {
            return res.status(404).send('Usuário não encontrado');
        }
    
        const { phone } = resultUser.rows[0];
        const query = `
            INSERT INTO products (user_id, contact_info, name, price, description, category)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
    
        const result = await db.query(query, [userId, phone, name, price, description, category]);
    
        // O resultado da inserção será retornado na variável "result.rows[0]"
        const insertedProduct = result.rows[0];
    
        res.status(201).json({ message: 'Produto cadastrado com sucesso.', product: insertedProduct });
    } catch (err) {
        res.status(500).send(err.message);
    }
}

export async function postProdImages(req, res) {
    const { imageUrl, isMain } = req.body;
    const prodId = req.params.id;
    const userId = res.locals.userId;

    try {
        // Verifique se o produto pertence ao usuário
        const resultProd = await db.query('SELECT * FROM products WHERE user_id = $1 AND id = $2', [userId, prodId]);

        if (resultProd.rows.length === 0) {
            return res.status(401).json({ message: "Produto não pertence ao usuário" });
        }

        // Consulta para obter a imagem principal atual (se existir)
        const currentMainImageQuery = 'SELECT id FROM products_images WHERE product_id = $1 AND is_main_image = true';
        const currentMainImage = await db.query(currentMainImageQuery, [prodId]);

        // Iniciar uma transação
        await db.query('BEGIN');

        if (isMain === true) {
            // Se isMain for verdadeiro, definir a nova imagem como a principal
            const insertImageQuery = 'INSERT INTO products_images (product_id, image_url, is_main_image) VALUES ($1, $2, $3) RETURNING id';
            const insertedImage = await db.query(insertImageQuery, [prodId, imageUrl, true]);
            const newMainImageId = insertedImage.rows[0].id;

            // Atualizar a imagem principal atual para não ser mais a principal
            if (currentMainImage.rows.length > 0) {
                const oldMainImageId = currentMainImage.rows[0].id;
                const updateOldMainImageQuery = 'UPDATE products_images SET is_main_image = false WHERE id = $1';
                await db.query(updateOldMainImageQuery, [oldMainImageId]);
            }

            // Atualizar a linha do produto em products com o novo main_image_id
            const updateProductQuery = 'UPDATE products SET main_image_id = $1 WHERE id = $2';
            await db.query(updateProductQuery, [newMainImageId, prodId]);
        } else {
            // Se isMain não for verdadeiro, apenas inserir a imagem na tabela products_images sem marcá-la como principal
            const insertImageQuery = 'INSERT INTO products_images (product_id, image_url, is_main_image) VALUES ($1, $2, $3)';
            await db.query(insertImageQuery, [prodId, imageUrl, false]);
        }

        // Commit da transação
        await db.query('COMMIT');

        // Responda com sucesso
        return res.status(200).json({ message: "Imagem adicionada com sucesso" });
    } catch (error) {
        // Rollback da transação em caso de erro
        await db.query('ROLLBACK');
        console.error("Erro ao adicionar imagem:", error);
        return res.status(500).json({ message: "Erro interno do servidor" });
    } finally {
        // Certifique-se de liberar recursos após a transação
        await db.query('END');
    }
}

export async function postProdNewMain(req, res) {
    const userId = res.locals.userId;
    const prodId = req.params.id;
    const newMainImageId = req.params.idImage;

    try {
        // Verifique se o produto pertence ao usuário
        const resultProd = await db.query('SELECT * FROM products WHERE user_id = $1 AND id = $2', [userId, prodId]);

        if (resultProd.rows.length === 0) {
            return res.status(401).json({ message: "Produto não pertence ao usuário" });
        }

        // Verifique se a nova imagem principal pertence ao produto
        const resultImage = await db.query('SELECT * FROM products_images WHERE product_id = $1 AND id = $2', [prodId, newMainImageId]);

        if (resultImage.rows.length === 0) {
            return res.status(401).json({ message: "A imagem selecionada não pertence ao produto" });
        }

        // Iniciar uma transação
        await db.query('BEGIN');

        // Atualizar a imagem principal atual para não ser mais a principal
        const updateOldMainImageQuery = 'UPDATE products_images SET is_main_image = false WHERE product_id = $1 AND is_main_image = true';
        await db.query(updateOldMainImageQuery, [prodId]);

        // Atualizar a nova imagem como a imagem principal
        const updateNewMainImageQuery = 'UPDATE products_images SET is_main_image = true WHERE id = $1';
        await db.query(updateNewMainImageQuery, [newMainImageId]);

        // Atualizar a linha do produto em products com o novo main_image_id
        const updateProductQuery = 'UPDATE products SET main_image_id = $1 WHERE id = $2';
        await db.query(updateProductQuery, [newMainImageId, prodId]);

        // Commit da transação
        await db.query('COMMIT');

        // Responda com sucesso
        return res.status(200).json({ message: "Imagem principal atualizada com sucesso" });
    } catch (error) {
        // Rollback da transação em caso de erro
        await db.query('ROLLBACK');
        console.error("Erro ao atualizar a imagem principal:", error);
        return res.status(500).json({ message: "Erro interno do servidor" });
    } finally {
        // Certifique-se de liberar recursos após a transação
        await db.query('END');
    }
}
