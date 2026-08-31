module.exports = async (req, res) => {
  // Configuração de cabeçalhos CORS
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
    
    // ATENÇÃO: COLE A SUA CHAVE ANON ENTRE AS ASPAS ABAIXO
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzZmtraWh2ZXl4aGZzZHp1dnVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwMzgzMTMsImV4cCI6MjEwMzYxNDMxM30.x57rHz2zt-FuIMNOlQqe4UC7jXHkp-LjR__Xze5CJi4';

    // Monta a máscara do CPF (ex: 123.456.789-00) para buscar em ambos os formatos
    const cpfFormatado = cleanCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");

    // Realiza a busca no Supabase filtrando tanto pelo CPF limpo quanto pelo formatado
    const queryUrl = `${SUPABASE_REST_URL}/bilhetes?or=(cpf.eq.${cleanCpf},cpf.eq.${cpfFormatado})&order=created_at.desc&select=*`;

    const fetchResponse = await fetch(queryUrl, {
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
      return res.status(500).json({ 
        message: 'Erro na consulta do banco de dados.', 
        details: responseText 
      });
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
