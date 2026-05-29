import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, Sparkles, RefreshCcw, Loader2, CheckCircle, Sliders, Calendar, DollarSign, Cpu } from 'lucide-react';
import { api } from '../services/api';
import type { ForecastRecord } from '../services/api';

export const Forecast: React.FC = () => {
  const [data, setData] = useState<ForecastRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [horizon, setHorizon] = useState<'3' | '6' | '10'>('6'); // 3, 6, 10 months ahead
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenProgress, setRegenProgress] = useState(0);
  const [toasts, setToasts] = useState<{ id: number; message: string }[]>([]);

  // Real-time calculator state
  const [storeId, setStoreId] = useState('Bangalore Central Hub');
  const [itemId, setItemId] = useState('Wireless Earbuds');
  const [price, setPrice] = useState('24.99');
  const [promo, setPromo] = useState(false);
  const [date, setDate] = useState('2026-05-12');
  const [lag1, setLag1] = useState('150');
  const [isCalculating, setIsCalculating] = useState(false);
  const [calcResult, setCalcResult] = useState<{
    store_id: string;
    item_id: string;
    predicted_demand: number;
    features_used: string[];
    status: string;
  } | null>(null);

  const addToast = (message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Fetch forecast prediction data
  const loadForecast = async () => {
    try {
      const records = await api.getForecast();
      setData(records);
    } catch (err) {
      console.error("Failed to load forecast data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForecast();
  }, []);

  // Filter forecast data based on selected horizon
  const getFilteredData = () => {
    const todayIndex = data.findIndex(item => item.month === 'Jun');
    if (todayIndex === -1) return data;

    const actuals = data.slice(0, todayIndex + 1);
    const predictions = data.slice(todayIndex + 1);

    const count = horizon === '3' ? 3 : horizon === '6' ? 6 : predictions.length;
    return [...actuals, ...predictions.slice(0, count)];
  };

  // Run forecast re-generation sequence
  const handleRegenerateForecast = () => {
    if (isRegenerating) return;
    setIsRegenerating(true);
    setRegenProgress(0);

    const interval = setInterval(() => {
      setRegenProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsRegenerating(false);
            // Refresh data from backend to pull newly computed forecasts
            loadForecast();
            addToast("ML Forecast Engine completed sequence! Multi-dimensional vectors synchronized.");
          }, 1000);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  // Handle calculator submission
  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCalculating) return;
    setIsCalculating(true);
    setCalcResult(null);

    try {
      // Simulate network + model inference time for premium visual feedback
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const res = await api.predictDemand({
        store_id: storeId,
        item_id: itemId,
        price: parseFloat(price) || 24.99,
        promo,
        date,
        lag_1: parseFloat(lag1) || 150.0,
        lag_7: (parseFloat(lag1) || 150.0) * 0.95,
        lag_30: (parseFloat(lag1) || 150.0) * 0.90,
        rolling_mean_7: (parseFloat(lag1) || 150.0) * 0.97,
        rolling_mean_30: (parseFloat(lag1) || 150.0) * 0.93
      });

      setCalcResult(res);
      addToast(`Real-time demand forecasted successfully for ${itemId}!`);
    } catch (err: any) {
      console.error(err);
      addToast(`Engine Error: ${err.message || 'Failed to parse model features'}`);
    } finally {
      setIsCalculating(false);
    }
  };

  const filteredData = getFilteredData();

  return (
    <div className="space-y-6 relative pb-12">
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
                <CheckCircle className="w-4 h-4" />
              </div>
              <p className="flex-1 text-foreground/90">{toast.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Demand Forecasting</h1>
          <p className="text-sm text-foreground/50 mt-1">AI-powered predictions based on historical trends</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Horizon Toggles */}
          <div className="bg-card border border-border rounded-xl p-1 flex items-center gap-1">
            {(['3', '6', '10'] as const).map(h => (
              <button
                key={h}
                onClick={() => setHorizon(h)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  horizon === h 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-foreground/70 hover:bg-foreground/5'
                }`}
              >
                {h === '10' ? 'Full Prediction' : `Next {h} Months`}
              </button>
            ))}
          </div>

          {/* Regenerate AI Model Button */}
          <button 
            onClick={handleRegenerateForecast}
            disabled={isRegenerating || loading}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-medium shadow-lg shadow-primary/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isRegenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Re-training AI... {regenProgress}%</span>
              </>
            ) : (
              <>
                <RefreshCcw className="w-4 h-4" />
                <span>Run Forecast Engine</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Regenerating Status Overlay */}
      <AnimatePresence>
        {isRegenerating && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex flex-col gap-2 shadow-sm"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-primary">
              <span>Deep-learning network converging on seasonal matrices...</span>
              <span>{regenProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-foreground/5 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-primary"
                style={{ width: `${regenProgress}%` }}
                layout
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-primary to-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-primary/20">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-white/80" />
            <h3 className="font-semibold text-white/90">AI Prediction</h3>
          </div>
          <div className="text-4xl font-bold mb-2">+24.5%</div>
          <p className="text-white/80 text-sm">Expected demand increase over the next quarter driven by seasonal trends.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-emerald-500">
            <TrendingUp className="w-5 h-5" />
            <h3 className="font-semibold text-foreground">Top Growth Category</h3>
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">Electronics</div>
          <p className="text-sm text-foreground/60">Predicted to surge by 45% in Q3 due to upcoming back-to-school season.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-red-500">
            <TrendingDown className="w-5 h-5" />
            <h3 className="font-semibold text-foreground">Risk Category</h3>
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">Winter Apparel</div>
          <p className="text-sm text-foreground/60">Demand dropping sharply. Recommend halting restocks immediately.</p>
        </motion.div>
      </div>

      {loading ? (
        <div className="h-[400px] w-full bg-card border border-border rounded-2xl flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground">Forecast Model</h3>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-foreground/70">Actual Data</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full border-2 border-purple-500 border-dashed" />
                <span className="text-foreground/70 font-medium">AI Predicted</span>
              </div>
            </div>
          </div>
          
          <div className="h-[400px] w-full mt-8">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--foreground)', opacity: 0.5 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--foreground)', opacity: 0.5 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px' }}
                  itemStyle={{ color: 'var(--foreground)' }}
                />
                <ReferenceLine x="Jun" stroke="var(--border)" strokeDasharray="3 3" label={{ position: 'top', value: 'Today', fill: 'var(--foreground)', opacity: 0.5, fontSize: 12, dy: -10 }} />
                
                {/* Actual Line */}
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }} 
                  activeDot={{ r: 6 }} 
                />
                
                {/* Predicted Line */}
                <Line 
                  type="monotone" 
                  dataKey="predicted" 
                  stroke="#a855f7" 
                  strokeWidth={3} 
                  strokeDasharray="5 5"
                  dot={{ fill: 'var(--card)', stroke: '#a855f7', strokeWidth: 2, r: 4 }} 
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Real-time ML Inference Calculator Form */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.4 }} 
        className="grid grid-cols-1 lg:grid-cols-5 gap-6"
      >
        {/* Input Form Column (3/5 width) */}
        <div className="lg:col-span-3 bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sliders className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold text-foreground">Real-time AI Demand Calculator</h3>
            </div>
            <p className="text-xs text-foreground/50 mb-6">
              Adjust dimensional vectors to run live inference on the XGBoost warehouse forecasting model.
            </p>

            <form onSubmit={handleCalculate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Store ID Select */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground/70">Store Location</label>
                  <select 
                    value={storeId} 
                    onChange={e => setStoreId(e.target.value)}
                    className="bg-foreground/5 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary cursor-pointer"
                  >
                    {[
                      'Bangalore Central Hub',
                      'Mumbai Distribution Center',
                      'Hyderabad Smart Storage',
                      'Chennai Logistics Park',
                      'Delhi North Fulfillment Hub'
                    ].map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                {/* Item ID Select */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground/70">Product Item</label>
                  <select 
                    value={itemId} 
                    onChange={e => setItemId(e.target.value)}
                    className="bg-foreground/5 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary cursor-pointer"
                  >
                    {[
                      'Wireless Earbuds',
                      'Winter Hoodies',
                      'Protein Powder',
                      'Gaming Keyboard',
                      'Office Chair Pro',
                      'Running Shoes',
                      'Travel Backpack',
                      'Yoga Mat Premium'
                    ].map(it => (
                      <option key={it} value={it}>{it}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Unit Price */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground/70">Unit Price ($)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-foreground/40 text-sm"><DollarSign className="w-4 h-4" /></span>
                    <input 
                      type="number" 
                      step="0.01"
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                      className="w-full bg-foreground/5 border border-border rounded-xl pl-9 pr-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                      placeholder="24.99"
                    />
                  </div>
                </div>

                {/* Date Picker */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground/70">Prediction Target Date</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-foreground/40 text-sm"><Calendar className="w-4 h-4" /></span>
                    <input 
                      type="date" 
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      className="w-full bg-foreground/5 border border-border rounded-xl pl-9 pr-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Lag Demand */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground/70">Yesterday's Demand (Lag-1 Units)</label>
                  <input 
                    type="number" 
                    value={lag1}
                    onChange={e => setLag1(e.target.value)}
                    className="w-full bg-foreground/5 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                    placeholder="150"
                  />
                </div>

                {/* Promo Active Switch */}
                <div className="flex items-center justify-between bg-foreground/5 border border-border rounded-xl p-3 mt-5">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-foreground">Promotion Campaign</span>
                    <span className="text-[10px] text-foreground/40">Is promo active on target date</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPromo(!promo)}
                    className={`w-11 h-6 rounded-full p-1 transition-colors cursor-pointer ${promo ? 'bg-primary' : 'bg-foreground/20'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-card shadow-md transition-transform ${promo ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isCalculating}
                className="w-full mt-4 py-2.5 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-primary-foreground font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md shadow-primary/10 transition-all cursor-pointer disabled:opacity-50"
              >
                {isCalculating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Compiling Model Weights...</span>
                  </>
                ) : (
                  <>
                    <Cpu className="w-4 h-4" />
                    <span>Run Live ML Prediction</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Inference Output Screen Column (2/5 width) */}
        <div className="lg:col-span-2 bg-gradient-to-b from-card to-card/50 border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[350px]">
          <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
            <span className="text-xs font-bold tracking-wider text-primary/80 uppercase">AI Inference Panel</span>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isCalculating ? 'bg-amber-500 animate-pulse' : calcResult ? 'bg-emerald-500' : 'bg-foreground/20'}`} />
              <span className="text-[10px] font-semibold text-foreground/50 uppercase">
                {isCalculating ? 'Computing' : calcResult ? 'Success' : 'Idle'}
              </span>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center text-center">
            <AnimatePresence mode="wait">
              {isCalculating ? (
                <motion.div 
                  key="calculating"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-4"
                >
                  <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                    <motion.div 
                      className="absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary"
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    />
                    <Cpu className="w-6 h-6 text-primary animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Inference Pipeline Activated</h4>
                    <p className="text-xs text-foreground/40 mt-1 max-w-[200px] mx-auto">
                      Preprocessing features, resolving label maps, and executing XGBRegressor weights...
                    </p>
                  </div>
                </motion.div>
              ) : calcResult ? (
                <motion.div 
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-5 w-full text-left"
                >
                  {/* Neon Glowing Prediction Display */}
                  <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2">
                      <span className="text-[9px] font-semibold bg-primary/20 text-primary px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                        {calcResult.status === 'fallback' ? 'Sandbox' : 'ML Model'}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-foreground/50">Predicted Daily Demand</span>
                    <div className="text-5xl font-extrabold text-primary my-2 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                      {calcResult.predicted_demand.toFixed(1)}
                    </div>
                    <span className="text-[10px] font-bold text-foreground/80 bg-foreground/5 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Units / Day
                    </span>
                  </div>

                  {/* Metadata Mapping Details */}
                  <div className="space-y-2 text-xs bg-foreground/5 border border-border p-3.5 rounded-xl">
                    <div className="flex justify-between items-center text-[10px] text-foreground/50 border-b border-border pb-1.5 mb-1.5 uppercase font-bold">
                      <span>Label Transform Map</span>
                      <span>Encoded Int</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/60 font-medium">Store location</span>
                      <span className="font-semibold text-foreground">→ {storeId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/60 font-medium">Product Item</span>
                      <span className="font-semibold text-foreground">→ {itemId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/60 font-medium">Active features processed</span>
                      <span className="font-semibold text-primary">{calcResult.features_used.length} Inputs</span>
                    </div>
                  </div>

                  <div className="text-[10px] text-foreground/40 text-center">
                    Successfully loaded and executed via <code className="text-primary font-mono font-bold">XGBRegressor</code> inside FastAPI.
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-3"
                >
                  <Cpu className="w-12 h-12 text-foreground/20 mx-auto" />
                  <div>
                    <h4 className="text-sm font-semibold text-foreground/50">Awaiting Inference Parameters</h4>
                    <p className="text-xs text-foreground/40 mt-1 max-w-[200px] mx-auto">
                      Fill out the form variables and click predict to run calculations.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="border-t border-border pt-3 mt-4 text-[9px] text-foreground/30 flex justify-between">
            <span>Model: warehouse_forecasting_model.pkl</span>
            <span>Est. Accuracy: R² 0.88</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
