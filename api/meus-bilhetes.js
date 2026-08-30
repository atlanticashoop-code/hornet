module.exports = async (req, res) => {
  // Configuração dos cabeçalhos CORS
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

    // Configurações do Supabase
    const SUPABASE_REST_URL = 'https://hsfkkihveyxhfsdzuvuf.supabase.co/rest/v1';
    
    // ATENÇÃO: Substitua pelo valor da sua chave anon public (eyJhbGciOi...)
    const SUPABASE_ANON_KEY = 'SUA_CHAVE_ANON_AQUI'; 

    // Busca os bilhetes cadastrados para este CPF
    const fetchResponse = await fetch(`${SUPABASE_REST_URL}/bilhetes?cpf=eq.${cpf}&select=*`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!fetchResponse.ok) {
      const errorText = await fetchResponse.text();
      console.error('Erro no Supabase:', errorText);
      return res.status(500).json({ message: 'Erro ao consultar o banco de dados.' });
    }

    const compras = await fetchResponse.json();

    return res.status(200).json({
      sucesso: true,
      compras: compras || []
    });

  } catch (err) {
    console.error('Erro na API:', err);
    return res.status(500).json({ message: 'Erro interno no servidor.' });
  }
};
