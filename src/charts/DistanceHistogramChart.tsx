import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Aggregated } from '../OverallStats';
export const DistanceHistogramChart: React.FC<{ agg: Aggregated; unit:'yards'|'meters' }> = ({ agg, unit }) => {
  if (!agg.distanceBuckets.length) return null;
  return <div className="round-chart-card"><h4 className="chart-title">Shot Distance Histogram ({unit==='yards'? 'yd':'m'})</h4><div className="chart-container"><ResponsiveContainer width="100%" height="100%"><BarChart data={agg.distanceBuckets} margin={{top:5,right:10,left:0,bottom:20}}><CartesianGrid vertical={false} stroke="#1f2832" /><XAxis dataKey="range" tick={{fontSize:10}} stroke="#5a6b7d" /><YAxis width={40} tick={{fontSize:10}} stroke="#5a6b7d" /><Tooltip contentStyle={{}} wrapperClassName="chart-tooltip" /><Bar dataKey="count" name="Shots" fill="#ffb347" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer></div></div>;
};
export default DistanceHistogramChart;
