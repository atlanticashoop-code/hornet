export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método não permitido' });
    }

    const { cpf, valor, qtd } = req.body;

    try {
        const response = await fetch('https://api.mercadopago.com/v1/payments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.MERCADO_PAGO_TOKEN}`
            },
            body: JSON.stringify({
                transaction_amount: Number(valor),
                description: `Cotas Hornetão Blue - Qtd: ${qtd}`,
                payment_method_id: 'pix',
                payer: {
                    email: `cliente${Date.now()}@gmail.com`,
                    identification: {
                        type: 'CPF',
                        number: String(cpf).replace(/\D/g, '')
                    }
                }
            })
        });

        const data = await response.json();
        return res.status(response.status).json(data);
    } catch (error) {
        return res.status(500).json({ error: 'Erro de comunicação no servidor' });
    }
}
