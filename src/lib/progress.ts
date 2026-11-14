// Local-only progress storage (no account, no cloud).
// "Lưu được" = survives app restart on the same phone.
// Uses the SDK 58 expo-file-system API (Paths.document + File) throughout;
// the legacy FileSystem.*Async helpers are runtime stubs in SDK 58 and
// must not be used here.
import { Paths, File } from 'expo-file-system';

export type Progress = {
  sessions: number; // completed negotiation sessions
  totalSaved: number; // total VND/month saved across sessions
  bestScore: number; // best rule-based score percent (0-100)
  updatedAt: string; // ISO timestamp
};

const EMPTY: Progress = { sessions: 0, totalSaved: 0, bestScore: 0, updatedAt: '' };

function progressFile(): File {
  return new File(Paths.document, 'dam-phan-song-progress.json');
}

export async function loadProgress(): Promise<Progress> {
  try {
    const f = progressFile();
    if (!f.exists) return EMPTY;
    const raw = await f.text();
    const parsed = JSON.parse(raw) as Partial<Progress>;
    return {
      sessions: typeof parsed.sessions === 'number' ? parsed.sessions : 0,
      totalSaved: typeof parsed.totalSaved === 'number' ? parsed.totalSaved : 0,
      bestScore: typeof parsed.bestScore === 'number' ? parsed.bestScore : 0,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : '',
    };
  } catch {
    return EMPTY;
  }
}

export async function recordSession(savedPerMonth: number, scorePercent: number): Promise<Progress> {
  const prev = await loadProgress();
  const next: Progress = {
    sessions: prev.sessions + 1,
    totalSaved: prev.totalSaved + Math.max(0, savedPerMonth),
    bestScore: Math.max(prev.bestScore, scorePercent),
    updatedAt: new Date().toISOString(),
  };
  try {
    await progressFile().write(JSON.stringify(next));
  } catch {
    // Progress is best-effort; a failed write must never break the demo.
  }
  return next;
}
