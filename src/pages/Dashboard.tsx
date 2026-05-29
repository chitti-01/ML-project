import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  Activity,
  Check,
  Wifi,
  WifiOff,
  Sparkles
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { api, WS_BASE } from '../services/api';
import type { Recommendation } from '../services/api';

const chartData = [
  { name: 'Jan', stock: 4000, demand: 2400 },
  { name: 'Feb', stock: 3000, demand: 1398 },
  { name: 'Mar', stock: 2000, demand: 9800 },
  { name: 'Apr', stock: 2780, demand: 3908 },
  { name: 'May', stock: 1890, demand: 4800 },
  { name: 'Jun', stock: 2390, demand: 3800 },
  { name: 'Jul', stock: 3490, demand: 4300 },
];

export const Dashboard: React.FC = () => {
  // Stats state (seeded with default dashboard telemetry)
  const [liveStats, setLiveStats] = useState({
    totalInventory: 24592,
    activeDemand: 18290,
    forecastConfidence: 94.2,
    criticalAlerts: 3
  });
  const [wsConnected, setWsConnected] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [toasts, setToasts] = useState<{ id: number; message: string }[]>([]);

  // Show premium toast
  const addToast = (message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Connect to live telemetry WS
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const connectWS = () => {
      try {
        ws = new WebSocket(`${WS_BASE}/dashboard`);
        
        ws.onopen = () => {
          setWsConnected(true);
          console.log('[WebSocket] Dashboard live telemetry connection established.');
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            if (message.type === 'live_update') {
              setLiveStats(prev => ({
                ...prev,
                totalInventory: message.data.total_inventory,
                activeDemand: message.data.active_demand,
                criticalAlerts: message.data.critical_alerts
              }));
            }
          } catch (e) {
            console.error('[WebSocket] Parsing failed', e);
          }
        };

        ws.onclose = () => {
          setWsConnected(false);
          console.warn('[WebSocket] Dashboard live telemetry disconnected. Reconnecting...');
          reconnectTimeout = setTimeout(connectWS, 4000); // Reconnect loop
        };

        ws.onerror = () => {
          ws?.close();
        };
      } catch (err) {
        console.error('[WebSocket] Connection failed', err);
        reconnectTimeout = setTimeout(connectWS, 4000);
      }
    };

    connectWS();

    // Fetch initial recommendations
    const fetchRecs = async () => {
      try {
        const data = await api.getRecommendations();
        setRecommendations(data.slice(0, 3)); // Display top 3
      } catch (err) {
        console.error('Failed to load dashboard insights', err);
      }
    };
    fetchRecs();

    return () => {
      if (ws) ws.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, []);

  // Action for Recommendations
  const handleApplyRecommendation = async (id: string | undefined, title: string) => {
    if (!id) return;
    try {
      const response = await api.applyRecommendation(id, title);
      setRecommendations(prev => prev.filter(r => (r.id || r._id) !== id));
      addToast(`Successfully applied: "${title}". Generated PO: ${response.po_id || 'N/A'}`);
    } catch (err) {
      addToast(`Failed to apply: "${title}"`);
    }
  };

  const formattedStats = [
    { title: 'Total Inventory', value: liveStats.totalInventory.toLocaleString(), change: '+12.5%', isPositive: true, icon: Package },
    { title: 'Active Demand', value: liveStats.activeDemand.toLocaleString(), change: '+5.2%', isPositive: true, icon: TrendingUp },
    { title: 'Forecast Confidence', value: `${liveStats.forecastConfidence}%`, change: '+1.2%', isPositive: true, icon: Activity },
    { title: 'Critical Alerts', value: liveStats.criticalAlerts.toString(), change: liveStats.criticalAlerts > 3 ? '+1' : '-2', isPositive: liveStats.criticalAlerts <= 3, icon: AlertTriangle, alert: true },
  ];

  return (
    <div className="space-y-6 relative">
      {/* Toast Overlay */}
      <div className="fixed bottom-6 right-6 z-50 space-y-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className="bg-card/90 backdrop-blur-xl border border-primary/20 p-4 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-medium text-foreground pointer-events-auto min-w-[300px]"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                <Check className="w-4 h-4" />
              </div>
              <p className="flex-1 text-foreground/90">{toast.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Header section with telemetry indicator */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Overview Dashboard</h1>
          <p className="text-sm text-foreground/50 mt-1">Real-time telemetry and predictive operational models</p>
        </div>
        
        {/* WS Live status label */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
          wsConnected 
            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
            : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
        }`}>
          {wsConnected ? (
            <>
              <Wifi className="w-3.5 h-3.5 animate-pulse" />
              <span>Live Telemetry Connected</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5" />
              <span>Telemetry Offline (Using Buffer)</span>
            </>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {formattedStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground/60">{stat.title}</p>
                  <h3 className="text-2xl font-bold mt-2 text-foreground tracking-tight">{stat.value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${stat.alert ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-sm">
                {stat.isPositive ? (
                  <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-red-500" />
                )}
                <span className={stat.isPositive ? "text-emerald-500 font-medium" : "text-red-500 font-medium"}>
                  {stat.change}
                </span>
                <span className="text-foreground/50 ml-1">vs last month</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-foreground">Stock vs Demand Trends</h3>
                <p className="text-sm text-foreground/50">6-month overview of inventory movements</p>
              </div>
              <select className="bg-background border border-border rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/50 text-foreground cursor-pointer">
                <option>Last 6 Months</option>
                <option>This Year</option>
              </select>
            </div>
            <div className="h-[300px] w-full min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--foreground)', opacity: 0.5, fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--foreground)', opacity: 0.5, fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px', color: 'var(--foreground)' }}
                    itemStyle={{ color: 'var(--foreground)' }}
                  />
                  <Area type="monotone" dataKey="stock" name="Stock Level" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorStock)" />
                  <Area type="monotone" dataKey="demand" name="Market Demand" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorDemand)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* AI Recommendations Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col h-full"
        >
          <div className="flex items-center gap-2 mb-6 text-foreground">
            <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-purple-500" />
            </div>
            <h3 className="text-lg font-bold">Pro Vision AI Insights</h3>
          </div>
          
          <div className="space-y-4 flex-1 overflow-y-auto">
            <AnimatePresence mode="popLayout">
              {recommendations.length > 0 ? (
                recommendations.map((rec) => {
                  const recId = rec.id || rec._id;
                  return (
                    <motion.div 
                      key={recId}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, x: 50, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="p-4 rounded-xl bg-background border border-border hover:border-primary/50 transition-colors group relative"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <p className="text-sm text-foreground/80 leading-relaxed font-medium">{rec.title}</p>
                      </div>
                      <p className="text-xs text-foreground/50 mt-1.5 line-clamp-2 leading-relaxed">{rec.description}</p>
                      
                      <div className="mt-4 flex items-center justify-between">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          rec.priority === 'High' ? 'bg-red-500/10 text-red-500' :
                          rec.priority === 'Medium' ? 'bg-amber-500/10 text-amber-500' :
                          'bg-emerald-500/10 text-emerald-500'
                        }`}>
                          {rec.priority} Priority
                        </span>
                        <button 
                          onClick={() => handleApplyRecommendation(recId, rec.title)}
                          className="text-xs font-semibold text-primary group-hover:opacity-100 transition-all opacity-80 hover:text-primary/80 flex items-center gap-1 cursor-pointer"
                        >
                          Apply Now →
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center text-sm text-foreground/40 py-8">
                  All recommendations applied. Great work!
                </div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

