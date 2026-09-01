module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const paymentId = req.query.payment_id || (req.body && req.body.payment_id);

    if (!paymentId) {
      return res.status(200).json({ status: 'pending', message: 'ID do pagamento não fornecido.' });
    }

    const MP_ACCESS_TOKEN = 'APP_USR-8568413033783803-082914-edc65dc648a813113da7590030ded6f7-3651775878';

    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!mpRes.ok) {
      return res.status(200).json({ status: 'pending' });
    }

    const data = await mpRes.json();
    
    return res.status(200).json({ status: data.status });

  } catch (err) {
    console.error('Erro ao verificar status:', err);
    return res.status(200).json({ status: 'pending' });
  }
};
