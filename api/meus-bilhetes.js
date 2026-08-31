module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, apikey');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ message: 'Método não permitido.' });

  try {
    const body = req.body || {};
    const rawCpf = body.cpf ? String(body.cpf).trim() : '';
    const cleanCpf = rawCpf.replace(/\D/g, '');

    if (!cleanCpf || cleanCpf.length !== 11) {
      return res.status(400).json({ meusBilhetes: [], message: 'CPF inválido.' });
    }

    const SUPABASE_REST_URL = 'https://hsfkkihveyxhfsdzuvuf.supabase.co/rest/v1';
    
    // COLE SUA CHAVE ANON PUBLIC DO SUPABASE AQUI DENTRO DAS ASPAS:
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzZmtraWh2ZXl4aGZzZHp1dnVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwMzgzMTMsImV4cCI6MjEwMzYxNDMxM30.x57rHz2zt-FuIMNOlQqe4UC7jXHkp-LjR__Xze5CJi4';

    // Formata o CPF para o padrão 000.000.000-00
    const formattedCpf = cleanCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");

    // Realiza a busca no Supabase testando:
    // 1. CPF sem pontuação (ex: 12345678900)
    // 2. CPF com pontuação (ex: 123.456.789-00)
    const url = `${SUPABASE_REST_URL}/bilhetes?or=(cpf.eq.${cleanCpf},cpf.eq.${formattedCpf})&order=created_at.desc&select=*`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const dataText = await response.text();

    if (!response.ok) {
      console.error('Erro na resposta do Supabase:', dataText);
      return res.status(500).json({ sucesso: false, message: 'Erro ao consultar banco de dados.' });
    }

    let registros = [];
    try {
      registros = JSON.parse(dataText);
    } catch (e) {
      registros = [];
    }

    return res.status(200).json({
      sucesso: true,
      compras: Array.isArray(registros) ? registros : []
    });

  } catch (err) {
    console.error('Erro geral na API:', err);
    return res.status(500).json({ sucesso: false, message: 'Erro interno no servidor.' });
  }
};
