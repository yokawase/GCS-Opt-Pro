import React from 'react';
import { IconCheckCircle, IconInfo, IconXCircle } from './Icons';
import StatusBadge from './StatusBadge';
import { GuidanceResult } from '../types';

interface ScreeningCardProps {
  title: string;
  guidance: GuidanceResult;
}

const ScreeningCard: React.FC<ScreeningCardProps> = ({ title, guidance }) => {
  const { status, message } = guidance;
  
  const borderColor = 
    status === 'recommended' ? 'border-green-500' : 
    status === 'shared' ? 'border-yellow-500' : 
    'border-red-500';

  const icon = 
    status === 'recommended' ? <IconCheckCircle className="text-green-500 w-5 h-5" /> : 
    status === 'shared' ? <IconInfo className="text-yellow-500 w-5 h-5" /> : 
    <IconXCircle className="text-red-500 w-5 h-5" />;

  return (
    <div className={`bg-white rounded-lg border-l-4 ${borderColor} p-4 shadow-sm mb-3`}>
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-slate-800">{title}</h4>
        {icon}
      </div>
      <div className="mb-2">
        <StatusBadge status={status} />
      </div>
      <p className="text-xs text-slate-600 leading-relaxed">{message}</p>
    </div>
  );
};

export default ScreeningCard;