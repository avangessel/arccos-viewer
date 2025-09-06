import { Routes, Route, NavLink } from 'react-router-dom';
import { RoundList } from './RoundList';
import { RoundDetail } from './RoundDetail';
import React, { useEffect, useState } from 'react';

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
          </nav>
          <div style={{marginLeft:'auto', position:'relative'}}>
            <button onClick={()=> setOpen(o=>!o)} style={settingsBtn}>{unit === 'yards'? 'Yards (yd)':'Meters (m)'} ▾</button>
            {open && <div style={dropdown}>
              <div style={ddHeader}>Distance Units</div>
              <button onClick={()=> toggle('yards')} style={ddItem(unit==='yards')}>Yards (yd)</button>
              <button onClick={()=> toggle('meters')} style={ddItem(unit==='meters')}>Meters (m)</button>
            </div>}
          </div>
        </header>
        <main onClick={()=> open && setOpen(false)}>
          <Routes>
            <Route path="/" element={<RoundList />} />
            <Route path="/round/:id" element={<RoundDetail />} />
            <Route path="*" element={<div>Not found</div>} />
          </Routes>
        </main>
      </div>
    </UnitContext.Provider>
  );
};

const settingsBtn: React.CSSProperties = { background:'#243040', color:'#fff', border:'1px solid #314252', padding:'.45rem .65rem', fontSize:'.65rem', borderRadius:4, cursor:'pointer' };
const dropdown: React.CSSProperties = { position:'absolute', right:0, top:'calc(100% + 4px)', background:'#161d27', border:'1px solid #243040', borderRadius:6, minWidth:160, zIndex:20, boxShadow:'0 4px 12px -2px rgba(0,0,0,0.45)', padding:'.35rem .35rem .5rem' };
const ddHeader: React.CSSProperties = { fontSize:'.55rem', textTransform:'uppercase', letterSpacing:'.07em', opacity:.7, padding:'.15rem .25rem .35rem' };
const ddItem = (active:boolean): React.CSSProperties => ({ display:'block', width:'100%', textAlign:'left', background: active? '#2d4b68':'#1d2733', color:'#fff', border:'1px solid '+(active? '#406d90':'#283544'), padding:'.4rem .5rem', fontSize:'.65rem', borderRadius:4, cursor:'pointer', marginBottom:'.3rem' });
