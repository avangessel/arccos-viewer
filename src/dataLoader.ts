import roundsJson from '../data/rounds.json';
import type { RoundSummary, RoundDetail, HoleDetail } from './types';

// Use Vite glob import to eagerly bundle per-round JSON. This allows simple lookup.
// Pattern relative to this file (inside src/) pointing one level up to data directory.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Vite injects types
const roundModules: Record<string, any> = import.meta.glob('../data/round_*.json', { eager: true });

const summaries: RoundSummary[] = roundsJson as RoundSummary[];

// Map roundId -> RoundDetail
const roundDetailMap: Map<number, RoundDetail> = new Map();
for (const path in roundModules) {
  const data = roundModules[path];
  if (data && typeof data === 'object' && 'roundId' in data) {
    roundDetailMap.set((data as RoundDetail).roundId, data as RoundDetail);
  } else if (data?.default && typeof data.default === 'object' && 'roundId' in data.default) {
    roundDetailMap.set((data.default as RoundDetail).roundId, data.default as RoundDetail);
  }
}

export function listRounds(): RoundSummary[] {
  // Sort desc by startTime
  return [...summaries].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
}

export function getRoundDetail(roundId: number): RoundDetail | null {
  return roundDetailMap.get(roundId) || null;
}

export function getRoundSummary(roundId: number) {
  return summaries.find(s => s.roundId === roundId) || null;
}

export function computeStats(detail: RoundDetail) {
  let totalPutts = 0;
  let gir = 0;
  let fairways = 0;
  let fairwayChances = 0; // assume par 4/5 holes, but lacking par data -> approximate by: if noOfShots > 3 treat as chance
  let upDowns = 0;
  let upDownChances = 0;
  let approachDistances: number[] = [];

  for (const rawHole of detail.holes || []) {
    if (!rawHole) continue;
    const h: any = rawHole; // be tolerant of partial data
    totalPutts += (typeof h.putts === 'number' ? h.putts : 0);
    if (h.isGir === 'T') gir++;
    const shotsArr: any[] = Array.isArray(h.shots) ? h.shots : [];
    const firstShot = shotsArr[0];
    const likelyPar3 = (firstShot?.distance || 0) < 200 && (h.noOfShots || shotsArr.length) <= 4 && shotsArr.length < 5;
    if (!likelyPar3) {
      fairwayChances++;
      if (h.isFairWay === 'T') fairways++;
    }
    if (h.isUpDownChance === 'T') upDownChances++;
    if (h.isUpDown === 'T') upDowns++;
    if (h.approachShotId) {
      const app = shotsArr.find(s => s && s.shotId === h.approachShotId);
      if (app?.distance) approachDistances.push(app.distance);
    }
  }
  const avgApproachDistance = approachDistances.length ? approachDistances.reduce((a,b)=>a+b,0)/approachDistances.length : null;
  const scoringAverage = detail.noOfShots / detail.holes.length;
  return { totalPutts, gir, fairways, fairwayChances, upDowns, upDownChances, avgApproachDistance, scoringAverage };
}

export function holePolylineCoordinates(hole: HoleDetail): [number, number][] {
  // Sequence: first shot start, then each shot end sequentially until pin.
  const coords: [number, number][] = [];
  if (hole.shots.length) {
    // start point
    coords.push([hole.shots[0].startLat, hole.shots[0].startLong]);
    for (const shot of hole.shots) {
      coords.push([shot.endLat, shot.endLong]);
    }
  }
  return coords;
}

export function colorForHole(holeIndex: number, total: number) {
  const hue = (holeIndex / Math.max(total,1)) * 300; // cycle through 0-300 for variety
  return `hsl(${hue.toFixed(0)}, 75%, 55%)`;
}
