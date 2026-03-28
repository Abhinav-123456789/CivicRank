import { db } from "./firebase";
import { getEffectivePriority } from "./smartGovernance";
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs,
  updateDoc, 
  onSnapshot,
  increment,
  arrayUnion,
  runTransaction,
  query,
  deleteDoc
} from "firebase/firestore";

export interface IssueData {
  id: string;
  category?: string;
  coords?: { lat: number; lng: number };
  location?: any;
  reportCount?: number;
  reporters?: string[];
  [key: string]: any;
}

const processIssuesData = (issuesData: IssueData[]) => {
  const getIssueCreatedAtMillis = (issue: any) => {
    if (!issue.createdAt) return Date.now();
    return issue.createdAt instanceof Date 
      ? issue.createdAt.getTime() 
      : issue.createdAt?.toMillis?.() || Date.now();
  }

  let processed = issuesData.map(issue => {
    const millis = getIssueCreatedAtMillis(issue);
    return {
      ...issue,
      createdAtMillis: millis,
      effectivePriority: getEffectivePriority(issue.priorityLevel || "low", millis)
    }
  });

  const hasEmergency = processed.some(i => i.effectivePriority === "emergency");
  if (!hasEmergency && processed.length > 0) {
    const oldestIssue = processed.reduce((oldest, current) => current.createdAtMillis < oldest.createdAtMillis ? current : oldest);
    const oldestIndex = processed.findIndex(i => i.id === oldestIssue.id);
    if (oldestIndex !== -1) {
      processed[oldestIndex].effectivePriority = "emergency";
    }
  }

  const PRIORITY_WEIGHTS = { "low": 1, "medium": 2, "high": 3, "emergency": 5 };

  return processed.sort((a, b) => {
    const wA = PRIORITY_WEIGHTS[a.effectivePriority as keyof typeof PRIORITY_WEIGHTS] || 1;
    const wB = PRIORITY_WEIGHTS[b.effectivePriority as keyof typeof PRIORITY_WEIGHTS] || 1;
    if (wB !== wA) return wB - wA;
    return a.createdAtMillis - b.createdAtMillis;
  });
};

export const subscribeToIssues = (callback: (issues: IssueData[]) => void) => {
  const q = query(collection(db, "issues")); // Option to add orderBy("createdAt", "desc") if preferred
  return onSnapshot(q, (snapshot) => {
    const rawIssues = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(processIssuesData(rawIssues));
  }, (error) => {
    console.error("Error subscribing to issues:", error);
  });
};

export const getIssueById = async (id: string): Promise<IssueData | null> => {
  try {
    const docRef = doc(db, "issues", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("Error fetching issue by ID:", error);
    return null;
  }
};

/**
 * @deprecated Use upvoteIssueForUser(id, userId) instead.
 * This function bypasses duplicate-vote prevention and isVerified logic.
 * Retained only for backwards compatibility — throws if called directly.
 */
export const upvoteIssue = async (_id: string): Promise<never> => {
  throw new Error(
    "[upvoteIssue] Deprecated. Use upvoteIssueForUser(id, userId) to ensure dedup and verification consistency."
  );
};

/**
 * Atomically upvotes an issue for a specific user.
 * - Uses a Firestore transaction to prevent race conditions.
 * - Prevents duplicate votes via `upvotedBy` array.
 * - Sets `isVerified = true` once upvotes >= 3.
 * Returns 'ok' | 'already_voted'
 */
export const upvoteIssueForUser = async (
  id: string,
  userId: string
): Promise<'ok' | 'already_voted'> => {
  const docRef = doc(db, "issues", id);
  return await runTransaction(db, async (tx) => {
    const snap = await tx.get(docRef);
    if (!snap.exists()) throw new Error("Issue not found");

    const data = snap.data();
    const upvotedBy: string[] = data.upvotedBy ?? [];

    if (upvotedBy.includes(userId)) return 'already_voted';

    const newUpvotes = (data.upvotes ?? 0) + 1;
    tx.update(docRef, {
      upvotes: increment(1),
      upvotedBy: arrayUnion(userId),
      isVerified: newUpvotes >= 3,
    });
    return 'ok';
  });
};

export const verifyIssue = async (id: string) => {
  try {
    const docRef = doc(db, "issues", id);
    await updateDoc(docRef, {
      verifications: increment(1)
    });
  } catch (error) {
    console.error("Error verifying issue:", error);
    throw error;
  }
};

export const updateIssueStatus = async (id: string, status: string) => {
  try {
    const docRef = doc(db, "issues", id);
    await updateDoc(docRef, { status });
  } catch (error) {
    console.error("Error updating issue status:", error);
    throw error;
  }
};

export const deleteIssue = async (id: string) => {
  try {
    const docRef = doc(db, "issues", id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting issue:", error);
    throw error;
  }
};

// ─── Duplicate Detection ─────────────────────────────────────────────────────

/** Haversine great-circle distance between two lat/lng points, in metres. */
export const haversineDistance = (
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number => {
  const R = 6371000 // Earth radius in metres
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const sinDLat = Math.sin(dLat / 2)
  const sinDLng = Math.sin(dLng / 2)
  const x =
    sinDLat * sinDLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinDLng * sinDLng
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

/**
 * Checks whether an issue with the same category already exists within
 * `thresholdMetres` of `coords`. Returns the matching IssueData or null.
 * Falls back to category-only match when coords are absent.
 */
export const detectDuplicate = async (
  category: string,
  coords: { lat: number; lng: number } | null,
  thresholdMetres = 500
): Promise<IssueData | null> => {
  try {
    const snapshot = await getDocs(collection(db, "issues"))
    const candidates = snapshot.docs
      .map(d => ({ id: d.id, ...d.data() } as IssueData))
      .filter(issue => {
        // Must be same category (case-insensitive)
        if ((issue.category || "").toLowerCase() !== category.toLowerCase()) return false

        // If we have GPS coords, check proximity
        if (coords) {
          const issueCoords =
            issue.coords ??
            (typeof issue.location === "object" && issue.location?.lat
              ? { lat: issue.location.lat, lng: issue.location.lng }
              : null)

          if (issueCoords) {
            return haversineDistance(coords, issueCoords) <= thresholdMetres
          }
          // No coords on the stored issue → treat as potential match if same category
          return true
        }

        // No GPS on new report → match on category alone
        return true
      })

    return candidates.length > 0 ? candidates[0] : null
  } catch (error) {
    console.error("[detectDuplicate] error:", error)
    return null
  }
}

/**
 * Merges a new report into an existing duplicate issue:
 * increments reportCount and appends userId to the reporters array.
 */
export const mergeDuplicateReport = async (
  existingIssueId: string,
  userId: string
): Promise<void> => {
  const docRef = doc(db, "issues", existingIssueId)
  await updateDoc(docRef, {
    reportCount: increment(1),
    reporters: arrayUnion(userId),
  })
}
