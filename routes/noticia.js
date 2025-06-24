const express = require('express');
const db = require('../db');
const path = require('path');
const multer = require('multer');
const verificarToken = require('../middlewares/authmiddlewares');
const router = express.Router();

// Configuração de upload
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    const nomeArquivo = Date.now() + path.extname(file.originalname);
    cb(null, nomeArquivo);
  }
});
const upload = multer({ storage });

// Criar notícia (protegida)
router.post('/criar', verificarToken, upload.fields([
  { name: 'imagem_capa' },
  { name: 'imagem_extra' }
]), (req, res) => {
  const { titulo, conteudo, id_tema } = req.body;

  if (req.usuario.tipo !== 'redator') {
    return res.status(403).json({ erro: 'Apenas redatores podem publicar notícias' });
  }

  const imagem_capa = req.files['imagem_capa']?.[0]?.path || null;
  const imagem_extra = req.files['imagem_extra']?.[0]?.path || null;

  const sql = `
    INSERT INTO noticias (id_tema, id_redator, titulo, imagem_capa, conteudo, imagem_extra)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [id_tema, req.usuario.id, titulo, imagem_capa, conteudo, imagem_extra], (err) => {
    if (err) return res.status(500).json({ erro: 'Erro ao salvar notícia: ' + err.message });

    res.status(201).json({ mensagem: 'Notícia publicada com sucesso' });
  });
});

// Listar notícias públicas
router.get('/', (req, res) => {
  const sql = `
    SELECT noticias.*, redator.nome AS autor, temas.nome AS tema
    FROM noticias
    JOIN redator ON noticias.id_redator = redator.id_redator
    JOIN temas ON noticias.id_tema = temas.id_tema
    ORDER BY publicado_em DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar notícias: ' + err.message });
    res.json(results);
  });
});

module.exports = router;
