module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, apikey');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ message: 'Método não permitido.' });

  try {
    const body = req.body || {};
    const email = String(body.email || '').trim();
    const cpf = body.cpf;
    const telefone = body.telefone || body.whatsapp || body.phone;
    const valor = body.valor || body.valorTotal || body.amount;
    const qtd = body.qtd;

    const cleanCpf = String(cpf || '').replace(/\D/g, '');
    const cleanPhone = String(telefone || '').replace(/\D/g, '');

    if (!cleanCpf || cleanCpf.length !== 11) {
      return res.status(400).json({ message: 'Informe um CPF válido com 11 dígitos.' });
    }

    const MP_ACCESS_TOKEN = 'APP_USR-8568413033783803-082914-edc65dc648a813113da7590030ded6f7-3651775878';
    const SUPABASE_REST_URL = 'https://hsfkkihveyxhfsdzuvuf.supabase.co/rest/v1';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzZmtraWh2ZXl4aGZzZHp1dnVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwMzgzMTMsImV4cCI6MjEwMzYxNDMxM30.x57rHz2zt-FuIMNOlQqe4UC7jXHkp-LjR__Xze5CJi4';

    // 1. Sorteio dos números das cotas
    const quantidadeCotas = parseInt(qtd) || 1;
    const numerosSorteados = [];
    while (numerosSorteados.length < quantidadeCotas) {
      const num = String(Math.floor(Math.random() * 100000)).padStart(5, '0');
      if (!numerosSorteados.includes(num)) {
        numerosSorteados.push(num);
      }
    }

    const numerosString = numerosSorteados.join(',');

    // 2. Tenta gravar no Supabase (com fallback caso a coluna email não exista na tabela)
    let payloadSupabase = {
      cpf: cleanCpf,
      telefone: cleanPhone,
      email: email,
      qtd: quantidadeCotas,
      valor: parseFloat(valor),
      numeros: numerosString,
      status: 'pago'
    };

    let supaRes = await fetch(`${SUPABASE_REST_URL}/bilhetes`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(payloadSupabase)
    });

    // Se der erro por falta do campo email na tabela, tenta novamente sem o e-mail
    if (!supaRes.ok) {
      delete payloadSupabase.email;
      supaRes = await fetch(`${SUPABASE_REST_URL}/bilhetes`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(payloadSupabase)
      });
      if (!supaRes.ok) {
        console.error('Erro retornado pelo Supabase:', await supaRes.text());
      }
    }

    // 3. Comunicação com o Mercado Pago para geração do PIX
    const mpPayload = {
      transaction_amount: parseFloat(valor),
      description: `Rifa - ${quantidadeCotas} bilhete(s)`,
      payment_method_id: 'pix',
      payer: {
        email: email || `cliente${cleanCpf}@suarifa.com`,
        first_name: 'Cliente',
        identification: {
          type: 'CPF',
          number: cleanCpf
        }
      }
    };

    const mpRes = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `${cleanCpf}-${Date.now()}`
      },
      body: JSON.stringify(mpPayload)
    });

    const mpData = await mpRes.json();

    if (!mpRes.ok) {
      console.error('Erro Mercado Pago:', mpData);
      return res.status(500).json({ 
        message: mpData.message || 'Erro ao comunicar com o Mercado Pago.',
        erro_detalhado: mpData
      });
    }

    const qrCode = mpData.point_of_interaction?.transaction_data?.qr_code;
    const qrCodeBase64 = mpData.point_of_interaction?.transaction_data?.qr_code_base64;

    return res.status(200).json({
      sucesso: true,
      qr_code: qrCode,
      pix_copia_cola: qrCode,
      qr_code_base64: qrCodeBase64,
      numeros: numerosSorteados
    });

  } catch (err) {
    console.error('Erro geral ao gerar Pix:', err);
    return res.status(500).json({ message: 'Erro interno ao processar requisição.' });
  }
};
