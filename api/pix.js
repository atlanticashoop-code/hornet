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
    const { telefone, cpf, valor, qtd } = req.body || {};

    const cleanPhone = telefone ? String(telefone).replace(/\D/g, '') : '';
    const cleanCpf = cpf ? String(cpf).replace(/\D/g, '') : '';

    if (!cleanPhone || cleanPhone.length < 10) {
      return res.status(400).json({ message: 'Celular inválido.' });
    }

    if (!cleanCpf || cleanCpf.length !== 11) {
      return res.status(400).json({ message: 'CPF inválido.' });
    }

    const numericAmount = Number(valor);
    if (!numericAmount || numericAmount <= 0) {
      return res.status(400).json({ message: 'Valor inválido.' });
    }

    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!token) {
      return res.status(500).json({
        message: 'MERCADO_PAGO_ACCESS_TOKEN não está configurado na Vercel.'
      });
    }

    const areaCode = cleanPhone.substring(0, 2);
    const phoneNumber = cleanPhone.substring(2);

    const paymentData = {
      transaction_amount: numericAmount,
      description: `RDS PRÊMIOS - ${qtd || 1} Cota(s) - Tel: ${cleanPhone}`,
      payment_method_id: 'pix',
      payer: {
        email: `cliente_${cleanCpf}@rdspremios.com`,
        first_name: 'Cliente',
        last_name: 'RDS',
        identification: { type: 'CPF', number: cleanCpf },
        phone: { area_code: areaCode, number: phoneNumber }
      }
    };

    const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Idempotency-Key': `pix-${cleanCpf}-${Date.now()}`
      },
      body: JSON.stringify(paymentData)
    });

    const data = await mpResponse.json();

    if (!mpResponse.ok) {
      return res.status(mpResponse.status).json({
        message: data.message || 'Erro ao gerar cobrança no Mercado Pago.',
        details: data
      });
    }

    const qrCode = data.point_of_interaction?.transaction_data?.qr_code;
    const qrCodeBase64 = data.point_of_interaction?.transaction_data?.qr_code_base64;

    if (!qrCode) {
      return res.status(500).json({ message: 'Pix não retornado do Mercado Pago.' });
    }

    // --- GERAR NÚMEROS DE COTAS ALEATÓRIAS ---
    const totalCotas = Number(qtd) || 1;
    const numerosGerados = [];
    for (let i = 0; i < totalCotas; i++) {
      const num = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
      numerosGerados.push(num);
    }

    // --- SALVAR NO SUPABASE ---
    const SUPABASE_REST_URL = 'https://hsfkkihveyxhfsdzuvuf.supabase.co/rest/v1';
    const SUPABASE_ANON_KEY = 'SUA_CHAVE_ANON_AQUI'; // <--- COLE SUA CHAVE ANON AQUI

    await fetch(`${SUPABASE_REST_URL}/bilhetes`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${sb_publishable_lGtzhKr3071NaxYCnMKn5g_hKHidtU7}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        cpf: cleanCpf,
        telefone: cleanPhone,
        qtd: totalCotas,
        numeros: numerosGerados,
        valor: numericAmount,
        status: 'pendente'
      })
    });

    return res.status(200).json({
      id: data.id,
      status: data.status,
      qr_code: qrCode,
      qr_code_base64: qrCodeBase64,
      numeros: numerosGerados
    });

  } catch (error) {
    console.error('Erro no servidor (/api/pix.js):', error);
    return res.status(500).json({ message: 'Erro interno ao processar requisição.' });
  }
};
