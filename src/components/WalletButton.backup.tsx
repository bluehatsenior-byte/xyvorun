"use client";

import { useState } from "react";
import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const BSC_TESTNET_CHAIN_ID = "0x61";

export default function WalletButton() {
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [connecting, setConnecting] = useState(false);

  async function connectWallet() {
    setError("");
    setConnecting(true);

    try {
      const ethereum = window.ethereum;

      if (!ethereum) {
        throw new Error(
          "No compatible wallet was detected."
        );
      }

      console.log(
        "Wallet provider:",
        ethereum
      );

      // First check the currently connected account.
      let accounts = await ethereum.request({
        method: "eth_accounts",
      });

      // Only request permission if there is no connected account.
      if (!accounts || accounts.length === 0) {
        accounts = await ethereum.request({
          method: "eth_requestAccounts",
        });
      }

      if (!accounts || accounts.length === 0) {
        throw new Error(
          "No wallet account was selected."
        );
      }

      const chainId =
        await ethereum.request({
          method: "eth_chainId",
        });

      if (chainId !== BSC_TESTNET_CHAIN_ID) {
        setError(
          "Please switch Trust Wallet to BNB Smart Chain Testnet."
        );
        return;
      }

      setAddress(accounts[0]);

      console.log(
        "Wallet connected:",
        accounts[0]
      );
    } catch (err: any) {
      console.error(
        "Trust Wallet connection error:",
        err
      );

      if (err?.code === 4001) {
        setError(
          "Wallet connection was rejected."
        );
      } else {
        setError(
          err?.message ||
            "Wallet connection failed."
        );
      }
    } finally {
      setConnecting(false);
    }
  }

  function shortenAddress(value: string) {
    return `${value.slice(0, 6)}...${value.slice(-4)}`;
  }

  return (
    <div className="wallet-wrapper">
      <button
        className="wallet-button"
        onClick={connectWallet}
        disabled={connecting}
      >
        {connecting
          ? "CONNECTING..."
          : address
            ? shortenAddress(address)
            : "CONNECT WALLET"}

        <span>?</span>
      </button>

      {error && (
        <p className="wallet-error">
          {error}
        </p>
      )}
    </div>
  );
}

