import React from 'react';
import { GuidanceResult } from '../types';

interface StatusBadgeProps {
  status: GuidanceResult['status'];
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const styles = {
    recommended: "bg-green-100 text-green-800 border-green-200",
    shared: "bg-yellow-100 text-yellow-800 border-yellow-200",
    not_recommended: "bg-red-100 text-red-800 border-red-200"
  };
  
  const labels = {
    recommended: "推奨 (Rec)",
    shared: "個別 (Shared)",
    not_recommended: "非推奨 (Not Rec)"
  };

  return (
    <span className={`text-xs font-bold px-2 py-1 rounded border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

export default StatusBadge;