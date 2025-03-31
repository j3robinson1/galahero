import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const CrowdFundingPopup = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);
  const [hydrated, setHydrated] = useState(false);
  const router = useRouter();
  const [availableBalance, setAvailableBalance] = useState(0);
  const [lockedBalance, setLockedBalance] = useState(0);
  const [goal, setGoal] = useState(0);

  const fetchGoal = async () => {
    try {
      const response = await fetch('/api/fundingGoal', {
        method: 'POST', // Make sure it matches the HTTP method expected by your endpoint
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch funding goal');
      }

      const data = await response.json();
      if (data && data.curPrice) {
        setGoal(data.curPrice); // Assuming the API returns { curPrice: value }
      } else {
        throw new Error('No price available');
      }
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
        setAvailableBalance(total - locked);
      }
    } catch (err) {
      console.error('Error fetching balance:', err);
    }
  };

  useEffect(() => {
    fetchBalance();
    fetchGoal();
  }, []);

  function calculateTimeLeft() {
    const targetDate = new Date('2025-05-01T00:00:00Z');
    const now = new Date();
    const difference = targetDate - now;

    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return null;
  }

  useEffect(() => {
    setHydrated(true);
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!hydrated || router.pathname === '/profile') {
    return null;
  }

  return (
    isOpen && (
      <div className="popup-overlay">
        <div className="popup-content">
          <button className="close-button" onClick={() => setIsOpen(false)}>
            &times;
          </button>
          <h4 className="popup-title">Current amount funded:</h4>
          <p className="popup-amount">{availableBalance ? Math.ceil(availableBalance).toLocaleString() : '0'} GALA</p>
          <Link onClick={() => setIsOpen(false)} href="/profile" style={{color: 'white', textDecoration: 'none', cursor: 'pointer', padding: '5px 10px', display: 'inline-block', background: '#771756', border: '2px solid #a11d74', marginBottom: '10px', borderRadius: '5px' }}>Donate Now</Link>
          <p className="popup-description">Objective: Leaderboard Funding</p>
          <p className="popup-description">Goal: 1 Founders Node</p>
          <p className="popup-goal">Current FN Price: {goal.toLocaleString()} GALA</p>
          <p className="popup-refund">All donations will be refunded if goal is not met</p>
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
