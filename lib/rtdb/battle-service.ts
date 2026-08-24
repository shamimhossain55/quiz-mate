/**
 * lib/rtdb/battle-service.ts
 *
 * Firebase Realtime Database — 1v1 Real-Time Quiz Battle Service
 *
 * RTDB Paths:
 *   /battles/{battleId}                     -> Full battle room data
 *   /user_battle_invites/{sanitizedEmail}   -> Active incoming battle invite (pointing to battleId)
 */

import {
  ref,
  push,
  set,
  get,
  update,
  onValue,
  off,
  remove,
  serverTimestamp,
  DatabaseReference,
  onDisconnect,
} from "firebase/database";
import { rtdb } from "@/lib/rtdb-client";
import { sanitizeEmail } from "@/lib/rtdb/chat-service";

// ─── Types ───────────────────────────────────────────────────────────────────

export type BattleQuestion = {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
};

export type PlayerAnswer = {
  selectedOption: number;
  isCorrect: boolean;
  timeTaken: number;
  points: number;
};

export type BattlePlayer = {
  email: string;
  name: string;
  avatarUrl: string | null;
  score: number;
  currentQuestionIndex: number;
  answers?: Record<number, PlayerAnswer>;
  isReady?: boolean;
  isFinished?: boolean;
};

export type BattleStatus =
  | "pending"
  | "countdown"
  | "active"
  | "completed"
  | "declined"
  | "abandoned";

export type BattleRoom = {
  id: string;
  status: BattleStatus;
  classId: string;
  subjectId: string;
  subjectName: string;
  questions: BattleQuestion[];
  totalQuestions: number;
  inviterEmail: string;
  invitedEmail: string;
  player1: BattlePlayer;
  player2: BattlePlayer;
  winnerEmail: string | "draw" | null;
  createdAt: number;
  startedAt?: number | null;
  completedAt?: number | null;
};

export type IncomingBattleInvite = {
  battleId: string;
  inviterName: string;
  inviterEmail: string;
  inviterAvatar: string | null;
  subjectName: string;
  totalQuestions: number;
  timestamp: number;
};

// ─── Reference Helpers ───────────────────────────────────────────────────────

function battleRef(battleId: string): DatabaseReference {
  return ref(rtdb, `battles/${battleId}`);
}

function userInviteRef(userEmail: string): DatabaseReference {
  return ref(rtdb, `user_battle_invites/${sanitizeEmail(userEmail)}`);
}

// ─── Create Battle Challenge ─────────────────────────────────────────────────

/**
 * Creates a new 1v1 battle room in RTDB and places an invite on the target friend's invite slot.
 */
export async function createBattleChallenge({
  inviter,
  friend,
  classId,
  subjectId,
  subjectName,
  questions,
}: {
  inviter: { email: string; name: string; avatarUrl?: string | null };
  friend: { email: string; name: string; avatarUrl?: string | null };
  classId: string;
  subjectId: string;
  subjectName: string;
  questions: BattleQuestion[];
}): Promise<string> {
  const battlesListRef = ref(rtdb, "battles");
  const newBattleDocRef = push(battlesListRef);
  const battleId = newBattleDocRef.key!;

  const initialRoom: BattleRoom = {
    id: battleId,
    status: "pending",
    classId: classId || "class6",
    subjectId: subjectId || "general",
    subjectName: subjectName || "সাধারণ",
    questions,
    totalQuestions: questions.length,
    inviterEmail: inviter.email.toLowerCase(),
    invitedEmail: friend.email.toLowerCase(),
    player1: {
      email: inviter.email.toLowerCase(),
      name: inviter.name || "খেলোয়াড় ১",
      avatarUrl: inviter.avatarUrl || null,
      score: 0,
      currentQuestionIndex: 0,
      isReady: true,
      isFinished: false,
      answers: {},
    },
    player2: {
      email: friend.email.toLowerCase(),
      name: friend.name || "খেলোয়াড় ২",
      avatarUrl: friend.avatarUrl || null,
      score: 0,
      currentQuestionIndex: 0,
      isReady: false,
      isFinished: false,
      answers: {},
    },
    winnerEmail: null,
    createdAt: Date.now(),
  };

  // Write battle room
  await set(newBattleDocRef, initialRoom);

  // Send invite to friend's slot
  const inviteData: IncomingBattleInvite = {
    battleId,
    inviterName: inviter.name,
    inviterEmail: inviter.email.toLowerCase(),
    inviterAvatar: inviter.avatarUrl || null,
    subjectName,
    totalQuestions: questions.length,
    timestamp: Date.now(),
  };

  const friendInvRef = userInviteRef(friend.email);
  await set(friendInvRef, inviteData);

  return battleId;
}

