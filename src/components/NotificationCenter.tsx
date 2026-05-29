import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, ShoppingCart, Package, AlertTriangle, TrendingUp, Sparkles, FileText, Check } from 'lucide-react';
import { api } from '../services/api';

export const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await api.getNotifications();
        setNotifications(data);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };
    
    fetchNotifications();
    // In a real app, we might poll or use WebSocket here
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'new_order': return <ShoppingCart className="w-4 h-4 text-blue-500" />;
      case 'supplier_order': return <Package className="w-4 h-4 text-emerald-500" />;
      case 'low_stock': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'demand_spike': return <TrendingUp className="w-4 h-4 text-purple-500" />;
      case 'recommendation_executed': return <Sparkles className="w-4 h-4 text-primary" />;
      case 'report_sent': return <FileText className="w-4 h-4 text-foreground/50" />;
      default: return <Bell className="w-4 h-4 text-foreground/50" />;
    }
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({...n, read: true})));
    // Here we'd call an API to mark as read
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-foreground/5 transition-colors relative"
      >
        <Bell className="w-5 h-5 text-foreground/70" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-background"></span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col"
          >
            <div className="px-4 py-3 border-b border-border flex justify-between items-center bg-background/50">
              <h3 className="font-semibold text-foreground">Notifications</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllRead}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> Mark all read
                </button>
              )}
            </div>
            
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notif, idx) => (
                  <div 
                    key={notif.id || idx} 
                    className={`p-4 border-b border-border/50 last:border-0 hover:bg-background/50 transition-colors flex gap-3 ${!notif.read ? 'bg-primary/5' : ''}`}
                  >
                    <div className="mt-0.5 shrink-0">
                      <div className={`p-2 rounded-full bg-background border border-border shadow-sm`}>
                        {getIcon(notif.type)}
                      </div>
                    </div>
                    <div>
                      <p className={`text-sm text-foreground leading-tight ${!notif.read ? 'font-medium' : ''}`}>
                        {notif.message}
                      </p>
                      <span className="text-xs text-foreground/50 mt-1 block">
                        {new Date(notif.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-foreground/50 text-sm">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  No notifications yet.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
