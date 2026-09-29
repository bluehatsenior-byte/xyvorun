"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const AIRDROP_CONTRACT =
  "0xa8C16346AcE0512AD56f4ECEe2f548ebb121eEAf";

const XYV_CONTRACT =
  "0x19193d0C1888849b44390dcA637513934431EADf";

const REQUIRED_TAPS = 20;
const CLAIM_AMOUNT = "10000";

const AIRDROP_ABI = [
  "function claim()",
  "function hasClaimed(address) view returns (bool)",
];

const TOKEN_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
];

const REQUIRED_MISSIONS = [
  "visit",
  "telegram",
  "social",
];

export default function AirdropClaim() {
  const [wallet, setWallet] = useState("");
  const [taps, setTaps] = useState(0);
  const [completedMissions, setCompletedMissions] = useState<string[]>([]);
  const [balance, setBalance] = useState("0");
  const [claimed, setClaimed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const refreshProgress = async (address?: string) => {
    const activeWallet = address || wallet;

    if (!activeWallet) {
      setCompletedMissions([]);
      setTaps(
        Number(localStorage.getItem("xyv_taps") || "0")
      );
      return;
    }

    setTaps(
      Number(localStorage.getItem("xyv_taps") || "0")
    );

    try {
      const response = await fetch(
        `/api/missions?wallet=${encodeURIComponent(activeWallet)}`,
        { cache: "no-store" }
      );

      const result = await response.json();

      if (response.ok) {
        const missions = Array.isArray(result.missions)
          ? result.missions
          : [];

        const completed = missions
          .map((item: any) => item.task || item.id)
          .filter((id: string) =>
            REQUIRED_MISSIONS.includes(id)
          );

        setCompletedMissions(
          Array.from(new Set(completed))
        );
      }
    } catch {
      setCompletedMissions([]);
    }
  };

  const refreshBlockchain = async (address?: string) => {
    const activeWallet = address || wallet;

    if (!activeWallet || !window.ethereum) return;

    try {
      const provider =
        new ethers.BrowserProvider(window.ethereum);

      const network = await provider.getNetwork();

      if (network.chainId !== BigInt(97)) {
        return;
      }

      const token = new ethers.Contract(
        XYV_CONTRACT,
        TOKEN_ABI,
        provider
      );

      const tokenBalance =
        await token.balanceOf(activeWallet);

      const decimals =
        await token.decimals();

      setBalance(
        ethers.formatUnits(tokenBalance, decimals)
      );

      const airdrop = new ethers.Contract(
        AIRDROP_CONTRACT,
        AIRDROP_ABI,
        provider
      );

      setClaimed(
        await airdrop.hasClaimed(activeWallet)
      );
    } catch (error) {
      console.error(
        "Airdrop blockchain refresh error:",
        error
      );
    }
  };

  const refreshAll = async (address?: string) => {
    await refreshProgress(address);
    await refreshBlockchain(address);
  };

  useEffect(() => {
    if (!window.ethereum) return;

    window.ethereum
      .request({ method: "eth_accounts" })
      .then(async (accounts: string[]) => {
        if (accounts?.length) {
          setWallet(accounts[0]);
          await refreshAll(accounts[0]);
        }
      })
      .catch(() => {});

    const onAccountsChanged = async (
      accounts: string[]
    ) => {
      const nextWallet = accounts?.[0] || "";

      setWallet(nextWallet);

      if (nextWallet) {
        await refreshAll(nextWallet);
      } else {
        setCompletedMissions([]);
        setBalance("0");
        setClaimed(false);
      }
    };

    window.ethereum.on(
      "accountsChanged",
      onAccountsChanged
    );

    const onProgressUpdated = () => {
      refreshAll();
    };

    window.addEventListener(
      "xyv-progress-updated",
      onProgressUpdated
    );

    const onStorage = (event: StorageEvent) => {
      if (
        event.key === "xyv_taps" ||
        event.key?.startsWith("xyv_task_")
      ) {
        refreshAll();
      }
    };

    window.addEventListener("storage", onStorage);

    return () => {
      window.ethereum?.removeListener?.(
        "accountsChanged",
        onAccountsChanged
      );

      window.removeEventListener(
        "xyv-progress-updated",
        onProgressUpdated
      );

      window.removeEventListener(
        "storage",
        onStorage
      );
    };
  }, [wallet]);

  async function claimAirdrop() {
    if (!wallet) {
      setMessage("Connect your wallet first.");
      return;
    }

    const currentTaps = Number(
      localStorage.getItem("xyv_taps") || "0"
    );

    setTaps(currentTaps);

    await refreshProgress(wallet);

    if (currentTaps < REQUIRED_TAPS) {
      setMessage(
        `${REQUIRED_TAPS - currentTaps} taps remaining.`
      );
      return;
    }

    if (completedMissions.length < REQUIRED_MISSIONS.length) {
      setMessage(
        `${REQUIRED_MISSIONS.length - completedMissions.length} missions remaining.`
      );
      return;
    }

    if (!window.ethereum) {
      setMessage("Wallet provider not found.");
      return;
    }

    try {
      setLoading(true);
      setMessage("Checking claim eligibility...");

      const provider =
        new ethers.BrowserProvider(window.ethereum);

      const network = await provider.getNetwork();

      if (network.chainId !== BigInt(97)) {
        throw new Error(
          "Please switch Trust Wallet to BSC Testnet."
        );
      }

      const signer =
        await provider.getSigner();

      const airdrop = new ethers.Contract(
        AIRDROP_CONTRACT,
        AIRDROP_ABI,
        signer
      );

      const alreadyClaimed =
        await airdrop.hasClaimed(wallet);

      if (alreadyClaimed) {
        setClaimed(true);
        setMessage("This wallet has already claimed.");
        return;
      }

      setMessage(
        "Confirm the 10,000 XYV claim in your wallet..."
      );

      const tx = await airdrop.claim();

      setMessage(
        `Transaction submitted: ${tx.hash}`
      );

      await tx.wait();

      setClaimed(true);

      await refreshBlockchain(wallet);

      setMessage(
        `Claim successful! ${CLAIM_AMOUNT} XYV received.`
      );
    } catch (error: any) {
      console.error("Airdrop claim error:", error);

      setMessage(
        error?.shortMessage ||
          error?.reason ||
          error?.message ||
          "Claim failed."
      );
    } finally {
      setLoading(false);
    }
  }

  const missionCount =
    completedMissions.length;

  const tapsComplete =
    Math.min(taps, REQUIRED_TAPS);

  const missionProgress =
    Math.round(
      (missionCount /
        REQUIRED_MISSIONS.length) *
        100
    );

  const totalRequirements =
    REQUIRED_TAPS +
    REQUIRED_MISSIONS.length;

  const completedRequirements =
    Math.min(taps, REQUIRED_TAPS) +
    missionCount;

  const overallProgress =
    Math.round(
      (completedRequirements /
        totalRequirements) *
        100
    );

  const unlocked =
    tapsComplete >= REQUIRED_TAPS &&
    missionCount >= REQUIRED_MISSIONS.length &&
    !claimed;

  const shortWallet = wallet
    ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}`
    : "Not connected";

  return (
    <section className="mx-auto mt-8 w-full max-w-2xl rounded-2xl border border-white/10 bg-black/30 p-6 text-white shadow-xl backdrop-blur">
      <p className="text-sm uppercase tracking-[0.25em] text-gray-400">
        01 / COMMUNITY
      </p>

      <h2 className="mt-2 text-3xl font-black">
        THE XYV COMMUNITY AIRDROP
      </h2>

      <p className="mt-4 text-lg font-semibold">
        EARN XYV BY BEING PART OF XYVORUN.
      </p>

      <p className="mt-4 text-sm leading-6 text-gray-400">
        A dedicated allocation of XYV is reserved for
        community growth, early participation, ecosystem
        activity and future campaigns.
      </p>

      <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-5 text-center">
        <p className="text-sm text-gray-400">
          XYV COMMUNITY ALLOCATION
        </p>
        <p className="mt-2 text-4xl font-black">
          50,000,000 XYV
        </p>
      </div>

      <div className="mt-8">
        <p className="text-sm uppercase tracking-[0.2em] text-gray-400">
          XYV TAP & EARN
        </p>

        <h3 className="mt-2 text-2xl font-bold">
          Complete the mini-game and verified community
          missions to unlock your 10,000 XYV claim.
        </h3>

        <p className="mt-4 text-sm text-gray-400">
          Wallet: {shortWallet}
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              Mission Progress
            </p>
            <p className="font-black">
              {missionProgress}%
            </p>
          </div>

          <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-white transition-all"
              style={{
                width: `${missionProgress}%`,
              }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-gray-400">
            TAP CHALLENGE
          </p>

          <p className="mt-2 text-3xl font-black">
            {tapsComplete}/20
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-5">
        <p className="text-sm uppercase tracking-[0.2em] text-gray-400">
          VERIFIED COMMUNITY MISSIONS
        </p>

        <div className="mt-4 grid gap-3">
          {[
            ["visit", "Visit Xyvorun", 25],
            ["telegram", "Join Telegram", 50],
            ["social", "Follow Xyvorun", 50],
          ].map(([id, title, reward]) => {
            const completed =
              completedMissions.includes(
                id as string
              );

            return (
              <div
                key={id as string}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <div>
                  <p className="font-semibold">
                    {title as string}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    +{reward as number} XP
                  </p>
                </div>

                <span className="text-sm font-bold">
                  {completed
                    ? "COMPLETED"
                    : "PENDING"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-5">
        <p className="text-sm uppercase tracking-[0.2em] text-gray-400">
          CLAIM REQUIREMENTS
        </p>

        <div className="mt-4 space-y-3 text-sm">
          <p>
            {tapsComplete >= 20 ? "?" : "?"}{" "}
            {tapsComplete >= 20
              ? "20 taps complete"
              : `${20 - tapsComplete} taps remaining`}
          </p>

          <p>
            {missionCount >= 3 ? "?" : "?"}{" "}
            {missionCount >= 3
              ? "3 missions complete"
              : `${3 - missionCount} missions remaining`}
          </p>

          <p className="text-gray-400">
            {completedRequirements}/{totalRequirements}
            {" requirements complete"}
          </p>

          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-white transition-all"
              style={{
                width: `${overallProgress}%`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-5 text-center">
        <p className="text-sm text-gray-400">
          YOUR XYV BALANCE
        </p>

        <p className="mt-2 text-3xl font-black">
          {balance} XYV
        </p>
      </div>

      <button
        type="button"
        onClick={claimAirdrop}
        disabled={!unlocked || loading || claimed}
        className="mt-6 w-full rounded-xl bg-white px-6 py-5 text-lg font-black text-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {claimed
          ? "AIRDROP CLAIMED ?"
          : loading
          ? "PROCESSING..."
          : unlocked
          ? "CLAIM 10,000 XYV"
          : "?? COMPLETE REQUIREMENTS TO UNLOCK"}
      </button>

      {message && (
        <p className="mt-5 break-all text-center text-sm text-gray-300">
          {message}
        </p>
      )}

      <a
        href={`https://testnet.bscscan.com/address/${AIRDROP_CONTRACT}`}
        target="_blank"
        rel="noreferrer"
        className="mt-5 block text-center text-sm text-gray-400 underline"
      >
        View Airdrop Contract
      </a>
    </section>
  );
}


