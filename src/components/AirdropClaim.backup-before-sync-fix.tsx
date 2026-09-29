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

const AIRDROP_ABI = [
  "function claim() external",
  "function hasClaimed(address user) view returns (bool)",
];

const XYV_ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
];

const REQUIRED_MISSIONS = [
  {
    id: "visit",
    title: "Visit Xyvorun",
    reward: 25,
  },
  {
    id: "telegram",
    title: "Join Telegram",
    reward: 50,
  },
  {
    id: "social",
    title: "Follow Xyvorun",
    reward: 50,
  },
];

export default function AirdropClaim() {
  const [taps, setTaps] = useState(0);
  const [completedMissions, setCompletedMissions] = useState<string[]>([]);
  const [wallet, setWallet] = useState("");
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [balance, setBalance] = useState("0");
  const [message, setMessage] = useState("");
  const [txHash, setTxHash] = useState("");
  const [loadingMissions, setLoadingMissions] = useState(false);

  const tapsComplete = taps >= 20;

  const missionsComplete =
    REQUIRED_MISSIONS.every((mission) =>
      completedMissions.includes(mission.id)
    );

  const tasksComplete =
    tapsComplete && missionsComplete;

  async function loadMissionStatus(
    currentWallet: string
  ) {
    if (!currentWallet) return;

    setLoadingMissions(true);

    try {
      const response = await fetch(
        `/api/missions?wallet=${encodeURIComponent(
          currentWallet
        )}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Unable to load mission status."
        );
      }

      setCompletedMissions(
        Array.isArray(data.missions)
          ? data.missions
          : []
      );
    } catch (error: any) {
      console.error(
        "Mission status error:",
        error
      );

      setMessage(
        error?.message ||
          "Unable to load mission status."
      );
    } finally {
      setLoadingMissions(false);
    }
  }

  useEffect(() => {
    const ethereum = window.ethereum;

    if (!ethereum) return;

    ethereum
      .request({
        method: "eth_accounts",
      })
      .then(async (accounts: string[]) => {
        if (!accounts?.length) return;

        const currentWallet =
          ethers.getAddress(accounts[0]);

        setWallet(currentWallet);

        await loadMissionStatus(
          currentWallet
        );
      })
      .catch(() => {});

    const handleAccountsChanged = async (
      accounts: string[]
    ) => {
      if (!accounts?.length) {
        setWallet("");
        setCompletedMissions([]);
        setClaimed(false);
        return;
      }

      const currentWallet =
        ethers.getAddress(accounts[0]);

      setWallet(currentWallet);
      setClaimed(false);

      await loadMissionStatus(
        currentWallet
      );
    };

    ethereum.on(
      "accountsChanged",
      handleAccountsChanged
    );

    return () => {
      ethereum.removeListener?.(
        "accountsChanged",
        handleAccountsChanged
      );
    };
  }, []);

  function tapGame() {
    if (taps < 20 && !claimed) {
      setTaps((value) => value + 1);
    }
  }

  async function loadBalance(
    provider: ethers.BrowserProvider,
    currentWallet: string
  ) {
    const token = new ethers.Contract(
      XYV_CONTRACT,
      XYV_ABI,
      provider
    );

    const [rawBalance, decimals] =
      await Promise.all([
        token.balanceOf(currentWallet),
        token.decimals(),
      ]);

    setBalance(
      Number(
        ethers.formatUnits(
          rawBalance,
          decimals
        )
      ).toLocaleString(undefined, {
        maximumFractionDigits: 4,
      })
    );
  }

  async function getConnectedWallet() {
    const ethereum = window.ethereum;

    if (!ethereum) {
      throw new Error(
        "No compatible wallet was detected."
      );
    }

    let accounts =
      await ethereum.request({
        method: "eth_accounts",
      });

    if (!accounts?.length) {
      accounts =
        await ethereum.request({
          method: "eth_requestAccounts",
        });
    }

    if (!accounts?.length) {
      throw new Error(
        "Please connect your wallet first."
      );
    }

    return {
      ethereum,
      wallet: ethers.getAddress(
        accounts[0]
      ),
    };
  }

  async function verifyCurrentMissions(
    currentWallet: string
  ) {
    const response = await fetch(
      `/api/missions?wallet=${encodeURIComponent(
        currentWallet
      )}`,
      {
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.error ||
          "Unable to verify missions."
      );
    }

    const missions =
      Array.isArray(data.missions)
        ? data.missions
        : [];

    setCompletedMissions(missions);

    return REQUIRED_MISSIONS.every(
      (mission) =>
        missions.includes(mission.id)
    );
  }

  async function claimXYV() {
    setMessage("");
    setTxHash("");

    if (!tapsComplete) {
      setMessage(
        "Complete the 20-tap challenge first."
      );
      return;
    }

    setClaiming(true);

    try {
      const {
        ethereum,
        wallet: currentWallet,
      } =
        await getConnectedWallet();

      setWallet(currentWallet);

      const verified =
        await verifyCurrentMissions(
          currentWallet
        );

      if (!verified) {
        setMessage(
          "Complete all verified missions before claiming."
        );
        return;
      }

      const chainId =
        await ethereum.request({
          method: "eth_chainId",
        });

      if (chainId !== "0x61") {
        throw new Error(
          "Please switch to BNB Smart Chain Testnet."
        );
      }

      const provider =
        new ethers.BrowserProvider(
          ethereum
        );

      const airdrop =
        new ethers.Contract(
          AIRDROP_CONTRACT,
          AIRDROP_ABI,
          provider
        );

      const alreadyClaimed =
        await airdrop.hasClaimed(
          currentWallet
        );

      if (alreadyClaimed) {
        setClaimed(true);
        setMessage(
          "This wallet has already claimed its XYV."
        );

        await loadBalance(
          provider,
          currentWallet
        );

        return;
      }

      const signer =
        await provider.getSigner();

      const contract =
        airdrop.connect(signer) as any;

      setMessage(
        "Confirm the transaction in Trust Wallet..."
      );

      const tx =
        await contract.claim();

      setTxHash(tx.hash);

      setMessage(
        "Transaction submitted. Waiting for confirmation..."
      );

      await tx.wait();

      setClaimed(true);

      await loadBalance(
        provider,
        currentWallet
      );

      setMessage(
        "Claim successful! 10,000 XYV has been added to your wallet."
      );
    } catch (error: any) {
      console.error(
        "XYV claim error:",
        error
      );

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

  const completedMissionCount =
    REQUIRED_MISSIONS.filter(
      (mission) =>
        completedMissions.includes(
          mission.id
        )
    ).length;

  const progress = Math.round(
    ((Math.min(taps, 20) / 20 +
      completedMissionCount / 3) /
      2) *
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
        Complete the mini-game and verified
        community missions to unlock your
        10,000 XYV claim.
      </p>

      {wallet && (
        <p className="mt-2 text-xs text-gray-500">
          Wallet: {wallet.slice(0, 6)}...
          {wallet.slice(-4)}
        </p>
      )}

      <div className="mt-6">
        <div className="mb-2 flex justify-between text-sm">
          <span>Mission Progress</span>
          <span>{progress}%</span>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-white transition-all duration-300"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
          <p className="text-sm text-gray-400">
            TAP CHALLENGE
          </p>

          <p className="mt-2 text-4xl font-black">
            {Math.min(taps, 20)}/20
          </p>

          <button
            type="button"
            onClick={tapGame}
            disabled={
              tapsComplete || claimed
            }
            className="mt-5 w-full rounded-xl bg-white px-6 py-4 font-black text-black transition hover:scale-[1.02] disabled:opacity-40"
          >
            {tapsComplete
              ? "TAP COMPLETE ✓"
              : "TAP TO EARN"}
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-gray-400">
            VERIFIED COMMUNITY MISSIONS
          </p>

          <div className="mt-4 space-y-3">
            {REQUIRED_MISSIONS.map(
              (mission) => {
                const completed =
                  completedMissions.includes(
                    mission.id
                  );

                return (
                  <div
                    key={mission.id}
                    className="flex items-center justify-between rounded-xl border border-white/10 px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold">
                        {mission.title}
                      </p>

                      <p className="text-xs text-gray-500">
                        +{mission.reward} XP
                      </p>
                    </div>

                    <span
                      className={
                        completed
                          ? "font-bold text-green-400"
                          : "text-gray-500"
                      }
                    >
                      {completed
                        ? "✓ VERIFIED"
                        : "PENDING"}
                    </span>
                  </div>
                );
              }
            )}
          </div>

          {loadingMissions && (
            <p className="mt-3 text-center text-xs text-gray-500">
              Checking mission status...
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">
              CLAIM REQUIREMENTS
            </p>

            <p className="mt-1 font-bold">
              {tapsComplete
                ? "✓ 20 taps complete"
                : `○ ${20 - taps} taps remaining`}
            </p>

            <p className="mt-1 font-bold">
              {missionsComplete
                ? "✓ All missions verified"
                : `○ ${3 - completedMissionCount} missions remaining`}
            </p>
          </div>

          <p className="text-2xl font-black">
            {completedMissionCount}/3
          </p>
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
        type="button"
        onClick={claimXYV}
        disabled={
          !tasksComplete ||
          claiming ||
          claimed
        }
        className="mt-6 w-full rounded-xl bg-white px-6 py-5 text-lg font-black text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {claimed
          ? "ALREADY CLAIMED"
          : claiming
          ? "CLAIMING..."
          : tasksComplete
          ? "🎉 CLAIM 10,000 XYV"
          : "🔒 COMPLETE REQUIREMENTS TO UNLOCK"}
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
