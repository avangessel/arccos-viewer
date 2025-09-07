import React, { useMemo, useContext, useState, useEffect } from 'react';
import { listRounds, getRoundDetail, computeStats } from './dataLoader';
import { UnitContext } from './App';
import './overall.css';

const OverallCharts = React.lazy(() => import('./OverallCharts').then(m => ({ default: m.OverallCharts })));

export interface Aggregated {
  rounds: number;
  holes: number; shots: number;
  gir: number; girChances: number; girPct: number | null;
  fairways: number; fairwayChances: number; fairwayPct: number | null;
  upDowns: number; upDownChances: number; upDownPct: number | null;
  putts: number; avgPuttsPerHole: number | null; avgPuttsPerRound: number | null;
  totalPar: number | null; totalStrokes: number | null; aggOverUnder: number | null; scoringAvg: number | null;
  avgApproach: number | null; medianApproach: number | null;
  driveHcpAvg: number | null; approachHcpAvg: number | null; chipHcpAvg: number | null; sandHcpAvg: number | null; puttHcpAvg: number | null;
  distanceByClub: { club: string; avg: number; max: number }[];
  distanceBuckets: { range: string; count: number }[];
  approachScatter: { hole: number; distance: number; shot: number }[];
  scoringSeries: { idx: number; date: string; scoreAvg: number; rolling: number | null; overUnder: number | null }[];
  girFairwaySeries: { idx: number; date: string; girPct: number; fairwayPct: number; girRolling: number | null; fairwayRolling: number | null }[];
}

