import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StatMap from './StatMap';
import LevelProgressBar from './LevelProgressBar';
import Link from 'next/link';

const Inventory = ({ walletAddress }) => {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("musicians"); // Default to AI Musicians

  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        const response = await axios.get(`/api/getNfts?wallet=${walletAddress}`);
        setNfts(response.data.nfts);
      } catch (error) {
        console.error("Error fetching NFTs:", error);
      } finally {
        setLoading(false);
      }
    };

    if (walletAddress) {
      fetchNFTs();
    }
  }, [walletAddress]);

  const aiMusicians = nfts.filter(nft => nft.metadata.animation_url);
  const wearables = nfts.filter(nft => !nft.metadata.animation_url);

  return (
    <div className="inventory">
      {/* Tab Buttons */}
      <div className="tabs">
        <button
          className={activeTab === "musicians" ? "active" : ""}
          onClick={() => setActiveTab("musicians")}
        >
          🎶 AI Musicians
        </button>
        <button
          className={activeTab === "wearables" ? "active" : ""}
          onClick={() => setActiveTab("wearables")}
        >
          🏷 Wearables
        </button>
      </div>

      {/* Loading & NFT Content */}
      {!walletAddress ? (
        <p style={{ textAlign: 'center', fontSize: '16px', color: '#fff' }}>
          Connect Wallet to manage assets
        </p>
      ) : loading ? (
        <p style={{ textAlign: 'center', fontSize: '16px', color: '#fff' }}>Loading NFTs...</p>
      ) : (
        <>
          {activeTab === "musicians" && aiMusicians.length === 0 && (
            <p style={{ textAlign: 'center' }}>No AI Musicians found.</p>
          )}
          {activeTab === "wearables" && wearables.length === 0 && (
            <p style={{ textAlign: 'center' }}>No Wearables found.</p>
          )}

          {/* AI Musicians */}
          {activeTab === "musicians" &&
            aiMusicians.map((nft, index) => (
              <div key={index} className="nft-item">
                <div className="nft-content">
                  {/* Video */}
                  <div className="nft-video">
                    <video
                      src={nft.metadata.animation_url.replace(
                        'ipfs://',
                        'https://ipfs.io/ipfs/'
                      )}
                      width="200"
                      autoPlay
                      muted
                      loop
                    />
                  </div>

                  {/* Details */}
                  <div className="nft-details stat-detail">
                    <h3>{nft.metadata.name}</h3>
                    <div className="stats">
                      <LevelProgressBar totalPoints={nft.totalPointsEarned} />
                      <p className="stat"><strong>Games Played:</strong> {nft.totalGamesPlayed}</p>
                      <p className="stat"><strong>Points Earned:</strong> {nft.totalPointsEarned.toLocaleString()}</p>
                    </div>
                    <Link disabled href="#" style={{ display: 'block', textAlign: 'center', padding: '5px 10px', background: '#2d0821', borderRadius: '5px', border: '1px solid #d17eb5', textDecoration: 'none', color: '#d17eb5', cursor: 'not-allowed' }}>Manage</Link>
                  </div>

                  <div className="nft-details">
                    <StatMap attributes={nft.metadata.attributes} totalPoints={nft.totalPointsEarned} />
                  </div>

                  {/* Attributes */}
                  <div className="nft-attributes">
                    <div className="attributes-box">
                      <ul>
                        {nft.metadata.attributes.map((attr, idx) => (
                          <li key={idx}><strong>{attr.trait_type}:</strong> {attr.value}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))
          }

          {/* Wearables - Flex Row Display */}
          {activeTab === "wearables" && (
            <div className="wearables-container">
              {wearables.map((nft, index) => {
                // Assign custom name based on tokenId
                const customName =
                  nft.id.tokenId === "271205046435987955380309562123119264530432"
                    ? "Medal of Honor"
                    : "Close Encounters Club Card - Diamond Edition";

                return (
                  <div key={index} className="wearable-item">
                    <img src={nft.metadata.image_url} alt={customName} width="200" height="200" />
                    <p>{customName}</p>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Styles */}
      <style jsx>{`
        .inventory {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding: 20px;
        }
        .tabs {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-bottom: 20px;
        }
        .tabs button {
          padding: 8px 12px;
          border: 1px solid #d17eb5;
          background: #2d0821;
          color: #d17eb5;
          cursor: pointer;
          border-radius: 5px;
          font-size: 14px;
          transition: all 0.2s;
        }
        .tabs button:hover, .tabs button.active {
          background: #d17eb5;
          color: #2d0821;
        }
        .nft-item {
          border: 1px solid #771756;
          padding: 5px;
          border-radius: 10px;
          background: #420d30;
          color: #fff;
          max-width: 1050px;
          margin: auto;
        }
        .nft-content {
          display: flex;
          align-items: center;
          gap: 20px;
          justify-content: space-between;
        }
        .nft-video video {
          margin-left: 4px;
          border-radius: 7px;
        }
        .nft-details {
          flex: 1;
        }
        .nft-details.stat-detail {
          width: 170px;
        }
        .nft-details h3 {
          margin-top: 0px;
          margin-bottom: 5px;
          font-size: 18px;
        }
        .nft-attributes {
          width: 210px;
        }
        .attributes-box {
          border: 1px solid #771756;
          padding: 5px;
          border-radius: 5px;
          background: #2d0821;
        }
        .attributes-box ul {
          list-style: none;
          padding: 0;
          margin: 0;
          max-height: 200px;
          overflow-y: scroll;
        }
        .attributes-box ul li {
          padding: 5px 8px;
          font-size: 10px;
          border: 1px solid #771756;
          border-radius: 5px;
          margin: 5px;
          background: #420d30;
        }
        .stat {
          margin: 10px 0px;
          font-size: 14px;
          background: #2d0821;
          border: 1px solid #771756;
          border-radius: 5px;
          padding: 3px 5px;
          color: #dddddd;
        }
        .stat strong {
          font-size: 10px;
          display: block;
        }
        /* Wearables Layout */
        .wearables-container {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
        }
        .wearable-item {
          border: 1px solid #771756;
          padding: 5px;
          border-radius: 10px;
          background: #420d30;
          color: #fff;
          text-align: center;
          width: 200px;
        }
        .wearable-item p {
          margin: 5px;
        }
        .wearable-item img {
          border-radius: 7px;
        }
        @media (max-width: 768px) {
          .nft-content {
            flex-direction: column;
            align-items: center;
          }
          .nft-video video {
            width: 100%;
            max-width: 250px;
          }
          .nft-details {
            text-align: center;
            width: 100%;
          }
          .nft-details.stat-detail {
            width: 100%;
          }
          .nft-attributes {
            width: 100%;
          }
          .wearables-container {
            flex-direction: column;
            align-items: center;
          }
          .wearable-item {
            width: 100%;
            max-width: 250px;
          }
        }
      `}</style>
    </div>
  );
};

export default Inventory;
