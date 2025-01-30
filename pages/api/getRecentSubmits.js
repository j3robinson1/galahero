import { supabase } from '../../utils/supabaseClient';
import cors, { runMiddleware } from '../../utils/corsMiddleware';

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);

  if (req.method === 'GET') {
    try {
      // Fetch all rows from the "music_highscores" table
      const { data, error } = await supabase
        .from('music_highscores')
        .select('*')
        .order('id', { ascending: false }); // Sort by ID in descending order

      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ error: error.message });
      }

      if (!data || data.length === 0) {
        return res.status(404).json({ error: 'No songs found' });
      }

      // Filter out duplicates while maintaining order by ID
      const uniqueSongs = [];
      const songSet = new Set();

      for (const row of data) {
        const uniqueKey = `${row.song}-${row.artist}`;
        if (!songSet.has(uniqueKey)) {
          uniqueSongs.push({ song: row.song, artist: row.artist });
          songSet.add(uniqueKey);
        }
      }

      return res.status(200).json({ data: uniqueSongs });
    } catch (err) {
      console.error('Unhandled error:', err);
      return res.status(500).json({ error: 'Internal server error', details: err.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
