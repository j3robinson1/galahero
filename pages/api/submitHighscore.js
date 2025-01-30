import { supabase } from '../../utils/supabaseClient';
import cors, { runMiddleware } from '../../utils/corsMiddleware';

export default async function handler(req, res) {
    await runMiddleware(req, res, cors);

    if (req.method === 'POST') {
        const { song, artist, score, user, mode } = req.body;
        
        // Check if necessary data is present
        if (!song || !artist || !score || !user || !mode) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        try {
            // Insert data into the Supabase 'music-highscores' table
            const { data, error } = await supabase
                .from('music_highscores')
                .insert([
                    { song: song, artist: artist, score: score, wallet: user, mode: mode }
                ]);

            if (error) {
                console.error("Supabase error:", error);
                return res.status(500).json({ error: error.message, details: error.details });
            }

            return res.status(200).json({ data: data });
        } catch (e) {
            console.error("Unhandled error:", e);
            return res.status(500).json({ error: 'Internal server error', details: e.message });
        }
    } else {
        // Handle any other HTTP methods
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
