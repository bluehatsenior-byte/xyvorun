"use client";

import { useState } from "react";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const BSC_TESTNET_CHAIN_ID = "0x61";

function getWalletProvider() {
  const ethereum = window.ethereum;

  if (!ethereum) {
    return null;
  }

  // If multiple injected providers exist, prefer Trust Wallet.
  if (ethereum.providers && Array.isArray(ethereum.providers)) {
    const trust = ethereum.providers.find(
      (provider: any) =>
        provider.isTrust ||
        provider.isTrustWallet
    );

    if (trust) {
      return trust;
    }
  }

  return ethereum;
}

export default function WalletButton() {
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [connecting, setConnecting] = useState(false);

  async function connectWallet() {
    setError("");
    setConnecting(true);

    try {
      const ethereum = getWalletProvider();

      if (!ethereum) {
        throw new Error(
          "No compatible wallet was detected."
        );
      }

      let accounts;

      try {
        accounts = await ethereum.request({
          method: "eth_requestAccounts",
        });
      } catch (walletError: any) {
        const walletMessage =
          String(walletError?.message || "").toLowerCase();

        if (
          walletMessage.includes("broadcast channel") ||
          walletMessage.includes("broadcastchannel") ||
          walletMessage.includes("channel is unavailable")
        ) {
          throw new Error(
            "Trust Wallet is not ready. Unlock Trust Wallet, close duplicate wallet tabs, then refresh this page and try again."
          );
        }

        throw walletError;
      }

      if (!accounts?.length) {
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
      } else if (
        String(err?.message || "")
          .toLowerCase()
          .includes("broadcast channel")
      ) {
        setError(
          "Trust Wallet extension communication failed. Please reload the page and try again."
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


