import { listRounds } from './dataLoader';
import type { RoundSummary } from './types';
import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export const RoundList: React.FC = () => {
  const [q, setQ] = useState('');
  const [limit, setLimit] = useState(50);
  const rounds = useMemo(() => listRounds(), []);

  const filtered = rounds.filter(r => r.courseName.toLowerCase().includes(q.toLowerCase()) || String(r.roundId).includes(q));

  return (
    <div>
      <h2 style={{margin:'0 0 .75rem'}}>Rounds ({filtered.length})</h2>
      <div className="filters">
        <input type="search" placeholder="Search course / round id" value={q} onChange={e=>setQ(e.target.value)} />
        <select value={limit} onChange={e=> setLimit(Number(e.target.value))}>
          {[25,50,100,200,500].map(n=> <option key={n} value={n}>Show {n}</option>)}
        </select>
      </div>
      <div className="grid">
        {filtered.slice(0, limit).map(r => <RoundCard key={r.roundId} r={r} />)}
      </div>
    </div>
  );
};

const RoundCard: React.FC<{ r: RoundSummary }> = ({ r }) => {
  const score = r.par + r.overUnder;
  const toPar = r.overUnder > 0 ? `+${r.overUnder}` : r.overUnder;
  return (
    <Link to={`/round/${r.roundId}`} className="round-card" style={{textDecoration:'none', color:'inherit'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
        <strong style={{fontSize:'.85rem'}}>{r.courseName}</strong>
        <span className="pill">{r.noOfHoles} holes</span>
      </div>
      <div style={{display:'flex', gap:'1rem', fontSize:'.7rem', flexWrap:'wrap'}}>
        <span>Round ID: {r.roundId}</span>
        <span>{formatDate(r.startTime)}</span>
      </div>
      <div style={{display:'flex', gap:'1rem', flexWrap:'wrap', fontSize:'.75rem'}}>
        <span className="inline"><span className="badge">Score</span>{score} ({toPar})</span>
        <span className="inline"><span className="badge">Shots</span>{r.noOfShots}</span>
      </div>
      {(r.driveHcp!=null || r.approachHcp!=null || r.chipHcp!=null || r.sandHcp!=null || r.puttHcp!=null) && (
        <div style={{marginTop:'.25rem', fontSize:'.65rem', display:'flex', gap:'.65rem', flexWrap:'wrap', opacity:.9}}>
          <span style={{fontWeight:600}}>HCP:</span>
          {r.driveHcp!=null && <span>Drive {r.driveHcp.toFixed(1)}</span>}
          {r.approachHcp!=null && <span>Approach {r.approachHcp.toFixed(1)}</span>}
          {r.chipHcp!=null && <span>Chip {r.chipHcp.toFixed(1)}</span>}
          {r.sandHcp!=null && <span>Sand {r.sandHcp.toFixed(1)}</span>}
          {r.puttHcp!=null && <span>Putt {r.puttHcp.toFixed(1)}</span>}
        </div>
      )}
      {r.notes && <div className="muted" style={{marginTop:'.25rem'}}>{r.notes}</div>}
    </Link>
  );
};
