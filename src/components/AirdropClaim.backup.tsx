"use client";

import { useState } from "react";
import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const AIRDROP_CONTRACT = "0xa8C16346AcE0512AD56f4ECEe2f548ebb121eEAf";
const XYV_CONTRACT = "0x19193d0C1888849b44390dcA637513934431EADf";

const AIRDROP_ABI = [
  "function claim() external",
  "function hasClaimed(address user) view returns (bool)"
];

const XYV_ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

export default function AirdropClaim() {
  const [taps, setTaps] = useState(0);
  const [tasks, setTasks] = useState({
    ecosystem: false,
    tokenomics: false,
    roadmap: false
  });

  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [balance, setBalance] = useState("0");
  const [message, setMessage] = useState("");
  const [txHash, setTxHash] = useState("");

  const tapsComplete = taps >= 20;
  const tasksComplete =
    tapsComplete &&
    tasks.ecosystem &&
    tasks.tokenomics &&
    tasks.roadmap;

  function tapGame() {
    if (taps < 20) {
      setTaps((value) => value + 1);
    }
  }

  function completeTask(task: keyof typeof tasks) {
    setTasks((current) => ({
      ...current,
      [task]: true
    }));
  }

  async function loadBalance(
    provider: ethers.BrowserProvider,
    wallet: string
  ) {
    const token = new ethers.Contract(
      XYV_CONTRACT,
      XYV_ABI,
      provider
    );

    const [rawBalance, decimals] = await Promise.all([
      token.balanceOf(wallet),
      token.decimals()
    ]);

    setBalance(
      Number(
        ethers.formatUnits(rawBalance, decimals)
      ).toLocaleString(undefined, {
        maximumFractionDigits: 4
      })
    );
  }

  async function claimXYV() {
    if (!tasksComplete) {
      setMessage("Complete all tasks first.");
      return;
    }

    setMessage("");
    setTxHash("");
    setClaiming(true);

    try {
      const ethereum = window.ethereum;

      if (!ethereum) {
        throw new Error("No compatible wallet was detected.");
      }

      let accounts = await ethereum.request({
        method: "eth_accounts"
      });

      if (!accounts?.length) {
        accounts = await ethereum.request({
          method: "eth_requestAccounts"
        });
      }

      if (!accounts?.length) {
        throw new Error("Please connect your wallet first.");
      }

      const wallet = accounts[0];

      const chainId = await ethereum.request({
        method: "eth_chainId"
      });

      if (chainId !== "0x61") {
        throw new Error(
          "Please switch to BNB Smart Chain Testnet."
        );
      }

      const provider = new ethers.BrowserProvider(
        ethereum
      );

      const airdrop = new ethers.Contract(
        AIRDROP_CONTRACT,
        AIRDROP_ABI,
        provider
      );

      const alreadyClaimed =
        await airdrop.hasClaimed(wallet);

      if (alreadyClaimed) {
        setClaimed(true);
        setMessage(
          "This wallet has already claimed its XYV."
        );
        await loadBalance(provider, wallet);
        return;
      }

      const signer = await provider.getSigner();
      const contract = airdrop.connect(signer) as any;

      setMessage(
        "Confirm the transaction in Trust Wallet..."
      );

      const tx = await contract.claim();

      setTxHash(tx.hash);

      setMessage(
        "Transaction submitted. Waiting for confirmation..."
      );

      await tx.wait();

      setClaimed(true);

      await loadBalance(provider, wallet);

      setMessage(
        "Claim successful! 10,000 XYV has been added to your wallet."
      );
    } catch (error: any) {
      console.error("XYV claim error:", error);

      if (error?.code === 4001) {
        setMessage(
          "Transaction rejected in Trust Wallet."
        );
      } else {
        setMessage(
          error?.shortMessage ||
          error?.message ||
          "Claim failed."
        );
      }
    } finally {
      setClaiming(false);
    }
  }

  const progress = Math.round(
    ((Math.min(taps, 20) / 20 +
      (tasks.ecosystem ? 1 : 0) +
      (tasks.tokenomics ? 1 : 0) +
      (tasks.roadmap ? 1 : 0)) /
      4) *
      100
  );

  return (
    <section className="mx-auto mt-8 w-full max-w-3xl rounded-3xl border border-white/10 bg-black/40 p-6 text-white shadow-2xl backdrop-blur">

      <p className="text-sm uppercase tracking-[0.25em] text-gray-400">
        XYVORUN
      </p>

      <h2 className="mt-2 text-3xl font-bold">
        XYV Tap & Earn
      </h2>

      <p className="mt-3 text-gray-400">
        Complete the mini-game and ecosystem tasks to unlock your 10,000 XYV claim.
      </p>

      <div className="mt-6">
        <div className="mb-2 flex justify-between text-sm">
          <span>Mission Progress</span>
          <span>{progress}%</span>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-white transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
          <p className="text-sm text-gray-400">
            TAP CHALLENGE
          </p>

          <p className="mt-2 text-4xl font-black">
            {taps}/20
          </p>

          <button
            onClick={tapGame}
            disabled={tapsComplete || claimed}
            className="mt-5 w-full rounded-xl bg-white px-6 py-4 font-black text-black transition hover:scale-[1.02] disabled:opacity-40"
          >
            {tapsComplete ? "TAP COMPLETE ✓" : "TAP TO EARN"}
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-gray-400">
            ECOSYSTEM MISSIONS
          </p>

          <div className="mt-4 space-y-3">

            <button
              onClick={() => {
                window.location.hash = "ecosystem";
                completeTask("ecosystem");
              }}
              disabled={tasks.ecosystem}
              className="w-full rounded-xl border border-white/10 px-4 py-3 text-left transition hover:bg-white/10 disabled:opacity-50"
            >
              {tasks.ecosystem ? "✓" : "○"} Explore Ecosystem
            </button>

            <button
              onClick={() => {
                window.location.hash = "tokenomics";
                completeTask("tokenomics");
              }}
              disabled={tasks.tokenomics}
              className="w-full rounded-xl border border-white/10 px-4 py-3 text-left transition hover:bg-white/10 disabled:opacity-50"
            >
              {tasks.tokenomics ? "✓" : "○"} Explore Tokenomics
            </button>

            <button
              onClick={() => {
                window.location.hash = "roadmap";
                completeTask("roadmap");
              }}
              disabled={tasks.roadmap}
              className="w-full rounded-xl border border-white/10 px-4 py-3 text-left transition hover:bg-white/10 disabled:opacity-50"
            >
              {tasks.roadmap ? "✓" : "○"} Explore Roadmap
            </button>

          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
        <p className="text-sm text-gray-400">
          YOUR XYV BALANCE
        </p>

        <p className="mt-2 text-3xl font-bold">
          {balance} XYV
        </p>
      </div>

      <button
        onClick={claimXYV}
        disabled={!tasksComplete || claiming || claimed}
        className="mt-6 w-full rounded-xl bg-white px-6 py-5 text-lg font-black text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {claimed
          ? "ALREADY CLAIMED"
          : claiming
          ? "CLAIMING..."
          : tasksComplete
          ? "🎉 CLAIM 10,000 XYV"
          : "🔒 COMPLETE MISSIONS TO UNLOCK"}
      </button>

      {message && (
        <p className="mt-4 text-center text-sm text-gray-300">
          {message}
        </p>
      )}

      {txHash && (
        <a
          href={`https://testnet.bscscan.com/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 block text-center text-sm text-blue-400 hover:underline"
        >
          View transaction on BscScan →
        </a>
      )}

      <a
        href={`https://testnet.bscscan.com/address/${AIRDROP_CONTRACT}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 block text-center text-xs text-gray-500 hover:underline"
      >
        View Airdrop Contract
      </a>

    </section>
  );
}

