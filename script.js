// Arquivo: /api/pix.js

export default async function handler(req, res) {
  // Configuração dos cabeçalhos CORS para permitir chamadas do front-end
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Tratamento para requisições do tipo OPTIONS (preflight CORS)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Permite apenas requisições POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido. Utilize POST.' });
  }

  try {
    const { cpf, valor, qtd } = req.body;

    // Limpa a string do CPF mantendo apenas dígitos
    const cleanCpf = cpf ? cpf.replace(/\D/g, '') : '';

    if (!cleanCpf || cleanCpf.length !== 11) {
      return res.status(400).json({ message: 'CPF inválido. Envie um CPF com 11 dígitos.' });
    }

    const numericAmount = Number(valor);
    if (!numericAmount || numericAmount <= 0) {
      return res.status(400).json({ message: 'Valor inválido para a transação.' });
    }

    // Busca o Token de Acesso configurado no painel da Vercel
    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;

    if (!token) {
      return res.status(500).json({
        message: 'MERCADO_PAGO_ACCESS_TOKEN não está configurado nas variáveis de ambiente da Vercel.'
      });
    }

    // Payload de criação do pagamento conforme especificações do Mercado Pago
    const paymentData = {
      transaction_amount: numericAmount,
      description: `RDS PRÊMIOS - ${qtd || 1} Cota(s)`,
      payment_method_id: 'pix',
      payer: {
        email: `cliente_${cleanCpf}@rdspremios.com`,
        first_name: 'Cliente',
        last_name: 'RDS',
        identification: {
          type: 'CPF',
          number: cleanCpf
        }
      }
    };

    // Chamada à API de pagamentos do Mercado Pago
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
      console.error('Erro retornado pela API do Mercado Pago:', data);
      return res.status(mpResponse.status).json({
        message: data.message || 'Erro ao gerar cobrança PIX no Mercado Pago.',
        details: data.cause || data
      });
    }

    // Extrai o código "Copia e Cola" e a imagem base64 do QR Code
    const qrCode = data.point_of_interaction?.transaction_data?.qr_code;
    const qrCodeBase64 = data.point_of_interaction?.transaction_data?.qr_code_base64;

    if (!qrCode) {
      return res.status(500).json({
        message: 'A resposta do Mercado Pago não retornou o código Pix.',
        details: data
      });
    }

    // Retorno de sucesso para o front-end
    return res.status(200).json({
      id: data.id,
      status: data.status,
      qr_code: qrCode,
      qr_code_base64: qrCodeBase64
    });

  } catch (error) {
    console.error('Erro interno no servidor (/api/pix.js):', error);
    return res.status(500).json({ message: 'Erro interno ao processar a requisição.' });
  }
}
