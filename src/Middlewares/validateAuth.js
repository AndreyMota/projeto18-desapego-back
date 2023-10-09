import db from "../Database/databaseConnection.js";

export default async function validateAuth(req, res, next) {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.sendStatus(401);

    try {
        // Consultar o banco de dados para encontrar a sessão com o token
        const query = 'SELECT * FROM sessions WHERE token = $1';
        const result = await db.query(query, [token]);

        if (result.rows.length === 0) {
            // Token não encontrado, retornar status code 401
            return res.status(401).send('token');
        }

        // Armazenar informações da sessão no objeto res.locals
        const session = result.rows[0];
        res.locals.sessionId = session.id;
        res.locals.userId = session.userid;
    } catch (err) {
        res.status(500).send(err.message);
    }

    next();
}
