import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp } from 'lucide-react';
import config from '../config.json';

const OptimalTokenCalc = () => {
  const CONSTANTS = config;
  
  const [mode, setMode] = useState<'N_to_D' | 'D_to_N'>('N_to_D');
  const [inputN, setInputN] = useState(100); 
  const [inputD, setInputD] = useState(100);

  const term1 = (CONSTANTS.beta * CONSTANTS.B_norm) / (CONSTANTS.alpha * CONSTANTS.A_norm);
  const base_ratio_term = Math.pow(term1, 1 / CONSTANTS.beta);

  const calculateMetrics = (inputVal: number, calcMode: 'N_to_D' | 'D_to_N') => {
    let N = 0;
    let D = 0;

    if (calcMode === 'N_to_D') {
      N = inputVal;
      const n_ratio = N / CONSTANTS.N0;
      D = base_ratio_term * CONSTANTS.N0 * Math.pow(n_ratio, CONSTANTS.alpha / CONSTANTS.beta);
    } else {
      D = inputVal;
      const d_ratio = D / (base_ratio_term * CONSTANTS.N0);
      N = CONSTANTS.N0 * Math.pow(d_ratio, CONSTANTS.beta / CONSTANTS.alpha);
    }

    const optimal_ratio = D / N;
    const loss_term_A = CONSTANTS.A_norm * Math.pow(N / CONSTANTS.N0, -CONSTANTS.alpha);
    const loss_term_B = CONSTANTS.B_norm * Math.pow(D / CONSTANTS.D0, -CONSTANTS.beta);
    const total_loss = CONSTANTS.E + loss_term_A + loss_term_B;

    return { N, D, ratio: optimal_ratio, loss: total_loss };
  };

  const currentMetrics = useMemo(() => {
    if (mode === 'N_to_D') {
      return calculateMetrics(inputN * 1_000_000, 'N_to_D');
    } else {
      return calculateMetrics(inputD * 1_000_000_000, 'D_to_N');
    }
  }, [inputN, inputD, mode]);

  const chartData = useMemo(() => {
    const data = [];
    const minExp = 7;
    const maxExp = 11;
    for (let i = 0; i <= 50; i++) {
      const exp = minExp + (i / 50) * (maxExp - minExp);
      const N = Math.pow(10, exp);
      const metrics = calculateMetrics(N, 'N_to_D');
      data.push({ N_display: N, D_optimal: metrics.D, ratio: metrics.ratio });
    }
    return data;
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + "T";
    if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
    return num.toFixed(0);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      <div className="lg:col-span-1 space-y-6">
        <div className="google-card p-6">
          <div className="flex bg-[#f1f3f4] p-1 rounded-lg mb-6">
            <button 
              className={`flex-1 py-1.5 text-[13px] font-medium rounded-md transition-colors ${mode === 'N_to_D' ? 'bg-white shadow-sm text-[#1a73e8]' : 'text-[#5f6368] hover:text-[#202124]'}`}
              onClick={() => setMode('N_to_D')}
            >
              N → D
            </button>
            <button 
              className={`flex-1 py-1.5 text-[13px] font-medium rounded-md transition-colors ${mode === 'D_to_N' ? 'bg-white shadow-sm text-[#1a73e8]' : 'text-[#5f6368] hover:text-[#202124]'}`}
              onClick={() => setMode('D_to_N')}
            >
              D → N
            </button>
          </div>

          <h2 className="text-[16px] font-medium text-[#202124] mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-[#1a73e8]" /> 
            {mode === 'N_to_D' ? 'Target Parameters (N)' : 'Target Tokens (D)'}
          </h2>

          {mode === 'N_to_D' ? (
            <div className="mb-6">
              <label className="block text-[13px] font-medium text-[#3c4043] mb-2">Parameters (Millions)</label>
              <input type="number" value={inputN} onChange={(e) => setInputN(Number(e.target.value))} className="w-full google-input text-sm" min="1" />
              <input type="range" min="10" max="10000" step="10" value={inputN} onChange={(e) => setInputN(Number(e.target.value))} className="mt-4 w-full h-1 bg-[#e8eaed] rounded appearance-none cursor-pointer accent-[#1a73e8]" />
              <div className="text-right text-[12px] text-[#5f6368] mt-2">Current N: {formatNumber(inputN * 1_000_000)}</div>
            </div>
          ) : (
            <div className="mb-6">
              <label className="block text-[13px] font-medium text-[#3c4043] mb-2">Tokens (Billions)</label>
              <input type="number" value={inputD} onChange={(e) => setInputD(Number(e.target.value))} className="w-full google-input text-sm" min="1" />
              <input type="range" min="1" max="10000" step="10" value={inputD} onChange={(e) => setInputD(Number(e.target.value))} className="mt-4 w-full h-1 bg-[#e8eaed] rounded appearance-none cursor-pointer accent-[#1a73e8]" />
              <div className="text-right text-[12px] text-[#5f6368] mt-2">Current D: {formatNumber(inputD * 1_000_000_000)}</div>
            </div>
          )}

          <div className="space-y-3 border-t border-[#dadce0] pt-4">
            <div className="flex justify-between items-center px-4 py-3 bg-[#f8f9fa] rounded border border-[#dadce0]">
              <span className="text-[#3c4043] text-[14px] font-medium">Parameters (N)</span>
              <span className="text-xl font-normal text-[#1a73e8]">{formatNumber(currentMetrics.N)}</span>
            </div>
            <div className="flex justify-between items-center px-4 py-3 bg-[#f8f9fa] rounded border border-[#dadce0]">
              <span className="text-[#3c4043] text-[14px] font-medium">Optimal Tokens (D)</span>
              <span className="text-xl font-normal text-[#1a73e8]">{formatNumber(currentMetrics.D)}</span>
            </div>
            <div className="flex justify-between items-center px-4 py-3 bg-[#e6f4ea] rounded border border-[#e6f4ea]">
              <span className="text-[#137333] text-[14px] font-medium">Ratio (D/N)</span>
              <span className="text-xl font-normal text-[#137333]">{currentMetrics.ratio.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center px-4 py-3 bg-[#fef7e0] rounded border border-[#fef7e0]">
              <span className="text-[#b06000] text-[14px] font-medium">Estimated Loss</span>
              <span className="text-xl font-mono text-[#b06000]">{currentMetrics.loss.toFixed(4)}</span>
            </div>
          </div>
        </div>

        <div className="google-card p-6">
          <h2 className="text-[16px] font-medium text-[#202124] mb-4">Coefficients</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {Object.entries({ 'E (Loss)': CONSTANTS.E, 'Norm (N0)': '100M', 'Alpha (α)': CONSTANTS.alpha, 'Beta (β)': CONSTANTS.beta }).map(([key, val]) => (
              <div key={key} className="p-3 bg-[#f8f9fa] rounded border border-[#dadce0]">
                <div className="text-[#5f6368] text-[12px] mb-1">{key}</div>
                <div className="font-mono text-[#202124] font-medium">{val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-6 flex flex-col">
        <div className="google-card p-6 h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-4 shrink-0">
            <h2 className="text-[16px] font-medium text-[#202124]">Token/Parameter Ratio Scaling</h2>
            <div className="text-[13px] text-[#5f6368] flex gap-4">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#34a853]"></span>MORTM Optimal</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f4" />
              <XAxis dataKey="N_display" scale="log" domain={['auto', 'auto']} type="number" tickFormatter={(val) => formatNumber(val)} stroke="#5f6368" fontSize={12} label={{ value: 'Parameters (N)', position: 'bottom', offset: 0, fill: '#5f6368', fontSize: 12 }} />
              <YAxis label={{ value: 'Ratio D/N', angle: -90, position: 'insideLeft', fill: '#5f6368', fontSize: 13 }} stroke="#5f6368" fontSize={12} />
              <Tooltip formatter={(value: any) => [Number(value).toFixed(1), 'MORTM Ratio']} labelFormatter={(label: any) => `Params: ${formatNumber(label)}`} contentStyle={{ borderRadius: '8px', border: '1px solid #dadce0', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }} />
              <Line type="monotone" dataKey="ratio" stroke="#34a853" strokeWidth={3} dot={false} name="MORTM Ratio" />
              <ReferenceLine x={currentMetrics.N} stroke="#1a73e8" strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="google-card p-6 h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-4 shrink-0">
             <h2 className="text-[16px] font-medium text-[#202124]">Optimal Tokens (D) vs Parameters (N)</h2>
             <div className="text-[13px] text-[#5f6368] flex gap-4">
               <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#1a73e8]"></span>MORTM Optimal D</span>
             </div>
          </div>
          
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f4" />
              <XAxis dataKey="N_display" scale="log" domain={['auto', 'auto']} type="number" tickFormatter={(val) => formatNumber(val)} stroke="#5f6368" fontSize={12} label={{ value: 'Parameters (N)', position: 'bottom', offset: 0, fill: '#5f6368', fontSize: 12 }} />
              <YAxis scale="log" domain={['auto', 'auto']} tickFormatter={(val) => formatNumber(val)} label={{ value: 'Tokens (D)', angle: -90, position: 'insideLeft', fill: '#5f6368', fontSize: 13 }} stroke="#5f6368" fontSize={12} />
              <Tooltip formatter={(value: any) => formatNumber(Number(value))} labelFormatter={(label: any) => `Params: ${formatNumber(label)}`} contentStyle={{ borderRadius: '8px', border: '1px solid #dadce0', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }} />
              <Line type="monotone" dataKey="D_optimal" stroke="#1a73e8" strokeWidth={3} dot={false} name="MORTM Optimal D" />
              <ReferenceLine x={currentMetrics.N} stroke="#ea4335" strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default OptimalTokenCalc;
