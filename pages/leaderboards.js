import React, { useState, useEffect } from 'react';
import GlobalLeaderboard from '../components/GlobalLeaderboard'; // Ensure correct import path
import Link from 'next/link';

const LeaderboardPage = ({ walletAddress }) => {
  const [timeRemaining, setTimeRemaining] = useState('');
  const leaderboardEndTime = new Date('2025-02-01T00:00:00Z');
  const donationData = [
    { id: 1, logo: 'fuzzle-logo.png', link: 'https://beta.fuzzleprime.com', donated: 1000, color: '#944cee' }, // Fuzzle: Gold
    { id: 2, logo: 'metaflora-logo.png', link: 'https://metaflora.xyz', donated: 1000, color: '#7bd36f' }, // Metaflora: Lime Green
    { id: 3, logo: 'morphsters-logo.png', link: 'https://discord.gg/74cZf7wbhm', donated: 2000, color: '#594d95' }, // Metaflora: Lime Green
    { id: 4, logo: 'niov-logo.png', link: 'https://www.niovlabs.com', donated: 1000, color: '#f8b4e0' }, // Metaflora: Lime Green
    { id: 5, logo: 'lfg-logo.png', link: 'https://lfg.inc', donated: 1000, color: '#f7110e' }, // Metaflora: Lime Green
    { id: 6, logo: 'earthlings-logo.png', link: 'https://linktr.ee/musicbyearthlings', donated: 1000, color: '#f3d735' }, // Metaflora: Lime Green
    { id: 7, logo: 'nftharbor-logo.png', link: 'https://marketplace.nftharbor.io', donated: 1000, color: '#0585cb' }, // Metaflora: Lime Green
    { id: 8, logo: 'rep-logo.png', link: 'https://rep.run/#repsocial', donated: 1000, color: '#7700f3' }, // Metaflora: Lime Green
    { id: 9, logo: 'j2r-logo.png', link: 'https://www.youtube.com/@journeytoyourroots5358', donated: 1000, color: '#bad7b9' },
    { id: 10, logo: 'gytrace-logo.png', link: 'https://gytrace.com', donated: 1000, color: '#6ab5db' }, // Metaflora: Lime Green
    { id: 11, logo: 'magnetohr-logo.png', link: 'https://magnetohr.com', donated: 1000, color: 'silver' }, // Metaflora: Lime Green
    { id: 12, logo: 'caps-logo.png', link: 'https://caps.city', donated: 1000, color: '#b60b0c' }, // Metaflora: Lime Green
    { id: 13, logo: 'smilinmonster-logo.png', link: 'https://www.youtube.com/@smilinmonster', donated: 1000, color: '#dff7a8' }, // Metaflora: Lime Green
    { id: 14, logo: 'deeep-logo.png', link: 'https://www.deeep.network', donated: 1000, color: '#24e26a' }, // Metaflora: Lime Green
    { id: 15, logo: 'nerdnode-logo.png', link: 'https://nerdnode.io', donated: 1000, color: '#56b490' }, // Metaflora: Lime Green
    { id: 16, logo: 'lionheartent-logo.png', link: 'https://lionheartent.org', donated: 1500, color: '#f3ea99' }, // Metaflora: Lime Green
    { id: 17, logo: 'wookie-logo.png', link: 'https://www.youtube.com/@realdrwookiee', donated: 2000, color: '#be9f82' }, // Metaflora: Lime Green
    { id: 18, logo: 'rzr-logo.png', link: 'https://film.gala.com/films/rzr', donated: 1000, color: 'silver' }, // Metaflora: Lime Green
    { id: 19, logo: 'wen-logo.png', link: 'https://galacoins.xyz', donated: 3000, color: '#f8f442' }, // Metaflora: Lime Green
    { id: 20, logo: 'mjcryptowiz-logo.png', link: 'https://www.youtube.com/@mjcryptowiz', donated: 1000, color: '#e12323' }, // Metaflora: Lime Green
    { id: 20, logo: 'c-money-logo.png', link: 'https://www.youtube.com/@C-Money37', donated: 2500, color: '#8cb2ec' }, // Metaflora: Lime Green
  ];
  const [tournamentEnded, setTournamentEnded] = useState(false);
  const totalRewards = donationData.reduce((sum, sponsor) => sum + sponsor.donated, 0);

  useEffect(() => {
    // Timer for countdown
    const timer = setInterval(() => {
      const now = new Date();
      const timeDiff = leaderboardEndTime - now;

      if (timeDiff <= 0) {
        clearInterval(timer);
        setTimeRemaining('Tournament Results');
        setTournamentEnded(true);
      } else {
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((timeDiff / (1000 * 60)) % 60);
        const seconds = Math.floor((timeDiff / 1000) % 60);
        setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      style={{
        fontFamily: 'Arial, sans-serif',
        padding: '20px',
        color: 'white',
        backgroundColor: '#1c0414',
        height: 'calc(100vh - 90px)',
        overflow: 'auto',
      }}
    >
      <div className="top-ctas" style={{ marginBottom: '40px', display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ minWidth: '200px', textAlign: 'center' }}>
          <h2>Earn</h2>
          <p>Play songs and climb the leaderboard. Score high to earn rewards!</p>
        </div>
        <div style={{ minWidth: '200px', textAlign: 'center' }}>
          <h2>Compete</h2>
          <p>Connect your wallet and see your rank. Keep playing to improve!</p>
        </div>
        <div style={{ minWidth: '200px', textAlign: 'center' }}>
          <h2>Win</h2>
          <p>Top players win amazing prizes. Check rewards now!</p>
        </div>
      </div>

      <Link href="/" className="play-now">Play Now</Link>

      {/* Sponsors Section */}
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h3>This Leaderboard is Sponsored By</h3>
        <div className="sponsors-container">
            {donationData.map((item) => (
                <a
                href={item.link}
                key={item.id}
                target="_blank"
                rel="noopener noreferrer"
                className="sponsor-item"
                style={{ borderColor: item.color }} // Keep dynamic border color
                >
                <img
                    src={item.logo}
                    alt={`Logo ${item.id}`}
                    className="sponsor-logo"
                />
                <p className="sponsor-donation">
                <svg style={{verticalAlign: 'bottom', marginRight: '2px'}} width="15px" fill="white" x="0px" y="0px" viewBox="0 0 469 527">
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
                  </svg> {Intl.NumberFormat().format(item.donated)}</p>
            </a>
          ))}
        </div>
      </div>

      <h3 style={{ textAlign: 'center' , maxWidth: '600px' , margin: 'auto' , background: 'linear-gradient(315deg, #7a0b53 0%, #530f3c 20%, #300621 80%, #450c33 90%)' , padding: '10px 5px' , borderRadius: '10px'}}>
        Total Rewards: 
        <svg style={{ verticalAlign: 'sub', marginRight: '5px', marginLeft: '5px'}} width="20px" fill="white" x="0px" y="0px" viewBox="0 0 469 527">
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
        <span className="total-gala">{Intl.NumberFormat().format(totalRewards)}</span>
      </h3>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h3>{tournamentEnded ? "Tournament Results" : "Leaderboard Ends In"}</h3>
        {!tournamentEnded && (
          <p style={{ fontSize: '1rem', fontWeight: 'bold', width: '180px', margin: 'auto', padding: '10px 5px', background: '#bc087c', borderRadius: '7px', border: '1px solid #707070' }}>
            {timeRemaining}
          </p>
        )}
      </div>
      <div>
        <GlobalLeaderboard wallet={walletAddress} totalRewards={totalRewards} />
      </div>
    </div>
  );
};

export default LeaderboardPage;
