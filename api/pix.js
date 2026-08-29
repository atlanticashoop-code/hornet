export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método não permitido' });
    }

    const token = process.env.MERCADO_PAGO_TOKEN;

    if (!token) {
        return res.status(500).json({ message: 'Token do Mercado Pago não encontrado na Vercel.' });
    }

    const { cpf, valor, qtd } = req.body;
    const cpfLimpo = String(cpf).replace(/\D/g, '');

    try {
        const response = await fetch('https://api.mercadopago.com/v1/payments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token.trim()}`
            },
            body: JSON.stringify({
                transaction_amount: Number(valor),
                description: `Cotas Hornetão Blue - Qtd: ${qtd}`,
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

        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ message: 'Erro interno no servidor da Vercel.' });
    }
}
