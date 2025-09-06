import type { HoleDetail } from './types';
import { useContext } from 'react';
import { UnitContext } from './App';

interface HoleBreakdownProps {
  holes: HoleDetail[];
  focusHole: number | null;
  onFocusHole: (holeId: number) => void;
}

export const HoleBreakdown: React.FC<HoleBreakdownProps> = ({ holes, focusHole, onFocusHole }) => {
  const { unit } = useContext(UnitContext);
  // Pre-compute stat rows
  const rows: ScorecardRow[] = buildRows(holes, unit);
  const totalDistance = holes.map(h=> h.shots.reduce((a,s)=> a + (s.distance||0),0)).reduce((a,b)=> a+b, 0);
  const totalPutts = holes.reduce((a,h)=> a + (h.putts||0),0);
  const totalShots = holes.reduce((a,h)=> a + h.noOfShots,0);
  const girCount = holes.filter(h=> h.isGir==='T').length;
  const fairwayCount = holes.filter(h=> h.isFairWay==='T').length;
  const upDownCount = holes.filter(h=> h.isUpDown==='T').length;

  return (
    <div style={{marginTop:'1.5rem'}}>
      <h3 style={{margin:'0 0 .75rem', fontSize:'1rem'}}>Scorecard Breakdown</h3>
      <div style={{overflowX:'auto'}}>
        <table style={{borderCollapse:'collapse', minWidth: holes.length * 80 + 220}}>
          <thead>
            <tr>
              <th style={hCellLeft}>Stat</th>
              {holes.map(h=> (
                <th key={h.holeId} style={{...hCell, background: focusHole===h.holeId? '#28405a':'#1a232d', cursor:'pointer'}} onClick={()=> onFocusHole(h.holeId)}>
                  H{h.holeId}
                </th>
              ))}
              <th style={hCell}>Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.label}>
                <td style={leftLabel}>{r.label}</td>
                {r.values.map((v,i)=> <td key={i} style={{...cell, background: focusHole===holes[i].holeId? '#22313f':'#161d27'}}>{v}</td>)}
                <td style={cell}>{aggregateForRow(r.label, { totalShots, totalPutts, girCount, fairwayCount, upDownCount, totalDistance, holes })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface ScorecardRow { label: string; values: (string|number)[]; }

function buildRows(holes: HoleDetail[], unit: 'meters' | 'yards'): ScorecardRow[] {
  const shots: ScorecardRow = { label: 'Shots', values: holes.map(h=> h.noOfShots) };
  const putts: ScorecardRow = { label: 'Putts', values: holes.map(h=> h.putts ?? '') };
  const gir: ScorecardRow = { label: 'GIR', values: holes.map(h=> h.isGir==='T'? '✓':'') };
  const fairway: ScorecardRow = { label: 'Fairway', values: holes.map(h=> h.isFairWay==='T'? '✓':'') };
  const upDown: ScorecardRow = { label: 'Up & Down', values: holes.map(h=> h.isUpDown==='T'? '✓':'') };
  const distLabel = unit === 'yards'? 'Total Dist (yd)' : 'Total Dist (m)';
  const dist: ScorecardRow = { label: distLabel, values: holes.map(h=> {
    const m = h.shots.reduce((a,s)=> a + (s.distance||0), 0);
    return Math.round(unit === 'yards'? m * 1.09361 : m);
  }) };
  const start: ScorecardRow = { label: 'Start', values: holes.map(h=> formatTime(h.shots[0]?.shotTime)) };
  const end: ScorecardRow = { label: 'End', values: holes.map(h=> formatTime(h.shots[h.shots.length-1]?.shotTime)) };
  const dur: ScorecardRow = { label: 'Duration (m)', values: holes.map(h=> durationMinutes(h.shots[0]?.shotTime, h.shots[h.shots.length-1]?.shotTime)) };
  return [shots, putts, gir, fairway, upDown, dist, start, end, dur];
}

function aggregateForRow(label: string, ctx: { totalShots: number; totalPutts: number; girCount: number; fairwayCount: number; upDownCount: number; totalDistance: number; holes: HoleDetail[] }) {
  const holesLen = ctx.holes.length;
  switch(label) {
    case 'Shots': return ctx.totalShots;
    case 'Putts': return ctx.totalPutts;
    case 'GIR': return `${ctx.girCount}/${holesLen}`;
    case 'Fairway': return `${ctx.fairwayCount}/${holesLen}`;
    case 'Up & Down': return `${ctx.upDownCount}/${holesLen}`;
  case 'Total Dist (m)': return Math.round(ctx.totalDistance);
  case 'Total Dist (yd)': return Math.round(ctx.totalDistance * 1.09361);
    case 'Start': return formatTime(ctx.holes[0].shots[0]?.shotTime);
    case 'End': return formatTime(ctx.holes[ctx.holes.length-1].shots[ctx.holes[ctx.holes.length-1].shots.length-1]?.shotTime);
    case 'Duration (m)': {
      const first = ctx.holes[0].shots[0]?.shotTime;
      const lastHole = ctx.holes[ctx.holes.length-1];
      const last = lastHole.shots[lastHole.shots.length-1]?.shotTime;
      return durationMinutes(first, last);
    }
  }
  return '';
}

function formatTime(iso?: string) {
  if(!iso) return '';
  return new Date(iso).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
}
function durationMinutes(startIso?: string, endIso?: string) {
  if(!startIso || !endIso) return '';
  const ms = new Date(endIso).getTime() - new Date(startIso).getTime();
  return (ms/60000).toFixed(1);
}

// Styling helpers
const hCell: React.CSSProperties = { padding: '.4rem .5rem', fontSize: '.65rem', background:'#1a232d', position:'sticky', top:0, textAlign:'center', borderBottom:'1px solid #253240', fontWeight:600, letterSpacing:'.05em' };
const hCellLeft: React.CSSProperties = { ...hCell, textAlign:'left', minWidth:140 };
const leftLabel: React.CSSProperties = { padding: '.45rem .55rem', fontSize: '.65rem', textAlign:'left', background:'#18202b', borderBottom:'1px solid #233041', fontWeight:600 };
const cell: React.CSSProperties = { padding: '.45rem .55rem', fontSize: '.65rem', textAlign:'center', background:'#161d27', borderBottom:'1px solid #233041', minWidth:60 };
