import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router'; // Import useRouter from Next.js
import Header from '../components/Header';
import WalletConnect from '../components/WalletConnect';
import CrowdFundingPopup from '../components/CrowdFundingPopup';
import { Analytics } from "@vercel/analytics/react";
import '../styles/styles.css';

function MyApp({ Component, pageProps }) {
  const [musicList, setMusicList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMusicList, setFilteredMusicList] = useState([]);
  const [walletAddress, setWalletAddress] = useState('');
  const [ethWalletAddress, setEthWalletAddress] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [metamaskClient, setMetamaskClient] = useState(null);
  const [isLeaderboard, setIsLeaderboard] = useState(false); // State for detecting the leaderboard page

  const router = useRouter(); // Use Next.js router

  useEffect(() => {
    fetchMusicData();

    // Set initial state based on current route
    setIsLeaderboard(router.pathname === '/leaderboards');

    // Listen for route changes
    const handleRouteChange = (url) => {
      setIsLeaderboard(url === '/leaderboards');
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange); // Cleanup on unmount
    };
  }, [router]);

  const fetchMusicData = async () => {
    try {
      const response = await fetch(
        'https://prod-gala-music-data.music.gala.com/song/getAllMusicTokensV2'
      );
      if (!response.ok) throw new Error('Failed to fetch music data');
      const data = await response.json();

      if (!Array.isArray(data)) throw new Error('Unexpected data format');

      const musicItems = data.map((item) => {
        const { artist, name, cid, image } = item;

        // Decode CID and construct MP3 URL
        const decodedCid = Buffer.from(cid, 'base64').toString('utf-8');
        const mp3Url = `https://galamusic-ipfs.gala.com/ipfs/${decodedCid}/track.mp3`;

        return {
          title: name,
          artist: artist,
          mp3: mp3Url,
          image: image,
        };
      });

      setMusicList(musicItems);
      setFilteredMusicList(musicItems);
    } catch (error) {
      console.error('Error fetching music data:', error);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);

    if (query.trim() === '') {
      setFilteredMusicList(musicList);
      return;
    }

    const filtered = musicList.filter(
      (music) =>
        music.title.toLowerCase().includes(query.toLowerCase()) ||
        music.artist.toLowerCase().includes(query.toLowerCase())
    );

    setFilteredMusicList(filtered);
  };

  const handleFilter = () => {
    console.log('Filter button clicked'); // Implement filtering logic if needed
  };

  const handleSelectMusic = (music) => {
    console.log('Selected music:', music);
  };

  const handleWalletConnect = (galaAddress, ethAddress, connected, client) => {
    setWalletAddress(galaAddress);
    setEthWalletAddress(ethAddress);
    setIsConnected(connected);
    setMetamaskClient(client);
  };

  return (
    <div className={`container ${isLeaderboard ? 'leaderboards' : ''}`}>
      <CrowdFundingPopup />
      <Header />
      <WalletConnect onConnect={handleWalletConnect} />
      <Component
        {...pageProps}
        musicList={filteredMusicList}
        onSearch={handleSearch}
        onFilter={handleFilter}
        onSelectMusic={handleSelectMusic}
        isConnected={isConnected}
        walletAddress={walletAddress}
        ethWalletAddress={ethWalletAddress}
        metamaskClient={metamaskClient}
      />
      <Analytics />
    </div>
  );
}

export default MyApp;
