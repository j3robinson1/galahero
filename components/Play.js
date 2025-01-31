import React, { useState, useEffect, useRef } from 'react';
import { analyze } from 'web-audio-beat-detector'; // Import library for BPM detection
import SongPreview from './SongPreview';
import Leaderboard from './Leaderboard';
import Hls from 'hls.js';

const Play = ({ song, user, metamaskClient }) => {
    const [score, setScore] = useState(1000);
    const [combo, setCombo] = useState(0);
    const [highestScore, setHighestScore] = useState(1000);
    const [gamePaused, setGamePaused] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [noteInterval, setNoteInterval] = useState(500); // Default to 500ms
    const [gameStarted, setGameStarted] = useState(false);
    const [gameMode, setGameMode] = useState('easy'); // Options: 'easy', 'normal', 'hard'
    const [comboProgress, setComboProgress] = useState(0);
    const [boostActive, setBoostActive] = useState(false);
    const [boostAvailable, setBoostAvailable] = useState(false);
    const [totalPredictedNotes, setTotalPredictedNotes] = useState(1000); // Example value; dynamically set this as needed
    const [wallet, setWallet] = useState(user || '');
    const audioRef = useRef(null);
    const noteContainerRef = useRef(null);
    const keys = ['a', 's', 'd', 'f'];
    const [practiceMode, setPracticeMode] = useState(true); // New state for practice mode
    const [tournamentEnded, setTournamentEnded] = useState(false);
    const tournamentEndTime = new Date('2025-02-01T00:00:00Z');

    const [burnAmount, setBurnAmount] = useState(0);
    const [burnSuccess, setBurnSuccess] = useState('');
    const [burnError, setBurnError] = useState('');
    const [isBurning, setIsBurning] = useState(false);

    const [activeKeys, setActiveKeys] = useState({
        a: false,
        s: false,
        d: false,
        f: false
    });

    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const frequencyBufferRef = useRef(null);
    const SAFE_DISTANCE = 100; // Minimum distance in pixels between notes
    
    useEffect(() => {
        const checkTournamentStatus = setInterval(() => {
            const now = new Date();
            if (now >= tournamentEndTime) {
                setTournamentEnded(true);
                clearInterval(checkTournamentStatus);
            }
        }, 1000);

        return () => clearInterval(checkTournamentStatus);
    }, []);
        
    const handleGameModeChange = (mode) => {
        setGameMode(mode);
        if (mode === 'easy') setBurnAmount(0);
        else if (mode === 'normal') setBurnAmount(1);
        else if (mode === 'hard') setBurnAmount(2);
    };
    
    // Analyze BPM and set note interval
    const analyzeBPM = async () => {
        try {
            if (song.mp3.endsWith('.m3u8')) {
                console.warn('Cannot analyze BPM for HLS (.m3u8) streams directly.');
                setTotalPredictedNotes(150); // Simplistic fallback
                setNoteInterval(500); // Fallback to default interval
                return;
            }
    
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            audioContextRef.current = audioContext;
    
            const response = await fetch(song.mp3);
            if (!response.ok) {
                throw new Error(`Failed to fetch audio file: ${response.statusText}`);
            }
    
            const audioData = await response.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(audioData);
    
            const bpm = await analyze(audioBuffer);
            console.log('Detected BPM:', bpm);
            const songDuration = audioBuffer.duration; // Get the duration in seconds
            console.log('Song duration:', songDuration);
    
            // Calculate interval for spawning notes
            const interval = 60000 / bpm;
            setNoteInterval(interval);
    
            // Adjust predicted notes calculation based on your new requirements
            const notesPerMinute = bpm * (gameMode === 'normal' ? 2 : gameMode === 'hard' ? 2.5 : 1);
            const totalNotes = (notesPerMinute * (songDuration / 60));
    
            // Suppose you want about half the notes hit to fill 50% of the bar by 1/3rd of the song
            const targetNotesByFirstThird = totalNotes * (1/3);
            setTotalPredictedNotes(targetNotesByFirstThird * 2); // Since you want 50% by this time
    
            console.log(`Calculated Total Predicted Notes: ${Math.ceil(totalNotes)}`);
        } catch (error) {
            console.error('Error detecting BPM or analyzing audio:', error);
            setTotalPredictedNotes(150); // Default fallback
            setNoteInterval(500); // Fallback to default interval
        }
    };
          
    // Initialize the game state
    useEffect(() => {
        if (!song?.mp3) return;
    
        const initializeAudio = async () => {
            const audio = new Audio();
            audioRef.current = audio;
            await analyzeBPM(); // This function should ideally set totalPredictedNotes internally

            if (song.mp3.endsWith('.m3u8')) {
                if (Hls.isSupported()) {
                    const hls = new Hls();
                    hls.loadSource(song.mp3);
                    hls.attachMedia(audio);
        
                    hls.on(Hls.Events.MANIFEST_PARSED, () => {
                        console.log('HLS manifest loaded. Ready to play.');
                        setNoteInterval(500); // Fallback interval for HLS
                    });
        
                    hls.on(Hls.Events.ERROR, (event, data) => {
                        console.error('HLS.js error:', data);
                    });
                } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
                    audio.src = song.mp3;
                    console.log('Native HLS support detected.');
                    setNoteInterval(500); // Fallback interval for HLS
                } else {
                    console.error('HLS is not supported in this browser.');
                    return;
                }
            } else {
                // Analyze BPM for MP3 files
                try {
                    const response = await fetch(song.mp3);
                    const audioData = await response.arrayBuffer();
                    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    const audioBuffer = await audioContext.decodeAudioData(audioData);
        
                    const bpm = await analyze(audioBuffer);
                    console.log('Detected BPM:', bpm);
        
                    // Calculate interval and total notes
                    const interval = 60000 / bpm; // Convert BPM to milliseconds per beat
                    setNoteInterval(interval);
        
                    const multiplier = gameMode === 'normal' ? 2 : gameMode === 'hard' ? 2.5 : 1;
                    const predictedNotes = Math.ceil(bpm * multiplier);
                    console.log(`Calculated Total Predicted Notes: ${predictedNotes}`);
                    setTotalPredictedNotes(predictedNotes);
        
                    // Ensure audio is ready for playback
                    audio.src = song.mp3;
                } catch (error) {
                    console.error('Error analyzing BPM:', error);
                    setNoteInterval(500); // Default interval
                }
            }
        
            // Pause audio to prepare for game start
            audio.pause();
            audio.currentTime = 0;
        
            const handleEnded = () => {
                console.log("Song finished!");
              
                // highestScore is still okay if you keep updating it as the user plays.
                setGameOver(true);
                setGameStarted(false);
                
                setComboProgress(0);
                setCombo(0);
            };
              
            audio.addEventListener("ended", handleEnded);
        
            return () => {
                audio.removeEventListener('ended', () => {});
                audio.pause();
                audio.currentTime = 0;
            };
        };        
    
        initializeAudio();
    }, [song]);    

    useEffect(() => {
        if (gameOver && !practiceMode && highestScore && user && gameMode) {
            submitHighScore(highestScore, user, gameMode);
            setScore(1000);
            setCombo(0);
            setComboProgress(0);
            setGameStarted(false);
            setGameOver
        }
    }, [gameOver, practiceMode, highestScore, user, gameMode]);
    
    useEffect(() => {
        setWallet(user);
    }, [user]);

    // Handle spawning notes
    useEffect(() => {
        if (!gameStarted || !noteContainerRef.current || gamePaused || gameOver) return;
    
        const intervalId = setInterval(spawnNote, noteInterval);
    
        return () => clearInterval(intervalId);
    }, [gameStarted, gamePaused, gameOver, noteInterval]);    

    // Handle key presses
    useEffect(() => {
        // Only attach listeners if the game is actually in progress
        if (!gameStarted || gameOver) return;
      
        const handleKeyDown = (event) => {
          const key = event.key.toLowerCase();
          if (keys.includes(key)) {
            setActiveKeys((prev) => ({ ...prev, [key]: true }));
            handleKeyPress(key, boostActive); // Will only be called if gameStarted && !gameOver
          }
        };
      
        const handleKeyUp = (event) => {
          const key = event.key.toLowerCase();
          if (keys.includes(key)) {
            setActiveKeys((prev) => ({ ...prev, [key]: false }));
          }
        };
      
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
      
        return () => {
          document.removeEventListener('keydown', handleKeyDown);
          document.removeEventListener('keyup', handleKeyUp);
        };
    }, [gameStarted, gameOver, boostActive]);      

    useEffect(() => {
        // (In the handleSpaceBar effect)
        const handleSpaceBar = (event) => {
            // The bar is considered "full" at totalPredictedNotes / 2 hits
            // So 50% bar is totalPredictedNotes / 4 hits
            if (event.code === "Space") {
            // Check if bar is at least 50%
            if (comboProgress >= (totalPredictedNotes / 4) && !boostActive) {
                // Then allow activation
                const maxBoostDuration = 10000; // 10 seconds
                // Scale boost duration by how full the bar is
                // e.g., if bar is 100%, they get maxBoostDuration
                // if bar is 200%, they'd still get maxBoostDuration
                // Adjust to your liking if you want more scaling
                const fillPercentage = Math.min(comboProgress / (totalPredictedNotes / 2), 1);
                const boostDuration = fillPercentage * maxBoostDuration;
        
                setBoostActive(true);
                setBoostAvailable(false);
        
                // End the boost after 'boostDuration'
                setTimeout(() => {
                setBoostActive(false);
                setComboProgress(0);
                setBoostAvailable(false); // reset progress after using
                }, boostDuration);
        
                console.log(`Boost activated for ${boostDuration / 1000} seconds.`);
            }
            }
        };
    
        document.addEventListener("keydown", handleSpaceBar);
        return () => document.removeEventListener("keydown", handleSpaceBar);
    }, [boostAvailable, comboProgress, totalPredictedNotes]);           
    
    const mapFrequenciesToKey = () => {
        if (!analyserRef.current || !frequencyBufferRef.current) {
            return keys[Math.floor(Math.random() * keys.length)];
        }

        const analyser = analyserRef.current;
        const buffer = frequencyBufferRef.current;

        analyser.getByteFrequencyData(buffer);
        const maxIndex = buffer.indexOf(Math.max(...buffer));
        const frequency = (audioContextRef.current.sampleRate / 2) * (maxIndex / buffer.length);

        if (frequency < 100) return 'a';
        if (frequency < 200) return 's';
        if (frequency < 300) return 'd';
        return 'f';
    };

    const spawnNote = () => {
        if (!audioRef.current) return;

        // Calculate remaining time in the song
        const remainingTime = audioRef.current.duration - audioRef.current.currentTime;

        if (remainingTime > 15) {
            const preSpawnDelay = 6000; // Delay in milliseconds to align notes with the hit line

            const createNote = (key) => {
                const column = noteContainerRef.current.querySelector(`#column-${key}`);
                if (!column) return;

                const existingNotes = Array.from(column.querySelectorAll('.note'));
                const hasOverlap = existingNotes.some((note) => {
                    const noteRect = note.getBoundingClientRect();
                    const containerRect = column.getBoundingClientRect();
                    const noteBottom = noteRect.top - containerRect.top + noteRect.height;
                    const containerHeight = containerRect.height;

                    const distanceToHitLine = Math.abs(noteBottom - (containerHeight - 200)); // Hit line position
                    return distanceToHitLine < SAFE_DISTANCE;
                });

                if (hasOverlap) return; // Skip creating this note if overlap detected

                const note = document.createElement('div');
                note.className = 'note';
                note.setAttribute('data-key', key);
                note.setAttribute('id', `note-${key}-${Date.now()}`); // Unique ID for debugging

                // Note styling
                note.style.position = 'absolute';
                note.style.left = '50%';
                note.style.transform = 'translateX(-50%)';
                note.style.width = '40px';
                note.style.height = '40px';
                note.style.backgroundColor = '#ff01a5';
                note.style.borderRadius = '50%';

                const extendedDuration = (noteInterval / 1000) * 4;
                note.style.animation = `moveDown ${extendedDuration}s linear`;

                setTimeout(() => column.appendChild(note), preSpawnDelay);

                note.onanimationend = () => {
                    if (!note.classList.contains('hit')) {
                        updateScore(-50);
                        setCombo(0);
                    }
                    note.remove();
                };
            };

            const availableKeys = [...keys];
            if (gameMode === 'easy') {
                if (Math.random() > 0.25) {
                    const randomKey = availableKeys[Math.floor(Math.random() * availableKeys.length)];
                    createNote(randomKey);
                }
            } else if (gameMode === 'normal') {
                const isSimultaneous = Math.random() > 0.9;
                if (isSimultaneous) {
                    const numNotes = 2;
                    const selectedKeys = [];

                    for (let i = 0; i < numNotes && availableKeys.length > 0; i++) {
                        const randomIndex = Math.floor(Math.random() * availableKeys.length);
                        const randomKey = availableKeys.splice(randomIndex, 1)[0];
                        selectedKeys.push(randomKey);
                    }

                    selectedKeys.forEach((key) => createNote(key));
                } else {
                    const randomKey = availableKeys[Math.floor(Math.random() * availableKeys.length)];
                    createNote(randomKey);
                }
                if (Math.random() > 0.95) {
                    const offBeatKey = availableKeys[Math.floor(Math.random() * availableKeys.length)];
                    setTimeout(() => createNote(offBeatKey), noteInterval / 2);
                }
            } else if (gameMode === 'hard') {
                const isSimultaneous = Math.random() > 0.8;
                if (isSimultaneous) {
                    const numNotes = 3;
                    const selectedKeys = [];

                    for (let i = 0; i < numNotes && availableKeys.length > 0; i++) {
                        const randomIndex = Math.floor(Math.random() * availableKeys.length);
                        const randomKey = availableKeys.splice(randomIndex, 1)[0];
                        selectedKeys.push(randomKey);
                    }

                    selectedKeys.forEach((key) => createNote(key));
                } else {
                    const randomKey = availableKeys[Math.floor(Math.random() * availableKeys.length)];
                    createNote(randomKey);
                }
                if (Math.random() > 0.8) {
                    const offBeatKey = availableKeys[Math.floor(Math.random() * availableKeys.length)];
                    setTimeout(() => createNote(offBeatKey), noteInterval / 2);
                }
            }
        } else {
            console.log("Stopped creating notes as we're in the last 10 seconds.");
        }
    };

    
    const burnTokens = async () => {
        setBurnError('');
        setBurnSuccess('');
        setIsBurning(true);
    
        try {
          const burnTokensDto = {
            owner: user,
            tokenInstances: [
              {
                quantity: burnAmount.toString(),
                tokenInstanceKey: {
                  collection: 'GALA',
                  category: 'Unit',
                  type: 'none',
                  additionalKey: 'none',
                  instance: '0',
                },
              },
            ],
            uniqueKey: `january-2025-event-${process.env.NEXT_PUBLIC_PROJECT_ID}-${Date.now()}`,
          };
    
          const signedBurnDto = await metamaskClient.sign('BurnTokens', burnTokensDto);
    
          const response = await fetch(`${process.env.NEXT_PUBLIC_BURN_GATEWAY_API}/BurnTokens`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(signedBurnDto),
          });
    
          if (!response.ok) {
            throw new Error('Failed to burn tokens');
          }
    
          setBurnSuccess('Successfully burned 1 GALA to start the game!');
          startGame(false); // Start the game after a successful burn
        } catch (error) {
          setBurnError(error instanceof Error ? error.message : 'Failed to burn tokens');
        } finally {
          setIsBurning(false);
        }
    };

    const PROGRESS_PER_HIT = 100 / totalPredictedNotes; // Divide 100% by the total number of predicted notes to normalize progress increment.

    const handleKeyPress = (pressedKey, isBoostActive) => {
        if (gamePaused || gameOver) return;
    
        const column = noteContainerRef.current.querySelector(`#column-${pressedKey}`);
        if (!column) return;
    
        const notes = Array.from(column.querySelectorAll('.note'));
        if (notes.length === 0) {
            // Miss logic
            showFeedback(pressedKey, "Miss", -50);
            updateScore(-50);
            setCombo(0); // Reset combo
            return;
        }
    
        let closestNote = null;
        let minDistance = Infinity;
    
        // Finding the closest note to the hit line
        notes.forEach((note) => {
            if (!note.classList.contains('hit')) {
                const noteRect = note.getBoundingClientRect();
                const containerRect = column.getBoundingClientRect();
                const noteBottom = noteRect.top - containerRect.top + noteRect.height;
                const containerHeight = containerRect.height;
    
                const distanceToHitLine = Math.abs(noteBottom - (containerHeight - 65)); // Hit line position
                if (distanceToHitLine < minDistance) {
                    closestNote = note;
                    minDistance = distanceToHitLine;
                }
            }
        });
    
        // Hitting the closest note logic
        if (closestNote && minDistance <= SAFE_DISTANCE) {
            closestNote.classList.add('hit');
            createParticleEffect(closestNote);
            closestNote.remove();
    
            let points = calculatePoints(minDistance);
            let feedbackText = "Good"; // Default feedback
            if (minDistance <= 25) feedbackText = "Perfect";
            else if (minDistance <= 50) feedbackText = "Great";

            if (boostActive) points *= 2;  // Double points when boost is active
    
            updateScore(points);
    
            // Update combo and comboProgress
            setCombo((prevCombo) => prevCombo + 1);
            showFeedback(pressedKey, feedbackText, points);
            if (!isBoostActive) { // Only update comboProgress if boost is not active
                setComboProgress((prev) => {
                    const newProgress = Math.min(prev + PROGRESS_PER_HIT, 100); // Ensures that progress never exceeds 100%
            
                    // Check for boost availability based on a threshold of 25% of a "full" bar
                    // Assuming "full" bar is considered 100% for user clarity
                    const boostThreshold = 50; // 25% of the full progress bar
                    if (newProgress >= boostThreshold) {
                        setBoostAvailable(true);
                    }
            
                    return newProgress;
                });
            }
        } else {
            // Miss logic
            showFeedback(pressedKey, "Miss", -50);
            updateScore(-50);
            setCombo(0); // Reset combo on miss
        }
    };    
    
    const calculatePoints = (distance) => {
        if (distance <= 25) return 100;
        if (distance <= 50) return 75;
        if (distance <= 80) return 50;
        return 20;  // Miss or poor hit
    };
      

    // Drain the boost bar when boostActive is true
    useEffect(() => {
        let drainInterval;
      
        if (boostActive) {
          drainInterval = setInterval(() => {
            setComboProgress((prevProgress) => {
              // Suppose you want to drain by 10% of the bar per second
              // But remember "1 bar" = totalPredictedNotes / 2
              const drainAmount = (totalPredictedNotes / 2) * 0.1; // 10% of a bar
              const newProgress = prevProgress - drainAmount;
              if (newProgress <= 0) {
                clearInterval(drainInterval);
                setBoostActive(false);
                return 0;
              }
              return newProgress;
            });
          }, 1000);
        }
      
        return () => clearInterval(drainInterval);
    }, [boostActive, totalPredictedNotes]);      

    const submitHighScore = async (finalScore, finalWallet, finalMode) => {
        try {
          const response = await fetch('/api/submitHighscore', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              song: song.title,
              artist: song.artist,
              score: finalScore,
              user: finalWallet,
              mode: finalMode
            })
          });
          const data = await response.json();

          setPracticeMode(true);
          console.log('High Score Submitted:', data);
        } catch (error) {
          console.error('Failed to submit high score:', error);
        }
    };      

    const showFeedback = (key, feedback, points) => {
        const column = noteContainerRef.current.querySelector(`#column-${key}`);
        if (!column) return;
    
        const feedbackDiv = document.createElement('div');
        feedbackDiv.className = 'feedback';
        feedbackDiv.textContent = feedback;
        feedbackDiv.style.position = 'absolute';
        feedbackDiv.style.bottom = '10px'; // Adjust position
        feedbackDiv.style.left = '50%';
        feedbackDiv.style.transform = 'translateX(-50%)';
        feedbackDiv.style.color =
            feedback === "Perfect" ? "gold" :
            feedback === "Great" ? "green" :
            feedback === "Good" ? "blue" : "red";
        feedbackDiv.style.fontSize = '20px';
        feedbackDiv.style.fontWeight = 'bold';
    
        column.appendChild(feedbackDiv);
    
        setTimeout(() => feedbackDiv.remove(), 1000);
    };

    const createParticleEffect = (note) => {
        const particleContainer = document.createElement('div');
        particleContainer.className = 'particle-container';

        for (let i = 0; i < 10; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = `${Math.random() * 50}px`;
            particle.style.top = `${Math.random() * 50}px`;
            particleContainer.appendChild(particle);
        }

        const rect = note.getBoundingClientRect();
        particleContainer.style.position = 'absolute';
        particleContainer.style.left = `${rect.left}px`;
        particleContainer.style.top = `${rect.top}px`;

        document.body.appendChild(particleContainer);

        setTimeout(() => particleContainer.remove(), 1000);
    };

    const updateScore = (points) => {
        setScore((prevScore) => {
          const newScore = Math.max(0, prevScore + points);
      
          // Update the ref's highestScore
          if (newScore > sessionRef.current.highestScore) {
            sessionRef.current.highestScore = newScore;
          }
      
          // Also keep local state
          if (newScore > highestScore) {
            localStorage.setItem('highestScore', newScore.toString());
            setHighestScore(newScore);
          }
      
          return newScore;
        });
      };      
    
    // A ref to hold all session data (wallet, mode, etc.)
    const sessionRef = useRef({
        wallet: '',
        mode: '',
        highestScore: 1000, // initial
        startTime: null,
        // maybe store other info you need
    });
    
    const buttonBase = {
        margin: '5px',
        padding: '10px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
      };
      
      const buttonActive = {
        ...buttonBase,
        backgroundColor: '#333',
        color: '#ffffff',
      };
      
      const buttonInactive = {
        ...buttonBase,
        backgroundColor: 'silver',
        color: '#000000',
      };

    const [isMobile, setIsMobile] = useState(false);

    // Detect mobile screen width
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile(); // Initial checkended
        window.addEventListener('resize', checkMobile); // Add resize listener
        return () => window.removeEventListener('resize', checkMobile); // Cleanup listener
    }, []);

    // In your startGame function, REMOVE new Audio(...) creation:
    const startGame = async (practice = false) => {
        setPracticeMode(practice);

        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }

        sessionRef.current.wallet = user; // lock in wallet
        sessionRef.current.mode = gameMode; // lock in current mode
        sessionRef.current.startTime = Date.now();
        sessionRef.current.highestScore = 1000; // reset to 1000

        setGameOver(false);
        setHighestScore(1000);
        setScore(1000);
        console.log(`Starting game with Total Predicted Notes: ${totalPredictedNotes}`);
        console.log('user: ', user);
        setWallet(user);

        const preSpawnTime = 500; // Delay before starting the game

        // Ensure the audio element is ready to play
        if (audioRef.current) {
            try {
                audioRef.current.currentTime = 0; // Reset to the beginning

                const playAudio = async () => {
                    try {
                        await audioRef.current.play();
                        console.log('Audio playback started successfully.');

                        // Sync audio start with game start
                        setTimeout(() => {
                            setGameStarted(true);
                            console.log('Game started.');
                        }, preSpawnTime);
                    } catch (error) {
                        console.error('Audio playback failed. Retrying...', error);
                        setTimeout(playAudio, 500); // Retry after 500ms
                    }
                };

                // Try playing the audio
                playAudio();
            } catch (error) {
                console.error('Audio playback error:', error);
                alert('Audio failed to play. Try again.');
            }
        } else {
            console.error('Audio element is not initialized.');
            alert('Audio element is not initialized. The game cannot start.');
        }
    };

    const togglePause = () => {
        setGamePaused((prev) => !prev);
        if (gamePaused) {
            if (audioRef.current) audioRef.current.play();
        } else {
            if (audioRef.current) audioRef.current.pause();
        }
    };

    useEffect(() => {
        let overlay;

        if (gameStarted && !gameOver) {
            // Create the overlay
            overlay = document.createElement('div');
            overlay.id = 'game-overlay';
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.zIndex = '9999';
            overlay.style.pointerEvents = 'auto';

            // Append overlay to the body
            document.body.prepend(overlay);
        } else {
            // Remove the overlay
            const existingOverlay = document.getElementById('game-overlay');
            if (existingOverlay) {
                existingOverlay.remove();
            }
        }

        // Cleanup overlay when component unmounts or state changes
        return () => {
            if (overlay) overlay.remove();
        };
    }, [gameStarted, gameOver]);

    return (
        <div>
            {/* Show a preview if the game hasn't started */}
            {!gameStarted && song && <SongPreview song={song} />}

            {/* When the game is over, display results */}
            {gameOver && (
                <div style={{ textAlign: "center", marginTop: "20px" }}>
                    <h2>Congrats! {practiceMode}</h2>
                    <p>Your Score: {highestScore}</p>
                    <p>Game Mode: {sessionRef.current.mode}</p>
                </div>
            )}
            
            {/* If the game isn't started, let the player choose a mode and start */}
            {!gameStarted && (
                <div style={{ textAlign: 'center' }}>
                <h2>New Game</h2>
                {isMobile ? (
                    <p style={{ color: 'silver', fontSize: '1.2rem' }}>Only available on desktop</p>
                ) : user ? (
                    <>
                    <div style={{ marginBottom: '20px' }}>
                        <button
                        onClick={() => handleGameModeChange('easy')}
                        style={gameMode === 'easy' ? buttonActive : buttonInactive}
                        >
                        Easy
                        </button>
                        <button
                        onClick={() => handleGameModeChange('normal')}
                        style={gameMode === 'normal' ? buttonActive : buttonInactive}
                        >
                        Normal
                        </button>
                        <button
                        onClick={() => handleGameModeChange('hard')}
                        style={gameMode === 'hard' ? buttonActive : buttonInactive}
                        >
                        Hard
                        </button>
                    </div>
                    {!tournamentEnded ? (
                        <button
                            onClick={burnTokens}
                            className="start buy-button"
                            style={{ padding: '10px', fontSize: '22px' }}
                        >
                            Start Game
                        </button>
                    ) : (
                        <p style={{ fontSize: '1.2rem', color: 'silver', marginTop: '10px' }}>No Current Active Tournament</p>
                    )}
                    <span className="burn">
                        <svg fill="silver" height="30px" width="30px" viewBox="0 0 611.999 611.999">
                        <g>
                            <path d="M216.02,611.195c5.978,3.178,12.284-3.704,8.624-9.4c-19.866-30.919-38.678-82.947-8.706-149.952 c49.982-111.737,80.396-169.609,80.396-169.609s16.177,67.536,60.029,127.585c42.205,57.793,65.306,130.478,28.064,191.029 c-3.495,5.683,2.668,12.388,8.607,9.349c46.1-23.582,97.806-70.885,103.64-165.017c2.151-28.764-1.075-69.034-17.206-119.851 c-20.741-64.406-46.239-94.459-60.992-107.365c-4.413-3.861-11.276-0.439-10.914,5.413c4.299,69.494-21.845,87.129-36.726,47.386 c-5.943-15.874-9.409-43.33-9.409-76.766c0-55.665-16.15-112.967-51.755-159.531c-9.259-12.109-20.093-23.424-32.523-33.073 c-4.5-3.494-11.023,0.018-10.611,5.7c2.734,37.736,0.257,145.885-94.624,275.089c-86.029,119.851-52.693,211.896-40.864,236.826 C153.666,566.767,185.212,594.814,216.02,611.195z" />
                        </g>
                        </svg>
                        {burnAmount + 1} GALA
                    </span>
                    </>
                ) : (
                    <>
                        <span>Connect Wallet to Play Ranked</span>
                    </>
                )}
                {!isMobile ? (
                    <>
                        <button
                            onClick={() => startGame(true)} // Start in practice mode
                            className="start practice-button"
                            style={{ cursor: 'pointer', padding: '10px', fontSize: '18px', marginLeft: '10px' }}
                        >
                            Practice Mode
                        </button>
                    </>
                ) : (
                    <></>
                )}
                {!user ? (
                    <img src="/galahero.jpg" width="100%" style={{ borderRadius: '10px', marginTop: '30px' }} />
                ): (
                    <></>
                )}
                </div>
            )}

            {!gameStarted && song && <Leaderboard song={song} wallet={user}/>}


            {/* Main game UI */}
            {gameStarted && !gameOver && (
                <div>
                    <div className="controls">
                        <div>Score: {score}</div>
                        <div>Combo: {combo}</div>
                        <div>Highest Score: {highestScore}</div>
                    </div>

                    <div
                        ref={noteContainerRef}
                        id="note-container"
                        style={{
                            position: 'relative',
                            height: 'calc(100vh - 85px)',
                            width: '500px',
                            overflow: 'hidden',
                            margin: 'auto',
                            display: 'flex',
                        }}
                    >
                        {keys.map((key, index) => (
                            <div
                                key={key}
                                id={`column-${key}`}
                                style={{
                                    position: 'relative',
                                    width: '25%',
                                    height: '100%',
                                    pointerEvents: 'none',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'flex-start',
                                }}
                            >
                                {/* Hit-zone indicator */}
                                <div
                                    className={`hit-zone ${activeKeys[key] ? 'pulse-effect' : ''}`}
                                    data-key={key.toUpperCase()}
                                    style={{
                                        position: 'absolute',
                                        width: '60px',
                                        height: '60px',
                                        border: '1px solid blue',
                                        borderRadius: '50%',
                                        bottom: '50px',
                                        pointerEvents: 'none',
                                    }}
                                ></div>
                            </div>
                        ))}

                        {/* Combo/boost progress bar */}
                        <div
                            style={{
                                position: 'absolute',
                                width: '99%',
                                height: '30px',
                                marginTop: '10px',
                                backgroundColor: '#490d34',
                                border: '2px solid #9b116d',
                                borderRadius: '5px',
                                overflow: 'hidden',
                            }}
                        >
                            <div
                                style={{
                                    width: `${Math.min( comboProgress )}%`,                                    
                                    height: "100%",
                                    backgroundColor: boostActive ? "#ff01a5" : "#9b116d",
                                    transition: "width .2s ease",
                                  }}                                  
                            ></div>
                        </div>

                        {/* Boost indicators */}
                        <div
                            style={{
                                textAlign: "center",
                                marginTop: "17px",
                                position: "absolute",
                                width: "100%",
                            }}
                        >
                            {boostAvailable && !boostActive && <span>Boost Available (Press Space)</span>}
                            {boostActive && <span>Boost Active!</span>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Play;
