import React, { useState, useMemo } from 'react';
import { Settings, Cpu, Layers, Database, Info, Save, AlertTriangle } from 'lucide-react';

const PRESETS = {
  "MORTM-A (Large)": { vocab_size: 650, d_model: 512, dim_feedforward: 512, num_heads: 8, d_layer: 11, num_experts: 6, topk_experts: 2, use_moe_decoder: true },
  "MORTM-B (Deep)": { vocab_size: 650, d_model: 512, dim_feedforward: 2048, num_heads: 8, d_layer: 14, num_experts: 14, topk_experts: 2, use_moe_decoder: false },
  "MORTM-C (Compact)": { vocab_size: 400, d_model: 512, dim_feedforward: 2048, num_heads: 8, d_layer: 12, num_experts: 5, topk_experts: 2, use_moe_decoder: true },
  "Custom": { vocab_size: 1000, d_model: 768, dim_feedforward: 3072, num_heads: 12, d_layer: 12, num_experts: 8, topk_experts: 2, use_moe_decoder: true }
};

interface TooltipIconProps { text: string }
const TooltipIcon: React.FC<TooltipIconProps> = ({ text }) => (
  <div className="group relative ml-1 inline-flex">
    <Info size={14} className="text-[#80868b] hover:text-[#202124] cursor-help" />
    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-[#202124] text-white text-xs rounded shadow-lg z-10 pointer-events-none text-center">
      {text}
    </div>
  </div>
);

const NumberInput = ({ label, value, onChange, min = 1, max, step = 1, description }: any) => (
  <div className="mb-4">
    <div className="flex justify-between items-center mb-1">
      <label className="text-[13px] font-medium text-[#3c4043] flex items-center">
        {label}
        {description && <TooltipIcon text={description} />}
      </label>
      <span className="text-[13px] font-medium text-[#1a73e8]">{value}</span>
    </div>
    <input type="range" min={min} max={max || value * 2} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full h-1 bg-[#e8eaed] rounded appearance-none cursor-pointer accent-[#1a73e8]" />
    <input type="number" min={min} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-2 w-full google-input text-center text-sm" />
  </div>
);

const Toggle = ({ label, checked, onChange }: any) => (
  <div className="flex items-center justify-between mb-4 p-3 bg-[#f8f9fa] border border-[#dadce0] rounded hover:border-[#80868b] transition-colors cursor-pointer" onClick={() => onChange(!checked)}>
    <span className="text-[13px] font-medium text-[#3c4043]">{label}</span>
    <button className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-[#1a73e8]' : 'bg-[#dadce0]'}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-4' : 'translate-x-1'}`} />
    </button>
  </div>
);

const formatParams = (num: number) => {
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
  return num.toLocaleString();
};

const ParamCalc = () => {
  const [config, setConfig] = useState(PRESETS["MORTM-A (Large)"]);
  const [activePreset, setActivePreset] = useState("MORTM-A (Large)");

  const stats = useMemo(() => {
    const { vocab_size, d_model, dim_feedforward, d_layer, num_experts, topk_experts, use_moe_decoder } = config;
    const embedding = vocab_size * d_model;
    const attention_params = (3 * d_model * d_model) + (d_model * d_model + d_model);
    const norm_params = (d_model * 2) * 3;
    const single_expert_params = 3 * ((d_model * dim_feedforward) + dim_feedforward);

    let ffn_total_layer = 0;
    let ffn_active_layer = 0;

    if (use_moe_decoder) {
      const gate_params = num_experts * d_model;
      const all_experts = num_experts * single_expert_params;
      const shared_expert = single_expert_params;
      ffn_total_layer = gate_params + all_experts + shared_expert;
      const active_experts = topk_experts * single_expert_params;
      ffn_active_layer = gate_params + active_experts + shared_expert;
    } else {
      ffn_total_layer = single_expert_params;
      ffn_active_layer = single_expert_params;
    }

    const layer_total = attention_params + norm_params + ffn_total_layer;
    const layer_active = attention_params + norm_params + ffn_active_layer;
    const all_layers_total = layer_total * d_layer;
    const all_layers_active = layer_active * d_layer;
    const final_norm = d_model * 2;
    const output_layer = (d_model * vocab_size) + vocab_size;

    const total_params = embedding + all_layers_total + final_norm + output_layer;
    const active_params = embedding + all_layers_active + final_norm + output_layer;
    const memory_gb = (total_params * 2) / (1024 ** 3);
    const sparsity = use_moe_decoder ? 1.0 - (topk_experts / num_experts) : 0;

    return { total_params, active_params, layer_breakdown: { attention: attention_params, ffn: ffn_total_layer, norm: norm_params }, component_breakdown: { embedding, layers: all_layers_total, output: output_layer + final_norm }, memory_gb, sparsity };
  }, [config]);

  const updateConfig = (key: string, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setActivePreset("Custom");
  };

  const loadPreset = (name: string) => {
    setConfig(PRESETS[name as keyof typeof PRESETS]);
    setActivePreset(name);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
      <div className="lg:col-span-4 space-y-6">
        <div className="google-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Save size={20} className="text-[#5f6368]" />
            <h2 className="text-[16px] font-medium text-[#202124]">Presets</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.keys(PRESETS).map(name => (
              <button key={name} onClick={() => loadPreset(name)} className={`px-4 py-1.5 text-[13px] font-medium rounded-full transition-colors border ${activePreset === name ? 'bg-[#e8f0fe] text-[#1967d2] border-[#e8f0fe]' : 'bg-white text-[#5f6368] border-[#dadce0] hover:bg-[#f8f9fa] hover:text-[#202124]'}`}>{name}</button>
            ))}
          </div>
        </div>

        <div className="google-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <Settings size={20} className="text-[#5f6368]" />
            <h2 className="text-[16px] font-medium text-[#202124]">Configuration</h2>
          </div>
          <NumberInput label="Vocab Size" value={config.vocab_size} onChange={(v:any) => updateConfig('vocab_size', v)} max={5000} step={10} description="トークンの総数" />
          <NumberInput label="D_Model" value={config.d_model} onChange={(v:any) => updateConfig('d_model', v)} max={4096} step={64} description="埋め込み次元数" />
          <NumberInput label="Dim Feedforward" value={config.dim_feedforward} onChange={(v:any) => updateConfig('dim_feedforward', v)} max={16384} step={128} description="FFNの中間層次元数" />
          <NumberInput label="Layers (d_layer)" value={config.d_layer} onChange={(v:any) => updateConfig('d_layer', v)} max={100} description="Decoderの層数" />
          <NumberInput label="Attention Heads" value={config.num_heads} onChange={(v:any) => updateConfig('num_heads', v)} max={64} description="Multi-head Attentionのヘッド数" />
        </div>

        <div className="google-card p-6 border-t-4 border-t-[#34a853]">
          <div className="flex items-center gap-2 mb-6">
            <Cpu size={20} className="text-[#5f6368]" />
            <h2 className="text-[16px] font-medium text-[#202124]">MoE Settings</h2>
          </div>
          <Toggle label="Use MoE Decoder" checked={config.use_moe_decoder} onChange={(v:any) => updateConfig('use_moe_decoder', v)} />
          {config.use_moe_decoder && (
            <div className="mt-4 pt-4 border-t border-[#dadce0]">
              <NumberInput label="Num Experts (Routed)" value={config.num_experts} onChange={(v:any) => updateConfig('num_experts', v)} max={64} description="ルーティング対象のエキスパート数" />
              <NumberInput label="Top-K Experts" value={config.topk_experts} onChange={(v:any) => updateConfig('topk_experts', v)} max={config.num_experts} description="トークンごとにアクティブになるExpert数" />
              {config.num_experts === config.topk_experts && (
                <div className="mt-3 p-3 bg-[#fef7e0] border border-[#fbbc04] rounded flex gap-2 text-[#b06000] text-[13px]">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  <span>Routed数とTop-Kが一致。スパース性による計算効率の向上はありません。</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="google-card p-6 border-l-4 border-l-[#1a73e8]">
            <h3 className="text-[#5f6368] text-[14px] font-medium flex items-center gap-2 mb-2"><Database size={16} /> Total Parameters</h3>
            <div className="text-[32px] font-normal text-[#202124] mb-1">{formatParams(stats.total_params)}</div>
            <div className="text-[13px] text-[#5f6368]">Est. Size (BF16): <span className="font-medium text-[#202124]">{stats.memory_gb.toFixed(2)} GB</span></div>
          </div>
          <div className="google-card p-6 border-l-4 border-l-[#34a853]">
            <h3 className="text-[#5f6368] text-[14px] font-medium flex items-center gap-2 mb-2"><Cpu size={16} /> Active Parameters</h3>
            <div className="text-[32px] font-normal text-[#202124] mb-1">{formatParams(stats.active_params)}</div>
            <div className="text-[13px] text-[#5f6368] flex justify-between">
              <span>Utilization: <span className="font-medium text-[#202124]">{((stats.active_params / stats.total_params) * 100).toFixed(1)}%</span></span>
              {config.use_moe_decoder && <span>Sparsity: <span className="font-medium text-[#188038]">{(stats.sparsity * 100).toFixed(1)}%</span></span>}
            </div>
          </div>
        </div>

        <div className="google-card p-6 flex-1">
          <h3 className="text-[16px] font-medium text-[#202124] mb-6 flex items-center gap-2"><Layers size={18} /> Parameter Breakdown</h3>
          
          <div className="mb-8 p-4 bg-[#f8f9fa] rounded border border-[#dadce0]">
            <div className="flex justify-between text-[13px] mb-2 font-medium text-[#3c4043]">
              <span>Active Parameters ({formatParams(stats.active_params)})</span>
              <span>Inactive Expert Params ({formatParams(stats.total_params - stats.active_params)})</span>
            </div>
            <div className="h-6 w-full bg-[#e8eaed] rounded-full overflow-hidden flex">
              <div style={{ width: `${(stats.active_params / stats.total_params) * 100}%` }} className="h-full bg-[#34a853]" />
              <div style={{ width: `${100 - (stats.active_params / stats.total_params) * 100}%` }} className="h-full bg-[#9aa0a6]" />
            </div>
          </div>

          <div className="space-y-5">
            <h4 className="text-[14px] font-medium text-[#5f6368] border-b border-[#dadce0] pb-2">Component Distribution (Per Layer)</h4>
            
            <BreakdownItem label="Attention Mechanisms" value={stats.layer_breakdown.attention} total={stats.layer_breakdown.attention + stats.layer_breakdown.ffn + stats.layer_breakdown.norm} color="bg-[#1a73e8]" />
            <BreakdownItem label="FeedForward / MoE" value={stats.layer_breakdown.ffn} total={stats.layer_breakdown.attention + stats.layer_breakdown.ffn + stats.layer_breakdown.norm} color="bg-[#f29900]" />
            <BreakdownItem label="Normalization" value={stats.layer_breakdown.norm} total={stats.layer_breakdown.attention + stats.layer_breakdown.ffn + stats.layer_breakdown.norm} color="bg-[#a142f4]" />
          </div>
          
          <div className="mt-8 pt-6 border-t border-[#dadce0] text-[13px] text-[#5f6368]">
            <p className="flex items-center gap-1 mb-2 font-medium"><Info size={14} /> 計算ロジックについての補足:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>ExpertはSwiGLU構造 (Linear x 3) として計算しています。</li>
              <li>Num Expertsはルーティング対象のみの数です。別途1つの共有Expertが加算されます。</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const BreakdownItem = ({ label, value, total, color }: any) => (
  <div>
    <div className="flex justify-between text-[13px] mb-1.5">
      <span className="text-[#3c4043] font-medium">{label}</span>
      <span className="font-mono text-[#202124]">{value.toLocaleString()}</span>
    </div>
    <div className="h-1.5 w-full bg-[#e8eaed] rounded-full overflow-hidden flex">
      <div style={{ width: `${(value / total) * 100}%` }} className={`h-full ${color}`} />
    </div>
  </div>
);

export default ParamCalc;
