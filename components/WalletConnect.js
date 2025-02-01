import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserConnectClient } from '@gala-chain/connect';
import Balance from './Balance';
import Link from 'next/link';
import { useRouter } from 'next/router';

const WalletConnect = ({ onConnect }) => {
  const [walletAddress, setWalletAddress] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [metamaskClient, setMetamaskClient] = useState(null);
  const [showBalance, setShowBalance] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false); // Track registration state

  const router = useRouter();

  useEffect(() => {
    try {
      const client = new BrowserConnectClient();
      setMetamaskClient(client);
    } catch (err) {
      console.warn('Failed to initialize MetaMask client:', err);
    }
  }, []);

  const connectWallet = async () => {
    try {
      await metamaskClient.connect();
      let address = await metamaskClient.ethereumAddress;
      if (address.startsWith('0x')) {
        address = `eth|${address.slice(2)}`;
      }
      setWalletAddress(address);
      onConnect(address, true, metamaskClient);

      // Automatically check registration and prompt sign if needed
      const isRegistered = await checkRegistration(address);
      if (!isRegistered) {
        await registerUser(address); // Automatically trigger registration
      }
    } catch (err) {
      console.error('Error connecting wallet:', err);
      onConnect('', false, null);
    }
  };

  const checkRegistration = async (address) => {
    if (!address) return false;
    try {
      const response = await getAlias(address);
      if (response.data.Data && response.data.Data.alias) {
        setIsRegistered(true);
        setWalletAddress(response.data.Data.alias); // Use the alias if available
        onConnect(response.data.Data.alias, true, metamaskClient);
        return true;
      } else {
        setIsRegistered(false);
        return false;
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        console.log('User not registered, proceeding to registration...');
        return false;
      } else {
        console.error('Check registration error:', err);
        setIsRegistered(false);
        return false;
      }
    }
  };

  const getAlias = async (address) => {
    return await axios.post(`${process.env.NEXT_PUBLIC_BURN_GATEWAY_PUBLIC_KEY_API}/GetObjectByKey`, {
      objectId: `\u0000GCUP\u0000${address.replace('0x', '').replace('eth|', '')}\u0000`,
    });
  };

  const registerUser = async (address) => {
    if (!address) return;
    setIsRegistering(true); // Start registering
    try {
      const publicKey = await metamaskClient.getPublicKey(); // Request MetaMask to provide the public key
      const response = await axios.post(`${process.env.NEXT_PUBLIC_GALASWAP_API}/CreateHeadlessWallet`, {
        publicKey: publicKey.publicKey,
      });
      setIsRegistered(true);
      setIsRegistering(false); // Stop registering
    } catch (err) {
      console.error('Error registering user:', err);
      setIsRegistering(false); // Stop registering if error
    }
  };

  const toggleBalance = () => {
    setShowBalance((prev) => !prev);
  };

  const isProfilePage = router.pathname === '/profile';
  const isLeaderboardsPage = router.pathname === '/leaderboards';
  const linkText = isLeaderboardsPage ? 'game' : 'leader';
  const linkHref = isLeaderboardsPage ? '/' : '/leaderboards';

  return (
    <div className="wallet-connect">
          {isProfilePage && (
            <Link 
              href="/"
              style={{
                textDecoration: 'none',
                cursor: 'pointer',
                fontWeight: 'bold',
                position: 'absolute',
                top: '0px',
                left: '-50px',
                color: 'white',
                padding: '0px 2px',
                background: '#ff01a5',
                borderRadius: '5px',
                border: '1px solid #565656',
              }}>
              <svg width="25px" height="25px" viewBox="0 0 24 24" fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d="M12.75 6V3.75H11.25V6L9 6C6.10051 6 3.75 8.3505 3.75 11.25V17.909C3.75 19.2019 4.7981 20.25 6.09099 20.25C6.71186 20.25 7.3073 20.0034 7.74632 19.5643L10.8107 16.5H13.1893L16.2537 19.5643C16.6927 20.0034 17.2881 20.25 17.909 20.25C19.2019 20.25 20.25 19.2019 20.25 17.909V11.25C20.25 8.3505 17.8995 6 15 6L12.75 6ZM18.75 11.25C18.75 9.17893 17.0711 7.5 15 7.5L9 7.5C6.92893 7.5 5.25 9.17893 5.25 11.25V17.909C5.25 18.3735 5.62652 18.75 6.09099 18.75C6.31403 18.75 6.52794 18.6614 6.68566 18.5037L10.1893 15H13.8107L17.3143 18.5037C17.4721 18.6614 17.686 18.75 17.909 18.75C18.3735 18.75 18.75 18.3735 18.75 17.909V11.25ZM6.75 12.75V11.25H8.25V9.75H9.75V11.25H11.25V12.75H9.75V14.25H8.25V12.75H6.75ZM15 10.875C15 11.4963 14.4963 12 13.875 12C13.2537 12 12.75 11.4963 12.75 10.875C12.75 10.2537 13.2537 9.75 13.875 9.75C14.4963 9.75 15 10.2537 15 10.875ZM16.125 14.25C16.7463 14.25 17.25 13.7463 17.25 13.125C17.25 12.5037 16.7463 12 16.125 12C15.5037 12 15 12.5037 15 13.125C15 13.7463 15.5037 14.25 16.125 14.25Z" fill="white"/>
              </svg>
            </Link>
          )}
          <Link
            href={linkHref}
            style={{
              textDecoration: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
              position: 'absolute',
              top: '0px',
              right: '-50px',
              color: 'white',
              padding: '0px 2px',
              background: '#ff01a5',
              borderRadius: '5px',
              border: '1px solid #565656',
            }}
          >
            {linkText === "leader" ? (
              <svg width="25px" height="25px" viewBox="0 0 24 24" fill="none">
                <path d="M15 21H9V12.6C9 12.2686 9.26863 12 9.6 12H14.4C14.7314 12 15 12.2686 15 12.6V21Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20.4 21H15V18.1C15 17.7686 15.2686 17.5 15.6 17.5H20.4C20.7314 17.5 21 17.7686 21 18.1V20.4C21 20.7314 20.7314 21 20.4 21Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 21V16.1C9 15.7686 8.73137 15.5 8.4 15.5H3.6C3.26863 15.5 3 15.7686 3 16.1V20.4C3 20.7314 3.26863 21 3.6 21H9Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10.8056 5.11325L11.7147 3.1856C11.8314 2.93813 12.1686 2.93813 12.2853 3.1856L13.1944 5.11325L15.2275 5.42427C15.4884 5.46418 15.5923 5.79977 15.4035 5.99229L13.9326 7.4917L14.2797 9.60999C14.3243 9.88202 14.0515 10.0895 13.8181 9.96099L12 8.96031L10.1819 9.96099C9.94851 10.0895 9.67568 9.88202 9.72026 9.60999L10.0674 7.4917L8.59651 5.99229C8.40766 5.79977 8.51163 5.46418 8.77248 5.42427L10.8056 5.11325Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : linkText === "game" ? (
              <svg width="25px" height="25px" viewBox="0 0 24 24" fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d="M12.75 6V3.75H11.25V6L9 6C6.10051 6 3.75 8.3505 3.75 11.25V17.909C3.75 19.2019 4.7981 20.25 6.09099 20.25C6.71186 20.25 7.3073 20.0034 7.74632 19.5643L10.8107 16.5H13.1893L16.2537 19.5643C16.6927 20.0034 17.2881 20.25 17.909 20.25C19.2019 20.25 20.25 19.2019 20.25 17.909V11.25C20.25 8.3505 17.8995 6 15 6L12.75 6ZM18.75 11.25C18.75 9.17893 17.0711 7.5 15 7.5L9 7.5C6.92893 7.5 5.25 9.17893 5.25 11.25V17.909C5.25 18.3735 5.62652 18.75 6.09099 18.75C6.31403 18.75 6.52794 18.6614 6.68566 18.5037L10.1893 15H13.8107L17.3143 18.5037C17.4721 18.6614 17.686 18.75 17.909 18.75C18.3735 18.75 18.75 18.3735 18.75 17.909V11.25ZM6.75 12.75V11.25H8.25V9.75H9.75V11.25H11.25V12.75H9.75V14.25H8.25V12.75H6.75ZM15 10.875C15 11.4963 14.4963 12 13.875 12C13.2537 12 12.75 11.4963 12.75 10.875C12.75 10.2537 13.2537 9.75 13.875 9.75C14.4963 9.75 15 10.2537 15 10.875ZM16.125 14.25C16.7463 14.25 17.25 13.7463 17.25 13.125C17.25 12.5037 16.7463 12 16.125 12C15.5037 12 15 12.5037 15 13.125C15 13.7463 15.5037 14.25 16.125 14.25Z" fill="white"/>
              </svg>
            ) : null}
          </Link>
          {!isProfilePage && (
            <Link 
              href="/profile"
              style={{
                textDecoration: 'none',
                cursor: 'pointer',
                fontWeight: 'bold',
                position: 'absolute',
                top: '0px',
                right: '-100px',
                color: 'white',
                padding: '0px 2px',
                background: '#ff01a5',
                borderRadius: '5px',
                border: '1px solid #565656',
              }}>
              <svg width="25px" height="25px" style={{ marginBottom: '-2px', marginTop: '2px' }} viewBox="0 0 24 24">
                <path fill="white" d="M20.456,15.646,19.35,13.8a4.245,4.245,0,0,1-.605-2.184V8.99a6.745,6.745,0,0,0-13.49,0v2.627a4.245,4.245,0,0,1-.6,2.184L3.544,15.646A2.05,2.05,0,0,0,5.3,18.75h3.98c-.008.084-.033.165-.033.25a2.75,2.75,0,0,0,5.5,0c0-.085-.025-.166-.033-.25H18.7a2.05,2.05,0,0,0,1.759-3.1ZM13.25,19a1.25,1.25,0,0,1-2.5,0,1.232,1.232,0,0,1,.033-.25h2.434A1.232,1.232,0,0,1,13.25,19Zm5.927-2.029a.542.542,0,0,1-.48.279H5.3a.549.549,0,0,1-.473-.832l1.107-1.846a5.752,5.752,0,0,0,.818-2.955V8.99a5.245,5.245,0,0,1,10.49,0v2.627a5.752,5.752,0,0,0,.818,2.955l1.107,1.846A.541.541,0,0,1,19.177,16.971Z"/>
              </svg>
            </Link>
          )}
      {!walletAddress ? (
        <>
          <button onClick={connectWallet} className="button">
            Connect Wallet
          </button>
          &nbsp;&nbsp;Get Started!
        </>
      ) : (
        <div>
          {/* Click on the address to toggle balance display */}
          <p className="wallet-address" onClick={toggleBalance} style={{ cursor: 'pointer' }}>
            Connected: {walletAddress.slice(0, 13)}...{walletAddress.slice(-4)}
          </p>

          {/* Conditionally show Balance if showBalance === true */}
          {showBalance && <Balance walletAddress={walletAddress} />}

          {!isRegistered && (
            <button onClick={registerUser} className="button">
              Register
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default WalletConnect;
