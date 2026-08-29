export default async function handler(req, res) {
    // Permite chamadas do front-end sem bloqueio de CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método não permitido' });
    }

    const token = process.env.MERCADO_PAGO_TOKEN;

    if (!token) {
        return res.status(500).json({ message: 'Token MERCADO_PAGO_TOKEN não configurado na Vercel.' });
    }

    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
        const { cpf, valor, qtd } = body;

        const cpfLimpo = String(cpf || '').replace(/\D/g, '');
        const valorNumerico = Number(valor);

        if (!valorNumerico || valorNumerico <= 0) {
            return res.status(400).json({ message: 'Valor inválido informado.' });
        }

        const idempotencyKey = `pix-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

        const response = await fetch('https://api.mercadopago.com/v1/payments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token.trim()}`,
                'X-Idempotency-Key': idempotencyKey
            },
            body: JSON.stringify({
                transaction_amount: valorNumerico,
                description: `Cotas Rifa Moto - Qtd: ${qtd || 1}`,
                payment_method_id: 'pix',
                payer: {
                    email: `cliente_${Date.now()}@email.com`,
                    identification: {
                        type: 'CPF',
                        number: cpfLimpo.length === 11 ? cpfLimpo : '00000000000'
                    }
                }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                message: data.message || data.cause?.[0]?.description || 'Erro na API do Mercado Pago.',
                detalhes: data
            });
        }

        const qrCode = data.point_of_interaction?.transaction_data?.qr_code;
        const qrCodeBase64 = data.point_of_interaction?.transaction_data?.qr_code_base64;

        return res.status(200).json({
            id: data.id,
            qr_code: qrCode,
            qr_code_base64: qrCodeBase64
        });

    } catch (error) {
        return res.status(500).json({ 
            message: 'Erro interno ao processar a requisição.', 
            erro: error.message 
        });
    }
}
