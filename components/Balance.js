import React, { useState, useEffect } from 'react';

const Balance = ({ walletAddress }) => {
  const [availableBalance, setAvailableBalance] = useState(0);
  const [lockedBalance, setLockedBalance] = useState(0);
  const [copySuccess, setCopySuccess] = useState('');

  const fetchBalance = async () => {
    if (!walletAddress) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BURN_GATEWAY_API}/FetchBalances`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner: walletAddress,
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

  const formatBalance = (balance) => {
    return balance.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  const copyToClipboard = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress)
        .then(() => {
          setCopySuccess('Copied!');
          setTimeout(() => setCopySuccess(''), 2000);
        })
        .catch(() => {
          setCopySuccess('Failed to copy');
        });
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [walletAddress]);

  return (
    <div className="balance-container">
      <div className="balance-info">
        <p>Available: {formatBalance(availableBalance)} GALA(GC)</p>
        <p>Locked: {formatBalance(lockedBalance)} GALA(GC)</p>
        <button 
            onClick={copyToClipboard} 
            style={{
              padding: '5px 10px',
              fontSize: '14px',
              borderRadius: '5px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Copy Wallet Address
  {copySuccess && (
    <svg
      style={{ position: 'absolute', transform: 'translate(3px, -2px)'}}
      width="20"
      height="20"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path d="M4 12.6111L8.92308 17.5L20 6.5" stroke="#78295a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
  )}
        </button>
      </div>
    </div>
  );
};

export default Balance;
