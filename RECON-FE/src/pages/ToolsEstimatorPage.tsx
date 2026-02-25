import { useState } from 'react';
import { estimatorApi } from '../api';
import { isApiError } from '../types/api';
import type {
  EstimatorPayload,
  EstimateResult,
  ProjectType,
  AreaUnit,
  QualityTier,
} from '../types/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const PROJECT_TYPES: { value: ProjectType; label: string }[] = [
  { value: 'renovation', label: 'Renovation' },
  { value: 'new_construction', label: 'New Construction' },
  { value: 'extension', label: 'Extension / Addition' },
  { value: 'interior', label: 'Interior Work' },
  { value: 'exterior', label: 'Exterior Work' },
];

const QUALITY_TIERS: { value: QualityTier; label: string; desc: string }[] = [
  { value: 'basic', label: 'Basic', desc: 'Economy materials' },
  { value: 'standard', label: 'Standard', desc: 'Mid-range finishes' },
  { value: 'premium', label: 'Premium', desc: 'High-end materials' },
];

const initialForm: EstimatorPayload = {
  projectType: 'renovation',
  area: 5,
  areaUnit: 'marla',
  location: '',
  quality: 'standard',
  floors: 1,
  additionalNotes: '',
};

function formatPKR(n: number) {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(n);
}

function EstimateDisplay({ result }: { result: EstimateResult }) {
  return (
    <div className="space-y-6">
      <div className="rounded-[4px] border border-[#800000]/20 bg-[#800000]/5 px-5 py-4">
        <p className="text-sm font-medium text-[#800000] uppercase tracking-wide">Summary</p>
        <p className="mt-1 text-[#1a1a1a]">{result.summary}</p>
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#1a1a1a]/60">
          Cost Breakdown
        </p>
        <div className="divide-y divide-stone-200 rounded-[4px] border border-stone-200">
          {result.breakdown.map((item) => (
            <div key={item.category} className="flex items-start justify-between gap-4 px-4 py-3">
              <div className="min-w-0">
                <p className="font-medium text-[#1a1a1a]">{item.category}</p>
                {item.notes && (
                  <p className="mt-0.5 text-sm text-[#1a1a1a]/60">{item.notes}</p>
                )}
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold text-[#1a1a1a]">
                  {formatPKR(item.minCost)} – {formatPKR(item.maxCost)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[4px] border border-stone-200 bg-stone-50 px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <p className="text-base font-semibold text-[#1a1a1a]">Total Estimate</p>
          <p className="text-lg font-bold text-[#800000]">
            {formatPKR(result.totalMin)} – {formatPKR(result.totalMax)}
          </p>
        </div>
        <p className="mt-1 text-xs text-[#1a1a1a]/50">{result.currency}</p>
      </div>

      <p className="text-xs text-[#1a1a1a]/50">{result.disclaimer}</p>
    </div>
  );
}

export function ToolsEstimatorPage() {
  const [form, setForm] = useState<EstimatorPayload>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EstimateResult | null>(null);

  const set = <K extends keyof EstimatorPayload>(key: K, value: EstimatorPayload[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    const res = await estimatorApi.getEstimate({
      ...form,
      additionalNotes: form.additionalNotes?.trim() || undefined,
    });
    setLoading(false);
    if (isApiError(res)) {
      setError(res.error.message);
      return;
    }
    setResult(res.data.estimate);
  };

  const selectClass =
    'w-full rounded-[4px] border border-[#1a1a1a]/15 bg-[#F9F9F9] px-3 py-2 text-[#1a1a1a] transition-[border-color,box-shadow] focus:border-[#800000] focus:outline-none focus:ring-1 focus:ring-[#800000] focus:bg-white text-sm';

  return (
    <div className="space-y-10">
      <section className="rounded-sm bg-[#800000] px-6 py-10 text-white md:py-12">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl" style={{ letterSpacing: '-0.02em' }}>
          AI Cost Estimator
        </h1>
        <p className="mt-3 max-w-xl text-lg text-white/90">
          Get a rough construction cost estimate for your project in PKR. Fill in the details below and our AI will generate a breakdown.
        </p>
      </section>

      <section className="grid gap-8 lg:grid-cols-2 lg:gap-8 lg:items-start">
        {/* Form */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm md:p-8">
            {error && (
              <div className="mb-6 rounded-sm border border-gray-200 bg-[#f9f9f9] p-4 text-[#1a1a1a]" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Project Type */}
              <div>
                <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">
                  Project Type
                </label>
                <select
                  className={selectClass}
                  value={form.projectType}
                  onChange={(e) => set('projectType', e.target.value as ProjectType)}
                  required
                >
                  {PROJECT_TYPES.map((pt) => (
                    <option key={pt.value} value={pt.value}>{pt.label}</option>
                  ))}
                </select>
              </div>

              {/* Area */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Area"
                  type="number"
                  min={1}
                  required
                  value={form.area}
                  onChange={(e) => set('area', Number(e.target.value))}
                  placeholder="e.g. 5"
                />
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">Unit</label>
                  <select
                    className={selectClass}
                    value={form.areaUnit}
                    onChange={(e) => set('areaUnit', e.target.value as AreaUnit)}
                  >
                    <option value="marla">Marla</option>
                    <option value="sqft">Sq. Ft.</option>
                  </select>
                </div>
              </div>

              {/* Location */}
              <Input
                label="Location"
                required
                value={form.location}
                onChange={(e) => set('location', e.target.value)}
                placeholder="e.g. Lahore, DHA Phase 5"
              />

              {/* Floors */}
              <Input
                label="Number of Floors"
                type="number"
                min={1}
                max={10}
                required
                value={form.floors}
                onChange={(e) => set('floors', Number(e.target.value))}
              />

              {/* Quality */}
              <div>
                <label className="mb-2 block text-sm font-medium text-[#1a1a1a]">Quality Tier</label>
                <div className="grid grid-cols-3 gap-2">
                  {QUALITY_TIERS.map((q) => (
                    <button
                      key={q.value}
                      type="button"
                      onClick={() => set('quality', q.value)}
                      className={`rounded-[4px] border px-3 py-2.5 text-left transition-colors ${
                        form.quality === q.value
                          ? 'border-[#800000] bg-[#800000]/5 text-[#800000]'
                          : 'border-stone-200 text-[#1a1a1a]/70 hover:border-stone-400'
                      }`}
                    >
                      <p className="text-sm font-semibold">{q.label}</p>
                      <p className="text-xs opacity-70">{q.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">
                  Additional Notes <span className="font-normal text-[#1a1a1a]/50">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  className={`${selectClass} resize-none`}
                  value={form.additionalNotes}
                  onChange={(e) => set('additionalNotes', e.target.value)}
                  placeholder="e.g. Include kitchen, 3 bathrooms, basement..."
                />
              </div>

              <Button type="submit" loading={loading} size="lg" className="w-full">
                {loading ? 'Generating estimate…' : 'Get Estimate'}
              </Button>
            </form>
          </div>
        </div>

        {/* Result — right column */}
        <div className="lg:sticky lg:top-6">
          {result ? (
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm md:p-8">
              <h2 className="mb-5 text-lg font-semibold text-[#1a1a1a]">Your Estimate</h2>
              <EstimateDisplay result={result} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-8 py-16 text-center">
              <div className="mb-3 text-4xl">🏗️</div>
              <p className="font-medium text-[#1a1a1a]">Your estimate will appear here</p>
              <p className="mt-1 text-sm text-[#1a1a1a]/50">Fill in the form and click Get Estimate</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
