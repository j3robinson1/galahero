import React, { useState, useEffect } from 'react';

const UserProfile = ({ walletAddress, metamaskClient }) => {
  const [totalGalaAllowance, setTotalGalaAllowance] = useState(0);
  const [totalSmokeAllowance, setTotalSmokeAllowance] = useState(0);
  const [availableGalaBalance, setAvailableGalaBalance] = useState(0);
  const [lockedGalaBalance, setLockedGalaBalance] = useState(0);
  const [availableSmokeBalance, setAvailableSmokeBalance] = useState(0);
  const [lockedSmokeBalance, setLockedSmokeBalance] = useState(0);
  const [galaMintQuantity, setGalaMintQuantity] = useState('');
  const [smokeMintQuantity, setSmokeMintQuantity] = useState('');
  const [copySuccess, setCopySuccess] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAllAllowances();
    fetchBalance("GALA", setAvailableGalaBalance, setLockedGalaBalance);
    fetchBalance("SMOKE", setAvailableSmokeBalance, setLockedSmokeBalance);
  }, [walletAddress]);

  // Function to fetch all allowances for the user
  const fetchAllAllowances = async () => {
    try {
      const response = await fetch(`https://api-galaswap.gala.com/galachain/api/asset/token-contract/FetchAllowances`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grantedTo: walletAddress })
      });
      const data = await response.json();
      if (data && data.Data && data.Data.length > 0) {
        let galaTotal = 0;
        let smokeTotal = 0;

        data.Data.forEach(item => {
          const available = parseFloat(item.quantity) - parseFloat(item.quantitySpent);
          if (item.collection === "GALA") {
            galaTotal += available;
          } else if (item.type === "SMOKE") {
            smokeTotal += available;
          }
        });

        setTotalGalaAllowance(galaTotal);
        setTotalSmokeAllowance(smokeTotal);
      } else {
        // Handle cases where no data is available
        console.log(`No data available for collection: ${collection}`);
        setTotalGalaAllowance(0);
        setTotalSmokeAllowance(0);
      }
    } catch (err) {
      console.error("Error fetching allowances:", err);
    }
  };

  // Function to fetch balances based on the token collection/type
  const fetchBalance = async (collection, setAvailableBalance, setLockedBalance) => {
    let requestBody = { owner: walletAddress };
    if (collection === "SMOKE") {
      requestBody = { ...requestBody, collection: "Token", category: "Unit", type: "SMOKE" };
    } else {
      requestBody.collection = collection;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_BURN_GATEWAY_API}/FetchBalances`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    if (data && data.Data && data.Data.length > 0) {
      const total = parseFloat(data.Data[0].quantity);
      const locked = data.Data[0].lockedHolds.reduce((acc, hold) => acc + parseFloat(hold.quantity), 0);
      setLockedBalance(locked);
      setAvailableBalance(total - locked);
    } else {
      // Handle cases where no data is available
      console.log(`No data available for collection: ${collection}`);
      setLockedBalance(0);
      setAvailableBalance(0);
    }
  };

  const mintSmoke = async () => {
    if (!totalSmokeAllowance > 0 || !walletAddress || smokeMintQuantity === '') return;
    setIsProcessing(true);
    setError('');
    setSuccess('');

    const mintTokenDto = {
      owner: walletAddress,
      quantity: smokeMintQuantity,
      tokenClass: { collection: "Token", category: "Unit", type: "SMOKE", additionalKey: "eth:DBC0A1d281aee499Cb1c9f5db2127cdA07C92f10", instance: "0" }
    };

    try {
      const signedMintDto = await metamaskClient.sign("MintToken", mintTokenDto);

      const response = await fetch(`${process.env.NEXT_PUBLIC_BURN_GATEWAY_API}/MintToken`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Wallet-Address': walletAddress },
        body: JSON.stringify(signedMintDto)
      });

      if (response.status === 201) {
        setSuccess(`Successfully minted ${smokeMintQuantity} SMOKE`);
      } else {
        throw new Error(`Failed to mint SMOKE: ${await response.text()}`);
      }
    } catch (err) {
      setError('Failed to mint SMOKE: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const mintGala = async () => {
    if (!totalGalaAllowance > 0 || !walletAddress || galaMintQuantity === '') {
      return;
    }

    setIsProcessing(true);
    setError('');
    setSuccess('');

    try {
      const mintTokenDto = {
        owner: walletAddress,
        quantity: galaMintQuantity,
        tokenClass: {
          collection: "GALA",
          category: "Unit",
          type: "none",
          additionalKey: "none",
          instance: "0"
        }
      };

      const signedMintDto = await metamaskClient.sign("MintToken", mintTokenDto);

      const response = await fetch(`${process.env.NEXT_PUBLIC_BURN_GATEWAY_API}/MintToken`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Wallet-Address': walletAddress
        },
        body: JSON.stringify(signedMintDto)
      });

      if (response.status === 201) {
        setSuccess(`Successfully minted ${galaMintQuantity} GALA`);
      } else {
        throw new Error(`Failed to mint GALA: ${await response.text()}`);
      }
    } catch (err) {
      setError('Failed to mint GALA: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress)
        .then(() => setCopySuccess('Copied!'))
        .catch(() => setCopySuccess('Failed to copy'));
      setTimeout(() => setCopySuccess(''), 2000);
    }
  };

  const formatBalance = (balance) => balance.toLocaleString(undefined, { maximumFractionDigits: 2 });

  return (
    <>
      <div className="token-container">
        <div className="token-row">
          <div className="token-image">
            <img src="https://cdn3d.iconscout.com/3d/premium/thumb/gala-coin-3d-icon-download-in-png-blend-fbx-gltf-file-formats--cryptocurrency-crypto-currency-digital-coins-pack-science-technology-icons-5752949.png" alt="GALA Token" />
          </div>
          <div className="token-info">
            <p>GALA Allowance: {formatBalance(totalGalaAllowance)}</p>
            <p>GALA Available: {formatBalance(availableGalaBalance)}</p>
            {totalGalaAllowance > 0 && 
              <>
              <input
                type="number"
                placeholder="Enter GALA quantity"
                value={galaMintQuantity}
                onChange={e => setGalaMintQuantity(e.target.value)}
                disabled={isProcessing || totalGalaAllowance <= 0}
              />
              <button onClick={mintGala} disabled={isProcessing}>
                {isProcessing ? 'Processing...' : 'Mint GALA'}
              </button>
              </>
            }
          </div>
        </div>
        <div className="token-row smoke">
          <div className="token-image">
            <img src="https://tomato-blank-grasshopper-26.mypinata.cloud/ipfs/bafkreiazknhsiwhyhk7mgphodclapnmdpnt4gchbzpakmrthnvlzrjhbca" alt="SMOKE Token" />
          </div>
          <div className="token-info">
            <p>SMOKE Allowance: {formatBalance(totalSmokeAllowance)}</p>
            <p>SMOKE Available: {formatBalance(availableSmokeBalance)}</p>
            {totalSmokeAllowance > 0 && 
              <>
              <input
                type="number"
                placeholder="Enter SMOKE quantity"
                value={smokeMintQuantity}
                onChange={e => setSmokeMintQuantity(e.target.value)}
                disabled={isProcessing || totalSmokeAllowance <= 0}
              />
              <button onClick={mintSmoke} disabled={isProcessing}>
                {isProcessing ? 'Processing...' : 'Mint SMOKE'}
              </button>
              </>
            }
          </div>
        </div>
      </div>
      <style jsx>{`
        .balance-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
        }
        .token-row {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
          width: 100%;
          justify-content: space-between;
        }
        .token-image img {
          width: 50px; /* Adjust the size as needed */
          height: auto;
          margin-right: 20px;
        }
        .token-info {
          flex-grow: 1;
          text-align: left;
        }
        .token-info p {
          margin: 0;
        }
        button {
          padding: 5px 10px;
          font-size: 14px;
          border-radius: 5px;
          border: none;
          cursor: pointer;
          background-color: #4CAF50;
          color: white;
        }
        button:disabled {
          background-color: #ccc;
        }
      `}</style>
    </>
  );

};

export default UserProfile;
