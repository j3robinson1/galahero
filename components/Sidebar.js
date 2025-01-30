import React, { useEffect, useState } from 'react';

const Sidebar = ({ musicList = [], recentlyPlayed = [], onSearch, onFilter, onSelectMusic }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSongSlug, setSelectedSongSlug] = useState(null);
  const [removingParams, setRemovingParams] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined' || !musicList.length) return;

    const params = new URLSearchParams(window.location.search);
    const q = params.get('q') ? decodeURIComponent(params.get('q')).replace(/-/g, ' ') : '';
    const songSlug = params.get('song');

    if (q) {
      setSearchTerm(q);
      onSearch(q);
    }

    setSelectedSongSlug(songSlug);
    setRemovingParams(false);

    // Once all params are processed, update the URL to clean state
    params.delete('q');
    params.delete('song');
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
  }, [musicList]); // Depend on musicList to ensure it's loaded

  useEffect(() => {
    if (selectedSongSlug && musicList.length > 0) {
      const found = musicList.find(music => music.title.toLowerCase().replace(/\s+/g, '-') === selectedSongSlug.toLowerCase());
      if (found) onSelectMusic(found);
    }
  }, [selectedSongSlug, musicList]); // Reacting to changes in selectedSongSlug and musicList

  const handleSelectSong = (music) => {
    const slug = music.title.toLowerCase().replace(/\s+/g, '-');
    setSelectedSongSlug(slug);
    onSelectMusic(music);
    updateUrl(searchTerm, slug);
  };

  const updateUrl = (search, slug) => {
    const params = new URLSearchParams();
    if (search) params.set('q', encodeURIComponent(search.replace(/\s/g, '-')));
    if (slug) params.set('song', slug);
    window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
  };

  // Sort musicList to move recently played songs to the top
  const sortedMusicList = [...musicList].sort((a, b) => {
    const isARecent = recentlyPlayed.some(r => r.song === a.title && r.artist === a.artist);
    const isBRecent = recentlyPlayed.some(r => r.song === b.title && r.artist === b.artist);

    if (isARecent && !isBRecent) return -1; // a should come before b
    if (!isARecent && isBRecent) return 1;  // b should come before a
    return 0; // keep original order otherwise
  });

  if (removingParams) {
    return <div style={{ width: '25%', padding: '1rem', height: 'calc(100vh - 100px)', backgroundColor: '#27071c' }}>
      <p style={{ color: 'white', textAlign: 'center', marginTop: '2rem' }}>Loading...</p>
    </div>;
  }

  return (
    <div style={{ width: '300px', backgroundColor: '#27071c', padding: '5px', height: 'calc(100vh - 95px)', overflowY: 'hidden' }}>
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Search music..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            onSearch(e.target.value);
            updateUrl(e.target.value, selectedSongSlug);
          }}
          style={{ width: 'calc(100% - 1.1rem)', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', marginBottom: '0.5rem' }}
        />
        {/* <button
          onClick={onFilter}
          style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', backgroundColor: 'gray', color: 'white', border: 'none' }}
        >Filter</button> */}
      </div>
      {searchTerm === '' && (
        <h3>Recently Played</h3>
      )}
      {sortedMusicList.length > 0 ? (
        <div className="musicList">
          {sortedMusicList.map((music, index) => (
            <div
              key={index}
              onClick={() => handleSelectSong(music)}
              style={{
                padding: '0.5rem',
                marginBottom: '0.5rem',
                borderRadius: '4px',
                background: selectedSongSlug === music.title.toLowerCase().replace(/\s+/g, '-') ? 'linear-gradient(315deg, #ce118b 0%, #960e66 100%)' : 'linear-gradient(315deg,#840758 0%,#530f3c 20%,#300621 80%,#560a3d 90%)',
                boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
              }}
            >
              <h4 style={{ margin: '0', fontSize: '1rem', color: '#fff' }}>{music.title}</h4>
              <p style={{ margin: '0', fontSize: '0.8rem', color: 'silver' }}>{music.artist}</p>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', color: '#aaa', marginTop: '2rem' }}>
          <p>No music available. Try searching or filtering.</p>
        </div>
      )}
      <iframe src="https://ads.fuzzleprime.com/adFrame?walletAddress=client|60816dcc05c6ea5702e755eb" width="300" height="170" frameborder="0" style={{borderRadius: '5px', overflow: 'hidden'}}></iframe>
    </div>
  );
};

export default Sidebar;
