import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ScatterChart, Scatter, ZAxis, ReferenceDot } from 'recharts';
import { PieChart, Pie, Legend } from 'recharts';
import { Activity, BarChart2, PieChart as PieChartIcon, Loader2, Network, Layers } from 'lucide-react';
import { api } from '../services/api';
import type { PerformanceData, AnalyticsSummary, ClassificationData, ClusterGroup } from '../services/api';

interface DistributionItem {
  name: string;
  value: number;
  color: string;
}

export const Analytics: React.FC = () => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [performance, setPerformance] = useState<PerformanceData[]>([]);
  const [distribution, setDistribution] = useState<DistributionItem[]>([]);
  const [classifications, setClassifications] = useState<ClassificationData[]>([]);
  const [clusters, setClusters] = useState<ClusterGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const [sumRes, perfRes, distRes, classRes, clusterRes] = await Promise.all([
        api.getAnalyticsSummary(),
        api.getAnalyticsCharts(),
        api.getAnalyticsDistribution(),
        api.getAnalyticsClassifications(),
        api.getAnalyticsClusters()
      ]);
      setSummary(sumRes);
      setPerformance(perfRes);
      setDistribution(distRes);
      setClassifications(classRes);
      setClusters(clusterRes);
    } catch (err) {
      console.error('Failed to load analytics data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Advanced Analytics</h1>
        <p className="text-sm text-foreground/50 mt-1">Deep dive into operational metrics</p>
      </div>

      {loading ? (
        <div className="h-[400px] w-full flex items-center justify-center bg-card border border-border rounded-2xl">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Efficiency by Location Chart */}
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between h-[380px]">
              <div className="flex items-center gap-2 mb-4 shrink-0">
                <BarChart2 className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold text-foreground">Efficiency by Location</h3>
              </div>
              <div className="flex-1 w-full h-[280px] min-h-[280px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--foreground)', opacity: 0.5 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--foreground)', opacity: 0.5 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px' }}
                      itemStyle={{ color: 'var(--foreground)' }}
                      cursor={{ fill: 'var(--foreground)', opacity: 0.05 }}
                    />
                    <Bar dataKey="processing" name="Processing (%)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="shipping" name="Shipping (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Stock Distribution Chart */}
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between h-[380px]">
              <div className="flex items-center gap-2 mb-4 shrink-0">
                <PieChartIcon className="w-5 h-5 text-purple-500" />
                <h3 className="text-lg font-bold text-foreground">Stock Distribution</h3>
              </div>
              <div className="flex-1 w-full h-[280px] min-h-[280px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distribution}
                      cx="50%"
                      cy="45%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px' }}
                      itemStyle={{ color: 'var(--foreground)' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Classifications Chart */}
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between h-[380px]">
              <div className="flex items-center gap-2 mb-4 shrink-0">
                <Layers className="w-5 h-5 text-indigo-500" />
                <h3 className="text-lg font-bold text-foreground">Item Classifications (ABC)</h3>
              </div>
              <div className="flex-1 w-full h-[280px] min-h-[280px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={classifications} layout="vertical" margin={{ top: 10, right: 30, left: 60, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--border)" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'var(--foreground)', opacity: 0.5 }} />
                    <YAxis dataKey="category" type="category" axisLine={false} tickLine={false} tick={{ fill: 'var(--foreground)', opacity: 0.8 }} width={120} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px' }}
                      itemStyle={{ color: 'var(--foreground)' }}
                      cursor={{ fill: 'var(--foreground)', opacity: 0.05 }}
                    />
                    <Bar dataKey="items" name="Items Count" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Clustering Chart */}
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between h-[380px]">
              <div className="flex items-center gap-2 mb-4 shrink-0">
                <Network className="w-5 h-5 text-rose-500" />
                <h3 className="text-lg font-bold text-foreground">Demand vs Stock Clusters</h3>
              </div>
              <div className="flex-1 w-full h-[280px] min-h-[280px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis type="number" dataKey="x" name="Demand Score" axisLine={false} tickLine={false} tick={{ fill: 'var(--foreground)', opacity: 0.5 }} />
                    <YAxis type="number" dataKey="y" name="Stock Level" axisLine={false} tickLine={false} tick={{ fill: 'var(--foreground)', opacity: 0.5 }} />
                    <ZAxis type="number" range={[60, 60]} />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }} 
                      contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px' }}
                      itemStyle={{ color: 'var(--foreground)' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    {clusters.map((cluster, i) => {
                      if (cluster.data.length === 0) return null;
                      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
                      cluster.data.forEach(d => {
                        if (d.x < minX) minX = d.x;
                        if (d.x > maxX) maxX = d.x;
                        if (d.y < minY) minY = d.y;
                        if (d.y > maxY) maxY = d.y;
                      });
                      const cx = (minX + maxX) / 2;
                      const cy = (minY + maxY) / 2;
                      
                      // Convert hex to rgba for light shading
                      const hex = cluster.color;
                      const r = parseInt(hex.slice(1, 3), 16);
                      const g = parseInt(hex.slice(3, 5), 16);
                      const b = parseInt(hex.slice(5, 7), 16);
                      const fill = `rgba(${r}, ${g}, ${b}, 0.15)`;

                      return (
                        <ReferenceDot 
                          key={`ref-${i}`} 
                          x={cx} 
                          y={cy} 
                          r={55} 
                          fill={fill} 
                          stroke={cluster.color} 
                          strokeWidth={2} 
                          strokeDasharray="6 6" 
                        />
                      );
                    })}
                    {clusters.map((cluster, i) => (
                      <Scatter key={i} name={cluster.name} data={cluster.data} fill={cluster.color} />
                    ))}
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {[
              { label: 'Avg Order Fulfillment', value: `${summary?.avg_fulfillment_days || 1.2} Days`, color: 'text-blue-500', bg: 'bg-blue-500/10' },
              { label: 'Low Stock SKU Warning', value: summary?.low_stock_items || 45, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
              { label: 'Space Utilization', value: `${summary?.space_utilization_pct || 87}%`, color: 'text-purple-500', bg: 'bg-purple-500/10' },
            ].map((kpi, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4 bg-card border border-border rounded-xl p-5 shadow-sm"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${kpi.bg}`}>
                  <Activity className={`w-6 h-6 ${kpi.color}`} />
                </div>
                <div>
                  <p className="text-sm text-foreground/50 font-medium">{kpi.label}</p>
                  <h4 className="text-xl font-bold text-foreground mt-0.5">{kpi.value}</h4>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

