import type { VercelRequest, VercelResponse } from '@vercel/node';

const invoiceStore: any[] = [
  {
    id: 'INV-TL-45000',
    buyerName: 'TechLogistics Ltd',
    amount: 45000,
    apy: 12.5,
    duration: 45,
    riskRating: 'A+',
    status: 'funding',
    fundedAmount: 22500,
    ownerWallet: 'DEMO_WALLET_1',
    industry: 'Manufacturing & Logistics',
    country: 'United Kingdom'
  },
  {
    id: 'INV-4412-Q',
    buyerName: 'Quantum Global',
    amount: 12800,
    apy: 9.5,
    duration: 187,
    riskRating: 'B',
    status: 'funding',
    fundedAmount: 5120,
    ownerWallet: 'DEMO_WALLET_2',
    industry: 'Technology & Software',
    country: 'Singapore'
  },
  {
    id: 'INV-9901-S',
    buyerName: 'Solaris Networks',
    amount: 5400,
    apy: 10.8,
    duration: 90,
    riskRating: 'B+',
    status: 'funding',
    fundedAmount: 4500,
    ownerWallet: 'DEMO_WALLET_3',
    industry: 'Technology & Software',
    country: 'United States'
  }
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const action = req.query.action as string;

  try {
    if (action === 'get-invoices' || action === 'ste-build-simulation') {
      return res.status(200).json({ success: true, data: invoiceStore });
    }

    if (action === 'stellar-build' || action === 'build-simulation') {
      return res.status(200).json({ 
        success: true, 
        data: { 
          invoices: invoiceStore,
          totalVolume: invoiceStore.reduce((sum, inv) => sum + inv.amount, 0)
        }
      });
    }

    if (action === 'fund-invoice') {
      const { invoiceId, amount, funderWallet } = req.body || req.query;
      const invoice = invoiceStore.find(inv => inv.id === invoiceId);
      if (!invoice) {
        return res.status(404).json({ success: false, error: 'Invoice not found' });
      }
      if (funderWallet === invoice.ownerWallet) {
        return res.status(400).json({ success: false, error: 'Cannot fund your own invoice' });
      }
      invoice.fundedAmount += Number(amount);
      if (invoice.fundedAmount >= invoice.amount) {
        invoice.status = 'funded';
      }
      return res.status(200).json({ success: true, data: invoice });
    }

    if (action === 'create-invoice') {
      const body = req.body;
      const newInvoice = {
        id: body.invoiceId || `INV-${Date.now()}`,
        buyerName: body.buyerName,
        amount: Number(body.amount),
        apy: 8.2,
        duration: 45,
        riskRating: 'A',
        status: 'funding',
        fundedAmount: 0,
        ownerWallet: body.ownerWallet || '',
        industry: body.industry || 'Manufacturing & Logistics',
        country: body.country || 'India'
      };
      invoiceStore.push(newInvoice);
      return res.status(200).json({ success: true, data: newInvoice });
    }

    if (action === 'get-portfolio') {
      const wallet = req.query.wallet as string;
      const funded = invoiceStore.filter(inv => inv.ownerWallet === wallet);
      return res.status(200).json({
        success: true,
        data: {
          totalInvested: funded.reduce((sum, inv) => sum + inv.fundedAmount, 0),
          activeInvoices: funded.filter(inv => inv.status === 'funding').length,
          averageAPY: funded.length > 0 ? funded.reduce((sum, inv) => sum + inv.apy, 0) / funded.length : 0
        }
      });
    }

    return res.status(200).json({ success: true, data: invoiceStore });

  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
