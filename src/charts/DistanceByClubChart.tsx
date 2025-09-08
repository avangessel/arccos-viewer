import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Aggregated } from '../OverallStats';

export const DistanceByClubChart: React.FC<{ agg: Aggregated; unit:'yards'|'meters' }> = ({ agg, unit }) => {
  if (!agg.distanceByClub.length) return null;
  return <div className="round-chart-card"><h4 className="chart-title">Distance by Club ({unit==='yards'? 'yd':'m'})</h4><div className="chart-container"><ResponsiveContainer width="100%" height="100%"><BarChart data={agg.distanceByClub} margin={{top:5,right:10,left:0,bottom:35}}><CartesianGrid vertical={false} stroke="#1f2832" /><XAxis dataKey="club" angle={-35} textAnchor="end" height={55} tick={{fontSize:10}} stroke="#5a6b7d" /><YAxis width={40} tick={{fontSize:10}} stroke="#5a6b7d" /><Tooltip contentStyle={{}} wrapperClassName="chart-tooltip" /><Legend wrapperStyle={{fontSize:10}} /><Bar dataKey="avg" name="Avg" fill="#4fa3ff" radius={[4,4,0,0]} /><Bar dataKey="max" name="Max" fill="#7dd36f" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer></div></div>;
};
export default DistanceByClubChart;
