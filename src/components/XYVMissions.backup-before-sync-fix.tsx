"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const TASKS = [
  {
    id: "visit",
    title: "Visit Xyvorun",
    reward: 25,
    url: "#",
  },
  {
    id: "telegram",
    title: "Join Telegram",
    reward: 50,
    url: "#",
  },
  {
    id: "social",
    title: "Follow Xyvorun",
    reward: 50,
    url: "#",
  },
];

export default function XYVMissions() {
  const [xp, setXp] = useState(0);
  const [taps, setTaps] = useState(0);
  const [message, setMessage] = useState("");
  const [mounted, setMounted] = useState(false);
  const [wallet, setWallet] = useState("");
  const [dailyClaimed, setDailyClaimed] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);

    const savedStreak =
      Number(localStorage.getItem("xyv_streak") || "0");

    const lastDaily =
      localStorage.getItem("xyv_last_daily");

    if (lastDaily) {
      const last = new Date(lastDaily);
      const current = new Date(today);

      const days = Math.floor(
        (current.getTime() - last.getTime()) / 86400000
      );

      if (days > 1) {
        localStorage.setItem("xyv_streak", "0");
        setStreak(0);
      } else {
        setStreak(savedStreak);
      }
    } else {
      setStreak(savedStreak);
    }

    if (localStorage.getItem(`xyv_daily_${today}`) === "1") {
      setDailyClaimed(true);
    }

    setXp(
      Number(localStorage.getItem("xyv_xp") || "0")
    );

    setTaps(
      Number(localStorage.getItem("xyv_taps") || "0")
    );

    setMounted(true);

    if (window.ethereum) {
      window.ethereum
        .request({ method: "eth_accounts" })
        .then((accounts: string[]) => {
          if (accounts?.length) {
            setWallet(accounts[0]);
          }
        })
        .catch(() => {});
    }
  }, []);

  function addXP(amount: number) {
    setXp((current) => {
      const next = current + amount;
      localStorage.setItem("xyv_xp", String(next));
      return next;
    });
  }

  function claimDailyReward() {
    const today = new Date().toISOString().slice(0, 10);
    const key = `xyv_daily_${today}`;

    if (localStorage.getItem(key) === "1") {
      setDailyClaimed(true);
      return;
    }

    const nextStreak = streak + 1;
    const reward = 100 + Math.min(nextStreak * 10, 100);

    localStorage.setItem(key, "1");
    localStorage.setItem("xyv_streak", String(nextStreak));
    localStorage.setItem("xyv_last_daily", today);

    setDailyClaimed(true);
    setStreak(nextStreak);

    addXP(reward);
    setMessage(`Daily reward claimed! +${reward} XP`);
  }

  function tap() {
    if (taps >= 20) return;

    const next = taps + 1;

    setTaps(next);
    localStorage.setItem("xyv_taps", String(next));

    addXP(next % 5 === 0 ? 15 : 5);
  }

  async function completeTask(
    id: string,
    reward: number
  ) {
    if (!wallet) {
      setMessage(
        "Connect your wallet before completing missions."
      );
      return;
    }

    if (!window.ethereum) {
      setMessage("Wallet provider not found.");
      return;
    }

    const key = `xyv_task_${id}`;

    if (localStorage.getItem(key) === "1") {
      setMessage("Mission already completed.");
      return;
    }

    try {
      const checksumWallet = ethers.getAddress(wallet);

      const message =
        `Xyvorun mission verification\n` +
        `Wallet: ${checksumWallet}\n` +
        `Mission: ${id}`;

      setMessage(
        "Sign the verification message in your wallet..."
      );

      const signature =
        await window.ethereum.request({
          method: "personal_sign",
          params: [
            message,
            checksumWallet,
          ],
        });

      const response = await fetch(
        "/api/missions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            wallet: checksumWallet,
            task: id,
            signature,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
          "Mission verification failed."
        );
      }

      localStorage.setItem(key, "1");

      addXP(result.xp ?? reward);

      setMessage(
        `Mission verified! +${result.xp ?? reward} XP`
      );

      setMounted(false);

      setTimeout(() => {
        setMounted(true);
      }, 0);
    } catch (error: any) {
      console.error("Mission verification error:", error);

      if (error?.code === 4001) {
        setMessage(
          "Signature request was rejected."
        );
      } else if (
        error?.message?.includes("409") ||
        error?.message?.includes("already completed")
      ) {
        localStorage.setItem(key, "1");

        setMounted(false);

        setTimeout(() => {
          setMounted(true);
        }, 0);

        setMessage("Mission already completed.");
      } else {
        setMessage(
          error?.message ||
          "Mission verification failed."
        );
      }
    }
  }

  const today = new Date().toISOString().slice(0, 10);

  const level =
    xp >= 500 ? 4 :
    xp >= 250 ? 3 :
    xp >= 100 ? 2 : 1;

  const levelStart =
    level === 4 ? 500 :
    level === 3 ? 250 :
    level === 2 ? 100 : 0;

  const levelTarget =
    level === 4 ? 1000 :
    level === 3 ? 500 :
    level === 2 ? 250 : 100;

  const levelProgress =
    level === 4
      ? 100
      : Math.min(
          100,
          Math.round(
            ((xp - levelStart) /
              (levelTarget - levelStart)) *
              100
          )
        );

  const xpNeeded =
    level === 4
      ? 0
      : Math.max(0, levelTarget - xp);

  return (
    <section className="mx-auto mt-8 w-full max-w-2xl rounded-2xl border border-white/10 bg-black/30 p-6 text-white shadow-xl backdrop-blur">

      <p className="text-sm uppercase tracking-[0.25em] text-gray-400">
        XYV COMMUNITY
      </p>

      <h2 className="mt-2 text-3xl font-bold">
        Earn XP
      </h2>

      <div className="mt-6 grid gap-4 md:grid-cols-4">

        <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-center">
          <p className="text-sm text-gray-400">XP</p>
          <p className="mt-2 text-3xl font-black">{xp}</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-center">
          <p className="text-sm text-gray-400">LEVEL</p>
          <p className="mt-2 text-3xl font-black">LVL {level}</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-center">
          <p className="text-sm text-gray-400">STREAK</p>
          <p className="mt-2 text-3xl font-black">
            {streak} 🔥
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-center">
          <p className="text-sm text-gray-400">TAPS</p>
          <p className="mt-2 text-3xl font-black">
            {taps}/20
          </p>
        </div>

      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={claimDailyReward}
          disabled={dailyClaimed}
          className="w-full rounded-xl border border-white/10 bg-white/10 px-5 py-4 font-bold transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {dailyClaimed
            ? "DAILY REWARD CLAIMED ✓"
            : `CLAIM DAILY +${100 + Math.min((streak + 1) * 10, 100)} XP`}
        </button>
      </div>

      <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-5">

        <div className="flex items-center justify-between">

          <div>
            <p className="text-sm text-gray-400">
              LEVEL {level}
            </p>

            <p className="mt-1 font-bold">
              {level === 4
                ? "MAX LEVEL"
                : `${xpNeeded} XP TO NEXT LEVEL`}
            </p>
          </div>

          <p className="text-2xl font-black">
            {levelProgress}%
          </p>

        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">

          <div
            className="h-full rounded-full bg-white transition-all duration-500"
            style={{
              width: `${levelProgress}%`,
            }}
          />

        </div>

      </div>

      <button
        type="button"
        onClick={tap}
        disabled={taps >= 20}
        className="mt-6 w-full rounded-xl bg-white px-6 py-5 text-xl font-black text-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {taps >= 20
          ? "ROUND COMPLETE ✓"
          : "TAP TO EARN XP"}
      </button>

      <div className="mt-8">

        <p className="text-sm uppercase tracking-[0.2em] text-gray-400">
          XYV MISSIONS
        </p>

        <div className="mt-4 grid gap-3">

          {TASKS.map((task) => {

            const completed =
              mounted &&
              localStorage.getItem(
                `xyv_task_${task.id}`
              ) === "1";

            return (
              <div
                key={task.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 p-4"
              >

                <div>

                  <p className="font-semibold">
                    {task.title}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    +{task.reward} XP
                  </p>

                </div>

                <button
                  type="button"
                  disabled={completed}
                  onClick={() =>
                    completeTask(
                      task.id,
                      task.reward
                    )
                  }
                  className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-black disabled:opacity-40"
                >
                  {completed
                    ? "COMPLETED"
                    : "START"}
                </button>

              </div>
            );
          })}

        </div>

      </div>

      {message && (
        <p className="mt-5 text-center text-sm text-gray-300">
          {message}
        </p>
      )}

    </section>
  );
}
