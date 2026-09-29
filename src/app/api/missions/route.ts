import { NextResponse } from "next/server";
import { ethers } from "ethers";
import { promises as fs } from "fs";
import path from "path";

const MISSION_XP: Record<string, number> = {
  visit: 25,
  telegram: 50,
  social: 50,
};

const DATA_FILE = path.join(
  process.cwd(),
  "data",
  "missions.json"
);

type MissionRecord = {
  wallet: string;
  task: string;
  xp: number;
  completedAt: string;
};

async function readMissions(): Promise<MissionRecord[]> {
  try {
    return JSON.parse(
      await fs.readFile(DATA_FILE, "utf8")
    );
  } catch {
    return [];
  }
}

async function writeMissions(
  missions: MissionRecord[]
) {
  await fs.mkdir(
    path.dirname(DATA_FILE),
    { recursive: true }
  );

  await fs.writeFile(
    DATA_FILE,
    JSON.stringify(missions, null, 2),
    "utf8"
  );
}

export async function GET(request: Request) {
  try {
    const { searchParams } =
      new URL(request.url);

    const wallet =
      searchParams.get("wallet")?.trim() || "";

    if (!wallet || !ethers.isAddress(wallet)) {
      return NextResponse.json(
        {
          success: false,
          error: "Valid wallet address is required.",
        },
        { status: 400 }
      );
    }

    const normalizedWallet =
      ethers.getAddress(wallet);

    const missions = await readMissions();

    const completed = missions
      .filter(
        (mission) =>
          mission.wallet.toLowerCase() ===
          normalizedWallet.toLowerCase()
      )
      .map((mission) => mission.task);

    return NextResponse.json({
      success: true,
      wallet: normalizedWallet,
      missions: completed,
      requiredMissions: Object.keys(MISSION_XP),
      allComplete: Object.keys(MISSION_XP).every(
        (task) => completed.includes(task)
      ),
    });
  } catch (error) {
    console.error(
      "Mission status error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Unable to load mission status.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const wallet =
      typeof body.wallet === "string"
        ? body.wallet.trim()
        : "";

    const task =
      typeof body.task === "string"
        ? body.task.trim()
        : "";

    const signature =
      typeof body.signature === "string"
        ? body.signature
        : "";

    if (!wallet || !task || !signature) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Wallet, task and signature are required.",
        },
        { status: 400 }
      );
    }

    if (!ethers.isAddress(wallet)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid wallet address.",
        },
        { status: 400 }
      );
    }

    if (
      !Object.prototype.hasOwnProperty.call(
        MISSION_XP,
        task
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Unknown mission.",
        },
        { status: 400 }
      );
    }

    const normalizedWallet =
      ethers.getAddress(wallet);

    const message =
      `Xyvorun mission verification\n` +
      `Wallet: ${normalizedWallet}\n` +
      `Mission: ${task}`;

    let recoveredWallet: string;

    try {
      recoveredWallet =
        ethers.verifyMessage(
          message,
          signature
        );
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid signature.",
        },
        { status: 401 }
      );
    }

    if (
      recoveredWallet.toLowerCase() !==
      normalizedWallet.toLowerCase()
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Signature does not belong to this wallet.",
        },
        { status: 401 }
      );
    }

    const missions = await readMissions();

    const alreadyCompleted =
      missions.some(
        (mission) =>
          mission.wallet.toLowerCase() ===
            normalizedWallet.toLowerCase() &&
          mission.task === task
      );

    if (alreadyCompleted) {
      return NextResponse.json(
        {
          success: false,
          error: "Mission already completed.",
        },
        { status: 409 }
      );
    }

    const record: MissionRecord = {
      wallet: normalizedWallet,
      task,
      xp: MISSION_XP[task],
      completedAt:
        new Date().toISOString(),
    };

    missions.push(record);

    await writeMissions(missions);

    return NextResponse.json({
      success: true,
      wallet: normalizedWallet,
      task,
      verified: true,
      xp: record.xp,
      completedAt: record.completedAt,
    });
  } catch (error) {
    console.error(
      "Mission verification error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Mission verification failed.",
      },
      { status: 500 }
    );
  }
}
