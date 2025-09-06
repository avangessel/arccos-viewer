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
    <div style={{marginTop:'1.25rem'}}>
      <h3 style={{margin:'0 0 .25rem', fontSize:'1.25rem'}}>Scorecard Breakdown</h3>
      <div style={{overflowX:'auto'}}>
    <table style={{borderCollapse:'separate', borderSpacing:0, minWidth: holes.length * 48 + 140}}>
          <thead>
            <tr>
              <th style={hCellLeft}>Stat</th>
              {holes.map(h=> {
                const start = h.shots[0]?.shotTime;
                const end = h.shots[h.shots.length-1]?.shotTime;
                let dur = '';
                if (start && end) {
                  const ms = new Date(end).getTime() - new Date(start).getTime();
                  dur = (ms/60000).toFixed(1)+'m';
                }
                const tip = `Hole ${h.holeId}\nStart: ${start? formatTime(start):'-'}\nEnd: ${end? formatTime(end):'-'}\nDur: ${dur || '-'}`;
                return (
                  <th
                    key={h.holeId}
                    title={tip}
                    style={{...hCell, background: focusHole===h.holeId? '#28405a':'#1a232d', cursor:'pointer'}}
                    onClick={()=> onFocusHole(h.holeId)}
                  >
                    {h.holeId}
                  </th>
                );
              })}
              <th style={hCell}>Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r,rowIdx) => {
              const evenRow = rowIdx % 2 === 0;
              return (
                <tr key={r.label}>
                  <td style={{...leftLabel, background: evenRow? rowBgA : rowBgB}}>{r.label}</td>
                  {r.values.map((v,colIdx)=> {
                    const focused = focusHole===holes[colIdx].holeId;
                    const colShade = colIdx % 2 === 0 ? (evenRow? colBgA : colBgB) : (evenRow? colBgAltA : colBgAltB);
                    const bg = focused ? '#223c50' : colShade;
                    return <td
                      key={colIdx}
                      style={{...cell, background:bg, borderRight:'1px solid #273544'}}
                    >{v}</td>;
                  })}
                  <td style={{...cell, background: evenRow? totalBgA : totalBgB, fontWeight:600}}>{aggregateForRow(r.label, { totalShots, totalPutts, girCount, fairwayCount, upDownCount, totalDistance, holes })}</td>
                </tr>
              );
            })}
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
  return [shots, putts, gir, fairway, upDown, dist];
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

// Styling helpers (condensed)
const hCell: React.CSSProperties = { padding: '.32rem .34rem', fontSize: '.65rem', background:'#16202a', position:'sticky', top:0, textAlign:'center', borderBottom:'1px solid #2d3a49', fontWeight:700, letterSpacing:'.04em', whiteSpace:'nowrap' };
const hCellLeft: React.CSSProperties = { ...hCell, textAlign:'left', minWidth:90 };
const leftLabel: React.CSSProperties = { padding: '.28rem .32rem', fontSize: '.64rem', textAlign:'left', borderBottom:'1px solid #273544', fontWeight:600, whiteSpace:'nowrap' };
const cell: React.CSSProperties = { padding: '.26rem .28rem', fontSize: '.64rem', textAlign:'center', borderBottom:'1px solid #273544', minWidth:42 };
// Color palette for zebra and column shading
const rowBgA = '#14202a';
const rowBgB = '#101a23';
const colBgA = '#1a2834';
const colBgB = '#16222c';
const colBgAltA = '#1e303d';
const colBgAltB = '#1a2731';
const totalBgA = '#203445';
const totalBgB = '#1c303f';
