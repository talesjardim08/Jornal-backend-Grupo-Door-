const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'chave-secreta-padrao';

function verificarToken(req, res, next) {

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ erro: 'Formato de token inválido' });
  }

  const token = parts[1];

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ erro: 'Token inválido ou expirado' });
    }

    // Salva o usuário autenticado na requisição
    req.usuario = decoded;
    next(); // Libera o acesso à próxima função da rota
  });
}

module.exports = verificarToken;
