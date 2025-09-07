import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Aggregated } from '../OverallStats';
export const ApproachDispersionChart: React.FC<{ agg: Aggregated; unit:'yards'|'meters' }> = ({ agg, unit }) => {
  if (!agg.approachScatter.length) return null;
  return <div className="round-chart-card"><h4 className="chart-title">Approach Dispersion ({unit==='yards'? 'yd':'m'})</h4><div className="chart-container"><ResponsiveContainer width="100%" height="100%"><ScatterChart margin={{top:10,right:10,left:0,bottom:20}}><CartesianGrid stroke="#1f2832" /><XAxis dataKey="distance" name="Distance" unit={unit==='yards'? 'yd':'m'} stroke="#5a6b7d" tick={{fontSize:10}} /><YAxis dataKey="hole" name="Hole" stroke="#5a6b7d" tick={{fontSize:10}} allowDecimals={false} width={35} /><ZAxis dataKey="shot" range={[50,50]} /><Tooltip cursor={{stroke:'#2d3d4b'}} contentStyle={{}} wrapperClassName="chart-tooltip" /><Scatter data={agg.approachScatter} fill="#c084fc" /></ScatterChart></ResponsiveContainer></div></div>;
};
export default ApproachDispersionChart;
