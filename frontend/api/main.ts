import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const action = req.query.action || req.body?.action;

    if (!action || typeof action !== 'string') {
      return res.status(400).json({ error: 'Missing action parameter' });
    }

    // Health check
    if (action === 'health') {
      return res.status(200).json({
        success: true,
        data: { status: 'ok', service: 'fintrix-api' },
      });
    }

    // AI Parse - placeholder (requires backend service)
    if (action === 'ai-parse') {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
      }
      // This would require calling an external AI service
      // For now, return a placeholder response
      return res.status(200).json({
        success: true,
        data: {
          buyer: 'Sample Company',
          amount: 5000,
          dueDate: '2026-06-15',
          invoiceId: 'INV-' + Date.now(),
        },
      });
    }

    // Chat - placeholder (requires backend service)
    if (action === 'chat') {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
      }
      const { question } = req.body;
      return res.status(200).json({
        success: true,
        data: {
          answer: `I received your question: "${question}". This is a placeholder response from the Vercel serverless function.`,
        },
      });
    }

    // Auth Challenge - placeholder
    if (action === 'auth-challenge') {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
      }
      const { address } = req.body;
      return res.status(200).json({
        success: true,
        data: {
          nonce: Math.random().toString(36).substring(7),
          message: `Sign this message to authenticate: ${address}`,
        },
      });
    }

    // Auth Verify - placeholder
    if (action === 'auth-verify') {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
      }
      return res.status(200).json({
        success: true,
        data: {
          token: 'placeholder-jwt-token',
          authenticated: true,
        },
      });
    }

    return res.status(400).json({ error: `Unknown action: ${action}` });
  } catch (error: any) {
    console.error('[MAIN] Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
