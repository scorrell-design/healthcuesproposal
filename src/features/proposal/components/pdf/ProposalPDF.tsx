import { Document, Page, View, Text, StyleSheet, Font } from '@react-pdf/renderer';
import { PDFSavingsSpectrum } from './PDFSavingsSpectrum';
import type { CompanyInfo, ProposalResult } from '../../types/proposal.types';

Font.register({
  family: 'Poppins',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/poppins@latest/latin-400-normal.ttf', fontWeight: 400 },
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/poppins@latest/latin-500-normal.ttf', fontWeight: 500 },
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/poppins@latest/latin-600-normal.ttf', fontWeight: 600 },
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/poppins@latest/latin-700-normal.ttf', fontWeight: 700 },
  ],
});

const BLUE = '#3F7FF4';
const BLUE_SOFT = '#E8F0FE';
const GREEN = '#2FBF8F';
const INK = '#0F172A';
const MUTED = '#475569';
const TEXT_MUTED = '#94A3B8';
const BORDER = '#E6EEF6';

const s = StyleSheet.create({
  page: {
    paddingTop: 0,
    paddingBottom: 60,
    paddingHorizontal: 48,
    fontFamily: 'Poppins',
    fontSize: 10,
    color: INK,
    backgroundColor: '#FFFFFF',
  },
  gradientBar: {
    marginHorizontal: -48,
    marginTop: 0,
    height: 8,
    backgroundColor: BLUE,
  },
  headerArea: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerBrandText: {
    fontSize: 16,
    fontWeight: 700,
    color: INK,
  },
  headerBrandNormal: {
    fontWeight: 400,
  },
  headerEyebrow: {
    fontSize: 10,
    fontWeight: 500,
    color: TEXT_MUTED,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  companyName: {
    fontSize: 28,
    fontWeight: 700,
    color: INK,
    marginTop: 20,
  },
  blueRule: {
    width: 60,
    height: 2,
    backgroundColor: BLUE,
    marginTop: 8,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 11,
    color: MUTED,
  },
  dateLine: {
    fontSize: 10,
    color: MUTED,
    marginTop: 2,
  },
  divider: {
    height: 0.5,
    backgroundColor: BORDER,
    marginVertical: 14,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
    marginBottom: 14,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: BLUE_SOFT,
    borderRadius: 6,
    padding: 12,
    borderLeft: `3 solid ${BLUE}`,
  },
  kpiLabel: {
    fontSize: 9,
    color: BLUE,
    textTransform: 'uppercase',
    fontWeight: 600,
    letterSpacing: 0.7,
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: 700,
    color: INK,
    marginTop: 4,
  },
  kpiSublabel: {
    fontSize: 9,
    color: MUTED,
    marginTop: 2,
  },
  qualRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  qualCard: {
    flex: 1,
    borderRadius: 6,
    border: `1 solid ${BORDER}`,
    padding: 10,
    backgroundColor: '#FFFFFF',
  },
  qualValue: {
    fontSize: 14,
    fontWeight: 600,
    color: INK,
  },
  qualLabel: {
    fontSize: 9,
    color: MUTED,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: INK,
    marginBottom: 2,
  },
  sectionTitleRule: {
    width: 40,
    height: 0.5,
    backgroundColor: BLUE,
    marginBottom: 6,
  },
  tierHeader: {
    flexDirection: 'row',
    backgroundColor: BLUE,
    padding: 8,
    borderRadius: 4,
  },
  tierHeaderCell: {
    flex: 1,
    fontSize: 8,
    fontWeight: 600,
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  tierRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: `0.5 solid ${BORDER}`,
  },
  tierRowAlt: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: `0.5 solid ${BORDER}`,
    backgroundColor: '#F6F9FC',
  },
  tierCell: {
    flex: 1,
    fontSize: 10,
    color: INK,
  },
  tierCellAccent: {
    flex: 1,
    fontSize: 10,
    fontWeight: 600,
    color: GREEN,
  },
  tierMethodology: {
    fontSize: 8,
    color: MUTED,
    marginTop: 6,
  },
  preparedBy: {
    marginTop: 16,
    paddingTop: 10,
    borderTop: `0.5 solid ${BORDER}`,
  },
  preparedByLabel: {
    fontSize: 8,
    color: TEXT_MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  preparedByName: {
    fontSize: 11,
    fontWeight: 600,
    color: INK,
    marginTop: 2,
  },
  preparedByEmail: {
    fontSize: 9,
    color: BLUE,
    marginTop: 1,
  },
  disclaimerSection: {
    marginTop: 20,
    paddingTop: 12,
    borderTop: `0.5 solid ${BORDER}`,
  },
  disclaimerTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: INK,
    marginBottom: 6,
  },
  disclaimerText: {
    fontSize: 9,
    color: MUTED,
    lineHeight: 1.5,
    marginBottom: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 48,
    right: 48,
    borderTop: `0.5 solid ${BORDER}`,
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 7,
    color: TEXT_MUTED,
  },
  footerBrand: {
    fontSize: 7,
    color: BLUE,
    fontWeight: 600,
  },
});

