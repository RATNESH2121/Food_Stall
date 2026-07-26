import { motion } from 'framer-motion';

export default function Loader({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="relative">
        <div className="w-10 h-10 rounded-full border-2 border-blue-100 border-t-blue-600 animate-spin" />
        <div className="absolute inset-0 w-10 h-10 rounded-full border-2 border-transparent border-r-blue-400 animate-spin" style={{ animationDuration: '0.6s', animationDirection: 'reverse' }} />
      </div>
      <p className="text-sm text-slate-400 font-medium">{text}</p>
    </div>
  );
}
