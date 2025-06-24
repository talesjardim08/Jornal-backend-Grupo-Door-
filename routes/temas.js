const express = require('express');
const db = require('../db');
const verificarToken = require('../middlewares/authmiddlewares');
const router = express.Router();

// Listar todos os temas (público)
router.get('/', (req, res) => {
  db.query('SELECT * FROM temas', (err, results) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar temas', detalhes: err.message });
    res.json(results);
  });
});

// Criar novo tema (protegido)
router.post('/novo', verificarToken, (req, res) => {
  const { nome } = req.body;

  if (!nome || nome.trim() === '') {
    return res.status(400).json({ erro: 'Campo "nome" é obrigatório' });
  }

  db.query('INSERT INTO temas (nome) VALUES (?)', [nome.trim()], (err) => {
    if (err) return res.status(500).json({ erro: 'Erro ao criar tema', detalhes: err.message });
    res.status(201).json({ mensagem: 'Tema criado com sucesso' });
  });
});

module.exports = router;
