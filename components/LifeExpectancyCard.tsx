import React from 'react';
import { IconHourglass, IconActivity } from './Icons';
import { ComorbidityLevel } from '../types';

interface LifeExpectancyCardProps {
  age: number;
  personalEx: number;
  referenceEx: number;
  comorbidity: ComorbidityLevel;
}

const LifeExpectancyCard: React.FC<LifeExpectancyCardProps> = ({ age, personalEx, referenceEx, comorbidity }) => {
  const expectedAge = (age + personalEx).toFixed(1);
  // const standardAge = (age + referenceEx).toFixed(1); // Not used in display but part of original logic
  const lostYears = (referenceEx - personalEx).toFixed(1);
  const isWarning = personalEx < 10;
  const percentage = Math.min(100, (personalEx / referenceEx) * 100);

  return (
    <div className="bg-white p-6 rounded-2xl card-shadow border border-indigo-100 mb-6">
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <IconHourglass className="w-5 h-5 text-indigo-600" />
        期待余命の推定 (Life Expectancy Estimation)
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
        {/* Personal Stat */}
        <div className="bg-indigo-50 p-4 rounded-xl text-center">
          <p className="text-sm text-slate-500 mb-1">あなたの推定余命</p>
          <div className="text-4xl font-extrabold text-indigo-700">
            {personalEx.toFixed(1)} <span className="text-lg text-indigo-500">年</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            期待死亡年齢: <strong>{expectedAge}歳</strong>
          </p>
        </div>

        {/* Comparison Stat */}
        <div className="flex flex-col justify-center space-y-3">
          <div>
            <div className="flex justify-between text-sm text-slate-600 mb-1">
              <span>あなたの余命</span>
              <span>同年代(健康)の余命: {referenceEx.toFixed(1)}年</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ease-in-out ${isWarning ? 'bg-orange-500' : 'bg-blue-500'}`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>

          {comorbidity !== 'none' && (
            <div className="text-xs text-red-600 font-bold flex items-center gap-1">
              <IconActivity className="w-4 h-4" />
              基礎疾患による喪失余命: 約 {lostYears} 年
            </div>
          )}

          {isWarning && (
            <div className="text-xs bg-orange-100 text-orange-800 p-2 rounded border border-orange-200">
              <strong>注意:</strong> 期待余命が10年未満です。多くのがん検診ガイドラインでは、検診の中止（卒業）が考慮される水準です。
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LifeExpectancyCard;