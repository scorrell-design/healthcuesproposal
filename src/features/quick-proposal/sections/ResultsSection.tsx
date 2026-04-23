import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, Download, ChevronDown, CheckCircle2, Plus, Minus,
} from 'lucide-react';
import { useProposalStore } from '@/features/proposal/store/proposal.store';
import { usePDFGeneration } from '@/features/proposal/hooks/usePDFGeneration';
import { payPeriodsPerYear, formatDollar, formatDollarCents } from '@/utils/format';
import { getFederalMarginalRate } from '@/features/proposal/engine';
import { STATE_TAX_RATES } from '@/config/tax-rates';
import { FICA_RATES, ADMIN_FEE_ANNUAL } from '@/config/fica-rates';
import {
  DISCLAIMER_TEXT, KEY_BENEFITS, VALUE_PROPOSITIONS, FAQ_ITEMS, HOW_WE_CALCULATE,
} from '@/constants/proposalCopy';
import { HealthCuesWordmark } from '@/components/branding/HealthCuesWordmark';
import { HealthCuesMark } from '@/components/branding/HealthCuesMark';
import type { TierResult } from '@/features/proposal/types/proposal.types';

const BRAND_BLUE = '#3F7FF4';
const BRAND_BLUE_DEEP = '#2E65D4';
const BRAND_GREEN = '#2FBF8F';
const GRADIENT = 'linear-gradient(135deg, #2FBF8F 0%, #3F7FF4 100%)';
const PAGE_BG = '#FFFFFF';
const CARD_BG = '#FFFFFF';
const CARD_BORDER = '#E6EEF6';
const CARD_SHADOW = '0 4px 20px rgba(15,23,42,0.06)';
const CARD_SHADOW_SM = '0 1px 4px rgba(15,23,42,0.04)';
const INNER_BG = '#F6F9FC';
const TEXT_PRIMARY = '#0F172A';
const TEXT_SECONDARY = '#475569';
const TEXT_MUTED = '#94A3B8';
const FONT_SANS = "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const FONT_MONO = "'JetBrains Mono', 'SF Mono', Monaco, monospace";

interface ResultsSectionProps {
  groupId: string;
}

interface TierPaycheckData {
  tierResult: TierResult;
  grossPay: number;
  preTaxPerPay: number;
  fedBefore: number;
  stateBefore: number;
  ficaBefore: number;
  netBefore: number;
  fedAfter: number;
  stateAfter: number;
  ficaAfter: number;
  planBenefit: number;
  netAfter: number;
  increase: number;
  pctIncrease: number;
  annualIncrease: number;
  annualTaxSavings: number;
  filingStatus: string;
  dependents: number;
  state: string;
}