// ─── Listen to Incoming Invites ──────────────────────────────────────────────

/**
 * Listens in real-time for any battle invite sent to the user.
 */
export function listenToIncomingBattleInvites(
  userEmail: string,
  callback: (invite: IncomingBattleInvite | null) => void
): () => void {
  if (!userEmail) return () => {};
  const invRef = userInviteRef(userEmail);

  onValue(
    invRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val() as IncomingBattleInvite;
        // Auto-ignore if invite is older than 60 seconds
        if (Date.now() - val.timestamp > 60000) {
          remove(invRef).catch(() => {});
          callback(null);
        } else {
          callback(val);
        }
      } else {
        callback(null);
      }
    },
    (err) => {
      console.warn("Error listening to battle invites:", err);
      callback(null);
    }
  );

  return () => off(invRef);
}

// ─── Respond to Battle Invite ────────────────────────────────────────────────

export async function acceptBattleChallenge(
  battleId: string,
  myEmail: string
): Promise<void> {
  // Clear invite notification
  const invRef = userInviteRef(myEmail);
  await remove(invRef).catch(() => {});

  // Update room status to countdown
  const bRef = battleRef(battleId);
  await update(bRef, {
    status: "countdown",
    startedAt: Date.now(),
    "player2/isReady": true,
  });
}

export async function declineBattleChallenge(
  battleId: string,
  myEmail: string
): Promise<void> {
  // Clear invite notification
  const invRef = userInviteRef(myEmail);
  await remove(invRef).catch(() => {});

  // Update room status
  const bRef = battleRef(battleId);
  await update(bRef, {
    status: "declined",
  }).catch(() => {});
}

// ─── Listen to Battle Room ───────────────────────────────────────────────────

export function listenToBattleRoom(
  battleId: string,
  callback: (room: BattleRoom | null) => void
): () => void {
  const bRef = battleRef(battleId);

  onValue(
    bRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val() as BattleRoom);
      } else {
        callback(null);
      }
    },
    (err) => {
      console.warn("Error listening to battle room:", err);
      callback(null);
    }
  );

  return () => off(bRef);
}

// ─── Gameplay Updates ────────────────────────────────────────────────────────

/**
 * Submits an answer for the current question in real-time.
 */
export async function submitBattleAnswer({
  battleId,
  playerRole,
  questionIndex,
  selectedOption,
  isCorrect,
  timeTaken,
  pointsEarned,
  newTotalScore,
  nextIndex,
  isLastQuestion,
}: {
  battleId: string;
  playerRole: "player1" | "player2";
  questionIndex: number;
  selectedOption: number;
  isCorrect: boolean;
  timeTaken: number;
  pointsEarned: number;
  newTotalScore: number;
  nextIndex: number;
  isLastQuestion: boolean;
}): Promise<void> {
  const bRef = battleRef(battleId);

  const answerPayload: PlayerAnswer = {
    selectedOption,
    isCorrect,
    timeTaken,
    points: pointsEarned,
  };

  const updates: Record<string, any> = {
    [`${playerRole}/score`]: newTotalScore,
    [`${playerRole}/currentQuestionIndex`]: nextIndex,
    [`${playerRole}/answers/${questionIndex}`]: answerPayload,
  };

  if (isLastQuestion) {
    updates[`${playerRole}/isFinished`] = true;
  }

  await update(bRef, updates);

  // Check if both players have finished to finalize the battle
  if (isLastQuestion) {
    const snap = await get(bRef);
    if (snap.exists()) {
      const room = snap.val() as BattleRoom;
      const otherRole = playerRole === "player1" ? "player2" : "player1";
      const otherFinished = room[otherRole]?.isFinished;

      if (otherFinished) {
        const p1Score = room.player1.score || 0;
        const p2Score = room.player2.score || 0;
        let winner: string | "draw" = "draw";

        if (p1Score > p2Score) {
          winner = room.player1.email;
        } else if (p2Score > p1Score) {
          winner = room.player2.email;
        }

        await update(bRef, {
          status: "completed",
          winnerEmail: winner,
          completedAt: Date.now(),
        });
      }
    }
  }
}

/**
 * Starts active question round after 3-2-1 countdown.
 */
export async function startBattleActivePhase(battleId: string): Promise<void> {
  const bRef = battleRef(battleId);
  await update(bRef, {
    status: "active",
  });
}