const fmt = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;

interface ProposalPDFProps {
  company: CompanyInfo;
  result: ProposalResult;
  proposalType: 'quick_proposal' | 'informed_analysis';
  brokerName?: string;
  brokerEmail?: string;
}

export function ProposalPDF({ company, result, proposalType, brokerName, brokerEmail }: ProposalPDFProps) {
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const currentTaxYear = new Date().getFullYear();
  const qualifiedPct = result.totalEmployees > 0 ? Math.round((result.qualifiedEmployees / result.totalEmployees) * 100) : 0;
  const totalCombinedSavings = result.employerAnnualFICASavings + (result.avgEmployeeAnnualSavings * result.totalEmployees);

  return (
    <Document>
      <Page size="LETTER" style={s.page}>
        {/* Gradient cover bar */}
        <View style={s.gradientBar} />

        {/* Header */}
        <View style={s.headerArea}>
          <Text style={s.headerBrandText}>
            Health<Text style={s.headerBrandNormal}>Cues</Text>
          </Text>
          <Text style={s.headerEyebrow}>Section 125 Proposal</Text>
        </View>

        {/* Company Info */}
        <Text style={s.companyName}>{company.name || 'Company'}</Text>
        <View style={s.blueRule} />
        <Text style={s.subtitle}>Section 125 Cafeteria Plan — Tax Savings Proposal</Text>
        <Text style={s.dateLine}>{date} · {company.employeeCount} employees</Text>
        {brokerName ? (
          <Text style={[s.dateLine, { marginTop: 2, fontSize: 10, color: TEXT_MUTED }]}>Prepared by {brokerName}</Text>
        ) : null}

        <View style={s.divider} />

        {/* KPI Cards */}
        <View style={s.kpiRow}>
          <View style={s.kpiCard}>
            <Text style={s.kpiLabel}>Total Combined Annual Savings</Text>
            <Text style={s.kpiValue}>{fmt(totalCombinedSavings)}</Text>
            <Text style={s.kpiSublabel}>Employer FICA + Employee tax savings</Text>
          </View>
          <View style={s.kpiCard}>
            <Text style={s.kpiLabel}>Projected Annual FICA Savings</Text>
            <Text style={s.kpiValue}>{fmt(result.employerAnnualFICASavings)}</Text>
            <Text style={s.kpiSublabel}>Employer side only</Text>
          </View>
          <View style={s.kpiCard}>
            <Text style={s.kpiLabel}>Projected Avg. Employee Savings</Text>
            <Text style={s.kpiValue}>{fmt(result.avgEmployeeAnnualSavings)}</Text>
            <Text style={s.kpiSublabel}>Per eligible employee</Text>
          </View>
        </View>

        {/* Qualified / Positively Impacted */}
        <View style={s.qualRow}>
          <View style={s.qualCard}>
            <Text style={s.qualValue}>{result.qualifiedEmployees} of {result.totalEmployees} ({qualifiedPct}%)</Text>
            <Text style={s.qualLabel}>Eligible Employees — meet Section 125 income threshold</Text>
          </View>
          <View style={s.qualCard}>
            <Text style={s.qualValue}>{result.positivelyImpactedCount} ({result.positivelyImpactedPercent}%)</Text>
            <Text style={s.qualLabel}>Estimated Positively Impacted — increased take-home pay</Text>
          </View>
        </View>

        {/* Savings Outlook */}
        <PDFSavingsSpectrum range={result.savingsRange} proposalType={proposalType} />

        <View style={s.divider} />

        {/* Tier Breakdown */}
        <Text style={s.sectionTitle}>Tier Breakdown</Text>
        <View style={s.sectionTitleRule} />
        <Text style={{ fontSize: 9, color: MUTED, marginBottom: 8 }}>Estimates based on provided data</Text>
        <View style={s.tierHeader}>
          <Text style={s.tierHeaderCell}>Tier</Text>
          <Text style={[s.tierHeaderCell, { textAlign: 'right' }]}># Employees (%)</Text>
          <Text style={[s.tierHeaderCell, { textAlign: 'right' }]}>Avg. Salary</Text>
          <Text style={[s.tierHeaderCell, { textAlign: 'right' }]}>FICA Savings/EE</Text>
        </View>
        {result.tierResults.map((tier, i) => {
          const pct = result.totalEmployees > 0 ? Math.round((tier.employeeCount / result.totalEmployees) * 100) : 0;
          return (
            <View key={tier.tier} style={i % 2 === 1 ? s.tierRowAlt : s.tierRow}>
              <Text style={[s.tierCell, { fontWeight: 600 }]}>{tier.tier}</Text>
              <Text style={[s.tierCell, { textAlign: 'right' }]}>{tier.employeeCount} ({pct}%)</Text>
              <Text style={[s.tierCell, { textAlign: 'right' }]}>{fmt(tier.avgSalary)}</Text>
              <Text style={[s.tierCellAccent, { textAlign: 'right' }]}>{fmt(tier.ficaSavingsPerEmployee)}</Text>
            </View>
          );
        })}
        <Text style={s.tierMethodology}>
          Tier FICA savings assume average pre-tax contributions consistent with typical Section 125 plan participation.
        </Text>

        {/* Prepared By */}
        {brokerName && (
          <View style={s.preparedBy}>
            <Text style={s.preparedByLabel}>Prepared By</Text>
            <Text style={s.preparedByName}>{brokerName}</Text>
            {brokerEmail && <Text style={s.preparedByEmail}>{brokerEmail}</Text>}
          </View>
        )}

        {/* Disclosures */}
        <View style={s.disclaimerSection}>
          <Text style={s.disclaimerTitle}>Important Disclosures</Text>
          <Text style={s.disclaimerText}>
            This proposal provides estimated projections based on the data provided and current federal and state tax rates as of {currentTaxYear}. Actual results will depend on employee participation rates, workforce changes, benefit elections, and tax law modifications.
          </Text>
          <Text style={s.disclaimerText}>
            Savings estimates assume all eligible employees are W-2 employees of the employer group. Independent contractors and 1099 workers are not eligible for Section 125 plans.
          </Text>
          <Text style={s.disclaimerText}>
            Section 125 plan availability, design requirements, and tax treatment may vary by state. Consult state-specific regulations before implementation.
          </Text>
          <Text style={s.disclaimerText}>
            This document is for informational purposes only and does not constitute tax, legal, or financial advice. Consult with a qualified tax professional before implementing a Section 125 Cafeteria Plan.
          </Text>
          <Text style={s.disclaimerText}>
            Projected Savings represents the most likely outcome based on provided data. Actual savings may fall within the Conservative Estimate to Optimal Savings range shown above.
          </Text>
        </View>

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>
            Prepared by HealthCues · Section 125 Analysis
          </Text>
          <Text style={s.footerBrand}>HealthCues</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
