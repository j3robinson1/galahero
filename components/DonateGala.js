import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const DonateGala = ({ walletAddress, metamaskClient }) => {
  const [recipientAddress] = useState('eth|d960c6a3467009fc3d7E8a09e1Ebda89dc1B36B5'); // Set default recipient address
  const [transferAmount, setTransferAmount] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
          owner: recipientAddress,
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
        setAvailableBalance(156163 + (total - locked));
      }
    } catch (err) {
      console.error('Error fetching balance:', err);
    }
  };

  useEffect(() => {
    fetchBalance();
    fetchGoal();
  }, []);

  const isValidTransfer = () => {
    return transferAmount !== null && transferAmount > 0;
  };

  const transferTokens = async () => {
    if (!isValidTransfer() || !walletAddress) return;

    setError('');
    setSuccess('');
    setIsProcessing(true);

    try {
      const transferTokensDto = {
        from: walletAddress,
        to: recipientAddress,
        quantity: transferAmount.toString(),
        tokenInstance: {
          collection: "GALA",
          category: "Unit",
          type: "none",
          additionalKey: "none",
          instance: "0"
        },
        uniqueKey: `january-2025-event-${process.env.NEXT_PUBLIC_PROJECT_ID}-donate-${Date.now()}`
      };

      const signedTransferDto = await metamaskClient.sign("TransferTokens", transferTokensDto);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BURN_GATEWAY_API}/TransferToken`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signedTransferDto)
      });

      if (!response.ok) {
        throw new Error('Failed to transfer tokens');
      }

      setSuccess(`Successfully donated ${transferAmount} GALA to Crowd Fund Initiative`);
      setTransferAmount(null);
    } catch (err) {
      console.error(`Error transferring tokens: ${err}`, err);
      setError(err instanceof Error ? err.message : 'Failed to transfer tokens');
    } finally {
      setIsProcessing(false);
    }
  };

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

  return (
    <div className="transfer-gala-container">
      <h2>Crowd Funding Initiative</h2>
      <div className="fundraising-info">
        <h4 className="popup-title">Current amount funded:</h4>
        <p className="popup-amount">{availableBalance ? Math.ceil(availableBalance).toLocaleString() : '0'} GALA</p>
        <p className="popup-description">Objective: Leaderboard Funding</p>
        <p className="popup-description">Goal: 1 Founders Node</p>
        <p className="popup-goal">Current Founders Node Price: {goal.toLocaleString()} GALA <a target="_blank" href="https://marketplace.nftharbor.io/item/Nodes/Node/FoundersNode/Ancient">
          <svg style={{verticalAlign: 'middle'}} width="20px" height="20px" viewBox="0 0 24 24" fill="none">
            <path d="M10.0002 5H8.2002C7.08009 5 6.51962 5 6.0918 5.21799C5.71547 5.40973 5.40973 5.71547 5.21799 6.0918C5 6.51962 5 7.08009 5 8.2002V15.8002C5 16.9203 5 17.4801 5.21799 17.9079C5.40973 18.2842 5.71547 18.5905 6.0918 18.7822C6.5192 19 7.07899 19 8.19691 19H15.8031C16.921 19 17.48 19 17.9074 18.7822C18.2837 18.5905 18.5905 18.2839 18.7822 17.9076C19 17.4802 19 16.921 19 15.8031V14M20 9V4M20 4H15M20 4L13 11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a></p>
        <p className="popup-refund">All donations will be refunded if goal is not met within the funding period</p>
        {timeLeft ? (
          <p className="popup-timer">
            {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
          </p>
        ) : (
          <p className="popup-timer">Time expired</p>
        )}
      </div>
      {walletAddress ? (
        <div className="transfer-form">
          <div className="input-group">
            <input
              type="number"
              value={transferAmount || ''}
              onChange={e => setTransferAmount(Number(e.target.value))}
              min="0"
              step="1"
              placeholder="Amount to donate"
              disabled={isProcessing}
            />
          </div>
          <button 
            onClick={transferTokens} 
            disabled={!isValidTransfer() || isProcessing}
            className="donate-btn"
          >
            {isProcessing ? 'Processing...' : 'Donate GALA'}
          </button>
          <small className="fee-notice">Gas fee: 1 GALA</small>
          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}
        </div>
      ) : (
        <p>Connect Wallet to Donate</p>
      )}
    </div>
  );
};

export default DonateGala;
