import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Hls from 'hls.js';

const SongPreview = ({ song }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [copySuccess, setCopySuccess] = useState('');
    const audioRef = useRef(null);
    const hlsRef = useRef(null); // Reference for HLS.js instance

    useEffect(() => {
        if (copySuccess) {
            const timer = setTimeout(() => setCopySuccess(''), 2500); // Message disappears after 2500 ms
            return () => clearTimeout(timer);
        }
    }, [copySuccess]);

    useEffect(() => {
        const audio = audioRef.current;

        if (song?.mp3.endsWith('.m3u8')) {
            // Initialize HLS.js if the source is an HLS stream
            if (Hls.isSupported()) {
                hlsRef.current = new Hls();
                hlsRef.current.loadSource(song.mp3);
                hlsRef.current.attachMedia(audio);

                hlsRef.current.on(Hls.Events.MANIFEST_PARSED, () => {
                    console.log('HLS manifest loaded. Ready to play.');
                });

                hlsRef.current.on(Hls.Events.ERROR, (event, data) => {
                    console.error('HLS.js error:', data);
                });
            } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
                // Fallback for Safari
                audio.src = song.mp3;
            } else {
                console.error('HLS is not supported in this browser.');
            }
        } else {
            // For non-HLS formats, directly set the source
            audio.src = song.mp3;
        }

        const updateTime = () => {
            setCurrentTime(audio.currentTime);
        };

        const updateDuration = () => {
            setDuration(audio.duration);
        };

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);

            // Cleanup HLS instance
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
        };
    }, [song?.mp3]);

    const handleShare = () => {
        const artistSlug = song.artist.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
        const songSlug = song.title.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
        const shareUrl = `${window.location.origin}?q=${artistSlug}&song=${songSlug}`;

        if (navigator.share) {
            navigator.share({
                title: song.title,
                text: `Check out this song: ${song.title} by ${song.artist}`,
                url: shareUrl,
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(shareUrl).then(() => {
                setCopySuccess('Link copied to clipboard!');
            }, (err) => {
                console.error('Failed to copy: ', err);
            });
        }
    };

    const togglePlay = () => {
        const audio = audioRef.current;
        if (isPlaying) {
            audio.pause();
        } else {
            audio.play().catch((error) => {
                console.error('Audio playback failed:', error);
            });
        }
        setIsPlaying(!isPlaying);
    };

    const handleProgressChange = (event) => {
        const audio = audioRef.current;
        const newTime = event.target.value;
        audio.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const handleVolumeChange = (event) => {
        const newVolume = event.target.value;
        setVolume(newVolume);
        audioRef.current.volume = newVolume;
    };

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    };

    if (!song) return null;

    const nftharborUrl = `https://marketplace.nftharbor.io/item/Song/Music/${encodeURIComponent(song.title)}/${encodeURIComponent(song.artist)}`;

    return (
        <div className="song-preview">
            <div className="song-info-container">
                <img className="song-image" src={song.image} alt={song.title} />
                <div className="song-details">
                    <h2>{song.title}</h2>
                    <p>{song.artist}</p>
                    <div className="buy-section">
                        <button 
                            className="buy-button"
                            onClick={() => window.open(`https://music.gala.com/artists/${song.artist.toLowerCase().replace(/\s+/g, '-').replace('&', 'and')}`, '_blank')}
                        >
                            <Image width={40} height={30} src="/gala.png" alt="Gala Music" />
                            <span>Gala Music</span>
                        </button>

                        <button
                            className="buy-alt"
                            onClick={() => window.open(nftharborUrl, '_blank')}
                        >
                            <Image width={40} height={30} src="/nftharbor.png" alt="NFT Harbor" />
                        </button>

                        <button
                            className="buy-alt"
                            onClick={() => window.open('https://opensea.io/collection/galamusic', '_blank')}
                        >
                            <Image width={40} height={30} src="/opensea.png" alt="OpenSea" />
                        </button>
                    </div>
                </div>
                <button
                className="share-button"
                onClick={handleShare}
                >
                <svg width="35px" height="35px" viewBox="0 0 24 24" fill="none">
                    <path d="M11.5003 12H5.41872M5.24634 12.7972L4.24158 15.7986C3.69128 17.4424 3.41613 18.2643 3.61359 18.7704C3.78506 19.21 4.15335 19.5432 4.6078 19.6701C5.13111 19.8161 5.92151 19.4604 7.50231 18.7491L17.6367 14.1886C19.1797 13.4942 19.9512 13.1471 20.1896 12.6648C20.3968 12.2458 20.3968 11.7541 20.1896 11.3351C19.9512 10.8529 19.1797 10.5057 17.6367 9.81135L7.48483 5.24303C5.90879 4.53382 5.12078 4.17921 4.59799 4.32468C4.14397 4.45101 3.77572 4.78336 3.60365 5.22209C3.40551 5.72728 3.67772 6.54741 4.22215 8.18767L5.24829 11.2793C5.34179 11.561 5.38855 11.7019 5.407 11.8459C5.42338 11.9738 5.42321 12.1032 5.40651 12.231C5.38768 12.375 5.34057 12.5157 5.24634 12.7972Z" stroke="silver" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                </button>
            </div>
            <audio ref={audioRef}></audio>
            <div className="media-controls">
                <button onClick={togglePlay}>
                    {isPlaying ? (
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="6" y="4" width="4" height="16" fill="silver" />
                            <rect x="14" y="4" width="4" height="16" fill="silver" />
                        </svg>
                    ) : (
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 3L19 12L5 21V3Z" fill="silver" />
                        </svg>
                    )}
                </button>
                <input
                    type="range"
                    min="0"
                    max={duration}
                    value={currentTime}
                    onChange={handleProgressChange}
                />
                <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
                <div className="volume-control">
                    <svg width="25" height="25" viewBox="0 0 24 24" fill="none">
                        <path d="M3 9V15H7L12 20V4L7 9H3Z" fill="silver" />
                        <path d="M16.5 12C16.5 10.42 15.79 8.92 14.54 7.93L13.49 8.98C14.37 9.57 15 10.71 15 12C15 13.29 14.37 14.43 13.49 15.02L14.54 16.07C15.79 15.08 16.5 13.58 16.5 12Z" fill="silver" />
                        <path d="M19.07 4.93L17.66 6.34C19.34 8.02 20.5 10.38 20.5 12C20.5 13.62 19.34 15.98 17.66 17.66L19.07 19.07C21.08 17.06 22.5 14.15 22.5 12C22.5 9.85 21.08 6.94 19.07 4.93Z" fill="silver" />
                    </svg>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                    />
                </div>
            </div>
        </div>
    );
};

export default SongPreview;
