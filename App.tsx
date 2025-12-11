import React, { useState, useMemo } from 'react';
import { calculateSimulation, getScreeningGuidance } from './services/logic';
import LifeExpectancyCard from './components/LifeExpectancyCard';
import SimulationChart from './components/SimulationChart';
import ScreeningCard from './components/ScreeningCard';
import { IconHeartPulse, IconUser, IconLungs } from './components/Icons';
import { Sex, ComorbidityLevel, SimulationResult, GuidanceMap } from './types';

const App = () => {
  const [age, setAge] = useState<number>(75); // Default to elderly to show effect
  const [sex, setSex] = useState<Sex>('Male');
  const [comorbidity, setComorbidity] = useState<ComorbidityLevel>('mild');
  const [isSmoker, setIsSmoker] = useState<boolean>(false);

  // Calculate result synchronously as derived state.
  // This ensures 'result' is never null on first render, preventing white flashes or layout shifts.
  const result: SimulationResult = useMemo(() => {
    return calculateSimulation(age, sex, comorbidity);
  }, [age, sex, comorbidity]);

  const guidance: GuidanceMap = useMemo(() => {
    const le = result.personalEx;
    return {
      gastric: getScreeningGuidance('gastric', age, sex, comorbidity, isSmoker, le),
      colorectal: getScreeningGuidance('colorectal', age, sex, comorbidity, isSmoker, le),
      lung: getScreeningGuidance('lung', age, sex, comorbidity, isSmoker, le),
      breast: getScreeningGuidance('breast', age, sex, comorbidity, isSmoker, le),
      cervical: getScreeningGuidance('cervical', age, sex, comorbidity, isSmoker, le),
    };
  }, [age, sex, comorbidity, isSmoker, result]);

  return (
    <div className="min-h-screen pb-12">
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-2">
          <div className="bg-blue-600 text-white p-2 rounded-lg">
            <IconHeartPulse className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 leading-tight">GCS-Opt Pro</h1>
            <p className="text-xs text-slate-500">Comprehensive Cancer Screening & Life Expectancy Optimizer</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Input Panel */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-2xl card-shadow sticky top-24">
              <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <IconUser className="w-5 h-5 text-blue-500" />
                患者プロファイル
              </h2>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  年齢: <span className="text-blue-600 font-bold">{age}歳</span>
                </label>
                <input 
                  type="range" 
                  min="30" 
                  max="95" 
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value))} 
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>30</span><span>95</span>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">性別</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setSex('Male')} 
                    className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${sex === 'Male' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                  >
                    男性
                  </button>
                  <button 
                    onClick={() => setSex('Female')} 
                    className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${sex === 'Female' ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-600'}`}
                  >
                    女性
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">基礎疾患 (Comorbidity)</label>
                <div className="space-y-2">
                  {[
                    { id: 'none', label: 'なし (None)', desc: '健康' },
                    { id: 'mild', label: '軽度 (Mild)', desc: '高血圧、安定した糖尿病' },
                    { id: 'severe', label: '重度 (Severe)', desc: '心不全、認知症、フレイル' }
                  ].map((opt) => (
                    <button 
                      key={opt.id} 
                      onClick={() => setComorbidity(opt.id as ComorbidityLevel)}
                      className={`w-full text-left p-3 rounded-lg border ${comorbidity === opt.id ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-slate-200'}`}
                    >
                      <div className={`text-sm font-bold ${comorbidity === opt.id ? 'text-blue-700' : 'text-slate-700'}`}>{opt.label}</div>
                      <div className="text-xs text-slate-500">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-2">
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                  <input 
                    type="checkbox" 
                    checked={isSmoker} 
                    onChange={(e) => setIsSmoker(e.target.checked)} 
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" 
                  />
                  <div>
                    <div className="text-sm font-bold text-slate-700">喫煙歴あり (Smoker)</div>
                    <div className="text-xs text-slate-500">肺がんリスク評価用</div>
                  </div>
                  <IconLungs className="ml-auto text-slate-400 w-5 h-5" />
                </label>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. Life Expectancy Card */}
            <LifeExpectancyCard
              age={age}
              personalEx={result.personalEx}
              referenceEx={result.referenceEx}
              comorbidity={comorbidity}
            />

            {/* 2. Gastric Cancer Simulation */}
            <SimulationChart 
              result={result} 
              guidanceMessage={guidance.gastric.message} 
            />

            {/* 3. Other Cancer Guidelines */}
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4 px-1">他のがん検診の適応判定 (Guidelines)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ScreeningCard title="大腸がん (Colorectal)" guidance={guidance.colorectal} />
                <ScreeningCard title="肺がん (Lung)" guidance={guidance.lung} />
                <ScreeningCard title="乳がん (Breast)" guidance={guidance.breast} />
                <ScreeningCard title="子宮頸がん (Cervical)" guidance={guidance.cervical} />
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default App;