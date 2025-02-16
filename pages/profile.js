import React, { useState } from 'react';
import TransferGala from '../components/TransferGala';
import DonateGala from '../components/DonateGala';
import RewardLog from '../components/RewardLog';
import Inventory from '../components/Inventory';

const UserProfile = ({ walletAddress, ethWalletAddress, metamaskClient }) => {
  const [activeTab, setActiveTab] = useState('Activity');

  return (
    <>
      <div className="user-profile">
        {walletAddress === "eth|d960c6a3467009fc3d7E8a09e1Ebda89dc1B36B5" && (
          <TransferGala walletAddress={walletAddress} metamaskClient={metamaskClient} />
        )}
        <DonateGala walletAddress={walletAddress} metamaskClient={metamaskClient} />
        
        <div className="tabs">
          <button onClick={() => setActiveTab('Activity')} className={activeTab === 'Activity' ? 'active' : ''}>
            Activity
          </button>
          <button onClick={() => setActiveTab('Inventory')} className={activeTab === 'Inventory' ? 'active' : ''}>
            Inventory
          </button>
        </div>
        
        <div className="tab-content">
          {activeTab === 'Activity' && <RewardLog walletAddress={walletAddress} />}
          {activeTab === 'Inventory' && <Inventory walletAddress={ethWalletAddress} />}
        </div>
      </div>
      <style jsx>{`
        .tab-content:after {
          content: "";
          display: block;
          width: 100%;
          height: 100vh;
          background-color: #2d0921;
          position: absolute;
          top: 0px;
          left: 0;
          z-index: -1;
        }
        .tab-content {
            background: #2d0921;
        }
        .tabs button.active {
            background: #2d0921;
            color: #d17eb4;
            border-bottom: 1px solid #2d0921;
        }
        .tabs button {
            cursor: pointer;
            color: #771756;
            background: none;
            border-top: 1px solid;
            border-left: 1px solid;
            border-right: 1px solid;
            padding: 5px 15px;
            font-size: 18px;
            margin-bottom: -1px;
            border-bottom: none;
        }
        .tabs {
            border-bottom: 1px solid #771756;
            text-align: center;
            margin-top: 20px;
        }
      `}</style>
    </>
  );
};

export default UserProfile;
