import React from 'react';
import { Aggregated } from './OverallStats';

const DistanceByClubChart = React.lazy(()=> import('./charts/DistanceByClubChart').then(m=> ({default: m.DistanceByClubChart})));
const DistanceHistogramChart = React.lazy(()=> import('./charts/DistanceHistogramChart').then(m=> ({default: m.DistanceHistogramChart})));
const ApproachDispersionChart = React.lazy(()=> import('./charts/ApproachDispersionChart').then(m=> ({default: m.ApproachDispersionChart})));
const ScoringTrendChart = React.lazy(()=> import('./charts/ScoringTrendChart').then(m=> ({default: m.ScoringTrendChart})));
const GirFairwayTrendChart = React.lazy(()=> import('./charts/GirFairwayTrendChart').then(m=> ({default: m.GirFairwayTrendChart})));

export const OverallCharts: React.FC<{ agg: Aggregated; unit: 'yards'|'meters'; rollingWindow: number; scoreTarget: string; girTarget: string; fairwayTarget: string }> = ({ agg, unit, rollingWindow, scoreTarget, girTarget, fairwayTarget }) => {
  if (!agg.distanceByClub.length && !agg.distanceBuckets.length && !agg.approachScatter.length && !agg.scoringSeries.length) return null;
  return (
    <div className="overall-charts">
      <h3>Overall Charts</h3>
      <div className="chart-grid">
  {agg.distanceByClub.length > 0 && <React.Suspense fallback={<div className="round-chart-card"><div className="chart-container">Loading…</div></div>}><DistanceByClubChart agg={agg} unit={unit} /></React.Suspense>}
  {agg.distanceBuckets.length > 0 && <React.Suspense fallback={<div className="round-chart-card"><div className="chart-container">Loading…</div></div>}><DistanceHistogramChart agg={agg} unit={unit} /></React.Suspense>}
  {agg.approachScatter.length > 0 && <React.Suspense fallback={<div className="round-chart-card"><div className="chart-container">Loading…</div></div>}><ApproachDispersionChart agg={agg} unit={unit} /></React.Suspense>}
  {agg.scoringSeries.length > 0 && <React.Suspense fallback={<div className="round-chart-card"><div className="chart-container">Loading…</div></div>}><ScoringTrendChart series={agg.scoringSeries} rollingWindow={rollingWindow} scoreTarget={scoreTarget} /></React.Suspense>}
  {agg.girFairwaySeries.length > 0 && <React.Suspense fallback={<div className="round-chart-card"><div className="chart-container">Loading…</div></div>}><GirFairwayTrendChart series={agg.girFairwaySeries} rollingWindow={rollingWindow} girTarget={girTarget} fairwayTarget={fairwayTarget} /></React.Suspense>}
      </div>
    </div>
  );
};

export default OverallCharts;
