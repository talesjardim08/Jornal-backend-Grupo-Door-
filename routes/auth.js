const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();

const SECRET = process.env.JWT_SECRET;
const TIPOS_VALIDOS = ['leitor', 'redator'];

// Middleware 
if (!SECRET) {
  console.warn('⚠️ AVISO: JWT_SECRET não definido. Configure no .env para mais segurança.');
}

// Cadastro de Leitor ou Redator
router.post('/register/:tipo', async (req, res) => {
  const { nome, email, senha } = req.body;
  const tipo = req.params.tipo.toLowerCase();

  if (!TIPOS_VALIDOS.includes(tipo)) {
    return res.status(400).json({ erro: 'Tipo de usuário inválido' });
  }

  try {
    const hash = await bcrypt.hash(senha, 10);
    const query = `INSERT INTO \`${tipo}\` (nome, email, senha_hash) VALUES (?, ?, ?)`;

    db.query(query, [nome, email, hash], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ erro: 'E-mail já cadastrado' });
        }
        return res.status(500).json({ erro: 'Erro ao registrar: ' + err.message });
      }

      return res.status(201).json({ mensagem: 'Usuário registrado com sucesso' });
    });
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao processar senha' });
  }
});

// Login para Leitor ou Redator
router.post('/login/:tipo', (req, res) => {
  const { email, senha } = req.body;
  const tipo = req.params.tipo.toLowerCase();

  if (!TIPOS_VALIDOS.includes(tipo)) {
    return res.status(400).json({ erro: 'Tipo de usuário inválido' });
  }

  const query = `SELECT * FROM \`${tipo}\` WHERE email = ?`;

  db.query(query, [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao buscar usuário: ' + err.message });
    }

    if (results.length === 0) {
      return res.status(401).json({ erro: 'Usuário não encontrado' });
    }

    const usuario = results[0];
    const valido = await bcrypt.compare(senha, usuario.senha_hash);

    if (!valido) {
      return res.status(401).json({ erro: 'Senha incorreta' });
    }

    const payload = {
      id: usuario[`id_${tipo}`], // id_leitor ou id_redator
      tipo: tipo
    };

    const token = jwt.sign(payload, SECRET, { expiresIn: '2h' });


    const id_usuario = usuario[`id_${tipo}`];
    return res.json({
      token,
      nome: usuario.nome,
       id: id_usuario
    });
  });
});

module.exports = router;
