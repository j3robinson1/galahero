import { supabase } from '../../utils/supabaseClient';
import cors, { runMiddleware } from '../../utils/corsMiddleware';

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);

  if (req.method === 'GET') {
    try {
      // Parse query parameters:
      const { wallet } = req.query;

      if (!wallet) {
        return res.status(400).json({ error: 'Missing required query parameter: wallet' });
      }

      // Fetch all records for the provided wallet
      const { data, error } = await supabase
        .from('music_highscores')
        .select('*')
        .eq('wallet', wallet);

      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ error: error.message });
      }

      if (!data || data.length === 0) {
        return res.status(200).json({ wallet, totalBurns: 0, message: "No burns found for this wallet." });
      }

      // Sum up burns based on the mode
      const totalBurns = data.reduce((sum, record) => {
        let burns = 0;
        if (record.mode === 'easy') burns = 1;
        if (record.mode === 'normal') burns = 2;
        if (record.mode === 'hard') burns = 3;
        return sum + burns;
      }, 0);

      return res.status(200).json({ wallet, totalBurns });
    } catch (err) {
      console.error('Unhandled error:', err);
      return res.status(500).json({ error: 'Internal server error', details: err.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
