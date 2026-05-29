import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  Package, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownRight,
  Search,
  Filter
} from 'lucide-react';
import { api } from '../services/api';

// Dummy Data
const DUMMY_ORDERS_RECEIVED = [
  { id: 'ORD-1001', customer: 'Acme Corp', product: 'Wireless Earbuds', quantity: 50, date: '2026-05-28', status: 'Pending', priority: 'High', delivery: '2026-06-02' },
  { id: 'ORD-1002', customer: 'Global Tech', product: 'Office Chair Pro', quantity: 12, date: '2026-05-28', status: 'Processing', priority: 'Medium', delivery: '2026-06-05' },
  { id: 'ORD-1003', customer: 'Jane Doe', product: 'Gaming Keyboard', quantity: 1, date: '2026-05-27', status: 'Packed', priority: 'Low', delivery: '2026-05-30' },
  { id: 'ORD-1004', customer: 'Smith Ltd', product: 'Travel Backpack', quantity: 5, date: '2026-05-27', status: 'Shipped', priority: 'Medium', delivery: '2026-05-29' },
  { id: 'ORD-1005', customer: 'John Smith', product: 'Running Shoes', quantity: 2, date: '2026-05-26', status: 'Delivered', priority: 'Low', delivery: '2026-05-28' },
  { id: 'ORD-1006', customer: 'Tech Haven', product: 'Wireless Earbuds', quantity: 100, date: '2026-05-26', status: 'Pending', priority: 'High', delivery: '2026-06-01' },
  { id: 'ORD-1007', customer: 'Fitness Co', product: 'Yoga Mat Premium', quantity: 30, date: '2026-05-25', status: 'Processing', priority: 'Medium', delivery: '2026-05-30' },
  { id: 'ORD-1008', customer: 'Retail Giant', product: 'Winter Hoodies', quantity: 200, date: '2026-05-25', status: 'Shipped', priority: 'High', delivery: '2026-05-28' },
  { id: 'ORD-1009', customer: 'Alice Brown', product: 'Protein Powder', quantity: 3, date: '2026-05-24', status: 'Delivered', priority: 'Low', delivery: '2026-05-26' },
  { id: 'ORD-1010', customer: 'Mike Johnson', product: 'Gaming Keyboard', quantity: 2, date: '2026-05-24', status: 'Pending', priority: 'Medium', delivery: '2026-05-29' },
  { id: 'ORD-1011', customer: 'StartUp Inc', product: 'Office Chair Pro', quantity: 8, date: '2026-05-23', status: 'Packed', priority: 'High', delivery: '2026-05-27' },
  { id: 'ORD-1012', customer: 'Gym Bros', product: 'Protein Powder', quantity: 50, date: '2026-05-23', status: 'Shipped', priority: 'Medium', delivery: '2026-05-26' },
  { id: 'ORD-1013', customer: 'Sarah Connor', product: 'Travel Backpack', quantity: 1, date: '2026-05-22', status: 'Delivered', priority: 'Low', delivery: '2026-05-25' },
  { id: 'ORD-1014', customer: 'MegaStore', product: 'Wireless Earbuds', quantity: 500, date: '2026-05-22', status: 'Processing', priority: 'High', delivery: '2026-06-05' },
  { id: 'ORD-1015', customer: 'Bob Wilson', product: 'Running Shoes', quantity: 1, date: '2026-05-21', status: 'Delivered', priority: 'Low', delivery: '2026-05-24' },
];

const DUMMY_ORDERS_PLACED = [
  { id: 'PO-9001', supplier: 'AudioTech Supplies', product: 'Wireless Earbuds', quantity: 1000, date: '2026-05-28', status: 'Requested', arrival: '2026-06-15' },
  { id: 'PO-9002', supplier: 'Ergo Furnishings', product: 'Office Chair Pro', quantity: 50, date: '2026-05-27', status: 'Confirmed', arrival: '2026-06-10' },
  { id: 'PO-9003', supplier: 'KeyTronix', product: 'Gaming Keyboard', quantity: 200, date: '2026-05-25', status: 'In Transit', arrival: '2026-06-01' },
  { id: 'PO-9004', supplier: 'ActiveWear Inc', product: 'Winter Hoodies', quantity: 500, date: '2026-05-20', status: 'Received', arrival: '2026-05-25' },
  { id: 'PO-9005', supplier: 'FitGear Co', product: 'Yoga Mat Premium', quantity: 100, date: '2026-05-28', status: 'Requested', arrival: '2026-06-12' },
  { id: 'PO-9006', supplier: 'NutriLife', product: 'Protein Powder', quantity: 300, date: '2026-05-24', status: 'Confirmed', arrival: '2026-06-05' },
  { id: 'PO-9007', supplier: 'BagMakers Ltd', product: 'Travel Backpack', quantity: 150, date: '2026-05-22', status: 'In Transit', arrival: '2026-05-30' },
  { id: 'PO-9008', supplier: 'ShoeFactory', product: 'Running Shoes', quantity: 250, date: '2026-05-18', status: 'Received', arrival: '2026-05-22' },
  { id: 'PO-9009', supplier: 'AudioTech Supplies', product: 'Wireless Earbuds', quantity: 500, date: '2026-05-15', status: 'Received', arrival: '2026-05-20' },
  { id: 'PO-9010', supplier: 'Ergo Furnishings', product: 'Office Chair Pro', quantity: 20, date: '2026-05-28', status: 'Requested', arrival: '2026-06-20' },
];

