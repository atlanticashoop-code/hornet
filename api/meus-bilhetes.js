module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido.' });
  }

  try {
    const body = req.body || {};
    const cpf = body.cpf ? String(body.cpf).replace(/\D/g, '') : '';

    if (!cpf || cpf.length !== 11) {
      return res.status(400).json({ message: 'Informe um CPF válido com 11 dígitos.' });
    }

    return res.status(200).json({
      sucesso: true,
      compras: []
    });
  } catch (err) {
    return res.status(500).json({ message: 'Erro no servidor.' });
  }
};
