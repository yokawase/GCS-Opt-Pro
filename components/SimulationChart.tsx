import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SimulationResult } from '../types';
import { IconInfo } from './Icons';

interface SimulationChartProps {
  result: SimulationResult;
  guidanceMessage: string;
}

const SimulationChart: React.FC<SimulationChartProps> = ({ result, guidanceMessage }) => {
  return (
    <div className="bg-white p-6 rounded-2xl card-shadow border border-blue-100">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">胃がん検診シミュレーション</h3>
          <p className="text-sm text-slate-500">ピロリ除菌介入による獲得余命の算出</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-400">推計獲得余命</div>
          <div className="text-3xl font-extrabold text-blue-600">
            {result.gainDays.toFixed(1)} <span className="text-sm text-slate-500">日</span>
          </div>
        </div>
      </div>
      
      <div className="h-48 w-full mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={result.survivalData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="age" tick={{ fontSize: 10 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
            <Tooltip formatter={(val: number) => `${val}%`} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Line 
              type="monotone" 
              dataKey="Base" 
              stroke="#94a3b8" 
              strokeDasharray="5 5" 
              name="現状" 
              strokeWidth={2} 
              dot={false} 
            />
            <Line 
              type="monotone" 
              dataKey="Intervention" 
              stroke="#2563eb" 
              name="介入後" 
              strokeWidth={3} 
              dot={false} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800 flex items-start gap-2">
        <IconInfo className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <span><strong>判定: </strong>{guidanceMessage}</span>
      </div>
    </div>
  );
};

export default SimulationChart;