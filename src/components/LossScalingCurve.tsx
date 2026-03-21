import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Label } from 'recharts';
import { Settings, TrendingDown, Info, Sigma } from 'lucide-react';

const LossScalingCurve = () => {
  const defaultParams = {
    E: 0.65163,
    A_norm: 0.32154,
    alpha: 0.10206,
    B_norm: 0.50357,
    beta: 0.30357,
    N0: 1e8,
    D0: 1e8,
  };

  const [params, setParams] = useState(defaultParams);
  const [inputs, setInputs] = useState({ N: 1.6e8, D: 8.0e8 });
  const [loss, setLoss] = useState(0);

  const formatMetric = (num: number) => {
    if (num === 0) return '0';
    const absNum = Math.abs(num);
    if (absNum >= 1e12) return (num / 1e12).toFixed(2).replace(/\.0+$/, '').replace(/\.$/, '') + 'T';
    if (absNum >= 1e9) return (num / 1e9).toFixed(2).replace(/\.0+$/, '').replace(/\.$/, '') + 'B';
    if (absNum >= 1e6) return (num / 1e6).toFixed(2).replace(/\.0+$/, '').replace(/\.$/, '') + 'M';
    if (absNum >= 1e3) return (num / 1e3).toFixed(2).replace(/\.0+$/, '').replace(/\.$/, '') + 'K';
    return num.toLocaleString();
  };

  const calculateLoss = (N: number, D: number, p: typeof defaultParams) => {
    const termA = p.A_norm * Math.pow(N / p.N0, -p.alpha);
    const termB = p.B_norm * Math.pow(D / p.D0, -p.beta);
    return p.E + termA + termB;
  };

  useEffect(() => {
    setLoss(calculateLoss(inputs.N, inputs.D, params));
  }, [inputs, params]);

  const chartData = useMemo(() => {
    const data = [];
    const baseN = inputs.N;
    for (let i = -10; i <= 10; i++) {
      const factor = Math.pow(10, i / 5);
      const currentN = baseN * factor;
      data.push({
        n: currentN,
        loss: calculateLoss(currentN, inputs.D, params),
        isCurrent: i === 0
      });
    }
    return data;
  }, [inputs, params]);

  const handleParamChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setParams(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
      <div className="lg:col-span-4 space-y-6">
        <div className="google-card p-4 bg-[#e8f0fe] border-none text-[#1967d2]">
          <div className="flex items-center gap-2 mb-2">
            <Sigma size={18} />
            <span className="font-medium text-sm tracking-wide">Model Formulation</span>
          </div>
          <div className="text-center font-serif text-lg py-2">
            L = E + A<sub className="text-xs">norm</sub>(N/N₀)<sup className="text-xs">-α</sup> + B<sub className="text-xs">norm</sub>(D/D₀)<sup className="text-xs">-β</sup>
          </div>
        </div>

        <div className="google-card p-6 border-t-4 border-t-[#1a73e8]">
          <div className="flex items-center gap-2 mb-4">
            <Settings size={20} className="text-[#5f6368]" />
            <h2 className="text-[16px] font-medium text-[#202124]">Model Configuration</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#3c4043] mb-1">Parameters (N)</label>
              <input type="number" name="N" value={inputs.N} onChange={handleInputChange} className="w-full google-input font-mono text-sm" />
              <p className="text-xs text-[#5f6368] mt-1 font-medium">Current: {formatMetric(inputs.N)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#3c4043] mb-1">Dataset Size (D)</label>
              <input type="number" name="D" value={inputs.D} onChange={handleInputChange} className="w-full google-input font-mono text-sm" />
              <p className="text-xs text-[#5f6368] mt-1 font-medium">Current: {formatMetric(inputs.D)} Tokens</p>
            </div>
          </div>
        </div>

        <div className="google-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Info size={20} className="text-[#5f6368]" />
            <h2 className="text-[16px] font-medium text-[#202124]">Coefficients</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 flex gap-4">
              <div className="flex-1">
                <label className="block text-xs font-medium text-[#5f6368] mb-1">Irreducible Loss (E)</label>
                <input type="number" name="E" step="0.00001" value={params.E} onChange={handleParamChange} className="w-full google-input text-sm font-mono" />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-[#5f6368] mb-1">Norm (N₀=D₀)</label>
                <input type="number" name="N0" value={params.N0} disabled className="w-full google-input text-sm font-mono bg-[#f1f3f4] text-[#80868b] cursor-not-allowed" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1a73e8] mb-1">A (Norm)</label>
              <input type="number" name="A_norm" step="0.00001" value={params.A_norm} onChange={handleParamChange} className="w-full google-input text-sm font-mono border-[#1a73e8]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1a73e8] mb-1">Power α</label>
              <input type="number" name="alpha" step="0.00001" value={params.alpha} onChange={handleParamChange} className="w-full google-input text-sm font-mono border-[#1a73e8]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#188038] mb-1">B (Norm)</label>
              <input type="number" name="B_norm" step="0.00001" value={params.B_norm} onChange={handleParamChange} className="w-full google-input text-sm font-mono border-[#188038]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#188038] mb-1">Power β</label>
              <input type="number" name="beta" step="0.00001" value={params.beta} onChange={handleParamChange} className="w-full google-input text-sm font-mono border-[#188038]" />
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="google-card p-8 flex flex-col md:flex-row items-center justify-between gap-6 border-l-4 border-l-[#1a73e8]">
          <div>
            <h3 className="text-[#3c4043] font-medium mb-1">Predicted Loss (L)</h3>
            <div className="text-[40px] font-normal leading-tight font-mono text-[#202124]">{loss.toFixed(6)}</div>
          </div>
          <div className="bg-[#f8f9fa] p-4 rounded border border-[#dadce0] w-full md:w-auto min-w-[200px]">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown size={16} className="text-[#188038]" />
              <span className="text-sm font-medium text-[#3c4043]">Term Breakdown</span>
            </div>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex justify-between gap-4"><span className="text-[#5f6368]">Irreducible E:</span><span>{params.E.toFixed(5)}</span></div>
              <div className="flex justify-between gap-4"><span className="text-[#1a73e8]">Param Term:</span><span>{(params.A_norm * Math.pow(inputs.N / params.N0, -params.alpha)).toFixed(5)}</span></div>
              <div className="flex justify-between gap-4"><span className="text-[#188038]">Data Term:</span><span>{(params.B_norm * Math.pow(inputs.D / params.D0, -params.beta)).toFixed(5)}</span></div>
            </div>
          </div>
        </div>

        <div className="google-card p-6 flex-1 min-h-[400px]">
          <div className="mb-6">
            <h3 className="text-[16px] font-medium text-[#202124]">Loss Scaling Curve</h3>
            <p className="text-[#5f6368] text-[13px] mt-1">Predicted loss vs. Parameters (N) while keeping Dataset Size (D) fixed at {formatMetric(inputs.D)}.</p>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f4" />
                <XAxis dataKey="n" type="number" scale="log" domain={['auto', 'auto']} tickFormatter={(val) => formatMetric(val)} stroke="#5f6368" fontSize={12} label={{ value: 'Parameters (N)', position: 'bottom', offset: 0, fill: '#5f6368', fontSize: 12 }} />
                <YAxis domain={['auto', 'auto']} stroke="#5f6368" fontSize={12} tickFormatter={(val) => val.toFixed(3)} />
                <Tooltip formatter={(value: number) => [value.toFixed(5), "Loss"]} labelFormatter={(label: any) => `N: ${formatMetric(parseFloat(label))}`} contentStyle={{ borderRadius: '8px', border: '1px solid #dadce0', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="loss" stroke="#1a73e8" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                <ReferenceLine x={inputs.N} stroke="#ea4335" strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LossScalingCurve;