export const Orders: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'received' | 'placed'>('received');
  const [ordersReceived, setOrdersReceived] = useState(DUMMY_ORDERS_RECEIVED);
  const [ordersPlaced, setOrdersPlaced] = useState(DUMMY_ORDERS_PLACED);

  // In a real app, fetch from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const received = await api.getOrdersReceived();
        if (received && received.length > 0) setOrdersReceived(received);
        
        const placed = await api.getOrdersPlaced();
        if (placed && placed.length > 0) setOrdersPlaced(placed);
      } catch (e) {
        // Fallback to dummy data already set
        console.warn('Using dummy order data');
      }
    };
    fetchOrders();
  }, []);

  const stats = [
    { title: 'Orders Received', value: '1,248', change: '+12.5%', isPositive: true, icon: ShoppingCart },
    { title: 'Orders Placed', value: '45', change: '+5.2%', isPositive: true, icon: Package },
    { title: 'Pending Orders', value: '320', change: '-2.4%', isPositive: true, icon: Clock },
    { title: 'Completed Orders', value: '890', change: '+18.1%', isPositive: true, icon: CheckCircle2 },
  ];

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'pending':
      case 'requested':
        return 'bg-amber-500/10 text-amber-500';
      case 'processing':
      case 'confirmed':
        return 'bg-blue-500/10 text-blue-500';
      case 'packed':
      case 'in transit':
        return 'bg-purple-500/10 text-purple-500';
      case 'shipped':
        return 'bg-indigo-500/10 text-indigo-500';
      case 'delivered':
      case 'received':
        return 'bg-emerald-500/10 text-emerald-500';
      default:
        return 'bg-foreground/10 text-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority.toLowerCase()) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-amber-500';
      case 'low': return 'text-emerald-500';
      default: return 'text-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Order Management</h1>
          <p className="text-sm text-foreground/50 mt-1">Track incoming customer orders and outgoing supplier restocks</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
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
                <div className="p-3 rounded-xl bg-primary/10 text-primary">
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

      {/* Tabs & Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col"
      >
        <div className="border-b border-border px-6 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('received')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'received' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-foreground/60 hover:text-foreground hover:border-border'
              }`}
            >
              Orders Received (Customer)
            </button>
            <button
              onClick={() => setActiveTab('placed')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'placed' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-foreground/60 hover:text-foreground hover:border-border'
              }`}
            >
              Orders Placed (Supplier)
            </button>
          </div>
          
          <div className="flex items-center gap-3 pb-3 sm:pb-0">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
              <input 
                type="text" 
                placeholder="Search orders..." 
                className="pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground w-full sm:w-64"
              />
            </div>
            <button className="p-2 border border-border rounded-lg text-foreground/70 hover:bg-background transition-colors">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-background/50 text-xs font-semibold text-foreground/60 uppercase tracking-wider">
                {activeTab === 'received' ? (
                  <>
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Qty</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Expected Delivery</th>
                    <th className="px-6 py-4">Priority</th>
                    <th className="px-6 py-4 text-right">Status</th>
                  </>
                ) : (
                  <>
                    <th className="px-6 py-4">PO ID</th>
                    <th className="px-6 py-4">Supplier</th>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Qty</th>
                    <th className="px-6 py-4">Order Date</th>
                    <th className="px-6 py-4">Expected Arrival</th>
                    <th className="px-6 py-4 text-right">Status</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <AnimatePresence mode="wait">
                {activeTab === 'received' ? (
                  ordersReceived.map((order, i) => (
                    <motion.tr 
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="hover:bg-foreground/[0.02] transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{order.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground/80">{order.customer}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground/80">{order.product}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{order.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground/60">{order.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground/60">{order.delivery}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span className={getPriorityColor(order.priority)}>{order.priority}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  ordersPlaced.map((order, i) => (
                    <motion.tr 
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="hover:bg-foreground/[0.02] transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{order.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground/80">{order.supplier}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground/80">{order.product}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{order.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground/60">{order.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground/60">{order.arrival}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};
