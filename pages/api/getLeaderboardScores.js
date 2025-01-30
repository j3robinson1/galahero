import { supabase } from '../../utils/supabaseClient';
import cors, { runMiddleware } from '../../utils/corsMiddleware';

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);

  if (req.method === 'GET') {
    try {
      // Fetch the aggregated highest scores for each wallet
      const { data, error } = await supabase.rpc('get_aggregated_highest_scores');

      if (error) {
        console.error('Supabase RPC error:', error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ data });
    } catch (err) {
      console.error('Unhandled error:', err);
      return res.status(500).json({ error: 'Internal server error', details: err.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
