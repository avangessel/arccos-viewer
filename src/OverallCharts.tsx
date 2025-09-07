import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, ScatterChart, Scatter, ZAxis, LineChart, Line, ReferenceLine } from 'recharts';
import { Aggregated } from './OverallStats';

const ChartContainer: React.FC<{children: React.ReactNode}> = ({ children }) => (
  <div className="chart-container">{children}</div>
);

const ScoringTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  const p = payload.reduce((acc:any, cur:any)=> ({...acc, [cur.dataKey]: cur.value, course: cur.payload.course }), {});
  return <div className="chart-tooltip"><strong>Round {label}</strong><br/>Course: {p.course}<br/>Score/Hole: {p.scoreAvg}<br/>Rolling: {p.rolling ?? '—'}<br/>Over/Under: {p.overUnder ?? '—'}</div>;
};
const GirFairwayTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0].payload;
  return <div className="chart-tooltip"><strong>Round {label}</strong><br/>Course: {p.course}<br/>GIR %: {p.girPct}<br/>Fairway %: {p.fairwayPct}</div>;
};

export const OverallCharts: React.FC<{ agg: Aggregated; unit: 'yards'|'meters'; rollingWindow: number; scoreTarget: string; girTarget: string; fairwayTarget: string }> = ({ agg, unit, rollingWindow, scoreTarget, girTarget, fairwayTarget }) => {
  if (!agg.distanceByClub.length && !agg.distanceBuckets.length && !agg.approachScatter.length && !agg.scoringSeries.length) return null;
  const scoreTargetVal = scoreTarget ? parseFloat(scoreTarget) : null;
  const girTargetVal = girTarget ? parseFloat(girTarget) : null;
  const fairwayTargetVal = fairwayTarget ? parseFloat(fairwayTarget) : null;
  return (
    <div className="overall-charts">
      <h3>Overall Charts</h3>
      <div className="chart-grid">
        {agg.distanceByClub.length > 0 && <div className="round-chart-card">
          <h4 className="chart-title">Distance by Club ({unit==='yards'? 'yd':'m'})</h4>
          <ChartContainer>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agg.distanceByClub} margin={{top:5,right:10,left:0,bottom:35}}>
                <CartesianGrid vertical={false} stroke="#1f2832" />
                <XAxis dataKey="club" angle={-35} textAnchor="end" height={55} tick={{fontSize:10}} stroke="#5a6b7d" />
                <YAxis width={40} tick={{fontSize:10}} stroke="#5a6b7d" />
                <Tooltip contentStyle={{}} wrapperClassName="chart-tooltip" />
                <Legend wrapperStyle={{fontSize:10}} />
                <Bar dataKey="avg" name="Avg" fill="#4fa3ff" radius={[4,4,0,0]} />
                <Bar dataKey="max" name="Max" fill="#7dd36f" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>}
        {agg.distanceBuckets.length > 0 && <div className="round-chart-card">
          <h4 className="chart-title">Shot Distance Histogram ({unit==='yards'? 'yd':'m'})</h4>
          <ChartContainer>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agg.distanceBuckets} margin={{top:5,right:10,left:0,bottom:20}}>
                <CartesianGrid vertical={false} stroke="#1f2832" />
                <XAxis dataKey="range" tick={{fontSize:10}} stroke="#5a6b7d" />
                <YAxis width={40} tick={{fontSize:10}} stroke="#5a6b7d" />
                <Tooltip contentStyle={{}} wrapperClassName="chart-tooltip" />
                <Bar dataKey="count" name="Shots" fill="#ffb347" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>}
        {agg.approachScatter.length > 0 && <div className="round-chart-card">
          <h4 className="chart-title">Approach Dispersion ({unit==='yards'? 'yd':'m'})</h4>
          <ChartContainer>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{top:10,right:10,left:0,bottom:20}}>
                <CartesianGrid stroke="#1f2832" />
                <XAxis dataKey="distance" name="Distance" unit={unit==='yards'? 'yd':'m'} stroke="#5a6b7d" tick={{fontSize:10}} />
                <YAxis dataKey="hole" name="Hole" stroke="#5a6b7d" tick={{fontSize:10}} allowDecimals={false} width={35} />
                <ZAxis dataKey="shot" range={[50,50]} />
                <Tooltip cursor={{stroke:'#2d3d4b'}} contentStyle={{}} wrapperClassName="chart-tooltip" />
                <Scatter data={agg.approachScatter} fill="#c084fc" />
              </ScatterChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>}
        {agg.scoringSeries.length > 0 && <div className="round-chart-card">
          <h4 className="chart-title">Scoring Trend</h4>
          <ChartContainer>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={agg.scoringSeries} margin={{top:5,right:10,left:0,bottom:25}}>
                <CartesianGrid stroke="#1f2832" />
                <XAxis dataKey="idx" tick={{fontSize:10}} stroke="#5a6b7d" label={{ value:'Round # (chronological)', position:'insideBottom', dy:15, fontSize:10 }} />
                <YAxis width={40} tick={{fontSize:10}} stroke="#5a6b7d" />
                <Tooltip content={<ScoringTooltip />} />
                <Legend wrapperStyle={{fontSize:10}} />
                <Line type="monotone" dataKey="scoreAvg" name="Score/Hole" stroke="#4fa3ff" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="rolling" name={`Rolling (${rollingWindow})`} stroke="#ff7f50" strokeWidth={2} dot={false} />
                {scoreTargetVal!=null && !isNaN(scoreTargetVal) && <ReferenceLine y={scoreTargetVal} stroke="#d9534f" strokeDasharray="6 4" label={{ value:'Target', position:'right', fill:'#d9534f', fontSize:10 }} />}
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>}
        {agg.girFairwaySeries.length > 0 && <div className="round-chart-card">
          <h4 className="chart-title">GIR & Fairway % Over Time</h4>
          <ChartContainer>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={agg.girFairwaySeries} margin={{top:5,right:10,left:0,bottom:25}}>
                <CartesianGrid stroke="#1f2832" />
                <XAxis dataKey="idx" tick={{fontSize:10}} stroke="#5a6b7d" label={{ value:'Round # (chronological)', position:'insideBottom', dy:15, fontSize:10 }} />
                <YAxis domain={[0,100]} tick={{fontSize:10}} stroke="#5a6b7d" width={40} />
                <Tooltip content={<GirFairwayTooltip />} />
                <Legend wrapperStyle={{fontSize:10}} />
                <ReferenceLine y={50} stroke="#2d4b68" strokeDasharray="4 4" label={{ value:'50%', position:'right', fill:'#2d4b68', fontSize:10 }} />
                {girTargetVal!=null && !isNaN(girTargetVal) && <ReferenceLine y={girTargetVal} stroke="#7dd36f" strokeDasharray="3 3" label={{ value:'GIR Target', position:'right', fill:'#7dd36f', fontSize:10 }} />}
                {fairwayTargetVal!=null && !isNaN(fairwayTargetVal) && <ReferenceLine y={fairwayTargetVal} stroke="#c084fc" strokeDasharray="3 3" label={{ value:'FW Target', position:'right', fill:'#c084fc', fontSize:10 }} />}
                <Line type="monotone" dataKey="girPct" name="GIR %" stroke="#7dd36f" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="girRolling" name={`GIR Rolling (${rollingWindow})`} stroke="#5fa659" strokeWidth={2} strokeDasharray="4 2" dot={false} />
                <Line type="monotone" dataKey="fairwayPct" name="Fairway %" stroke="#c084fc" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="fairwayRolling" name={`FW Rolling (${rollingWindow})`} stroke="#9370db" strokeWidth={2} strokeDasharray="4 2" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>}
      </div>
    </div>
  );
};

export default OverallCharts;
