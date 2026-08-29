export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método não permitido' });
    }

    const token = process.env.MERCADO_PAGO_TOKEN;

    if (!token) {
        return res.status(500).json({ message: 'Token do Mercado Pago não encontrado na Vercel.' });
    }

    const { cpf, valor, qtd } = req.body;
    const cpfLimpo = String(cpf || '').replace(/\D/g, '');

    const idempotencyKey = `pix-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    try {
        const response = await fetch('https://api.mercadopago.com/v1/payments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token.trim()}`,
                'X-Idempotency-Key': idempotencyKey
            },
            body: JSON.stringify({
                transaction_amount: Number(valor),
                description: `Cotas Rifa Moto - Qtd: ${qtd || 1}`,
                payment_method_id: 'pix',
                payer: {
                    email: `cliente_${Date.now()}@email.com`,
                    identification: {
                        type: 'CPF',
                        number: cpfLimpo
                    }
                }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                message: data.message || data.cause?.[0]?.description || 'Erro no processamento do Mercado Pago.',
                detalhes: data
            });
        }

        // Retorna a resposta completa da API + atalhos para garantir compatibilidade com o HTML
        return res.status(200).json({
            ...data,
            qr_code: data.point_of_interaction?.transaction_data?.qr_code,
            qr_code_base64: data.point_of_interaction?.transaction_data?.qr_code_base64
        });

    } catch (error) {
        return res.status(500).json({ message: 'Erro interno no servidor da Vercel.' });
    }
}
