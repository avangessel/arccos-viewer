import { Routes, Route, NavLink } from 'react-router-dom';
import { RoundList } from './RoundList';
import { RoundDetail } from './RoundDetail';
// Lazy-load OverallStats for code-splitting
import React, { useEffect, useState } from 'react';
import './app.css';
const OverallStats = React.lazy(() => import('./OverallStats').then(m => ({ default: m.OverallStats })));

export type DistanceUnit = 'yards' | 'meters';
interface UnitContextValue { unit: DistanceUnit; toDisplay(meters: number | null | undefined): string; toggle(u: DistanceUnit): void; }
export const UnitContext = React.createContext<UnitContextValue>({ unit:'yards', toDisplay: ()=>'', toggle: ()=>{} });

function formatDistance(unit: DistanceUnit, meters: number | null | undefined) {
  if (meters == null) return '—';
  if (unit === 'meters') return meters.toFixed(1);
  // yards
  return (meters * 1.09361).toFixed(1);
}

export const App: React.FC = () => {
  const [unit, setUnit] = useState<DistanceUnit>('yards');
  const [open, setOpen] = useState(false);
  useEffect(()=> {
    const saved = localStorage.getItem('distanceUnit');
    if (saved === 'yards' || saved === 'meters') setUnit(saved);
  }, []);
  function toggle(u: DistanceUnit) {
    setUnit(u);
    localStorage.setItem('distanceUnit', u);
    setOpen(false);
  }
  const ctx: UnitContextValue = { unit, toggle, toDisplay: (m)=> formatDistance(unit, m) };
  return (
    <UnitContext.Provider value={ctx}>
      <div className="layout">
        <header>
          <h1>Arccos Viewer</h1>
          <nav>
            <NavLink to="/" end className={({isActive})=> isActive? 'active': ''}>Rounds</NavLink>
            <NavLink to="/overall" className={({isActive})=> isActive? 'active': ''}>Overall</NavLink>
          </nav>
          <div className="header-actions">
            <button onClick={()=> setOpen(o=>!o)} className="settings-btn">{unit === 'yards'? 'Yards (yd)':'Meters (m)'} ▾</button>
            {open && <div className="settings-dropdown">
              <div className="settings-dd-header">Distance Units</div>
              <button onClick={()=> toggle('yards')} className={`settings-dd-item ${unit==='yards'?'active':''}`}>Yards (yd)</button>
              <button onClick={()=> toggle('meters')} className={`settings-dd-item ${unit==='meters'?'active':''}`}>Meters (m)</button>
            </div>}
          </div>
        </header>
        <main onClick={()=> open && setOpen(false)}>
          <Routes>
            <Route path="/" element={<RoundList />} />
            <Route path="/round/:id" element={<RoundDetail />} />
            <Route path="/overall" element={<React.Suspense fallback={<div className="suspense-loading">Loading overall stats…</div>}><OverallStats /></React.Suspense>} />
            <Route path="*" element={<div>Not found</div>} />
          </Routes>
        </main>
      </div>
    </UnitContext.Provider>
  );
};

// Inline style constants removed; see app.css for header/dropdown styling.
