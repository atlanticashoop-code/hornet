module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, apikey');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const rawCpf = req.query.cpf || (req.body && req.body.cpf) ? String(req.query.cpf || req.body.cpf).trim() : '';
    const cleanCpf = rawCpf.replace(/\D/g, '');

    if (!cleanCpf || cleanCpf.length !== 11) {
      return res.status(400).json({ sucesso: false, message: 'Por favor, informe um CPF válido com 11 dígitos.' });
    }

    const SUPABASE_REST_URL = 'https://hsfkkihveyxhfsdzuvuf.supabase.co/rest/v1';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzZmtraWh2ZXl4aGZzZHp1dnVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwMzgzMTMsImV4cCI6MjEwMzYxNDMxM30.x57rHz2zt-FuIMNOlQqe4UC7jXHkp-LjR__Xze5CJi4';

    const formattedCpf = cleanCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");

    const queryUrl = `${SUPABASE_REST_URL}/bilhetes?or=(cpf.eq.${cleanCpf},cpf.eq.${formattedCpf},cpf.ilike.%${cleanCpf}%)&order=created_at.desc&select=*`;

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
      return res.status(500).json([]);
    }

    let compras = [];
    try {
      compras = JSON.parse(responseText);
    } catch (e) {
      compras = [];
    }

    // Retorna a lista diretamente
    return res.status(200).json(Array.isArray(compras) ? compras : []);

  } catch (err) {
    return res.status(500).json([]);
  }
};
