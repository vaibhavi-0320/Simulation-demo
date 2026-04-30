import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const { amount, txHash, funderWallet } = req.body;

    if (!id || !txHash || !funderWallet) {
      return res.status(400).json({ error: 'Missing required fields: id, txHash, funderWallet' });
    }

    // Log the funding record (in production, this would save to a database)
    console.log('[FUND] Recording funding:', {
      invoiceId: id,
      amount,
      txHash,
      funderWallet,
      timestamp: new Date().toISOString(),
    });

    // Return success response
    return res.status(200).json({
      success: true,
      data: {
        invoiceId: id,
        amount,
        txHash,
        funderWallet,
        status: 'recorded',
      },
    });
  } catch (error: any) {
    console.error('[FUND] Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
