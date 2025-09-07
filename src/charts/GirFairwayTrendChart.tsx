import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, ReferenceLine } from 'recharts';

const GirFairwayTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0].payload;
  return <div className="chart-tooltip"><strong>Round {label}</strong><br/>Course: {p.course}<br/>GIR %: {p.girPct}<br/>Fairway %: {p.fairwayPct}</div>;
};
export const GirFairwayTrendChart: React.FC<{ series:any[]; rollingWindow:number; girTarget:string; fairwayTarget:string }> = ({ series, rollingWindow, girTarget, fairwayTarget }) => {
  if (!series.length) return null;
  const girTargetVal = girTarget? parseFloat(girTarget): null;
  const fwTargetVal = fairwayTarget? parseFloat(fairwayTarget): null;
  return <div className="round-chart-card"><h4 className="chart-title">GIR & Fairway % Over Time</h4><div className="chart-container"><ResponsiveContainer width="100%" height="100%"><LineChart data={series} margin={{top:5,right:10,left:0,bottom:25}}><CartesianGrid stroke="#1f2832" /><XAxis dataKey="idx" tick={{fontSize:10}} stroke="#5a6b7d" label={{ value:'Round # (chronological)', position:'insideBottom', dy:15, fontSize:10 }} /><YAxis domain={[0,100]} tick={{fontSize:10}} stroke="#5a6b7d" width={40} /><Tooltip content={<GirFairwayTooltip />} /><Legend wrapperStyle={{fontSize:10}} /><ReferenceLine y={50} stroke="#2d4b68" strokeDasharray="4 4" label={{ value:'50%', position:'right', fill:'#2d4b68', fontSize:10 }} />{girTargetVal!=null && !isNaN(girTargetVal) && <ReferenceLine y={girTargetVal} stroke="#7dd36f" strokeDasharray="3 3" label={{ value:'GIR Target', position:'right', fill:'#7dd36f', fontSize:10 }} />}{fwTargetVal!=null && !isNaN(fwTargetVal) && <ReferenceLine y={fwTargetVal} stroke="#c084fc" strokeDasharray="3 3" label={{ value:'FW Target', position:'right', fill:'#c084fc', fontSize:10 }} />}<Line type="monotone" dataKey="girPct" name="GIR %" stroke="#7dd36f" strokeWidth={2} dot={false} /><Line type="monotone" dataKey="girRolling" name={`GIR Rolling (${rollingWindow})`} stroke="#5fa659" strokeWidth={2} strokeDasharray="4 2" dot={false} /><Line type="monotone" dataKey="fairwayPct" name="Fairway %" stroke="#c084fc" strokeWidth={2} dot={false} /><Line type="monotone" dataKey="fairwayRolling" name={`FW Rolling (${rollingWindow})`} stroke="#9370db" strokeWidth={2} strokeDasharray="4 2" dot={false} /></LineChart></ResponsiveContainer></div></div>;
};
export default GirFairwayTrendChart;
