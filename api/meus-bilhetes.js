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
    const cleanCpf = body.cpf ? String(body.cpf).replace(/\D/g, '').trim() : '';

    if (!cleanCpf || cleanCpf.length !== 11) {
      return res.status(400).json({ message: 'Informe um CPF válido com 11 dígitos.' });
    }

    const SUPABASE_REST_URL = 'https://hsfkkihveyxhfsdzuvuf.supabase.co/rest/v1';
    const SUPABASE_ANON_KEY = 'SUA_CHAVE_ANON_AQUI'; // <--- SUBSTiTUA PELA SUA CHAVE ANON

    // Realiza a busca no Supabase filtrando pelo CPF limpo
    const fetchResponse = await fetch(`${SUPABASE_REST_URL}/bilhetes?cpf=eq.${cleanCpf}&select=*`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const responseText = await fetchResponse.text();

    if (!fetchResponse.ok) {
      console.error('Erro na resposta do Supabase:', responseText);
      return res.status(500).json({ message: 'Erro na consulta do banco de dados.', details: responseText });
    }

    let compras = [];
    try {
      compras = JSON.parse(responseText);
    } catch (e) {
      compras = [];
    }

    return res.status(200).json({
      sucesso: true,
      compras: Array.isArray(compras) ? compras : []
    });

  } catch (err) {
    console.error('Erro geral na API de bilhetes:', err);
    return res.status(500).json({ message: 'Erro interno no servidor.' });
  }
};
