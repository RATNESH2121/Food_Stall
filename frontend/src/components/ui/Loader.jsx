import { Loader2 } from 'lucide-react';

export default function Loader({ className = "" }) {
  return (
    <div className={`flex justify-center items-center h-48 ${className}`}>
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
    </div>
  );
}
