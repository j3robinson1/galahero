import React, { useState, useEffect } from 'react';

function Leaderboard({ song, wallet }) {
  const [mode, setMode] = useState('normal');
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);

  const styles = {
    container: {
      marginTop: '20px',
      width: '100%',
      marginLeft: 'auto',
      marginRight: 'auto',
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif',
    },
    title: {
      fontSize: '1.5rem',
      marginBottom: '1rem',
      letterSpacing: '1px',
    },
    tabContainer: {
      display: 'inline-block',
      marginBottom: '1rem',
    },
    tabButton: {
      padding: '8px 16px',
      margin: '0 4px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      backgroundColor: 'silver',
      transition: 'background-color 0.2s ease',
    },
    tabButtonActive: {
      backgroundColor: '#333',
      color: 'white',
    },
    table: {
      borderCollapse: 'collapse',
      width: '100%',
      marginTop: '1rem',
      borderRadius: '10px',
      overflow: 'hidden',
    },
    tr: {
      background: 'linear-gradient(315deg, #740758 0%, #530f3c 20%, #3d092a 80%, #560a3d 90%)',
    },
    th: {
      padding: '10px',
      textTransform: 'uppercase',
      fontWeight: '600',
    },
    td: {
      padding: '8px 10px',
      borderBottom: '1px solid #740758',
    },
    loading: {
      fontStyle: 'italic',
    },
    noScores: {
      fontStyle: 'italic',
    },
    highlight: {
      background: 'linear-gradient(315deg, rgb(167 32 133) 0%, rgb(113 26 84) 20%, rgb(113 23 80) 80%, rgb(140 21 101) 90%)',
    },
  };

  const getButtonStyle = (buttonMode) => {
    return mode === buttonMode ? { ...styles.tabButton, ...styles.tabButtonActive } : styles.tabButton;
  };

  const formatWallet = (wallet) => {
    const isMobile = window.innerWidth <= 768; // Check if the screen width is mobile
    if (isMobile) {
      return `${wallet.slice(0, 7)}...${wallet.slice(-5)}`;
    }
    return wallet;
  };

  useEffect(() => {
    if (!song?.title || !song?.artist) return;

    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          song: song.title,
          artist: song.artist,
          mode,
        }).toString();

        const res = await fetch(`/api/getHighscores?${queryParams}`);
        const json = await res.json();

        const sorted = (json.data || []).sort((a, b) => b.score - a.score);
        setScores(sorted);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [song?.title, song?.artist, mode]);

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Leaderboard</h3>
      <div style={styles.tabContainer}>
        <button style={getButtonStyle('easy')} onClick={() => setMode('easy')}>
          Easy
        </button>
        <button style={getButtonStyle('normal')} onClick={() => setMode('normal')}>
          Normal
        </button>
        <button style={getButtonStyle('hard')} onClick={() => setMode('hard')}>
          Hard
        </button>
      </div>

      {loading && <p style={styles.loading}>Loading leaderboard...</p>}
      {!loading && scores.length === 0 && <p style={styles.noScores}>No scores found for this mode yet.</p>}
      {!loading && scores.length > 0 && (
        <table style={styles.table}>
          <thead>
            <tr style={styles.tr}>
              <th style={styles.th}>Rank</th>
              <th style={styles.th}>Wallet</th>
              <th style={styles.th}>Score</th>
              <th style={styles.th}>Mode</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((row, index) => (
              <tr
                key={row.id || index}
                style={row.wallet === wallet ? { ...styles.tr, ...styles.highlight } : styles.normal}
              >
                <td style={styles.td}>{index + 1}</td>
                <td style={styles.td}>
                  {row.wallet === wallet ? `You - ${formatWallet(row.wallet)}` : formatWallet(row.wallet)}
                </td>
                <td style={styles.td}>{new Intl.NumberFormat().format(row.score)}</td>
                <td style={styles.td}>{row.mode}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Leaderboard;
