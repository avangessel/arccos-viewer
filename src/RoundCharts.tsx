import React, { useMemo, useContext } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, ScatterChart, Scatter, ZAxis } from 'recharts';
import type { RoundDetail } from './types';
import { UnitContext } from './App';

interface Props {
  detail: RoundDetail;
}

// Minimal club label mapping (extend as needed)
const clubLabel = (clubType: number | null) => {
  if (clubType == null) return '—';
  const map: Record<number, string> = {
    1: 'Driver', 2: '3W', 3: '5W', 6: 'Hybrid', 7: '3i', 8: '4i', 9: '5i', 10: '6i', 11: '7i', 47: '8i', 51: '9i', 55: 'Wedge', 12: 'Putter', 36: 'FW/Util'
  };
  return map[clubType] || String(clubType);
};

export const RoundCharts: React.FC<Props> = ({ detail }) => {
  const { unit } = useContext(UnitContext);
  const { distanceByClub, distanceBuckets, approachScatter } = useMemo(()=> buildDatasets(detail, unit), [detail, unit]);
  return (
    <div style={{marginTop:'1.5rem'}}>
      <h3 style={{margin:'0 0 .75rem', fontSize:'1rem'}}>Charts</h3>
      <div style={{display:'grid', gap:'1rem', gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))'}}>
        <div className="round-chart-card">
          <h4 className="chart-title">Distance by Club ({unit === 'yards'? 'yd':'m'})</h4>
          <ChartContainer>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distanceByClub} margin={{top:5,right:10,left:0,bottom:35}}>
                <CartesianGrid vertical={false} stroke="#1f2832" />
                <XAxis dataKey="club" angle={-35} textAnchor="end" height={55} tick={{fontSize:10}} stroke="#5a6b7d" />
                <YAxis width={40} tick={{fontSize:10}} stroke="#5a6b7d" />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{fontSize:10}} />
                <Bar dataKey="avg" name="Avg" fill="#4fa3ff" radius={[4,4,0,0]} />
                <Bar dataKey="max" name="Max" fill="#7dd36f" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
        <div className="round-chart-card">
          <h4 className="chart-title">Shot Distance Histogram ({unit === 'yards'? 'yd':'m'})</h4>
          <ChartContainer>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distanceBuckets} margin={{top:5,right:10,left:0,bottom:20}}>
                <CartesianGrid vertical={false} stroke="#1f2832" />
                <XAxis dataKey="range" tick={{fontSize:10}} stroke="#5a6b7d" />
                <YAxis width={40} tick={{fontSize:10}} stroke="#5a6b7d" />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" name="Shots" fill="#ffb347" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
        <div className="round-chart-card">
          <h4 className="chart-title">Approach Dispersion ({unit === 'yards'? 'yd':'m'})</h4>
          <ChartContainer>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{top:10,right:10,left:0,bottom:20}}>
                <CartesianGrid stroke="#1f2832" />
                <XAxis dataKey="distance" name="Distance" unit={unit === 'yards'? 'yd':'m'} stroke="#5a6b7d" tick={{fontSize:10}} />
                <YAxis dataKey="hole" name="Hole" stroke="#5a6b7d" tick={{fontSize:10}} allowDecimals={false} width={35} />
                <ZAxis dataKey="shot" range={[50,50]} />
                <Tooltip cursor={{stroke:'#2d3d4b'}} contentStyle={tooltipStyle} />
                <Scatter data={approachScatter} fill="#c084fc" />
              </ScatterChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </div>
    </div>
  );
};

const tooltipStyle: React.CSSProperties = { background:'#1a222c', border:'1px solid #263240', fontSize:12 };

const ChartContainer: React.FC<{children: React.ReactNode}> = ({ children }) => (
  <div style={{height:240, background:'#161d27', border:'1px solid #243040', borderRadius:8, padding:'.25rem .5rem'}}>{children}</div>
);

// Build datasets for charts.
function buildDatasets(detail: RoundDetail, unit: 'yards' | 'meters') {
  const allShots = detail.holes.flatMap(h => h.shots.filter(s => s.shouldIgnore !== 'T' && s.distance && s.clubType !== 12)); // exclude putts from general distance stats
  const byClub: Record<string, { club: string; distances: number[] }> = {};
  for (const s of allShots) {
    const key = clubLabel(s.clubType);
    if (!byClub[key]) byClub[key] = { club: key, distances: [] };
    byClub[key].distances.push(s.distance!);
  }
  const factor = unit === 'yards'? 1.09361 : 1;
  const distanceByClub = Object.values(byClub).map(v => {
    const avgM = v.distances.reduce((a,b)=>a+b,0)/v.distances.length;
    const maxM = Math.max(...v.distances);
    return {
      club: v.club,
      avg: +(avgM * factor).toFixed(1),
      max: +(maxM * factor).toFixed(1)
    };
  }).sort((a,b)=> a.avg - b.avg);

  // Histogram buckets (50m buckets)
  const bucketSizeBase = 50; // meters
  const bucketSize = unit === 'yards'? Math.round(bucketSizeBase * 1.09361) : bucketSizeBase;
  const buckets: Record<string, number> = {};
  for (const s of allShots) {
    const dist = (s.distance ?? 0) * (unit === 'yards'? 1.09361 : 1);
    const b = Math.floor(dist / bucketSize);
    const start = b*bucketSize;
    const end = start + bucketSize;
    const label = `${start}-${end}`;
    buckets[label] = (buckets[label]||0)+1;
  }
  const distanceBuckets = Object.entries(buckets).map(([range,count])=> ({ range, count })).sort((a,b)=> parseInt(a.range)-parseInt(b.range));

  // Approach dispersion: use approachShotId for each hole (if available)
  const approachScatter: { hole: number; distance: number; shot: number }[] = [];
  for (const h of detail.holes) {
    if (h.approachShotId) {
      const s = h.shots.find(x => x.shotId === h.approachShotId);
      if (s?.distance) {
        const distance = unit === 'yards'? +(s.distance * 1.09361).toFixed(1) : s.distance;
        approachScatter.push({ hole: h.holeId, distance, shot: s.shotId });
      }
    }
  }

  return { distanceByClub, distanceBuckets, approachScatter };
}
