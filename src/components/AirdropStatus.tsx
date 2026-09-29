"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";

const AIRDROP_CONTRACT =
  "0xa8C16346AcE0512AD56f4ECEe2f548ebb121eEAf";

const XYV_CONTRACT =
  "0x19193d0C1888849b44390dcA637513934431EADf";

const TOKEN_ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

const AIRDROP_ABI = [
  "function claimAmount() view returns (uint256)"
];

const TOTAL_ALLOCATION = 50_000_000;

export default function AirdropStatus() {
  const [claimAmount, setClaimAmount] = useState("10,000");
  const [balance, setBalance] = useState("0");
  const [remainingClaims, setRemainingClaims] = useState("0");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadStatus() {
    try {
      setLoading(true);
      setError("");

      const provider = new ethers.JsonRpcProvider(
        "https://data-seed-prebsc-1-s1.bnbchain.org:8545"
      );

      const token = new ethers.Contract(
        XYV_CONTRACT,
        TOKEN_ABI,
        provider
      );

      const airdrop = new ethers.Contract(
        AIRDROP_CONTRACT,
        AIRDROP_ABI,
        provider
      );

      const [rawBalance, decimals, rawClaimAmount] =
        await Promise.all([
          token.balanceOf(AIRDROP_CONTRACT),
          token.decimals(),
          airdrop.claimAmount()
        ]);

      const formattedBalance =
        Number(
          ethers.formatUnits(rawBalance, decimals)
        );

      const formattedClaim =
        Number(
          ethers.formatUnits(
            rawClaimAmount,
            decimals
          )
        );

      setBalance(
        formattedBalance.toLocaleString()
      );

      setClaimAmount(
        formattedClaim.toLocaleString()
      );

      setRemainingClaims(
        Math.floor(
          formattedBalance / formattedClaim
        ).toLocaleString()
      );
    } catch (err: any) {
      console.error(
        "Airdrop status error:",
        err
      );

      setError(
        "Unable to load live airdrop status."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStatus();

    const timer = setInterval(
      loadStatus,
      30000
    );

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mt-6 grid gap-4 md:grid-cols-3">

      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <p className="text-sm text-gray-400">
          Airdrop Balance
        </p>

        <p className="mt-2 text-2xl font-bold">
          {loading
            ? "..."
            : `${balance} XYV`}
        </p>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <p className="text-sm text-gray-400">
          Claims Remaining
        </p>

        <p className="mt-2 text-2xl font-bold">
          {loading
            ? "..."
            : remainingClaims}
        </p>
      </div>

      {error && (
        <p className="md:col-span-3 text-center text-sm text-red-400">
          {error}
        </p>
      )}

      <p className="md:col-span-3 text-center text-xs text-gray-500">
        Live data from BNB Smart Chain Testnet
      </p>
    </div>
  );
}


