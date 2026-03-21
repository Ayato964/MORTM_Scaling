import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Calculator, TrendingUp, AlertTriangle } from 'lucide-react';

const OptimalTokenCalc = () => {
  const CONSTANTS = { E: 0.65163, N0: 100_000_000, D0: 100_000_000, A_norm: 0.32154, alpha: 0.10206, B_norm: 0.50357, beta: 0.30357 };
  const [inputParams, setInputParams] = useState(100);

  const calculateMetrics = (N_raw: number) => {
    const N = N_raw;
    const term1 = (CONSTANTS.beta * CONSTANTS.B_norm) / (CONSTANTS.alpha * CONSTANTS.A_norm);
    const exponent1 = 1 / CONSTANTS.beta;
    const base_ratio_term = Math.pow(term1, exponent1);
    const n_ratio = N / CONSTANTS.N0;
    const scaling_exponent = (CONSTANTS.alpha / CONSTANTS.beta) - 1;
    const optimal_ratio = base_ratio_term * Math.pow(n_ratio, scaling_exponent);
    const optimal_D = optimal_ratio * N;

    const loss_term_A = CONSTANTS.A_norm * Math.pow(N / CONSTANTS.N0, -CONSTANTS.alpha);
    const loss_term_B = CONSTANTS.B_norm * Math.pow(optimal_D / CONSTANTS.D0, -CONSTANTS.beta);
    const total_loss = CONSTANTS.E + loss_term_A + loss_term_B;

    return { N, D: optimal_D, ratio: optimal_ratio, loss: total_loss, loss_A: loss_term_A, loss_B: loss_term_B };
  };

  const currentMetrics = useMemo(() => calculateMetrics(inputParams * 1_000_000), [inputParams]);

  const chartData = useMemo(() => {
    const data = [];
    const minExp = 7;
    const maxExp = 10;
    for (let i = 0; i <= 50; i++) {
      const exp = minExp + (i / 50) * (maxExp - minExp);
      const N = Math.pow(10, exp);
      const metrics = calculateMetrics(N);
      data.push({ N_display: N, D_optimal: metrics.D, ratio: metrics.ratio, chinchilla_D: N * 20, chinchilla_ratio: 20 });
    }
    return data;
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
    return num.toFixed(0);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      <div className="lg:col-span-1 space-y-6">
        <div className="google-card p-6">
          <h2 className="text-[16px] font-medium text-[#202124] mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-[#1a73e8]" /> Target Parameters (N)
          </h2>
          <div className="mb-6">
            <label className="block text-[13px] font-medium text-[#3c4043] mb-2">Parameters (Millions)</label>
            <input type="number" value={inputParams} onChange={(e) => setInputParams(Number(e.target.value))} className="w-full google-input text-sm" min="1" />
            <input type="range" min="10" max="10000" step="10" value={inputParams} onChange={(e) => setInputParams(Number(e.target.value))} className="mt-4 w-full h-1 bg-[#e8eaed] rounded appearance-none cursor-pointer accent-[#1a73e8]" />
            <div className="text-right text-[12px] text-[#5f6368] mt-2">Current: {formatNumber(inputParams * 1_000_000)}</div>
          </div>
          <div className="space-y-4 border-t border-[#dadce0] pt-4">
            <div className="flex justify-between items-center px-4 py-3 bg-[#e8f0fe] rounded border border-[#e8f0fe]">
              <span className="text-[#1967d2] text-[14px] font-medium">Optimal Tokens (D)</span>
              <span className="text-2xl font-normal text-[#1967d2]">{formatNumber(currentMetrics.D)}</span>
            </div>
            <div className="flex justify-between items-center px-4 py-3 bg-[#e6f4ea] rounded border border-[#e6f4ea]">
              <span className="text-[#137333] text-[14px] font-medium">Ratio (D/N)</span>
              <span className="text-2xl font-normal text-[#137333]">{currentMetrics.ratio.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center px-4 py-3 bg-[#f8f9fa] rounded border border-[#dadce0]">
              <span className="text-[#3c4043] text-[14px] font-medium">Estimated Loss</span>
              <span className="text-xl font-mono text-[#202124]">{currentMetrics.loss.toFixed(4)}</span>
            </div>
          </div>
          {currentMetrics.ratio > 100 && (
            <div className="mt-4 p-3 bg-[#fef7e0] border border-[#fbbc04] rounded flex gap-3 text-[13px] text-[#b06000]">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>High token-to-parameter ratio. Due to low α, this model requires significantly more data than Chinchilla at this scale.</p>
            </div>
          )}
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
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#9aa0a6]"></span>Chinchilla (Fixed 20)</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f4" />
              <XAxis dataKey="N_display" scale="log" domain={['auto', 'auto']} type="number" tickFormatter={(val) => formatNumber(val)} stroke="#5f6368" fontSize={12} label={{ value: 'Parameters (N)', position: 'bottom', offset: 0, fill: '#5f6368', fontSize: 12 }} />
              <YAxis label={{ value: 'Ratio D/N', angle: -90, position: 'insideLeft', fill: '#5f6368', fontSize: 13 }} stroke="#5f6368" fontSize={12} />
              <Tooltip formatter={(value: number, name: string) => [value.toFixed(1), name === 'ratio' ? 'MORTM Ratio' : 'Chinchilla Ratio']} labelFormatter={(label: any) => `Params: ${formatNumber(label)}`} contentStyle={{ borderRadius: '8px', border: '1px solid #dadce0', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }} />
              <Line type="monotone" dataKey="ratio" stroke="#34a853" strokeWidth={3} dot={false} name="MORTM Ratio" />
              <Line type="monotone" dataKey="chinchilla_ratio" stroke="#9aa0a6" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Chinchilla (20)" />
              <ReferenceLine x={inputParams * 1_000_000} stroke="#1a73e8" strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="google-card p-6 h-[400px] flex flex-col">
          <h2 className="text-[16px] font-medium text-[#202124] mb-4 shrink-0">Optimal Tokens (D) vs Parameters (N)</h2>
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f4" />
              <XAxis dataKey="N_display" scale="log" domain={['auto', 'auto']} type="number" tickFormatter={(val) => formatNumber(val)} stroke="#5f6368" fontSize={12} label={{ value: 'Parameters (N)', position: 'bottom', offset: 0, fill: '#5f6368', fontSize: 12 }} />
              <YAxis scale="log" domain={['auto', 'auto']} tickFormatter={(val) => formatNumber(val)} label={{ value: 'Tokens (D)', angle: -90, position: 'insideLeft', fill: '#5f6368', fontSize: 13 }} stroke="#5f6368" fontSize={12} />
              <Tooltip formatter={(value: number) => formatNumber(value)} labelFormatter={(label: any) => `Params: ${formatNumber(label)}`} contentStyle={{ borderRadius: '8px', border: '1px solid #dadce0', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />
              <Line type="monotone" dataKey="D_optimal" stroke="#1a73e8" strokeWidth={3} dot={false} name="MORTM Optimal D" />
              <Line type="monotone" dataKey="chinchilla_D" stroke="#9aa0a6" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Chinchilla (D = 20N)" />
              <ReferenceLine x={inputParams * 1_000_000} stroke="#ea4335" strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default OptimalTokenCalc;
