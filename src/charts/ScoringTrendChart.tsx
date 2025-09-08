import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, ReferenceLine } from 'recharts';

const ScoringTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  const p = payload.reduce((acc:any, cur:any)=> ({...acc, [cur.dataKey]: cur.value, course: cur.payload.course }), {});
  return <div className="chart-tooltip"><strong>Round {label}</strong><br/>Course: {p.course}<br/>Score/Hole: {p.scoreAvg}<br/>Rolling: {p.rolling ?? '—'}<br/>Over/Under: {p.overUnder ?? '—'}</div>;
};
export const ScoringTrendChart: React.FC<{ series:any[]; rollingWindow:number; scoreTarget:string }> = ({ series, rollingWindow, scoreTarget }) => {
  if (!series.length) return null;
  const targetVal = scoreTarget? parseFloat(scoreTarget): null;
  return <div className="round-chart-card"><h4 className="chart-title">Scoring Trend</h4><div className="chart-container"><ResponsiveContainer width="100%" height="100%"><LineChart data={series} margin={{top:5,right:10,left:0,bottom:25}}><CartesianGrid stroke="#1f2832" /><XAxis dataKey="idx" tick={{fontSize:10}} stroke="#5a6b7d" label={{ value:'Round # (chronological)', position:'insideBottom', dy:15, fontSize:10 }} /><YAxis width={40} tick={{fontSize:10}} stroke="#5a6b7d" /><Tooltip content={<ScoringTooltip />} /><Legend wrapperStyle={{fontSize:10}} /><Line type="monotone" dataKey="scoreAvg" name="Score/Hole" stroke="#4fa3ff" strokeWidth={2} dot={false} /><Line type="monotone" dataKey="rolling" name={`Rolling (${rollingWindow})`} stroke="#ff7f50" strokeWidth={2} dot={false} />{targetVal!=null && !isNaN(targetVal) && <ReferenceLine y={targetVal} stroke="#d9534f" strokeDasharray="6 4" label={{ value:'Target', position:'right', fill:'#d9534f', fontSize:10 }} />}</LineChart></ResponsiveContainer></div></div>;
};
export default ScoringTrendChart;
