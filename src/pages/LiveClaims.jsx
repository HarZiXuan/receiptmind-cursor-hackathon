import { Activity } from 'lucide-react';

export default function LiveClaims() {
  return (
    <div className="bg-white p-12 rounded-xl border border-gray-200 shadow-card text-center">
      <Activity size={48} className="mx-auto text-gray-300 mb-4" />
      <h2 className="text-lg font-semibold text-gray-900">Live Claims Feed</h2>
      <p className="text-gray-500">Waiting for real-time transactions...</p>
    </div>
  );
}

