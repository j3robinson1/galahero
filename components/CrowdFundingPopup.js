import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Confetti from 'react-confetti';

const CrowdFundingPopup = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);
  const [hydrated, setHydrated] = useState(false);
  const router = useRouter();
  const [availableBalance, setAvailableBalance] = useState(0);
  const [lockedBalance, setLockedBalance] = useState(0);
  const [goal, setGoal] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const fetchGoal = async () => {
    try {
      const response = await fetch('/api/fundingGoal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to fetch funding goal');
      const data = await response.json();
      setGoal(data.curPrice || 0);
    } catch (err) {
      console.error('Error fetching funding goal:', err);
    }
  };

  const fetchBalance = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BURN_GATEWAY_API}/FetchBalances`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner: 'eth|d960c6a3467009fc3d7E8a09e1Ebda89dc1B36B5',
          collection: "GALA",
          category: "Unit",
          type: "none",
          additionalKey: "none",
          instance: "0"
        })
      });
      const data = await response.json();
      if (data.Data.length > 0) {
        const total = parseFloat(data.Data[0].quantity);
        const locked = data.Data[0].lockedHolds.reduce((acc, hold) => acc + parseFloat(hold.quantity), 0);
        setLockedBalance(locked);
        setAvailableBalance(150163 + (total - locked));
      }
    } catch (err) {
      console.error('Error fetching balance:', err);
    }
  };

  // update balances and goal on mount
  useEffect(() => {
    fetchBalance();
    fetchGoal();
  }, []);

  // handle countdown timer
  function calculateTimeLeft() {
    const targetDate = new Date('2025-05-01T00:00:00Z');
    const now = new Date();
    const diff = targetDate - now;
    if (diff > 0) {
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      };
    }
    return null;
  }

  // hydrate and start timer
  useEffect(() => {
    setHydrated(true);
    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  // trigger confetti once when goal reached
  useEffect(() => {
    if (!showConfetti && goal > 0 && availableBalance >= goal) {
      setShowConfetti(true);
    }
  }, [availableBalance, goal, showConfetti]);

  if (!hydrated || router.pathname === '/profile') return null;

  return (
    isOpen && (
      <div className="popup-overlay">
        {showConfetti && <Confetti recycle={true} numberOfPieces={100} />}
        <div className="popup-content">
          <button className="close-button" onClick={() => setIsOpen(false)}>
            &times;
          </button>
          <h4 className="popup-title">
            {availableBalance >= goal ? '🎉 Goal Achieved! 🎉' : 'Current amount funded:'}
          </h4>
          <p className="popup-amount">
            {availableBalance ? Math.ceil(availableBalance).toLocaleString() : '0'} GALA
          </p>
          <Link
            href="/profile"
            onClick={() => setIsOpen(false)}
            style={{
              color: 'white',
              textDecoration: 'none',
              cursor: 'pointer',
              padding: '5px 10px',
              display: 'inline-block',
              background: '#771756',
              border: '2px solid #a11d74',
              marginBottom: '10px',
              borderRadius: '5px'
            }}
          >
            Donate Now
          </Link>
          <p className="popup-description">Objective: Leaderboard Funding</p>
          <p className="popup-description">Goal: 1 Founders Node</p>
          <p className="popup-goal">
            Current FN Price: {goal.toLocaleString()} GALA
          </p>
          <p className="popup-refund">
            We will be back with a tournament last week of May. Thank you for your support!
          </p>
          {timeLeft ? (
            <p className="popup-timer">
              {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
            </p>
          ) : (
            <p className="popup-timer">Time expired</p>
          )}
        </div>
      </div>
    )
  );
};

export default CrowdFundingPopup;
