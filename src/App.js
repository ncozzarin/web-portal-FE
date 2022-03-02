import LoadingOverlay from 'react-loading-overlay';
import React, { useEffect, useState } from "react";
import "./App.css";
import {ethers} from "ethers";
import abi from "./utils/WavePortal.json";
import HashLoader from 'react-spinners/HashLoader'


const App = () => {
  const [currentAccount, setCurrentAccount] = useState('');
  const [waveCount, setWaveCount] = useState(0);
  const [isActive, setIsActive] = useState(false);



  /**
  * Create a variable here that holds the contract address after you deploy!
  */
  const contractAddress = "0x228B689da7CBb01e3623C3b2e91a836C2D11Fe53";

  /**
  * Create a variable here that references the abi content!
  */
  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
  * Implement your connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        /*
        * Execute the actual wave from your smart contract
        */
        const waveTxn = await wavePortalContract.wave();
        setIsActive(true);
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
        setWaveCount(count.toNumber());
        setIsActive(false);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const initializeWaveCount = async () => {
    const { ethereum } = window;

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      let count = await wavePortalContract.getTotalWaves();
      setWaveCount(count.toNumber());
    }
  }


  useEffect(() => {
    initializeWaveCount();

    checkIfWalletIsConnected();
  }, [])
  
  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        👋 Hey there!
        </div>

        <div className="bio">
        I am Nick and I work on the IT field as a QA and a Front End developer... 
        Now im building Solidity projects to explore the posibilities of the blockchain technology
        How are you doing today? Connect your Ethereum wallet and wave at me!
        </div>

        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>

                {/*
        * If there is no currentAccount render this button
        */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        <LoadingOverlay
          active={isActive}
          spinner={<HashLoader />}
          text='Mining this block...'
          styles={{
            wrapper: {
              width: '400px',
              height: '400px',
              overflow: isActive ? 'hidden' : 'scroll'
            }
          }}
          >
        </LoadingOverlay>
      
        { !isActive ? 
        <div className="bio counter">
          So far {waveCount} people came through and said hi!
        </div> 
        : 
        null
        }
      </div>
    </div>
  );
}

export default App; 
