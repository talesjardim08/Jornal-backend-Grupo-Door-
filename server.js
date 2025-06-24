
const express = require('express');
const cors = require('cors');
const path = require('path');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use('/api/auth', require('./routes/auth'));
app.use('/api/noticias', require('./routes/noticia'));
app.use('/api/temas', require('./routes/temas'));

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(` Servidor rodando em ${PORT}`);
});
