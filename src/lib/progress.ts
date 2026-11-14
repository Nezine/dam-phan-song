// Local-only progress storage (no account, no cloud).
// "Lưu được" = survives app restart on the same phone.
// Uses the SDK 58 expo-file-system API: Paths.document for the directory,
// legacy read/write helpers for the JSON file itself.
import * as FileSystem from 'expo-file-system';
import { Paths, File } from 'expo-file-system';

export type Progress = {
  sessions: number; // completed negotiation sessions
  totalSaved: number; // total VND/month saved across sessions
  bestScore: number; // best rule-based score percent (0-100)
  updatedAt: string; // ISO timestamp
};

const EMPTY: Progress = { sessions: 0, totalSaved: 0, bestScore: 0, updatedAt: '' };

function fileUri(): string {
  return new File(Paths.document, 'dam-phan-song-progress.json').uri;
}

export async function loadProgress(): Promise<Progress> {
  try {
    const uri = fileUri();
    const info = await FileSystem.getInfoAsync(uri);
    if (!info.exists) return EMPTY;
    const raw = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.UTF8,
    });
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
    await FileSystem.writeAsStringAsync(fileUri(), JSON.stringify(next), {
      encoding: FileSystem.EncodingType.UTF8,
    });
  } catch {
    // Progress is best-effort; a failed write must never break the demo.
  }
  return next;
}
