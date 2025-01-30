import { supabase } from '../../utils/supabaseClient';
import cors, { runMiddleware } from '../../utils/corsMiddleware';

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);

  if (req.method === 'GET') {
    try {
      // Parse query parameters:
      const { song, artist, mode, wallet } = req.query;

      if (!song || !artist || !mode) {
        return res.status(400).json({ error: 'Missing required query parameters: song, artist, mode' });
      }

      if (wallet) {
        // Fetch all records for the provided wallet
        const { data, error } = await supabase
          .from('music_highscores')
          .select('*')
          .eq('song', song)
          .eq('artist', artist)
          .eq('mode', mode)
          .eq('wallet', wallet);

        if (error) {
          console.error('Supabase error:', error);
          return res.status(500).json({ error: error.message });
        }

        return res.status(200).json({ data });
      }

      // Fetch the highest score for each unique wallet
      const { data, error } = await supabase.rpc('get_highest_scores', {
        song_param: song,
        artist_param: artist,
        mode_param: mode,
      });

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