export const OverallStats: React.FC = () => {
  const allRounds = listRounds();
  const { unit, toDisplay } = useContext(UnitContext);
  // Filters
  const [courseId, setCourseId] = useState<string>('all');
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');
  // Trend config
  const [rollingWindow, setRollingWindow] = useState<number>(5);
  const [scoreTarget, setScoreTarget] = useState<string>(''); // score per hole target
  const [girTarget, setGirTarget] = useState<string>(''); // percent
  const [fairwayTarget, setFairwayTarget] = useState<string>('');

  // Load persisted settings
  useEffect(()=> {
    try {
      const raw = localStorage.getItem('overallSettings');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.courseId !== undefined) setCourseId(parsed.courseId);
        if (parsed.from !== undefined) setFrom(parsed.from);
        if (parsed.to !== undefined) setTo(parsed.to);
        if (parsed.rollingWindow !== undefined) setRollingWindow(parsed.rollingWindow);
        if (parsed.scoreTarget !== undefined) setScoreTarget(String(parsed.scoreTarget));
        if (parsed.girTarget !== undefined) setGirTarget(String(parsed.girTarget));
        if (parsed.fairwayTarget !== undefined) setFairwayTarget(String(parsed.fairwayTarget));
      }
    } catch {}
  }, []);
  // Persist when changes happen
  useEffect(()=> {
    try {
      localStorage.setItem('overallSettings', JSON.stringify({ courseId, from, to, rollingWindow, scoreTarget, girTarget, fairwayTarget }));
    } catch {}
  }, [courseId, from, to, rollingWindow, scoreTarget, girTarget, fairwayTarget]);

  const filteredRounds = useMemo(()=> {
    return allRounds.filter(r => {
      if (courseId !== 'all' && String(r.courseId) !== courseId) return false;
      if (from && new Date(r.startTime) < new Date(from)) return false;
      if (to && new Date(r.startTime) > new Date(to + 'T23:59:59')) return false;
      return true;
    });
  }, [allRounds, courseId, from, to]);

  const agg: Aggregated = useMemo(() => {
    let holes = 0, shots = 0;
    let gir = 0, fairways = 0, fairwayChances = 0; let upDowns = 0, upDownChances = 0; let putts = 0;
    let approachDistances: number[] = [];
    let driveH: number[] = [], approachH: number[] = [], chipH: number[] = [], sandH: number[] = [], puttH: number[] = [];
    let totalPar = 0, totalStrokes = 0, countedPars = 0;
    const allShots: any[] = [];
    const approachShotPoints: { hole: number; distance: number; shot: number }[] = [];
  const scoringSeriesRaw: { date: Date; scoreAvg: number; overUnder: number | null; course: string }[] = [];
  const girFairwayRaw: { date: Date; girPct: number; fairwayPct: number; course: string }[] = [];
  filteredRounds.forEach(r => {
      const detail = getRoundDetail(r.roundId);
      if (!detail || !Array.isArray(detail.holes)) return;
      const stats = computeStats(detail);
      holes += detail.holes.length;
      shots += detail.noOfShots || 0;
      gir += stats.gir; fairways += stats.fairways; fairwayChances += stats.fairwayChances; upDowns += stats.upDowns; upDownChances += stats.upDownChances; putts += stats.totalPutts;
      if (stats.avgApproachDistance) approachDistances.push(stats.avgApproachDistance);
      if (r.driveHcp!=null) driveH.push(r.driveHcp);
      if (r.approachHcp!=null) approachH.push(r.approachHcp);
      if (r.chipHcp!=null) chipH.push(r.chipHcp);
      if (r.sandHcp!=null) sandH.push(r.sandHcp);
      if (r.puttHcp!=null) puttH.push(r.puttHcp);
      if (typeof r.par === 'number' && typeof r.overUnder === 'number') { totalPar += r.par; totalStrokes += (r.par + r.overUnder); countedPars++; }
      for (const h of detail.holes) {
        if (!h || !Array.isArray(h.shots)) continue;
        for (const s of h.shots) {
          if (!s || s.shouldIgnore === 'T' || !s.distance || s.clubType === 12) continue;
          allShots.push(s);
        }
        if (h.approachShotId) {
          const s = h.shots.find(x=> x.shotId === h.approachShotId);
          if (s?.distance) approachShotPoints.push({ hole: h.holeId, distance: s.distance, shot: s.shotId });
        }
      }
      // per-round scoring average and percentages
      const roundHoles = detail.holes.length || 0;
      if (roundHoles) {
        const scoreAvg = detail.noOfShots / roundHoles;
  scoringSeriesRaw.push({ date: new Date(r.startTime), scoreAvg, overUnder: (typeof r.overUnder === 'number'? r.overUnder: null), course: r.courseName });
        const girPctRound = stats.gir / roundHoles * 100;
        const fwPctRound = stats.fairwayChances? (stats.fairways / stats.fairwayChances * 100): 0;
  girFairwayRaw.push({ date: new Date(r.startTime), girPct: girPctRound, fairwayPct: fwPctRound, course: r.courseName });
      }
    });
  const roundsCount = filteredRounds.length;
    const avgApproach = approachDistances.length? (approachDistances.reduce((a,b)=>a+b,0)/approachDistances.length): null;
    const scoringAvg = holes? shots/holes: null;
    const avg = (arr:number[]) => arr.length? arr.reduce((a,b)=>a+b,0)/arr.length: null;
    const median = (arr:number[]) => { if(!arr.length) return null; const s=[...arr].sort((a,b)=>a-b); const m=Math.floor(s.length/2); return s.length%2? s[m] : (s[m-1]+s[m])/2; };
    const girPct = holes? (gir/holes)*100 : null;
    const fairwayPct = fairwayChances? (fairways/fairwayChances)*100 : null;
    const upDownPct = upDownChances? (upDowns/upDownChances)*100 : null;
    const avgPuttsPerHole = holes? putts/holes : null;
    const avgPuttsPerRound = roundsCount? putts/roundsCount : null;
    const aggOverUnder = (countedPars && totalStrokes && totalPar) ? (totalStrokes - totalPar) : null;
    const medianApproach = median(approachDistances);
    const factor = unit === 'yards'? 1.09361 : 1;
    const byClub: Record<string,{club:string; distances:number[]}> = {};
    allShots.forEach(s=> { const key = clubLabel(s.clubType); if(!byClub[key]) byClub[key]={club:key,distances:[]}; byClub[key].distances.push(s.distance); });
    const distanceByClub = Object.values(byClub).map(v=> { const avgM=v.distances.reduce((a,b)=>a+b,0)/v.distances.length; const maxM=Math.max(...v.distances); return { club:v.club, avg:+(avgM*factor).toFixed(1), max:+(maxM*factor).toFixed(1) }; }).sort((a,b)=> a.avg-b.avg);
    const bucketSizeBase=50; const bucketSize = unit==='yards'? Math.round(bucketSizeBase*1.09361): bucketSizeBase; const buckets:Record<string,number>={};
    allShots.forEach(s=> { const dist=s.distance*factor; const b=Math.floor(dist/bucketSize); const start=b*bucketSize; const end=start+bucketSize; const label=`${start}-${end}`; buckets[label]=(buckets[label]||0)+1; });
    const distanceBuckets = Object.entries(buckets).map(([range,count])=>({range,count})).sort((a,b)=> parseInt(a.range)-parseInt(b.range));
    const approachScatter = approachShotPoints.map(p=> ({ hole:p.hole, distance:+(p.distance*factor).toFixed(1), shot:p.shot }));
    // Build sorted series with rolling average (window 5)
    scoringSeriesRaw.sort((a,b)=> a.date.getTime() - b.date.getTime());
    girFairwayRaw.sort((a,b)=> a.date.getTime() - b.date.getTime());
    const win = Math.max(1, Math.min(rollingWindow, 30));
    const scoringSeries = scoringSeriesRaw.map((d,i,arr)=> {
      const start = Math.max(0, i-(win-1));
      const slice = arr.slice(start, i+1);
      const rolling = slice.length? slice.reduce((a,b)=> a + b.scoreAvg,0)/slice.length: null;
      return { idx: i+1, date: d.date.toISOString().split('T')[0], scoreAvg: +d.scoreAvg.toFixed(2), rolling: rolling? +rolling.toFixed(2): null, overUnder: d.overUnder, course: d.course };
    });
    const girFairwaySeries = girFairwayRaw.map((d,i,arr)=> {
      const start = Math.max(0, i-(win-1));
      const slice = arr.slice(start, i+1);
      const girRolling = slice.length? slice.reduce((a,b)=> a + b.girPct,0)/slice.length : null;
      const fairwayRolling = slice.length? slice.reduce((a,b)=> a + b.fairwayPct,0)/slice.length : null;
      return { idx: i+1, date: d.date.toISOString().split('T')[0], girPct: +d.girPct.toFixed(1), fairwayPct: +d.fairwayPct.toFixed(1), course: d.course, girRolling: girRolling!=null? +girRolling.toFixed(1): null, fairwayRolling: fairwayRolling!=null? +fairwayRolling.toFixed(1): null };
    });
    return {
      rounds: roundsCount,
      holes, shots,
      gir, girChances: holes, girPct,
      fairways, fairwayChances, fairwayPct,
      upDowns, upDownChances, upDownPct,
      putts, avgPuttsPerHole, avgPuttsPerRound,
      totalPar: countedPars? totalPar: null, totalStrokes: countedPars? totalStrokes: null, aggOverUnder,
      scoringAvg,
      avgApproach,
      medianApproach,
      driveHcpAvg: avg(driveH), approachHcpAvg: avg(approachH), chipHcpAvg: avg(chipH), sandHcpAvg: avg(sandH), puttHcpAvg: avg(puttH),
      distanceByClub, distanceBuckets, approachScatter
      , scoringSeries, girFairwaySeries
    };
  }, [filteredRounds, unit, rollingWindow]);

  const resetAll = () => {
    setCourseId('all'); setFrom(''); setTo(''); setRollingWindow(5); setScoreTarget(''); setGirTarget(''); setFairwayTarget('');
    try { localStorage.removeItem('overallSettings'); } catch {}
  };

  return (
    <div>
      <h2 className="overall-title">Overall Stats</h2>
      <div className="filters-row">
        <div>
          <label>Course</label>
          <select value={courseId} onChange={e=> setCourseId(e.target.value)} aria-label="Course Filter" title="Course Filter">
            <option value="all">All</option>
            {Array.from(new Map(allRounds.map(r=> [r.courseId, r.courseName])).entries()).map(([id,name])=> <option key={id} value={id}>{name}</option>)}
          </select>
        </div>
        <div>
          <label>From</label>
          <input type="date" value={from} onChange={e=> setFrom(e.target.value)} aria-label="From Date" title="From Date" />
        </div>
        <div>
          <label>To</label>
          <input type="date" value={to} onChange={e=> setTo(e.target.value)} aria-label="To Date" title="To Date" />
        </div>
        <div>
          <label>Rolling Window</label>
          <input type="number" min={1} max={30} value={rollingWindow} onChange={e=> setRollingWindow(Number(e.target.value)||1)} aria-label="Rolling Window" title="Rolling Window Size" />
        </div>
        <div>
          <label>Score Target (per hole)</label>
          <input type="number" step="0.01" value={scoreTarget} onChange={e=> setScoreTarget(e.target.value)} aria-label="Score Target" title="Score Target Per Hole" />
        </div>
        <div>
          <label>GIR Target %</label>
          <input type="number" step="0.1" value={girTarget} onChange={e=> setGirTarget(e.target.value)} aria-label="GIR Target" title="GIR Target Percent" />
        </div>
        <div>
          <label>Fairway Target %</label>
          <input type="number" step="0.1" value={fairwayTarget} onChange={e=> setFairwayTarget(e.target.value)} aria-label="Fairway Target" title="Fairway Target Percent" />
        </div>
        <div className="inline-note">Showing {filteredRounds.length} / {allRounds.length} rounds</div>
        <div>
          <button type="button" onClick={resetAll} aria-label="Reset Filters" title="Reset Filters & Settings" className="reset-btn">Reset</button>
        </div>
      </div>
      <div className="stats-grid overall-stats-grid">
        <Stat label="Rounds" value={agg.rounds} />
        <Stat label="Holes" value={agg.holes} />
        <Stat label="Shots" value={agg.shots} />
        <Stat label="GIR" value={`${agg.gir}/${agg.girChances}${agg.girPct!=null? ` (${agg.girPct.toFixed(1)}%)`:''}`} />
        <Stat label="Fairways" value={`${agg.fairways}/${agg.fairwayChances}${agg.fairwayPct!=null? ` (${agg.fairwayPct.toFixed(1)}%)`:''}`} />
        <Stat label="Up & Down" value={`${agg.upDowns}/${agg.upDownChances}${agg.upDownPct!=null? ` (${agg.upDownPct.toFixed(1)}%)`:''}`} />
        <Stat label="Putts" value={agg.putts} />
        <Stat label="Putts / Hole" value={agg.avgPuttsPerHole!=null? agg.avgPuttsPerHole.toFixed(2): '—'} />
        <Stat label="Putts / Round" value={agg.avgPuttsPerRound!=null? agg.avgPuttsPerRound.toFixed(1): '—'} />
        <Stat label="Total Par" value={agg.totalPar!=null? agg.totalPar: '—'} />
        <Stat label="Total Strokes" value={agg.totalStrokes!=null? agg.totalStrokes: '—'} />
        <Stat label="Agg +/-" value={agg.aggOverUnder!=null? (agg.aggOverUnder>0? `+${agg.aggOverUnder}`: agg.aggOverUnder): '—'} />
        <Stat label="Scoring Avg" value={agg.scoringAvg? agg.scoringAvg.toFixed(2): '—'} />
        <Stat label={`Avg Approach (${unit==='yards'? 'yd':'m'})`} value={agg.avgApproach ? toDisplay(agg.avgApproach): '—'} />
        <Stat label={`Median Approach (${unit==='yards'? 'yd':'m'})`} value={agg.medianApproach ? toDisplay(agg.medianApproach): '—'} />
        {agg.driveHcpAvg!=null && <Stat label="Drive HCP" value={agg.driveHcpAvg.toFixed(1)} />}
        {agg.approachHcpAvg!=null && <Stat label="Approach HCP" value={agg.approachHcpAvg.toFixed(1)} />}
        {agg.chipHcpAvg!=null && <Stat label="Chip HCP" value={agg.chipHcpAvg.toFixed(1)} />}
        {agg.sandHcpAvg!=null && <Stat label="Sand HCP" value={agg.sandHcpAvg.toFixed(1)} />}
        {agg.puttHcpAvg!=null && <Stat label="Putt HCP" value={agg.puttHcpAvg.toFixed(1)} />}
      </div>
  <React.Suspense fallback={<div className="charts-loading">Loading charts…</div>}>
    <OverallCharts agg={agg} unit={unit} rollingWindow={rollingWindow} scoreTarget={scoreTarget} girTarget={girTarget} fairwayTarget={fairwayTarget} />
  </React.Suspense>
    </div>
  );
};

const Stat: React.FC<{label:string; value:any}> = ({label, value}) => <div className="stat"><h4>{label}</h4><div>{value}</div></div>;

function clubLabel(clubType: number | null) {
  if (clubType == null) return '—';
  const map: Record<number, string> = { 1:'Driver',2:'3W',3:'5W',6:'Hybrid',7:'3i',8:'4i',9:'5i',10:'6i',11:'7i',47:'8i',51:'9i',55:'Wedge',12:'Putter',36:'FW/Util' };
  return map[clubType] || String(clubType);
}

// Charts moved to lazy-loaded module OverallCharts.tsx for code-splitting.
