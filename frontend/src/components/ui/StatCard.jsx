import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function StatCard({ title, value, subtitle, icon: Icon, gradient, trend, trendValue, delay = 0 }) {
  const trendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const TrendIcon = trendIcon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={`${gradient} rounded-2xl p-5 text-white shadow-lg relative overflow-hidden cursor-default`}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -translate-y-8 translate-x-8" />
      <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full bg-black/5 translate-y-6 -translate-x-4" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
            <Icon className="w-5 h-5 text-white" />
          </div>
          {trendValue && (
            <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${
              trend === 'up' ? 'bg-white/20 text-white' : 'bg-black/15 text-white/80'
            }`}>
              <TrendIcon className="w-3 h-3" />
              {trendValue}
            </div>
          )}
        </div>

        <div>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          <p className="text-sm font-semibold text-white/90 mt-1">{title}</p>
          {subtitle && (
            <p className="text-xs text-white/60 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
