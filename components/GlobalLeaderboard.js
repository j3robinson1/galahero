import React, { useState, useEffect } from 'react';

function GlobalLeaderboard({ wallet, totalRewards }) {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  const styles = {
    container: {
      marginTop: '20px',
      width: '100%',
      marginLeft: 'auto',
      marginRight: 'auto',
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif',
      maxWidth: '1200px',
    },
    title: {
      fontSize: '1.5rem',
      marginBottom: '1rem',
      letterSpacing: '1px',
    },
    table: {
      borderCollapse: 'collapse',
      width: '100%',
      marginTop: '1rem',
      borderRadius: '10px',
      overflow: 'hidden',
    },
    tr: {
      fontSize: '.9rem',
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
    td2: {
      padding: '8px 10px',
      borderBottom: '1px solid #740758',
      textAlign: 'left',
      width: '90px',
    },
    svg: {
      verticalAlign: 'bottom',
      marginRight: '5px',
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

  useEffect(() => {
    const fetchLeaderboardScores = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/getLeaderboardScores');
        const json = await response.json();
        const data = json.data || [];
        // Ensure there are at least 100 entries
        while (data.length < 100) {
          data.push({ wallet: 'No Player', total_score: 0 });
        }
        setScores(data);
      } catch (error) {
        console.error('Failed to fetch leaderboard scores:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboardScores();
  }, []);

  const formatWallet = (wallet) => {
    const isMobile = window.innerWidth <= 768; // Check if the screen width is mobile
    if (isMobile) {
      return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
    }
    return wallet;
  };

  const formatScore = (score) => {
    if (score >= 1_000_000) {
      return `${(score / 1_000_000).toFixed(2)}M`;
    } else if (score >= 100_000) {
      return `${(score / 1_000).toFixed(1)}K`;
    }
    return score.toString(); // Return full number for scores below 100,000
  };

  const calculateRewards = (rank) => {
    if (rank > 100) {
        return 0;
    }

    const totalRewardsAvailable = totalRewards; // Total rewards pool available

    // Bracket definitions with modified weights and finer control over the last bracket
    const brackets = [
        { limit: 3, weight: 630, decay: 0.86 },    // Top 3, higher weights with standard decay
        { limit: 10, weight: 420, decay: 0.95 },   // Top 10, closer weight to top 3 with standard decay
        { limit: 25, weight: 300, decay: 0.95 },   // Top 25, standard decay
        { limit: 50, weight: 150, decay: 0.97 },   // Top 50, standard decay
        { limit: 100, weight: 70, decay: 0.98 }    // Ranks 51-100, minimal decay for even split
    ];

    let weights = [];
    let currentBracketStart = 1;

    // Assign weights based on brackets
    for (let bracket of brackets) {
        let rangeSize = bracket.limit - currentBracketStart + 1;
        let currentWeight = bracket.weight;

        for (let i = 0; i < rangeSize; i++) {
            weights.push(currentWeight);
            // Apply the specific decay for each bracket to smooth transitions within
            currentWeight *= bracket.decay;
        }

        currentBracketStart = bracket.limit + 1;
    }

    const totalWeight = weights.reduce((a, b) => a + b, 0);
    const rewards = weights.map(weight => (weight / totalWeight) * totalRewardsAvailable);
    
    return rewards[rank - 1]; // Adjusted to zero-indexed array
  };

  return (
    <div style={styles.container}>
      {loading && <p style={styles.loading}>Loading leaderboard...</p>}
      {!loading && scores.length === 0 && <p style={styles.noScores}>No scores found yet.</p>}
      {!loading && scores.length > 0 && (
        <table style={styles.table}>
          <thead>
            <tr style={styles.tr}>
              <th style={styles.th}>Rank</th>
              <th style={styles.th}>Wallet</th>
              <th style={styles.th}>Score</th>
              <th style={styles.th}>Reward</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((row, index) => (
              <tr
                key={row.wallet}
                style={
                    row.wallet === 'No Player' ? 
                    { ...styles.normal, opacity: 0.7 } : // Apply reduced opacity if no player
                    (row.wallet === wallet ? { ...styles.tr, ...styles.highlight } : styles.normal)
                }
              >
                <td style={styles.td}>{index + 1}</td>
                <td style={styles.td}>
                  {row.wallet === wallet ? `You - ${formatWallet(row.wallet)}` : formatWallet(row.wallet)}
                </td>
                <td style={styles.td}>{formatScore(row.total_score)}</td>
                <td style={styles.td2}>
                <svg style={styles.svg} width="15px" fill="white" x="0px" y="0px" viewBox="0 0 469 527">
                    <path d="M0,389.9c6.4,3.4,14.8,8.6,20.8,12.6c2.2,1.5,4.7,2.8,7.1,4.3c1.3,0.8,2.1,1.2,3.3,2c0.6,0.4,1.1,0.8,1.7,1.1
                        c0.7,0.4,1.1,0.6,1.8,1l77,47.4c1.1,0.6,2.1,1.3,3.3,2l69.9,43.1c0.8,0.5,1.1,0.6,1.8,1.1l33.4,20.5c1.5,0.8,2.1,1.8,3.8,1.9V265.9
                        l-10.6-6.1c-1-0.5-1.6-0.9-2.6-1.5l-8.3-4.8c-11.8-6.2-22.8-13.8-34.7-20c-1.2-0.6-1.6-1-2.9-1.6l-10.6-6.1
                        c-2.6-1.6-14.4-8.7-16.5-9.2v41.2l43.4,25.1c1.2,0.7,2,1.2,3.1,1.8c1.2,0.6,1.8,1.3,3.3,1.6V463c-7.6-5.1-15.7-9.7-23.5-14.4
                        l-18.9-11.7c-7.7-5.2-16-9.5-23.7-14.6c-0.9-0.6-1.4-0.8-2.3-1.4l-16.7-10.3c-1.8-1-3.1-1.8-4.8-3c-6.1-4.1-12.7-7.7-18.9-11.7
                        c-1.7-1.1-3.1-1.8-4.8-2.9c-9.2-6.2-19.1-11.8-28.5-17.5c-0.8-0.5-1.5-1-2.2-1.5l-7.3-4.5V157.4c-1.4-0.9-2.8-1.7-4.4-2.6
                        c-1.6-0.9-2.8-1.6-4.4-2.6L4.6,139.4c-1.7-0.9-3-1.9-4.6-2.7L0,389.9L0,389.9z"/>
                    <path d="M245.5,265.5v100.3l13.3-7.5c6.1-3.2,11.7-7.1,17.8-10.3c1.1-0.6,1.5-0.8,2.3-1.4c0.8-0.5,1.6-0.8,2.4-1.2
                        v-59.1c1.2-0.3,1.6-0.5,2.5-1.1c0.9-0.6,1.5-0.8,2.4-1.3c4.7-2.7,9.3-5.9,14.1-8.3c6.5-3.2,12.7-7.2,18.9-10.9
                        c1.6-0.9,2.9-1.7,4.6-2.7l9.4-5.3c1-0.6,1.3-0.8,2.3-1.4c4.1-2.1,7.9-4.9,12.1-7.1l4.6-2.7c0.8-0.5,1.6-0.8,2.4-1.2l30.7-17.8
                        c6.5-3.4,12.5-7.5,18.9-10.9l9.5-5.6c3.2-1.9,6.3-3.6,9.5-5.6c1.7-1,3.1-1.7,4.6-2.7l5-2.8V370c-1.4,0.3-1.8,0.8-3,1.5l-8.8,5.4
                        c-0.9,0.6-1.6,1.1-2.7,1.8c-1.2,0.7-2,1.3-3,1.9c-1.1,0.6-1.7,1.1-2.8,1.7l-8.9,5.3c-8,4.6-15.5,9.8-23.5,14.4l-23.4,14.5
                        c-1.1,0.7-1.7,1-2.8,1.7c-10.5,7.1-21.7,13-32.3,19.9c-1.9,1.3-3.9,2.4-5.8,3.6l-29.3,18c-0.9,0.5-1.9,1.1-2.8,1.7
                        c-8.7,5.7-17.8,10.6-26.5,16.3l-11.9,7.3v42c2-0.5,5.2-2.9,7-4c2.4-1.5,4.7-2.7,7.1-4.3c6.7-4.5,14-8.2,20.7-12.7
                        c1.3-0.8,2.3-1.5,3.5-2.2l17.7-10.9c1.2-0.7,2.1-1.3,3.3-2l94.2-58c1.3-0.8,2.4-1.5,3.5-2.2l62.9-38.7c1.2-0.8,2.4-1.5,3.6-2.1
                        V137.1c-1.8,0.4-2.1,1-3.5,1.8c-1.3,0.7-2.2,1.2-3.4,1.9l-20.9,12.1c-7.1,3.8-13.7,8.5-20.9,12.1l-55.9,32.2
                        c-2.5,1.4-4.5,2.7-6.9,4.1l-10.3,6c-7.3,3.7-17.9,10-24.6,14.2c-1.2,0.8-2.2,1.1-3.4,1.9l-22.7,13.2c-1,0.5-0.8,0.5-1.8,1.1
                        l-7.1,3.9c-4.2,2.2-7.9,4.9-12.1,7.1c-1,0.5-1,0.7-1.8,1.1l-7.1,3.9C261.7,256,249.3,264.7,245.5,265.5L245.5,265.5z"/>
                    <path d="M13.9,119.9c1.4,0.3,2.2,1.1,3.5,1.8c4.7,2.5,8.9,5.5,13.7,7.9l38,22c18.1,11,36.9,20.8,55.1,31.8l3.4,1.9
                        c1.3,0.7,2.2,1.3,3.4,1.9l20.7,12c0.9,0.5,0.8,0.5,1.5,0.9c9.7,5.9,19.9,10.9,29.5,17l30.8,17.7c1.2,0.7,2.1,1.3,3.3,2
                        c3.6,2.2,16.5,10,17.8,10c1.9,0,12.9-7,15.7-8.7l5.4-3.2c1.8-1.1,3.4-1.8,5.2-2.9c1.9-1.1,3.3-1.9,5.2-3l10.5-6.2
                        c1.8-1.1,3.4-1.9,5.1-3l15.9-9c1-0.5,1.7-1,2.6-1.5c0.9-0.6,1.5-0.9,2.6-1.5l10.6-6.1c1.7-1,3.6-2.5,5.6-3c-0.3-1.2-0.5-1.1-1.5-1.7
                        l-33.9-19.5c-13.5,7.1-26.3,15.4-39.7,22.7c-1.1,0.6-2,1.2-3,1.9c-2.1,1.3-4,2.4-6.2,3.6l-20.4-11.8c-7.1-3.6-13.6-8.3-20.7-12
                        c-1.6-0.9-3.2-1.9-4.6-2.7l-41.4-23.8c-0.8-0.5-1.5-0.9-2.3-1.4c-0.9-0.6-1.5-0.8-2.4-1.3l-53-30.6c-1-0.6-1.1-0.9-2.5-1.2
                        c1.1-1.6,2.4-1.7,4.2-2.8c1.5-1,2.9-1.5,4.5-2.4l46.1-24.9c1-0.6,1-0.7,2-1.2c1-0.5,1.5-0.7,2.4-1.3c1.6-1,3.2-1.7,4.8-2.5l57.5-31
                        c1-0.5,1.3-0.8,2.3-1.4l23.4-12.5c1.3,0,19,10.3,23.1,12.4c1,0.5,1.7,0.8,2.7,1.4c1.2,0.7,1.5,1,2.9,1.6l63.6,34.3
                        c5.6,3.5,22.6,12.4,28.6,15.4c6.8,3.4,13.3,7.5,20.1,10.9l37.8,20.5c1.3,0.7,1.7,0.9,2.9,1.6c4.5,2.7,4.6,0.4,11.9-3.6l13.5-7.7
                        c2.4-1.3,11.5-7.1,13.6-7.6c-0.4-1.3-1.6-1.8-2.8-2.5l-13.7-7.5c-6.9-3.5-13.8-7.8-20.7-11.1l-13.7-7.5c-4.7-2.4-9.4-4.6-13.8-7.4
                        l-69.1-37.3c-1.4-0.7-2.2-1.1-3.4-1.9l-27.8-15c-1.3-0.7-2.1-1.2-3.4-1.9c-0.7-0.4-1-0.5-1.6-0.8L248.8,7.4C246.5,6,235.8,0,234.5,0
                        c-1.1,0-8.8,4.6-10.5,5.4l-79.1,42.8c-1.3,0.6-2.3,1.1-3.5,1.8L86,79.9c-1.3,0.7-1.9,1.2-3.4,1.9l-5,2.7c-1,0.5-1,0.7-1.8,1.1
                        c-1.1,0.7-2.3,1-3.5,1.8l-10.6,5.7c-1.4,0.7-2.1,1.3-3.4,1.9l-16.1,8.8c-0.6,0.3-0.6,0.2-1.1,0.5c-2.3,1.3-4.7,2.2-6.9,3.7
                        c-1.3,0.8-2.1,1.1-3.5,1.8l-15.5,8.6C14,119.1,14.3,118.5,13.9,119.9L13.9,119.9z"/>
                  </svg>
                  {new Intl.NumberFormat().format(calculateRewards(index + 1).toFixed(2))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default GlobalLeaderboard;
