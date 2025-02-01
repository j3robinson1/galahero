import React, { useState, useEffect } from 'react';
import TransferGala from '../components/TransferGala';
import DonateGala from '../components/DonateGala';
import RewardLog from "../components/RewardLog";

const UserProfile = ({ walletAddress, metamaskClient }) => {

  return (
    <div className="user-profile">
      {walletAddress === "eth|d960c6a3467009fc3d7E8a09e1Ebda89dc1B36B5" && (
        <TransferGala walletAddress={walletAddress} metamaskClient={metamaskClient} />
      )}
      <DonateGala walletAddress={walletAddress} metamaskClient={metamaskClient} />
      <RewardLog walletAddress={walletAddress} />
    </div>
  );
};

export default UserProfile;
