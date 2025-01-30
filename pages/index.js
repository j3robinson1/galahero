import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Play from '../components/Play';

const Home = ({
  musicList,
  onSearch,
  onFilter,
  onSelectMusic,
  isConnected,
  walletAddress,
  metamaskClient,
}) => {
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [resolvedMusic, setResolvedMusic] = useState(null); // Holds the updated song with correct source
  const [recentlyPlayed, setRecentlyPlayed] = useState([]); // Holds the recently played songs

  const isMobile = () => window.innerWidth <= 768;

  // Fetch recently played songs
  useEffect(() => {
    const fetchRecentlyPlayed = async () => {
      try {
        const response = await fetch('/api/getRecentSubmits'); // Adjust API endpoint if necessary
        if (!response.ok) throw new Error('Failed to fetch recently played songs');
        
        const data = await response.json();
        setRecentlyPlayed(data.data || []); // Assuming API response has a `data` key
      } catch (error) {
        console.error('Error fetching recently played songs:', error);
      }
    };

    fetchRecentlyPlayed();
  }, []); // Run once on component mount

  // Handle selecting a song
  const handleSelectMusic = (music) => {
    setSelectedMusic(music);
    onSelectMusic(music);
    if (isMobile()) {
      setIsSidebarOpen(false); // Close the sidebar if on mobile
    }
  };

  // Resolve the .mp3 or fallback to .m3u8
  useEffect(() => {
    const resolveMusicSource = async (music) => {
      if (!music) {
        setResolvedMusic(null);
        return;
      }

      let updatedMusic = { ...music }; // Clone the music object
      try {
        const response = await fetch(updatedMusic.mp3, { method: 'HEAD' });
        if (!response.ok) {
          console.warn(`MP3 not found for song: ${updatedMusic.title}. Falling back to M3U8.`);
          updatedMusic.mp3 = updatedMusic.mp3.replace('track.mp3', 'playlist.m3u8');
        }
      } catch (error) {
        console.error('Error checking MP3 file:', error);
        updatedMusic.mp3 = updatedMusic.mp3.replace('track.mp3', 'playlist.m3u8');
      }

      setResolvedMusic(updatedMusic);
    };

    resolveMusicSource(selectedMusic);
  }, [selectedMusic]);

  // Sidebar and main content styles
  const sidebarStyle = {
    position: 'fixed',
    top: '50px',
    bottom: 0,
    left: isSidebarOpen ? '0' : '-400px', // Slide in and out
    width: '310px',
    backgroundColor: '#27071c',
    padding: '1rem',
    transition: 'left 0.3s ease-in-out', // Smooth transition for sliding effect
    overflowY: 'auto',
    zIndex: 2, // Ensure the sidebar is above the main content
  };

  const mainContentStyle = {
    flex: 1,
    marginLeft: isSidebarOpen ? '340px' : '0', // Make space for the sidebar when it's open
    transition: 'margin-left 0.3s ease-in-out', // Smooth transition for margin changes
    backgroundColor: '#1c0414',
    padding: '1rem',
    maxWidth: 'calc(100% - 2rem)',
    height: 'calc(100vh - 80px)',
    overflow: 'auto',
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }} className={isSidebarOpen ? 'open' : ''}>
      {/* Hamburger Menu Icon */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        style={{
          position: 'absolute',
          top: '8px',
          left: '12px',
          zIndex: '3',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <svg
          width="30"
          height="30"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      {/* Sidebar */}
      <div style={sidebarStyle}>
        <Sidebar
          musicList={musicList}
          recentlyPlayed={recentlyPlayed}
          onSearch={onSearch}
          onFilter={onFilter}
          onSelectMusic={handleSelectMusic}
        />
      </div>

      {/* Main Content */}
      <div style={mainContentStyle}>
        {resolvedMusic ? (
          <Play song={resolvedMusic} user={walletAddress || ''} metamaskClient={metamaskClient} />
        ) : (
          <div style={{ textAlign: 'center', color: '#666' }}>
            <h2>Select a song to play</h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
