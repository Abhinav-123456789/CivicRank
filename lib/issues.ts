import { User } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  increment,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  location: any;
  coords?: { lat: number; lng: number };
  upvotes: number;
  status: "open" | "in-progress" | "resolved";
  priorityLevel: "low" | "medium" | "high" | "emergency";
  createdBy: string;
  createdAt: any;
  cluster?: string;
  imageUrl?: string;
  priorityScore?: number;
  /** How many times this issue has been independently reported */
  reportCount?: number;
  /** UIDs of users who reported this issue */
  reporters?: string[];
  /** true when upvotes >= 3 (community verified) */
  isVerified?: boolean;
  /** UIDs of users who upvoted (prevents duplicate votes) */
  upvotedBy?: string[];
}

// ─── Verification helper ──────────────────────────────────────────────────────

/**
 * Client-side fallback: compute isVerified from upvotes.
 * Use this when reading old docs that may not have the field.
 */
export const isIssueVerified = (issue: Issue): boolean => {
  // Prefer the stored field; fall back to computing from upvotes
  if (typeof issue.isVerified === 'boolean') return issue.isVerified;
  return (issue.upvotes ?? 0) >= 3;
};

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  totalIssues: number;
  totalUpvotes: number;
  rank: number;
}

// ─── Priority Scoring ─────────────────────────────────────────────────────────

export const getPriorityScore = (issue: Issue): number => {
  let score = issue.upvotes * 2;
  if (issue.priorityLevel === "emergency") score += 100;
  else if (issue.priorityLevel === "high") score += 50;
  else if (issue.priorityLevel === "medium") score += 20;
  else score += 5;
  // Each additional confirmed report adds weight
  if (issue.reportCount && issue.reportCount > 1) score += (issue.reportCount - 1) * 10;
  return score;
};

// ─── Category detection (client-side convenience helper) ─────────────────────

const detectCategory = (description: string, title: string): string => {
  const text = `${title} ${description}`.toLowerCase();
  const categories: { [key: string]: string[] } = {
    pothole: ["pothole", "hole", "pavement", "crack", "damaged road"],
    streetlight: ["light", "streetlight", "dark", "lamp", "broken light"],
    water: ["water", "leak", "flood", "drainage", "pipe", "puddle"],
    waste: ["waste", "trash", "garbage", "litter", "rubbish", "debris"],
    traffic: ["traffic", "congestion", "jam", "sign", "signal"],
  };
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some((keyword) => text.includes(keyword))) return category;
  }
  return "other";
};

// ─── Issue CRUD — all directly via Firestore ─────────────────────────────────

export const createIssue = async (
  data: {
    title: string;
    description: string;
    category?: string;
    location?: string;
    coords?: { lat: number; lng: number };
    priorityLevel?: "low" | "medium" | "high" | "emergency";
    imageUrl?: string;
  },
  user: User
) => {
  const detectedCategory = data.category || detectCategory(data.description, data.title);
  const detectedLocation = data.location || "Auto-detected";

  const issueData: any = {
    title: data.title,
    description: data.description,
    category: detectedCategory,
    location: detectedLocation,
    coords: data.coords ?? null,
    priorityLevel: data.priorityLevel || "low",
    upvotes: 0,
    status: "open",
    createdBy: user.uid,
    createdAt: serverTimestamp(),
    cluster: "Main District",
    reportCount: 1,
    reporters: [user.uid],
  };

  if (data.imageUrl) issueData.imageUrl = data.imageUrl;

  const docRef = await addDoc(collection(db, "issues"), issueData);
  return { id: docRef.id, ...issueData };
};

export const getIssues = async (): Promise<Issue[]> => {
  const q = query(collection(db, "issues"));
  const snapshot = await getDocs(q);
  const issues = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Issue[];
  return issues.sort((a, b) => getPriorityScore(b) - getPriorityScore(a));
};

export const getIssuesByLocation = async (location: string): Promise<Issue[]> => {
  const q = query(collection(db, "issues"));
  const snapshot = await getDocs(q);
  const allIssues = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Issue[];

  const locationLower = location.toLowerCase();
  const filtered = allIssues.filter((issue) => {
    if (typeof issue.location === "string") {
      return issue.location.toLowerCase().includes(locationLower);
    }
    return true;
  });
  return filtered.sort((a, b) => getPriorityScore(b) - getPriorityScore(a));
};

export const getIssueById = async (issueId: string): Promise<Issue | null> => {
  const docRef = doc(db, "issues", issueId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() } as Issue;
  return null;
};

export const updateIssueStatus = async (
  issueId: string,
  status: "open" | "in-progress" | "resolved"
) => {
  await updateDoc(doc(db, "issues", issueId), { status });
};

export const upvoteIssue = async (issueId: string) => {
  await updateDoc(doc(db, "issues", issueId), { upvotes: increment(1) });
};

export const deleteIssue = async (issueId: string) => {
  await deleteDoc(doc(db, "issues", issueId));
};

// ─── User / Auth helpers ──────────────────────────────────────────────────────

export const getUserRole = async (userId: string): Promise<"user" | "admin"> => {
  // NOTE: This is UI-only routing. Real security is enforced via Firestore rules.
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) return userDoc.data()?.role || "user";
  } catch {
    // If fetch fails, default to non-admin for safety
  }
  return "user";
};

export const createUserProfile = async (
  userId: string,
  data: { name: string; email: string; role?: "user" | "admin" }
) => {
  await setDoc(
    doc(db, "users", userId),
    { ...data, role: data.role || "user", createdAt: serverTimestamp() },
    { merge: true }
  );
};

// ─── Leaderboard ─────────────────────────────────────────────────────────────

export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  const issues = await getIssues();
  const userStats: { [userId: string]: { totalIssues: number; totalUpvotes: number } } = {};

  issues.forEach((issue) => {
    if (!userStats[issue.createdBy]) {
      userStats[issue.createdBy] = { totalIssues: 0, totalUpvotes: 0 };
    }
    userStats[issue.createdBy].totalIssues += 1;
    userStats[issue.createdBy].totalUpvotes += issue.upvotes;
  });

  const leaderboard: LeaderboardEntry[] = Object.entries(userStats).map(([userId, stats]) => ({
    userId,
    userName: "Community Member",
    totalIssues: stats.totalIssues,
    totalUpvotes: stats.totalUpvotes,
    rank: 0,
  }));

  leaderboard.sort((a, b) =>
    b.totalUpvotes !== a.totalUpvotes
      ? b.totalUpvotes - a.totalUpvotes
      : b.totalIssues - a.totalIssues
  );

  leaderboard.forEach((entry, index) => {
    entry.rank = index + 1;
  });

  return leaderboard;
};
