import { useParams, Link } from 'react-router-dom';
import { getRoundDetail, getRoundSummary, computeStats, colorForHole } from './dataLoader';
import { useMemo, useState, useContext } from 'react';
import { UnitContext } from './App';
import { MapView } from './MapView';
import { HoleBreakdown } from './HoleBreakdown';
import { RoundCharts } from './RoundCharts';
import type { HoleDetail } from './types';

function formatTimeRange(startIso: string, endIso: string) {
  const s = new Date(startIso); const e = new Date(endIso);
  return s.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) + ' – ' + e.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
}

export const RoundDetail: React.FC = () => {
  const { id } = useParams();
  const { unit } = useContext(UnitContext);
  const roundId = Number(id);
  const detailRaw = getRoundDetail(roundId);
  const summary = getRoundSummary(roundId);
  const detail = detailRaw ? { ...summary, ...detailRaw } : null;
  const [focusHole, setFocusHole] = useState<number | null>(null);
  const [showAllHoles, setShowAllHoles] = useState(true);
  const [showShotMarkers, setShowShotMarkers] = useState(true);

  const stats = useMemo(() => detail ? computeStats(detail) : null, [detail]);

  if (!detail) return <div>Round not found. <Link to="/">Back</Link></div>;

  const score = detail.overUnder + (detail as any).par; // par may not exist in detail; fallback below
  const roundsPar = (detail as any).par ?? '[par?]';
  const toPar = detail.overUnder > 0 ? `+${detail.overUnder}` : detail.overUnder;

  const holes = detail.holes;

    function toggleHole(holeId: number | null) {
      if (holeId == null || focusHole === holeId) {
        setFocusHole(null);
        setShowAllHoles(true); // re-show all holes when focus cleared
      } else {
        setFocusHole(holeId);
        setShowAllHoles(false);
      }
  }

  return (
    <div>
      <div style={{display:'flex', alignItems:'center', gap:'1rem', flexWrap:'wrap'}}>
        <h2 style={{margin:'0'}}>{detail.courseName}</h2>
        <span className="pill">Round {detail.roundId}</span>
        <span className="pill">{detail.noOfHoles} Holes</span>
        <span className="pill">{new Date(detail.startTime).toLocaleDateString()}</span>
      </div>
      <div style={{marginTop:'.5rem', fontSize:'.8rem'}}>
        <strong>Score:</strong> {(detail as any).par ? `${score} (${toPar})` : `${detail.noOfShots} shots (${toPar})`} &nbsp; • &nbsp; <strong>Time:</strong> {formatTimeRange(detail.startTime, detail.endTime)}
      </div>
      {/* Handicap block relocated below stats summary */}
      <div className="divider" />
      {stats && <>
      <div className="stats-grid">
        <Stat label="Shots" value={detail.noOfShots} />
        { (detail as any).par && <Stat label="Score / Par" value={`${score}/${roundsPar}`} /> }
        <Stat label="To Par" value={toPar} />
        <Stat label="GIR" value={`${stats.gir}/${holes.length}`} />
        <Stat label="Fairways" value={`${stats.fairways}/${stats.fairwayChances}`} />
        <Stat label="Putts" value={stats.totalPutts} />
        <Stat label="Up & Down" value={`${stats.upDowns}/${stats.upDownChances}`} />
  <Stat label={`Avg Approach (${unit === 'yards'? 'yd':'m'})`} value={stats.avgApproachDistance ? (unit === 'yards'? (stats.avgApproachDistance*1.09361).toFixed(1) : stats.avgApproachDistance.toFixed(1)) : '—'} />
        <Stat label="Scoring Avg" value={stats.scoringAverage.toFixed(2)} />
  {detail.driveHcp!=null && <Stat label="Drive HCP" value={detail.driveHcp.toFixed(1)} />}
  {detail.approachHcp!=null && <Stat label="Approach HCP" value={detail.approachHcp.toFixed(1)} />}
  {detail.chipHcp!=null && <Stat label="Chip HCP" value={detail.chipHcp.toFixed(1)} />}
  {detail.sandHcp!=null && <Stat label="Sand HCP" value={detail.sandHcp.toFixed(1)} />}
  {detail.puttHcp!=null && <Stat label="Putt HCP" value={detail.puttHcp.toFixed(1)} />}
      </div>
  {/* Handicap stats now integrated in stats grid */}
      </>}
      <div className="toggle-row">
        <label><input type="checkbox" checked={showAllHoles} onChange={e=> setShowAllHoles(e.target.checked)} />Show all holes</label>
        <label><input type="checkbox" checked={showShotMarkers} onChange={e=> setShowShotMarkers(e.target.checked)} />Show shot markers</label>
          {focusHole && <button onClick={()=> { setFocusHole(null); setShowAllHoles(true); }} style={btnStyle}>Clear focus</button>}
        <Link to="/" style={btnStyle}>Back to list</Link>
      </div>
  <div className="map-container"><MapView holes={holes} focusHole={focusHole} onFocusHole={toggleHole} showAllHoles={showAllHoles} showShotMarkers={showShotMarkers} /></div>
      <div className="hole-legend">
  {holes.map((h,i)=> <div key={h.holeId} className="hole-chip" onClick={()=> toggleHole(h.holeId)} style={{opacity: focusHole && focusHole!==h.holeId? .5:1}}>
          <span className="swatch" style={{background: colorForHole(i, holes.length)}} />
          H{h.holeId}: {h.noOfShots}
          {h.isGir==='T' && <span style={{color:'#8fdc8f'}}>GIR</span>}
        </div>)}
      </div>
  {/* New transposed scorecard breakdown placed here */}
  <HoleBreakdown holes={holes} focusHole={focusHole} onFocusHole={toggleHole} />
  <RoundCharts detail={detail} />
    </div>
  );
};

const btnStyle: React.CSSProperties = { background:'#243040', color:'#fff', border:'1px solid #314252', padding:'.4rem .65rem', fontSize:'.65rem', borderRadius:4, cursor:'pointer' };

const Stat: React.FC<{label:string; value: any}> = ({label, value}) => (
  <div className="stat"><h4>{label}</h4><div>{value}</div></div>
);

// (Old Scorecard table removed; replaced by transposed HoleBreakdown above charts.)
