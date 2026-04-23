import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, RotateCcw } from 'lucide-react';
import { useProposalStore } from '@/features/proposal/store/proposal.store';
import { SectionCard } from '@/features/proposal/components/shared/SectionCard';
import { PercentInput } from '@/features/proposal/components/shared/PercentInput';
import { DollarInput } from '@/features/proposal/components/shared/DollarInput';
import type { HealthSubBenefit } from '@/features/proposal/types/proposal.types';

const BENEFIT_TABS = ['Healthcare', 'Retirement', 'HSA'] as const;
type BenefitTab = typeof BENEFIT_TABS[number];

const HC_DEFAULTS: Record<'medical' | 'dental' | 'vision', HealthSubBenefit> = {
  medical: { participationRate: 75, premiums: { individual: 200, family: 775 } },
  dental:  { participationRate: 75, premiums: { individual: 35,  family: 85  } },
  vision:  { participationRate: 75, premiums: { individual: 15,  family: 40  } },
};

export function BenefitsSection() {
  const { benefits, setBenefits } = useProposalStore((s) => s);
  const [activeTab, setActiveTab] = useState<BenefitTab>('Healthcare');
  const [showRetirementTiers, setShowRetirementTiers] = useState(true);

  const handleResetToDefaults = useCallback(() => {
    setBenefits({
      healthcare: {
        ...benefits.healthcare,
        medical: HC_DEFAULTS.medical,
        dental: HC_DEFAULTS.dental,
        vision: HC_DEFAULTS.vision,
      },
      retirement: {
        ...benefits.retirement,
        participationRate: 60,
        contributionRates: { entry: 4, mid: 6, senior: 8, executive: 10 },
      },
      hsa: { ...benefits.hsa, participationRate: 30 },
    });
  }, [benefits, setBenefits]);

  const updateSubBenefit = useCallback(
    (type: 'medical' | 'dental' | 'vision', field: 'participationRate' | 'individual' | 'family', val: number) => {
      const current = benefits.healthcare[type];
      const updated: HealthSubBenefit =
        field === 'participationRate'
          ? { ...current, participationRate: val }
          : { ...current, premiums: { ...current.premiums, [field]: val } };

      setBenefits({
        healthcare: { ...benefits.healthcare, [type]: updated },
      });
    },
    [benefits.healthcare, setBenefits],
  );

  return (
    <SectionCard id="benefits" title="Benefits Configuration" subtitle="Configure pre-tax benefit details for more accurate projections">
      <div className="flex items-center justify-between mb-4">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium text-text-secondary"
          style={{ background: '#E8F0FE', border: '1px solid rgba(63, 127, 244, 0.2)' }}
        >
          Using preset values based on U.S. national averages
        </span>
        <button
          onClick={handleResetToDefaults}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium text-text-secondary hover:text-text-primary transition-colors"
          style={{ background: '#F6F9FC', border: '1px solid #E6EEF6' }}
        >
          <RotateCcw size={13} />
          Reset to Industry Average
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setBenefits({ enabled: !benefits.enabled })}
          className="relative h-6 w-11 rounded-full transition-colors flex-shrink-0"
          style={{ background: benefits.enabled ? 'var(--color-accent)' : '#E6EEF6' }}
        >
          <span
            className="absolute left-0 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform"
            style={{ transform: benefits.enabled ? 'translateX(22px)' : 'translateX(2px)' }}
          />
        </button>
        <span className="text-[14px] font-medium text-text-secondary">
          Include benefits in calculation
        </span>
      </div>

      {!benefits.enabled && (
        <p className="text-[13px] text-text-tertiary" style={{ marginTop: 12 }}>
          Proposal will use FICA savings only. Toggle on to include benefits for a more detailed estimate.
        </p>
      )}

      <div
        style={{
          marginTop: 24,
          opacity: benefits.enabled ? 1 : 0.3,
          pointerEvents: benefits.enabled ? 'auto' : 'none',
          transition: 'opacity 300ms',
        }}
      >
        <div className="glass-secondary inline-flex !p-1 !rounded-[14px] flex-wrap" style={{ marginBottom: 24 }}>
          {BENEFIT_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-[10px] px-4 py-1.5 text-[14px] font-medium transition-all
                ${activeTab === tab
                  ? 'bg-white text-text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── Healthcare Tab ── */}
        {activeTab === 'Healthcare' && (
          <div className="glass-secondary !rounded-[14px] !p-6" style={{ padding: 24 }}>
            {/* Column headers */}
            <div
              className="grid items-end"
              style={{
                gridTemplateColumns: '100px 100px 1fr 1fr',
                columnGap: 24,
                marginBottom: 12,
              }}
            >
              <div />
              <div className="text-center text-[11px] font-semibold text-text-tertiary uppercase" style={{ letterSpacing: '0.5px' }}>
                Participation
              </div>
              <div className="text-center text-[11px] font-semibold text-text-tertiary uppercase" style={{ letterSpacing: '0.5px' }}>
                Individual
              </div>
              <div className="text-center text-[11px] font-semibold text-text-tertiary uppercase" style={{ letterSpacing: '0.5px' }}>
                Family
              </div>
            </div>

            {/* Rows */}
            <div className="flex flex-col" style={{ gap: 16 }}>
              {(['medical', 'dental', 'vision'] as const).map((type) => (
                <div
                  key={type}
                  className="grid items-center"
                  style={{ gridTemplateColumns: '100px 100px 1fr 1fr', columnGap: 24 }}
                >
                  <div className="text-[14px] font-medium text-text-primary capitalize">{type}</div>
                  <div className="flex justify-center">
                    <PercentInput
                      value={benefits.healthcare[type].participationRate}
                      onChange={(v) => updateSubBenefit(type, 'participationRate', v)}
                    />
                  </div>
                  <div className="flex justify-center">
                    <DollarInput
                      value={benefits.healthcare[type].premiums.individual}
                      onChange={(v) => updateSubBenefit(type, 'individual', v)}
                    />
                  </div>
                  <div className="flex justify-center">
                    <DollarInput
                      value={benefits.healthcare[type].premiums.family}
                      onChange={(v) => updateSubBenefit(type, 'family', v)}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Single helper text */}
            <p className="text-[11px] text-text-tertiary" style={{ marginTop: 16 }}>
              Monthly premium per employee
            </p>
          </div>
        )}

        {/* ── Retirement Tab ── */}
        {activeTab === 'Retirement' && (
          <div>
            <div className="flex items-center gap-4 mb-6" style={{ maxWidth: 400 }}>
              <span className="text-[14px] font-medium text-text-primary">Participation Rate</span>
              <PercentInput
                value={benefits.retirement.participationRate}
                onChange={(val) => setBenefits({ retirement: { ...benefits.retirement, participationRate: val } })}
              />
            </div>

            <button
              onClick={() => setShowRetirementTiers(!showRetirementTiers)}
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors mb-4"
            >
              <motion.span animate={{ rotate: showRetirementTiers ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown size={14} className="text-current" />
              </motion.span>
              Contribution Rates by Tier
            </button>

            <AnimatePresence>
              {showRetirementTiers && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="glass-secondary !rounded-[14px]">
                    <div className="grid grid-cols-4 gap-4">
                      {(['entry', 'mid', 'senior', 'executive'] as const).map((tier) => (
                        <div key={tier} className="text-center">
                          <p className="text-[12px] font-medium text-text-secondary capitalize mb-2">{tier}</p>
                          <PercentInput
                            value={benefits.retirement.contributionRates[tier]}
                            onChange={(val) =>
                              setBenefits({
                                retirement: {
                                  ...benefits.retirement,
                                  contributionRates: {
                                    ...benefits.retirement.contributionRates,
                                    [tier]: val,
                                  },
                                },
                              })
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ── HSA Tab ── */}
        {activeTab === 'HSA' && (
          <div>
            <div className="flex items-center gap-4" style={{ maxWidth: 400, marginBottom: 24 }}>
              <span className="text-[14px] font-medium text-text-primary">Participation Rate</span>
              <PercentInput
                value={benefits.hsa.participationRate}
                onChange={(val) => setBenefits({ hsa: { ...benefits.hsa, participationRate: val } })}
              />
            </div>
            <p className="text-[12px] text-text-tertiary italic" style={{ marginTop: 8 }}>
              Savings estimate will use national average HSA contribution data.
            </p>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