export function ResultsSection({ groupId: _groupId }: ResultsSectionProps) {
  const { result, isCalculating, company, tiers, states, filingStatus } = useProposalStore((s) => s);
  const { downloadPDF, isGenerating } = usePDFGeneration();
  const [paycheckOpen, setPaycheckOpen] = useState(true);
  const [detailedOpen, setDetailedOpen] = useState(false);
  const [activePaycheckTab, setActivePaycheckTab] = useState<'benefit' | 'nonbenefit'>('benefit');
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const periods = result ? payPeriodsPerYear(company.payrollFrequency) : 26;

  const weightedFiling: 'single' | 'married' | 'hoh' = useMemo(() => {
    if (filingStatus.married >= filingStatus.single && filingStatus.married >= filingStatus.headOfHousehold) return 'married';
    if (filingStatus.headOfHousehold > filingStatus.single) return 'hoh';
    return 'single';
  }, [filingStatus]);

  const weightedStateCode = useMemo(() => {
    if (states.length === 0) return 'TX';
    let best = states[0].stateCode;
    let bestPct = 0;
    for (const s of states) {
      if (s.workforcePercent > bestPct) { best = s.stateCode; bestPct = s.workforcePercent; }
    }
    return best;
  }, [states]);

  const weightedStateRate = useMemo(() => {
    if (states.length === 0) return 0.05;
    return states.reduce((s, st) => s + (STATE_TAX_RATES[st.stateCode] ?? 0) * (st.workforcePercent / 100), 0);
  }, [states]);

  const buildTierPaycheck = useCallback((tr: TierResult): TierPaycheckData => {
    const grossPay = tr.avgSalary / periods;
    const preTaxPerPay = tr.avgPreTaxDeduction / periods;
    const federalRate = getFederalMarginalRate(tr.avgSalary, weightedFiling);
    const ficaRate = FICA_RATES.combined;

    const fedBefore = grossPay * federalRate;
    const stateBefore = grossPay * weightedStateRate;
    const ficaBefore = grossPay * ficaRate;
    const netBefore = grossPay - fedBefore - stateBefore - ficaBefore;

    const taxableAfter = grossPay - preTaxPerPay;
    const fedAfter = taxableAfter * federalRate;
    const stateAfter = taxableAfter * weightedStateRate;
    const ficaAfter = taxableAfter * ficaRate;
    const adminPerPay = ADMIN_FEE_ANNUAL / periods;
    const netAfterRaw = taxableAfter - fedAfter - stateAfter - ficaAfter;
    const planBenefit = (netAfterRaw - netBefore);
    const netAfter = netAfterRaw;

    const increase = netAfter - netBefore;
    const pctIncrease = netBefore > 0 ? (increase / netBefore) * 100 : 0;

    const filingLabel = weightedFiling === 'married' ? 'Married Filing Jointly' : weightedFiling === 'hoh' ? 'Head of Household' : 'Single';
    const dependents = weightedFiling === 'married' ? 2 : weightedFiling === 'hoh' ? 1 : 0;

    return {
      tierResult: tr,
      grossPay: r2(grossPay),
      preTaxPerPay: r2(preTaxPerPay),
      fedBefore: r2(fedBefore),
      stateBefore: r2(stateBefore),
      ficaBefore: r2(ficaBefore),
      netBefore: r2(netBefore),
      fedAfter: r2(fedAfter),
      stateAfter: r2(stateAfter),
      ficaAfter: r2(ficaAfter),
      planBenefit: r2(planBenefit),
      netAfter: r2(netAfter),
      increase: r2(increase),
      pctIncrease: Math.round(pctIncrease * 100) / 100,
      annualIncrease: r2(increase * periods),
      annualTaxSavings: r2((fedBefore - fedAfter + stateBefore - stateAfter + ficaBefore - ficaAfter) * periods),
      filingStatus: filingLabel,
      dependents,
      state: weightedStateCode,
    };
  }, [periods, weightedFiling, weightedStateRate, weightedStateCode]);

  const tierPaychecks = useMemo<TierPaycheckData[]>(() => {
    if (!result) return [];
    return result.tierResults.map(buildTierPaycheck);
  }, [result, buildTierPaycheck]);

  const benefittingEmployee = useMemo(() => {
    if (tierPaychecks.length < 2) return tierPaychecks[0] ?? null;
    return tierPaychecks[1];
  }, [tierPaychecks]);

  const nonBenefittingEmployee = useMemo(() => {
    const negative = tierPaychecks.filter((t) => t.increase < 0);
    if (negative.length === 0) return null;
    negative.sort((a, b) => a.tierResult.avgSalary - b.tierResult.avgSalary);
    return negative[0];
  }, [tierPaychecks]);

  if (isCalculating) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-5 w-5 animate-spin" style={{ color: BRAND_BLUE }} />
        <span className="ml-2 text-[14px]" style={{ color: TEXT_MUTED, fontFamily: FONT_SANS }}>Calculating savings...</span>
      </div>
    );
  }

  if (!result) {
    return (
      <div id="results" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 16, padding: 48, textAlign: 'center', boxShadow: CARD_SHADOW }}>
        <p style={{ fontSize: 14, color: TEXT_MUTED, fontFamily: FONT_SANS, margin: 0 }}>
          Complete the sections above to see your savings projection.
        </p>
      </div>
    );
  }

  const netSavings = result.employerAnnualFICASavings - result.totalAdminFee;
  const perEmployeeBenefit = result.totalEmployees > 0 ? Math.round(result.avgEmployeeAnnualSavings) : 0;
  const participationRate = result.positivelyImpactedPercent;

  const activePaycheck = activePaycheckTab === 'benefit' ? benefittingEmployee : nonBenefittingEmployee;

  return (
    <div id="results" style={{ fontFamily: FONT_SANS, background: PAGE_BG, borderRadius: 20, overflow: 'hidden' }}>
      {/* B1 — Sticky Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50 }}>
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 32px',
            background: PAGE_BG,
            borderBottom: `1px solid ${CARD_BORDER}`,
          }}
        >
          <HealthCuesWordmark size={28} />
          <button
            style={{
              background: BRAND_BLUE,
              color: '#FFFFFF',
              borderRadius: 9999,
              padding: '10px 22px',
              fontWeight: 600,
              fontSize: 14,
              border: 'none',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontFamily: FONT_SANS,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = BRAND_BLUE_DEEP; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = BRAND_BLUE; }}
          >
            CONTACT US
          </button>
        </div>
        <div style={{ height: 3, background: GRADIENT }} />
      </div>

      <div style={{ padding: '0 40px 60px' }}>
        {/* B2 — Hero */}
        <div style={{ textAlign: 'center', paddingTop: 48 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <HealthCuesMark size={64} />
          </div>
          <h1 style={{ fontWeight: 600, fontSize: 36, color: TEXT_PRIMARY, margin: 0 }}>
            Your Customized HealthCues Proposal
          </h1>
          <div style={{ width: 80, height: 2, background: GRADIENT, margin: '12px auto 16px' }} />
          <span
            style={{
              display: 'inline-block',
              background: GRADIENT,
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: 12,
              padding: '4px 14px',
              borderRadius: 9999,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            AI-Generated
          </span>
        </div>

        {/* B3 — KPI Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginTop: 48 }}>
          <KpiCard label="Anticipated Employee Participation Rate" value={`${participationRate}%`} caption="estimated voluntary participation among eligible employees based on internal modeling assumptions and historical participation patterns" />
          <KpiCard label="Annual Company Savings" value={formatDollar(netSavings)} caption="estimated total employer payroll tax savings" />
          <KpiCard label="Per Employee Benefit" value={formatDollar(perEmployeeBenefit)} caption="average annual take-home pay increase per qualified employee" />
        </div>

        {/* B4 — Key Benefits */}
        <div style={{ marginTop: 56, textAlign: 'center' }}>
          <h2 style={{ fontWeight: 600, fontSize: 20, color: TEXT_PRIMARY, marginBottom: 20 }}>Key Benefits</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
            {KEY_BENEFITS.map((b) => (
              <span
                key={b}
                style={{
                  background: CARD_BG,
                  border: `1px solid ${CARD_BORDER}`,
                  padding: '10px 20px',
                  borderRadius: 9999,
                  fontWeight: 500,
                  fontSize: 14,
                  color: TEXT_PRIMARY,
                  boxShadow: CARD_SHADOW_SM,
                }}
              >
                {b}
              </span>
            ))}
          </div>
        </div>

        {/* B5 — How We Calculate */}
        <Card style={{ marginTop: 56, textAlign: 'center' }}>
          <h2 style={{ fontWeight: 600, fontSize: 22, color: TEXT_PRIMARY, marginBottom: 16 }}>How We Calculate</h2>
          <p style={{ fontWeight: 400, fontSize: 15, color: TEXT_SECONDARY, maxWidth: 820, margin: '0 auto', lineHeight: 1.65 }}>
            {HOW_WE_CALCULATE}
          </p>
        </Card>

        {/* B6 — Paycheck Comparison */}
        <Card style={{ marginTop: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => setPaycheckOpen(!paycheckOpen)}>
            <h2 style={{ fontWeight: 600, fontSize: 22, color: TEXT_PRIMARY, margin: 0 }}>Paycheck Comparison</h2>
            {paycheckOpen ? <Minus size={20} style={{ color: TEXT_MUTED }} /> : <Plus size={20} style={{ color: TEXT_MUTED }} />}
          </div>

          <AnimatePresence>
            {paycheckOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ marginTop: 20 }}>
                  {/* Tab switcher */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                    <PillTab active={activePaycheckTab === 'benefit'} onClick={() => setActivePaycheckTab('benefit')}>Benefitting Employee Example</PillTab>
                    <PillTab active={activePaycheckTab === 'nonbenefit'} onClick={() => setActivePaycheckTab('nonbenefit')}>Non-Benefiting Employee Example</PillTab>
                  </div>

                  {activePaycheck ? (
                    <>
                      {/* Employee Profile */}
                      <div style={{ textAlign: 'center', marginBottom: 24 }}>
                        <h3 style={{ fontWeight: 600, fontSize: 16, color: TEXT_PRIMARY, margin: 0 }}>Employee Profile</h3>
                        <div style={{ width: 60, height: 2, background: BRAND_BLUE, margin: '8px auto 16px' }} />
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 40 }}>
                          <ProfileStat label="Annual Salary" value={formatDollar(activePaycheck.tierResult.avgSalary)} />
                          <ProfileStat label="Filing Status" value={activePaycheck.filingStatus} />
                          <ProfileStat label="Dependents" value={String(activePaycheck.dependents)} />
                          <ProfileStat label="State" value={activePaycheck.state} />
                        </div>
                      </div>

                      {/* Two-column paycheck */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                        {/* Current */}
                        <Card inner>
                          <h4 style={{ fontWeight: 600, fontSize: 14, color: TEXT_MUTED, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Paycheck (Bi-weekly)</h4>
                          <PaySection title="Earnings">
                            <PayRow label="Gross Pay" value={activePaycheck.grossPay} />
                          </PaySection>
                          <PaySection title="Deductions">
                            <PayRow label="Pre-Tax Deductions" value={0} />
                          </PaySection>
                          <PaySection title="Taxes">
                            <PayRow label="Federal Withholding" value={-activePaycheck.fedBefore} negative />
                            <PayRow label="State Withholding" value={-activePaycheck.stateBefore} negative />
                            <PayRow label="FICA (7.65%)" value={-activePaycheck.ficaBefore} negative />
                          </PaySection>
                          <div style={{ height: 1, background: CARD_BORDER, margin: '12px 0' }} />
                          <PayRow label="Net Pay" value={activePaycheck.netBefore} bold />
                        </Card>

                        {/* With Plan */}
                        <Card inner style={{ borderColor: 'rgba(63,127,244,0.25)' }}>
                          <h4 style={{ fontWeight: 600, fontSize: 14, color: BRAND_BLUE, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Paycheck with Plan</h4>
                          <PaySection title="Earnings">
                            <PayRow label="Gross Pay" value={activePaycheck.grossPay} />
                          </PaySection>
                          <PaySection title="Deductions">
                            <PayRow label="Pre-Tax Benefit Deduction" value={-activePaycheck.preTaxPerPay} accent />
                          </PaySection>
                          <PaySection title="Taxes">
                            <PayRow label="Federal Withholding" value={-activePaycheck.fedAfter} negative />
                            <PayRow label="State Withholding" value={-activePaycheck.stateAfter} negative />
                            <PayRow label="FICA (7.65%)" value={-activePaycheck.ficaAfter} negative />
                          </PaySection>
                          <PaySection title="Plan Benefit">
                            <PayRow label="Tax Savings Benefit" value={activePaycheck.planBenefit} accent />
                          </PaySection>
                          <div style={{ height: 1, background: CARD_BORDER, margin: '12px 0' }} />
                          <div>
                            <PayRow label="Net Pay" value={activePaycheck.netAfter} bold green={activePaycheck.increase > 0} />
                            <div style={{ textAlign: 'right', marginTop: 4 }}>
                              <span style={{
                                fontWeight: 600,
                                fontSize: 14,
                                fontFamily: FONT_MONO,
                                color: activePaycheck.increase >= 0 ? BRAND_GREEN : '#EF4444',
                              }}>
                                {activePaycheck.increase >= 0 ? '+' : ''}{formatDollarCents(activePaycheck.increase)}({activePaycheck.increase >= 0 ? '+' : ''}{activePaycheck.pctIncrease.toFixed(1)}%)
                              </span>
                            </div>
                          </div>
                        </Card>
                      </div>

                      {/* Annual Impact Summary */}
                      <div style={{ textAlign: 'center', marginTop: 24 }}>
                        <h3 style={{ fontWeight: 600, fontSize: 16, color: TEXT_PRIMARY, margin: 0 }}>Annual Impact Summary</h3>
                        <div style={{ width: 60, height: 2, background: BRAND_BLUE, margin: '8px auto 16px' }} />
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 60 }}>
                          <ProfileStat label="Annual Take-Home Increase" value={formatDollarCents(activePaycheck.annualIncrease)} />
                          <ProfileStat label="Total Tax Savings" value={formatDollarCents(activePaycheck.annualTaxSavings)} />
                          <ProfileStat label="Increase Percentage" value={`${activePaycheck.pctIncrease >= 0 ? '+' : ''}${activePaycheck.pctIncrease.toFixed(1)}%`} accent />
                        </div>
                      </div>
                    </>
                  ) : (
                    <p style={{ color: TEXT_MUTED, fontSize: 14, fontStyle: 'italic', textAlign: 'center', padding: '24px 0' }}>
                      No employees are projected to see a net decrease under this plan configuration.
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* B7 — Detailed Analysis */}
        <Card style={{ marginTop: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => setDetailedOpen(!detailedOpen)}>
            <h2 style={{ fontWeight: 600, fontSize: 22, color: TEXT_PRIMARY, margin: 0 }}>Detailed Analysis</h2>
            {detailedOpen ? <Minus size={20} style={{ color: TEXT_MUTED }} /> : <Plus size={20} style={{ color: TEXT_MUTED }} />}
          </div>

          <AnimatePresence>
            {detailedOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 20 }}>
                  {/* Employee Eligibility */}
                  <Card inner>
                    <div style={{ textAlign: 'center' }}>
                      <h3 style={{ fontWeight: 600, fontSize: 18, color: TEXT_PRIMARY, margin: 0 }}>Employee Eligibility</h3>
                      <div style={{ width: 60, height: 2, background: GRADIENT, margin: '8px auto 20px' }} />
                    </div>
                    <DetailRow label="Total Eligible Employees" value={String(result.totalEmployees)} />
                    <DetailRow label="Eligible Employees" value={String(result.qualifiedEmployees)} />
                    <DetailRow label="Employees with positive net take-home pay" value={String(result.positivelyImpactedCount)} />
                    <DetailRow label="Participation rate of eligible employees" value={`${participationRate}%`} />
                  </Card>

                  {/* Financial Impact */}
                  <Card inner>
                    <div style={{ textAlign: 'center' }}>
                      <h3 style={{ fontWeight: 600, fontSize: 18, color: TEXT_PRIMARY, margin: 0 }}>Financial Impact</h3>
                      <div style={{ width: 60, height: 2, background: GRADIENT, margin: '8px auto 20px' }} />
                    </div>
                    <DetailRow label="Employer Annual Savings (Net of Fees):" value={formatDollar(netSavings)} />
                    <DetailRow label="Monthly Per Employee:" value={formatDollar(result.totalEmployees > 0 ? Math.round(netSavings / result.totalEmployees / 12) : 0)} />
                  </Card>
                </div>

                {/* Statistically Significant notice */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    marginTop: 20,
                    padding: '14px 20px',
                    background: CARD_BG,
                    border: `1px solid ${CARD_BORDER}`,
                    borderRadius: 12,
                    boxShadow: CARD_SHADOW_SM,
                  }}
                >
                  <CheckCircle2 size={20} style={{ color: BRAND_GREEN, flexShrink: 0 }} />
                  <p style={{ color: TEXT_PRIMARY, fontSize: 14, margin: 0 }}>
                    <strong>Statistically Significant:</strong> This analysis is based on a sample size of {result.totalEmployees} employees, which provides a statistically significant result.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* B8 — Value Proposition */}
        <div style={{ marginTop: 56, textAlign: 'center' }}>
          <h2 style={{ fontWeight: 600, fontSize: 24, color: TEXT_PRIMARY, marginBottom: 28 }}>Value Proposition</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 20,
            }}
            className="value-prop-grid"
          >
            {VALUE_PROPOSITIONS.map((vp, i) => (
              <Card key={i} inner style={{ textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: GRADIENT,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 16,
                      color: '#FFFFFF',
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </div>
                  <span style={{ fontWeight: 600, fontSize: 16, color: TEXT_PRIMARY }}>{vp.title}</span>
                </div>
                <p style={{ fontWeight: 400, fontSize: 14, color: TEXT_SECONDARY, lineHeight: 1.5, margin: 0 }}>{vp.body}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* B9 — FAQ */}
        <div style={{ marginTop: 56 }}>
          <h2 style={{ fontWeight: 600, fontSize: 22, color: TEXT_PRIMARY, marginBottom: 20, textAlign: 'center' }}>Frequently Asked Questions</h2>
          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {FAQ_ITEMS.map((item, i) => (
                <div key={i}>
                  <button
                    onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                    style={{
                      display: 'flex',
                      width: '100%',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 4px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: FONT_SANS,
                    }}
                  >
                    <span style={{ fontWeight: 600, fontSize: 16, color: BRAND_BLUE }}>{item.q}</span>
                    <ChevronDown
                      size={18}
                      style={{
                        color: BRAND_BLUE,
                        flexShrink: 0,
                        transform: faqOpen === i ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s',
                      }}
                    />
                  </button>
                  <AnimatePresence>
                    {faqOpen === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <p style={{ padding: '0 4px 14px', fontSize: 15, color: TEXT_SECONDARY, lineHeight: 1.6, margin: 0 }}>{item.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {i < FAQ_ITEMS.length - 1 && <div style={{ height: 1, background: CARD_BORDER }} />}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* B10 — CTA */}
        <Card style={{ marginTop: 56, textAlign: 'center' }}>
          <h2 style={{ fontWeight: 600, fontSize: 24, color: BRAND_BLUE, margin: 0 }}>
            Ready to boost employee satisfaction and reduce tax liability?
          </h2>
          <p style={{ fontWeight: 400, fontSize: 16, color: TEXT_SECONDARY, marginTop: 12 }}>
            Our dedicated team will guide you through every step of the implementation process.
          </p>
        </Card>

        {/* B11 — Disclaimer */}
        <Card style={{ marginTop: 40, textAlign: 'center' }}>
          <h3 style={{ fontWeight: 600, fontSize: 18, color: TEXT_PRIMARY, marginBottom: 12 }}>Disclaimer</h3>
          <p style={{ fontWeight: 400, fontSize: 13, color: TEXT_MUTED, lineHeight: 1.6, margin: 0 }}>
            {DISCLAIMER_TEXT}
          </p>
        </Card>

        {/* B12 — Download */}
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <button
            onClick={downloadPDF}
            disabled={isGenerating}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              background: BRAND_BLUE,
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: 16,
              padding: '14px 32px',
              borderRadius: 9999,
              border: 'none',
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              opacity: isGenerating ? 0.6 : 1,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontFamily: FONT_SANS,
            }}
            onMouseEnter={(e) => { if (!isGenerating) e.currentTarget.style.background = BRAND_BLUE_DEEP; }}
            onMouseLeave={(e) => { if (!isGenerating) e.currentTarget.style.background = BRAND_BLUE; }}
          >
            {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            DOWNLOAD FULL PROPOSAL
          </button>
        </div>
      </div>

      {/* Responsive grid override */}
      <style>{`
        @media (max-width: 900px) {
          .value-prop-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 600px) {
          .value-prop-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function r2(n: number) {
  return Math.round(n * 100) / 100;
}

function Card({ children, style, inner }: { children: React.ReactNode; style?: React.CSSProperties; inner?: boolean }) {
  return (
    <div
      style={{
        background: inner ? INNER_BG : CARD_BG,
        border: `1px solid ${CARD_BORDER}`,
        borderRadius: inner ? 12 : 16,
        padding: inner ? 20 : 32,
        boxShadow: inner ? CARD_SHADOW_SM : CARD_SHADOW,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function KpiCard({ label, value, caption }: { label: string; value: string; caption: string }) {
  return (
    <div
      style={{
        background: CARD_BG,
        border: `1px solid ${CARD_BORDER}`,
        borderRadius: 16,
        padding: '32px 24px',
        textAlign: 'center',
        borderLeft: `4px solid ${BRAND_BLUE}`,
        boxShadow: CARD_SHADOW,
      }}
    >
      <p style={{ fontWeight: 600, fontSize: 16, color: TEXT_PRIMARY, margin: 0 }}>{label}</p>
      <p style={{ fontWeight: 600, fontSize: 56, color: TEXT_PRIMARY, margin: '8px 0', lineHeight: 1, fontFamily: FONT_MONO }}>{value}</p>
      <p style={{ fontWeight: 400, fontSize: 13, color: TEXT_MUTED, margin: 0 }}>{caption}</p>
    </div>
  );
}

function PillTab({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? BRAND_BLUE : 'transparent',
        color: active ? '#FFFFFF' : TEXT_MUTED,
        border: active ? 'none' : `1px solid ${CARD_BORDER}`,
        borderRadius: 9999,
        padding: '8px 20px',
        fontWeight: 600,
        fontSize: 14,
        cursor: 'pointer',
        transition: 'all 0.2s',
        fontFamily: FONT_SANS,
      }}
    >
      {children}
    </button>
  );
}

function ProfileStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p style={{ fontWeight: 600, fontSize: 18, color: accent ? BRAND_BLUE : TEXT_PRIMARY, margin: 0, fontFamily: FONT_MONO }}>{value}</p>
      <p style={{ fontWeight: 400, fontSize: 12, color: TEXT_MUTED, margin: '4px 0 0' }}>{label}</p>
    </div>
  );
}

function PaySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <p style={{ fontWeight: 600, fontSize: 11, color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '8px 0 4px' }}>{title}</p>
      {children}
    </div>
  );
}

function PayRow({ label, value, bold, negative, accent, green }: {
  label: string; value: number; bold?: boolean; negative?: boolean; accent?: boolean; green?: boolean;
}) {
  const isNeg = value < -0.005;
  const displayValue = isNeg ? `(${formatDollarCents(Math.abs(value))})` : formatDollarCents(value);
  const color = accent ? BRAND_BLUE : green ? BRAND_GREEN : bold ? TEXT_PRIMARY : isNeg ? 'rgba(239,68,68,0.8)' : TEXT_SECONDARY;

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0', fontSize: bold ? 16 : 13 }}>
      <span style={{ color: accent ? BRAND_BLUE : TEXT_SECONDARY }}>{label}</span>
      <span style={{ fontFamily: FONT_MONO, fontWeight: bold ? 600 : 500, color }}>{displayValue}</span>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
      <span style={{ fontWeight: 400, fontSize: 14, color: TEXT_SECONDARY }}>{label}</span>
      <span style={{ fontWeight: 600, fontSize: 18, color: TEXT_PRIMARY, fontFamily: FONT_MONO }}>{value}</span>
    </div>
  );
}
