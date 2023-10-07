import db from "../Database/databaseConnection.js";
import bcrypt from "bcrypt";

export async function getUsers(req, res) {
    try {
        const query = `
        SELECT * FROM users`;
        const result = await db.query(query);
        res.send(result);
    } catch (err) {
        res.status(500).send(err.message);
    }
    
}

export async function postSignUp(req, res) {
    const { name, email, password, phone, cpf } = req.body;
    try {
        const tem = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (tem.rowCount > 0) {
            return res.status(409).send('Email já cadastrado!');
        }
        const passHash = await bcrypt.hash(password, 4);
        const result = await db.query(`
        INSERT INTO users (name, email, password, phone, cpf)
        VALUES ($1, $2, $3, $4, $5)
        `, [name, email, passHash, phone, cpf]);
        res.status(201).json({ message: 'Usuário cadastrado com sucesso.' });

    } catch (err) {
        res.status(500).send(err.message);
    }
}


import { v4 as uuidv4 } from 'uuid'; // Importe o 'v4' da biblioteca 'uuid'

export async function signIn(req, res) {
    const { email, password } = req.body;

    try {
        // Consultar o banco de dados para verificar se o usuário existe
        const query = 'SELECT * FROM users WHERE email = $1';
        const result = await db.query(query, [email]);

        if (result.rows.length === 0) {
            // Usuário não encontrado, retornar status code 404
            return res.status(401).send('E-mail não cadastrado!');
        }

        // Verificar se a senha está correta
        const user = result.rows[0];
        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            // Senha incorreta, retornar status code 401
            return res.status(401).send('Senha incorreta! Tente novamente!');
        }

        // Gerar um token compatível com SQL usando UUID v4
        const token = uuidv4();

        // Inserir o token na tabela sessions
        const insertTokenQuery = 'INSERT INTO sessions (token, userid) VALUES ($1, $2)';
        await db.query(insertTokenQuery, [token, user.id]);

        // Retornar os dados do usuário e o token
        res.status(200).json({
            token: token
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
}