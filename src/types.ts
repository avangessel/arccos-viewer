export interface RoundSummary {
  courseName: string;
  roundId: number;
  courseId: number;
  courseVersion: number;
  startTime: string;
  endTime: string;
  noOfHoles: number;
  noOfShots: number;
  par: number;
  overUnder: number; // strokes over (+) or under (-) par
  driveHcp: number | null;
  approachHcp: number | null;
  chipHcp: number | null;
  sandHcp: number | null;
  puttHcp: number | null;
  includedInLatestHandicap?: string;
  notes?: string | null;
  roundUUID?: string | null;
  [k: string]: any; // fallback for unused fields
}

export interface Shot {
  shotId: number;
  clubType: number | null;
  clubId: number | null;
  startLat: number;
  startLong: number;
  endLat: number;
  endLong: number;
  distance: number | null;
  shotTime: string;
  shouldIgnore: string | null;
  noOfPenalties: number;
  shotUUID?: string;
  tourQuality?: { percentile: number; method: string } | null;
  [k: string]: any;
}

export interface HoleDetail {
  holeId: number;
  noOfShots: number;
  isGir: string; // 'T' / 'F'
  putts: number;
  isFairWay: string; // 'T' / 'F'
  isFairWayLeft: string;
  isFairWayRight: string;
  isUpDown?: string;
  isUpDownChance?: string;
  startTime: string;
  endTime: string;
  pinLat: number;
  pinLong: number;
  shots: Shot[];
  [k: string]: any;
}

export interface RoundDetail {
  roundId: number;
  courseId: number;
  courseName: string;
  startTime: string;
  endTime: string;
  noOfHoles: number;
  noOfShots: number;
  overUnder: number;
  holes: HoleDetail[];
  par?: number; // not included in detail file apparently
  [k: string]: any;
}

export interface ComputedRoundStats {
  totalPutts: number;
  gir: number;
  fairways: number;
  fairwayChances: number;
  upDowns: number;
  upDownChances: number;
  avgApproachDistance: number | null;
  scoringAverage: number; // strokes / holes
}
