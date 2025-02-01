import React, { useEffect, useState } from "react";

const RewardLog = ({ walletAddress }) => {
  const [rewards, setRewards] = useState([]);
  const [totalEarned, setTotalEarned] = useState(0);
  const [totalDonated, setTotalDonated] = useState(0);
  const [totalBurns, setTotalBurns] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!walletAddress) return;

    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);

      const rewardSearchParam = `6f46d045c938d69456032bea89973429-reward and ${walletAddress.replace(/^eth\|/, "")}`;
      const donateSearchParam = `6f46d045c938d69456032bea89973429-donate and ${walletAddress.replace(/^eth\|/, "")}`;

      const fetchType = async (searchParam) => {
        let offset = 0;
        let allTransactions = [];
        let shouldContinue = true;

        while (shouldContinue) {
          const payload = {
            limit: 10,
            offset,
            search: searchParam,
          };

          const response = await fetch("/api/rewards", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch logs for search param: ${searchParam}`);
          }

          const data = await response.json();
          const blocks = data?.data?.blocks || [];

          const extractedTransactions = blocks
            .flatMap((block) =>
              block.parsedBlock?.transactions
                ?.filter(
                  (transaction) =>
                    transaction.actions?.[0]?.args &&
                    transaction.actions[0].args[0] === "GalaChainToken:TransferToken"
                )
                .map((transaction) => {
                  const data = transaction.actions[0].args[1]
                    ? JSON.parse(transaction.actions[0].args[1])
                    : null;

                  return data
                    ? {
                        channel: block.channel,
                        blockNumber: block.parsedBlock.blockNumber,
                        transactionNumber: transaction.id,
                        to: data.to,
                        quantity: parseFloat(data.quantity),
                        currency: data.tokenInstance?.collection || "GALA",
                        timestamp: block.parsedBlock.createdAt,
                        type: searchParam.includes('donate') ? 'donate' : 'reward'
                      }
                    : null;
                })
                .filter(Boolean)
            )
            .filter(Boolean);

          allTransactions = [...allTransactions, ...extractedTransactions];

          // Stop fetching if fewer than 10 items are returned
          if (extractedTransactions.length < 10) {
            shouldContinue = false;
          } else {
            offset += 10; // Increase offset for next batch
          }
        }
        return allTransactions;
      };

      const calculateTotal = (transactions, type) => {
        return transactions
          .filter(transaction => transaction.type === type)
          .reduce((sum, transaction) => sum + transaction.quantity, 0);
      };

      try {
        // Fetch both datasets concurrently
        const [donations, rewards] = await Promise.all([
          fetchType(donateSearchParam),
          fetchType(rewardSearchParam)
        ]);
        const combinedTransactions = [...donations, ...rewards];
        setRewards(combinedTransactions);

        // Set totals
        setTotalEarned(calculateTotal(rewards, 'reward'));
        setTotalDonated(calculateTotal(donations, 'donate'));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchBurns = async () => {
      try {
        const response = await fetch(`/api/getBurns?wallet=${walletAddress}`);

        if (!response.ok) {
          throw new Error("Failed to fetch burn logs");
        }

        const data = await response.json();
        setTotalBurns(data.totalBurns || 0);
      } catch (err) {
        console.error("Error fetching burns:", err);
      }
    };

    fetchTransactions();
    fetchBurns();
  }, [walletAddress]);

  return (
    <div className="reward-log-container">
      <div className="summary-header">
        <h4 className="summary-item">Burned: {totalBurns.toLocaleString()} GALA</h4>
        <h4 className="summary-item">Earned: {totalEarned.toLocaleString()} GALA</h4>
        <h4 className="summary-item">Donated: {totalDonated.toLocaleString()} GALA</h4>
      </div>

      <h4 className="activity-log">Activity Log</h4>
      {!walletAddress && <p>Connect Wallet to View Activity Logs</p>}
      {error && <p className="error">{error}</p>}
      {!loading && walletAddress && rewards.length === 0 && <p>No rewards found.</p>}

      <div className="reward-log-list">
        {rewards.map((reward, index) => (
          <a
            key={index}
            href={`https://gytrace.com/${reward.channel}/tx/${reward.transactionNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="reward-log-item"
          >
            <div className="reward-logo">
              <img
                src="https://cdn3d.iconscout.com/3d/premium/thumb/gala-coin-3d-icon-download-in-png-blend-fbx-gltf-file-formats--cryptocurrency-crypto-currency-digital-coins-pack-science-technology-icons-5752949.png"
                alt="Gala Logo"
              />
            </div>
            <div className="reward-info">
              <p className="reward-text">
                You {reward.type === 'donate' ? 'sent' : 'received'} <strong>{reward.quantity.toLocaleString()} {reward.currency}</strong>
              </p>
              <p className="reward-type">{reward.type === 'donate' ? `Donation to: Crowd Funding Initiative` : "Tournament Reward"}
              </p>
            </div>
            <div className="reward-status">
              <p className="fulfilled">FULFILLED ✅</p>
              <p className="reward-time">{new Date(reward.timestamp).toLocaleString()}</p>
            </div>
          </a>
        ))}
      </div>


      {loading && <p>Loading rewards...</p>}

      <style jsx>{`
        .reward-log-container {
          width: 95%;
          max-width: 800px;
          margin: 20px auto;
          color: #fff;
          text-align: center;
        }

        .summary-header {
          display: flex;
          justify-content: space-between;
          font-weight: bold;
        }

        .summary-item {
          background: #570e40;
          padding: 10px 15px;
          border-radius: 8px;
          margin-bottom: 0px;
        }

        .activity-log {
          text-align: left;
          padding: 10px 0px;
          margin: 15px 5px;
          border-bottom: 2px solid #333;
          font-weight: bold;
        }

        .reward-log-list {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .reward-log-item {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 95%;
          background: #570e3f;
          padding: 15px;
          border-radius: 10px;
          text-decoration: none;
          color: #fff;
          transition: background 0.2s;
        }

        .reward-log-item:hover {
          background: #460c33;
        }

        .reward-logo {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .reward-logo img {
          width: 60px;
          height: 60px;
          border-radius: 50%;
        }

        .reward-info {
          flex-grow: 1;
          text-align: left;
          padding-left: 10px;
        }

        .reward-text {
          font-size: 16px;
          margin-bottom: 5px;
        }

        .reward-type {
          font-size: 12px;
          color: silver;
        }

        .reward-status {
          text-align: right;
        }

        .fulfilled {
          font-size: 14px;
          font-weight: bold;
          color: #00c853;
        }

        .reward-time {
          font-size: 12px;
          color: silver;
        }

        @media only screen and (max-width: 600px) {
          .summary-header {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
};

export default RewardLog;
