import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Home,
  Car,
  DollarSign,
  TrendingUp,
  Shield,
  X,
  Info,
  BarChart3,
  PieChart,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';

/* ---------- Small helpers ---------- */
const parseNumber = (v, fallback = 0) => {
  if (v === undefined || v === null) return fallback;
  const n = parseFloat(String(v).replace(/,/g, ''));
  return Number.isNaN(n) ? fallback : n;
};

const formatCurrency = (n) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);

const formatPercent = (n, digits = 1) =>
  `${(n * 100).toFixed(digits)}%`;

/* ---------- Inline tooltip label for literacy ---------- */
function TermTooltipLabel({ term, label }) {
  const [open, setOpen] = useState(false);

  const tips = {
    '50-30-20': {
      title: '50/30/20 rule',
      text: 'Simple rule of thumb: 50% needs (rent, food), 30% wants (eating out, fun), 20% savings and debt payoff.',
    },
    affordability: {
      title: 'Affordability vs approval',
      text: 'Lenders approve based on gross income. You live on net (take-home) pay. Do the math with your actual paycheck.',
    },
    dti: {
      title: 'Debt-to-income (DTI)',
      text: 'Total monthly debt payments ÷ gross monthly income. Lenders often like DTI under ~43%. Lower is safer.',
    },
    avalanche: {
      title: 'Avalanche method',
      text: 'Pay extra on the highest-interest debt first. You save the most on interest.',
    },
    snowball: {
      title: 'Snowball method',
      text: 'Pay extra on the smallest balance first. You get quick wins and motivation, even if you pay a bit more interest.',
    },
  };

  const tip = tips[term];

  if (!tip) return <span>{label}</span>;

  return (
    <span className="inline-flex items-center relative">
      <span>{label}</span>
      <button
        type="button"
        className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full border border-blue-500 text-blue-600 text-[10px] hover:bg-blue-50"
        onClick={() => setOpen((v) => !v)}
      >
        ?
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-64 rounded-md border border-slate-200 bg-white shadow-lg p-3 text-xs text-slate-700">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="font-semibold text-slate-900">{tip.title}</div>
            <button
              type="button"
              className="text-slate-400 hover:text-slate-600"
              onClick={() => setOpen(false)}
            >
              <X size={12} />
            </button>
          </div>
          <p className="leading-snug">{tip.text}</p>
        </div>
      )}
    </span>
  );
}

/* =======================================================
   REAL ESTATE ROI / CAP RATE / CASH-ON-CASH CALCULATOR
   ======================================================= */

const roiFormatCurrency = (n) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

const roiFormatPercent = (n) => `${(n * 100).toFixed(1)}%`;

function RealEstateRoiCalculator() {
  const [purchasePrice, setPurchasePrice] = useState('300000');
  const [closingCosts, setClosingCosts] = useState('9000');
  const [rehabCosts, setRehabCosts] = useState('15000');

  const [monthlyRent, setMonthlyRent] = useState('2500');
  const [otherIncome, setOtherIncome] = useState('0');
  const [vacancyRate, setVacancyRate] = useState('5');

  const [opExPercent, setOpExPercent] = useState('35');

  const [downPaymentPercent, setDownPaymentPercent] = useState('20');
  const [interestRate, setInterestRate] = useState('6.5');
  const [loanTermYears, setLoanTermYears] = useState('30');

  // NEW: simple growth assumptions for projections
  const [incomeGrowthRate, setIncomeGrowthRate] = useState('2'); // % per year
  const [valueGrowthRate, setValueGrowthRate] = useState('3');   // % per year

  const P = parseNumber(purchasePrice);
  const CC = parseNumber(closingCosts);
  const rehab = parseNumber(rehabCosts);

  const rent = parseNumber(monthlyRent);
  const other = parseNumber(otherIncome);
  const vacPct = parseNumber(vacancyRate) / 100;
  const opPct = parseNumber(opExPercent) / 100;

  const dpPct = parseNumber(downPaymentPercent) / 100;
  const rate = parseNumber(interestRate) / 100;
  const years = parseNumber(loanTermYears);

  const incGrowth = parseNumber(incomeGrowthRate) / 100; // NOI growth
  const valGrowth = parseNumber(valueGrowthRate) / 100;  // property value growth

  let results = null;
  let projections = [];

  if (P > 0 && years > 0) {
    const loanAmount = P * (1 - dpPct);
    const downPayment = P * dpPct;

    const r = rate / 12;
    const n = years * 12;

    const monthlyDebtService =
      r === 0 ? loanAmount / n : loanAmount * (r / (1 - Math.pow(1 + r, -n)));

    const annualDebtService = monthlyDebtService * 12;

    const gsi = (rent + other) * 12;
    const vacancyLoss = gsi * vacPct;
    const egi = gsi - vacancyLoss;

    const opEx = egi * opPct;
    const noi = egi - opEx;

    const totalCashInvested = downPayment + CC + rehab;

    const capRate = P > 0 ? noi / P : 0;
    const annualCashFlow = noi - annualDebtService;
    const cashOnCash =
      totalCashInvested > 0 ? annualCashFlow / totalCashInvested : 0;

    const dscr = annualDebtService > 0 ? noi / annualDebtService : 0;

    results = {
      loanAmount,
      downPayment,
      monthlyDebtService,
      annualDebtService,
      gsi,
      vacancyLoss,
      egi,
      opEx,
      noi,
      totalCashInvested,
      capRate,
      annualCashFlow,
      cashOnCash,
      dscr,
    };

    // ---- Multi-year rough projections (3 / 5 / 10 years) ----
    const horizons = [3, 5, 10];

    projections = horizons.map((h) => {
      let totalCashFlow = 0;

      for (let year = 1; year <= h; year++) {
        const noiYear = noi * Math.pow(1 + incGrowth, year - 1);
        const cashFlowYear = noiYear - annualDebtService; // assume fixed-rate loan
        totalCashFlow += cashFlowYear;
      }

      const simpleRoi =
        totalCashInvested > 0 ? totalCashFlow / totalCashInvested : 0;

      const projectedValue = P * Math.pow(1 + valGrowth, h);

      return {
        years: h,
        totalCashFlow,
        simpleRoi,
        projectedValue,
      };
    });
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">
        Real Estate ROI
      </h2>
      <p className="text-sm text-slate-600 max-w-2xl">
        Estimate cap rate, cash-on-cash return, and DSCR to understand if a
        rental or commercial property is worth the risk. Then see how the
        deal might look over 3, 5, and 10 years with simple growth
        assumptions. No judgment, just numbers.
      </p>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        {/* Inputs */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-5 shadow border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">
              Property &amp; One-Time Costs
            </h3>
            <div className="grid gap-4 md:grid-cols-3">
              <RoiField
                label="Purchase price"
                prefix="$"
                value={purchasePrice}
                onChange={setPurchasePrice}
              />
              <RoiField
                label="Closing costs"
                prefix="$"
                value={closingCosts}
                onChange={setClosingCosts}
              />
              <RoiField
                label="Rehab / initial work"
                prefix="$"
                value={rehabCosts}
                onChange={setRehabCosts}
              />
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">
              Income &amp; Vacancy
            </h3>
            <div className="grid gap-4 md:grid-cols-3">
              <RoiField
                label="Monthly rent"
                prefix="$"
                value={monthlyRent}
                onChange={setMonthlyRent}
              />
              <RoiField
                label="Other monthly income"
                prefix="$"
                value={otherIncome}
                onChange={setOtherIncome}
              />
              <RoiField
                label="Vacancy rate"
                suffix="%"
                value={vacancyRate}
                onChange={setVacancyRate}
              />
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow border border-slate-100 space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-1">
              Operating Expenses &amp; Financing
            </h3>
            <div className="grid gap-4 md:grid-cols-4">
              <RoiField
                label="OpEx as % of EGI"
                suffix="%"
                value={opExPercent}
                onChange={setOpExPercent}
              />
              <RoiField
                label="Down payment"
                suffix="%"
                value={downPaymentPercent}
                onChange={setDownPaymentPercent}
              />
              <RoiField
                label="Interest rate"
                suffix="%"
                value={interestRate}
                onChange={setInterestRate}
              />
              <RoiField
                label="Loan term (years)"
                value={loanTermYears}
                onChange={setLoanTermYears}
              />
            </div>

            {/* NEW: projection assumptions */}
            <div className="grid gap-4 md:grid-cols-2 pt-2 border-t border-slate-100">
              <RoiField
                label="Annual rent & expenses growth"
                suffix="%"
                value={incomeGrowthRate}
                onChange={setIncomeGrowthRate}
              />
              <RoiField
                label="Annual property value growth"
                suffix="%"
                value={valueGrowthRate}
                onChange={setValueGrowthRate}
              />
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-5 shadow border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">
              Key Metrics (Year 1)
            </h3>

            {!results ? (
              <p className="text-sm text-slate-500">
                Enter property values to see cap rate, cash-on-cash, and DSCR.
              </p>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <RoiMetricTile
                    label="Cap Rate"
                    value={roiFormatPercent(results.capRate)}
                  />
                  <RoiMetricTile
                    label="Cash-on-Cash"
                    value={roiFormatPercent(results.cashOnCash)}
                  />
                  <RoiMetricTile
                    label="DSCR"
                    value={results.dscr.toFixed(2)}
                    emphasize={
                      results.dscr < 1.2
                        ? 'bad'
                        : results.dscr < 1.3
                        ? 'warn'
                        : 'good'
                    }
                  />
                  <RoiMetricTile
                    label="Annual Cash Flow"
                    value={roiFormatCurrency(results.annualCashFlow)}
                    emphasize={
                      results.annualCashFlow < 0 ? 'bad' : 'good'
                    }
                  />
                </div>

                <hr className="my-4" />

                <dl className="space-y-1 text-sm text-slate-700">
                  <RoiRow label="NOI" value={roiFormatCurrency(results.noi)} />
                  <RoiRow
                    label="Annual Debt Service"
                    value={roiFormatCurrency(
                      results.annualDebtService
                    )}
                  />
                  <RoiRow
                    label="Total Cash Invested"
                    value={roiFormatCurrency(
                      results.totalCashInvested
                    )}
                  />
                  <RoiRow
                    label="Loan Amount"
                    value={roiFormatCurrency(results.loanAmount)}
                  />
                </dl>
              </>
            )}
          </div>

          {/* NEW: multi-year snapshot */}
          <div className="rounded-2xl bg-slate-900 p-4 text-sm text-slate-100">
            <p className="font-semibold mb-2">
              Multi-year snapshot (rough)
            </p>
            {!results ? (
              <p className="text-xs text-slate-300">
                Once you enter numbers above, you&apos;ll see 3 / 5 / 10-year
                projections here.
              </p>
            ) : (
              <>
                <p className="text-[11px] text-slate-300 mb-2">
                  Assumes fixed-rate debt, simple annual growth for income and
                  property value, and ignores taxes and big cap-ex. Use it as a
                  quick directional view, not a full underwriting model.
                </p>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs">
                    <thead>
                      <tr className="text-slate-300 border-b border-slate-700">
                        <th className="py-1 pr-4 text-left">Years</th>
                        <th className="py-1 px-4 text-right">
                          Total cash flow
                        </th>
                        <th className="py-1 px-4 text-right">
                          Simple ROI
                        </th>
                        <th className="py-1 pl-4 text-right">
                          Projected value
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {projections.map((p) => (
                        <tr key={p.years} className="border-b border-slate-800/60">
                          <td className="py-1 pr-4">
                            {p.years} yrs
                          </td>
                          <td className="py-1 px-4 text-right font-mono">
                            {roiFormatCurrency(p.totalCashFlow)}
                          </td>
                          <td className="py-1 px-4 text-right font-mono">
                            {roiFormatPercent(p.simpleRoi)}
                          </td>
                          <td className="py-1 pl-4 text-right font-mono">
                            {roiFormatCurrency(p.projectedValue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
              <RoiField
                label="Purchase price"
                prefix="$"
                value={purchasePrice}
                onChange={setPurchasePrice}
              />
              <RoiField
                label="Closing costs"
                prefix="$"
                value={closingCosts}
                onChange={setClosingCosts}
              />
              <RoiField
                label="Rehab / initial work"
                prefix="$"
                value={rehabCosts}
                onChange={setRehabCosts}
              />
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">
              Income &amp; Vacancy
            </h3>
            <div className="grid gap-4 md:grid-cols-3">
              <RoiField
                label="Monthly rent"
                prefix="$"
                value={monthlyRent}
                onChange={setMonthlyRent}
              />
              <RoiField
                label="Other monthly income"
                prefix="$"
                value={otherIncome}
                onChange={setOtherIncome}
              />
              <RoiField
                label="Vacancy rate"
                suffix="%"
                value={vacancyRate}
                onChange={setVacancyRate}
              />
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">
              Operating Expenses &amp; Financing
            </h3>
            <div className="grid gap-4 md:grid-cols-4">
              <RoiField
                label="OpEx as % of EGI"
                suffix="%"
                value={opExPercent}
                onChange={setOpExPercent}
              />
              <RoiField
                label="Down payment"
                suffix="%"
                value={downPaymentPercent}
                onChange={setDownPaymentPercent}
              />
              <RoiField
                label="Interest rate"
                suffix="%"
                value={interestRate}
                onChange={setInterestRate}
              />
              <RoiField
                label="Loan term (years)"
                value={loanTermYears}
                onChange={setLoanTermYears}
              />
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-5 shadow border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">
              Key Metrics (Year 1)
            </h3>

            {!results ? (
              <p className="text-sm text-slate-500">
                Enter property values to see cap rate, cash-on-cash, and DSCR.
              </p>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <RoiMetricTile
                    label="Cap Rate"
                    value={roiFormatPercent(results.capRate)}
                  />
                  <RoiMetricTile
                    label="Cash-on-Cash"
                    value={roiFormatPercent(results.cashOnCash)}
                  />
                  <RoiMetricTile
                    label="DSCR"
                    value={results.dscr.toFixed(2)}
                    emphasize={
                      results.dscr < 1.2
                        ? 'bad'
                        : results.dscr < 1.3
                        ? 'warn'
                        : 'good'
                    }
                  />
                  <RoiMetricTile
                    label="Annual Cash Flow"
                    value={roiFormatCurrency(results.annualCashFlow)}
                    emphasize={
                      results.annualCashFlow < 0 ? 'bad' : 'good'
                    }
                  />
                </div>

                <hr className="my-4" />

                <dl className="space-y-1 text-sm text-slate-700">
                  <RoiRow label="NOI" value={roiFormatCurrency(results.noi)} />
                  <RoiRow
                    label="Annual Debt Service"
                    value={roiFormatCurrency(
                      results.annualDebtService
                    )}
                  />
                  <RoiRow
                    label="Total Cash Invested"
                    value={roiFormatCurrency(
                      results.totalCashInvested
                    )}
                  />
                  <RoiRow
                    label="Loan Amount"
                    value={roiFormatCurrency(results.loanAmount)}
                  />
                </dl>
              </>
            )}
          </div>

          <div className="rounded-2xl bg-slate-900 p-4 text-sm text-slate-100">
            <p className="font-semibold mb-2">How to read this:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>
                <span className="font-semibold">Cap Rate</span> is the
                property&apos;s return if you paid all cash.
              </li>
              <li>
                <span className="font-semibold">Cash-on-Cash</span> shows
                return on your actual cash invested (down payment +
                closing + rehab).
              </li>
              <li>
                <span className="font-semibold">DSCR</span> compares NOI
                to loan payments. Many lenders like DSCR ≥ 1.20.
              </li>
              <li>
                <span className="font-semibold">Annual Cash Flow</span> is
                what&apos;s left after expenses and loan payments, before
                taxes and reserves.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function RoiField({ label, value, onChange, prefix, suffix }) {
  return (
    <label className="flex flex-col gap-1 text-sm text-slate-700">
      <span>{label}</span>
      <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
        {prefix && (
          <span className="mr-1 text-slate-400 text-xs">{prefix}</span>
        )}
        <input
          className="w-full bg-transparent text-sm text-slate-900 outline-none"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          inputMode="decimal"
        />
        {suffix && (
          <span className="ml-1 text-slate-400 text-xs">{suffix}</span>
        )}
      </div>
    </label>
  );
}

function RoiMetricTile({ label, value, emphasize }) {
  let color = 'text-slate-900';
  if (emphasize === 'good') color = 'text-emerald-600';
  if (emphasize === 'bad') color = 'text-rose-600';
  if (emphasize === 'warn') color = 'text-amber-600';

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">
        {label}
      </div>
      <div className={`text-xl font-semibold ${color} font-mono`}>
        {value}
      </div>
    </div>
  );
}

function RoiRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4">
      <dt>{label}</dt>
      <dd className="font-mono">{value}</dd>
    </div>
  );
}

/* ---------- Mortgage: state + territory data ---------- */
const stateData = {
  AL: { name: 'Alabama', propertyTax: 0.41, insurance: 1800 },
  AK: { name: 'Alaska', propertyTax: 1.19, insurance: 1200 },
  AZ: { name: 'Arizona', propertyTax: 0.62, insurance: 1400 },
  AR: { name: 'Arkansas', propertyTax: 0.61, insurance: 1900 },
  CA: { name: 'California', propertyTax: 0.73, insurance: 1400 },
  CO: { name: 'Colorado', propertyTax: 0.51, insurance: 2400 },
  CT: { name: 'Connecticut', propertyTax: 2.14, insurance: 1600 },
  DE: { name: 'Delaware', propertyTax: 0.57, insurance: 1200 },
  FL: { name: 'Florida', propertyTax: 0.89, insurance: 4200 },
  GA: { name: 'Georgia', propertyTax: 0.87, insurance: 1800 },
  HI: { name: 'Hawaii', propertyTax: 0.28, insurance: 900 },
  ID: { name: 'Idaho', propertyTax: 0.63, insurance: 1300 },
  IL: { name: 'Illinois', propertyTax: 2.08, insurance: 1500 },
  IN: { name: 'Indiana', propertyTax: 0.85, insurance: 1400 },
  IA: { name: 'Iowa', propertyTax: 1.57, insurance: 1500 },
  KS: { name: 'Kansas', propertyTax: 1.41, insurance: 2000 },
  KY: { name: 'Kentucky', propertyTax: 0.86, insurance: 1700 },
  LA: { name: 'Louisiana', propertyTax: 0.55, insurance: 2400 },
  ME: { name: 'Maine', propertyTax: 1.36, insurance: 1100 },
  MD: { name: 'Maryland', propertyTax: 1.09, insurance: 1400 },
  MA: { name: 'Massachusetts', propertyTax: 1.23, insurance: 1600 },
  MI: { name: 'Michigan', propertyTax: 1.54, insurance: 1400 },
  MN: { name: 'Minnesota', propertyTax: 1.12, insurance: 1700 },
  MS: { name: 'Mississippi', propertyTax: 0.79, insurance: 2000 },
  MO: { name: 'Missouri', propertyTax: 0.97, insurance: 1900 },
  MT: { name: 'Montana', propertyTax: 0.84, insurance: 1600 },
  NE: { name: 'Nebraska', propertyTax: 1.73, insurance: 2000 },
  NV: { name: 'Nevada', propertyTax: 0.6, insurance: 1200 },
  NH: { name: 'New Hampshire', propertyTax: 2.18, insurance: 1300 },
  NJ: { name: 'New Jersey', propertyTax: 2.49, insurance: 1500 },
  NM: { name: 'New Mexico', propertyTax: 0.8, insurance: 1400 },
  NY: { name: 'New York', propertyTax: 1.72, insurance: 1600 },
  NC: { name: 'North Carolina', propertyTax: 0.84, insurance: 1600 },
  ND: { name: 'North Dakota', propertyTax: 0.98, insurance: 1600 },
  OH: { name: 'Ohio', propertyTax: 1.56, insurance: 1200 },
  OK: { name: 'Oklahoma', propertyTax: 0.9, insurance: 2300 },
  OR: { name: 'Oregon', propertyTax: 0.87, insurance: 1100 },
  PA: { name: 'Pennsylvania', propertyTax: 1.58, insurance: 1300 },
  RI: { name: 'Rhode Island', propertyTax: 1.63, insurance: 1700 },
  SC: { name: 'South Carolina', propertyTax: 0.57, insurance: 1800 },
  SD: { name: 'South Dakota', propertyTax: 1.31, insurance: 1700 },
  TN: { name: 'Tennessee', propertyTax: 0.71, insurance: 1700 },
  TX: { name: 'Texas', propertyTax: 1.8, insurance: 2000 },
  UT: { name: 'Utah', propertyTax: 0.6, insurance: 1100 },
  VT: { name: 'Vermont', propertyTax: 1.9, insurance: 1200 },
  VA: { name: 'Virginia', propertyTax: 0.82, insurance: 1300 },
  WA: { name: 'Washington', propertyTax: 0.93, insurance: 1100 },
  WV: { name: 'West Virginia', propertyTax: 0.58, insurance: 1300 },
  WI: { name: 'Wisconsin', propertyTax: 1.85, insurance: 1200 },
  WY: { name: 'Wyoming', propertyTax: 0.61, insurance: 1600 },
  DC: { name: 'Washington D.C.', propertyTax: 0.56, insurance: 1400 },
  PR: { name: 'Puerto Rico', propertyTax: 0.8, insurance: 1100 },
  VI: { name: 'U.S. Virgin Islands', propertyTax: 1.25, insurance: 2000 },
  GU: { name: 'Guam', propertyTax: 0.35, insurance: 1500 },
  AS: { name: 'American Samoa', propertyTax: 0.4, insurance: 1800 },
  MP: {
    name: 'Northern Mariana Islands',
    propertyTax: 0.35,
    insurance: 1500,
  },
};

/* ---------- Budget tab ---------- */
function BudgetTab() {
  const [income, setIncome] = useState('');
  const [expenses, setExpenses] = useState([
    { name: '', amount: '', category: 'needs' },
  ]);

  const addExpense = () =>
    setExpenses((prev) => [
      ...prev,
      { name: '', amount: '', category: 'needs' },
    ]);

  const removeExpense = (i) =>
    setExpenses((prev) => prev.filter((_, idx) => idx !== i));

  const updateExpense = (i, field, value) =>
    setExpenses((prev) =>
      prev.map((exp, idx) =>
        idx === i ? { ...exp, [field]: value } : exp
      )
    );

  const totalIncome = parseNumber(income);
  const needs = expenses.filter((e) => e.category === 'needs');
  const wants = expenses.filter((e) => e.category === 'wants');
  const savings = expenses.filter((e) => e.category === 'savings');

  const totalNeeds = needs.reduce(
    (sum, e) => sum + parseNumber(e.amount),
    0
  );
  const totalWants = wants.reduce(
    (sum, e) => sum + parseNumber(e.amount),
    0
  );
  const totalSavings = savings.reduce(
    (sum, e) => sum + parseNumber(e.amount),
    0
  );
  const totalExpenses = totalNeeds + totalWants + totalSavings;
  const remaining = totalIncome - totalExpenses;

  const pct = (value) =>
    totalIncome > 0 ? (value / totalIncome) * 100 : 0;

  const needsPct = pct(totalNeeds);
  const wantsPct = pct(totalWants);
  const savingsPct = pct(totalSavings);

  const idealNeeds = totalIncome * 0.5;
  const idealWants = totalIncome * 0.3;
  const idealSavings = totalIncome * 0.2;

  const chartData = [
    {
      name: 'Needs',
      value: Math.round(needsPct),
    },
    {
      name: 'Wants',
      value: Math.round(wantsPct),
    },
    {
      name: 'Savings',
      value: Math.round(savingsPct),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 flex gap-3 items-start">
        <div className="mt-1 rounded-full bg-emerald-600/90 text-white w-7 h-7 flex items-center justify-center text-sm">
          <BarChart3 size={16} />
        </div>
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-emerald-900">
            50/30/20 in real life
          </h2>
          <p className="text-xs text-emerald-800 leading-snug">
            Start simple: aim for 50% of take-home pay to needs, 30% to
            wants, 20% to savings and debt payoff. It does not have to be
            perfect—this just gives you a target.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="rounded-xl bg-white border border-slate-200 p-4">
            <label className="text-sm text-slate-700">
              <TermTooltipLabel term="50-30-20" label="Monthly income" />
              <input
                type="number"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                placeholder="e.g. 5000"
              />
            </label>
          </div>

          <div className="rounded-xl bg-white border border-slate-200 p-4 space-y-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-slate-700">
                Monthly expenses
              </span>
              <button
                onClick={addExpense}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                + Add expense
              </button>
            </div>
            <div className="space-y-2">
              {expenses.map((e, i) => (
                <div
                  key={i}
                  className="flex gap-2 items-center text-xs md:text-sm"
                >
                  <input
                    className="flex-1 px-2 py-2 border border-slate-300 rounded-lg text-sm"
                    placeholder="Name (rent, groceries, Netflix…)"
                    value={e.name}
                    onChange={(ev) =>
                      updateExpense(i, 'name', ev.target.value)
                    }
                  />
                  <select
                    className="w-28 px-2 py-2 border border-slate-300 rounded-lg text-xs"
                    value={e.category}
                    onChange={(ev) =>
                      updateExpense(i, 'category', ev.target.value)
                    }
                  >
                    <option value="needs">Needs</option>
                    <option value="wants">Wants</option>
                    <option value="savings">Savings</option>
                  </select>
                  <input
                    type="number"
                    className="w-28 px-2 py-2 border border-slate-300 rounded-lg text-sm"
                    placeholder="Amount"
                    value={e.amount}
                    onChange={(ev) =>
                      updateExpense(i, 'amount', ev.target.value)
                    }
                  />
                  {expenses.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExpense(i)}
                      className="text-rose-500 hover:text-rose-700"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <PieChart size={16} /> Monthly overview
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span>Total income</span>
                <span className="font-semibold">
                  {formatCurrency(totalIncome || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total expenses</span>
                <span className="font-semibold">
                  {formatCurrency(totalExpenses || 0)}
                </span>
              </div>
              <div className="border-t border-slate-700 my-2" />
              <div className="flex justify-between items-center">
                <span>Leftover each month</span>
                <span
                  className={`font-semibold ${
                    remaining >= 0
                      ? 'text-emerald-400'
                      : 'text-rose-400'
                  }`}
                >
                  {formatCurrency(remaining || 0)}
                </span>
              </div>
            </div>
          </div>

          {totalIncome > 0 && (
            <div className="rounded-xl bg-white border border-slate-200 p-4 space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <BarChart3 size={16} /> 50/30/20 comparison
              </h3>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChartLike data={chartData} />
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px]">
                <CategoryChip
                  label="Needs"
                  actual={needsPct}
                  ideal={50}
                  color="bg-sky-100 text-sky-800"
                />
                <CategoryChip
                  label="Wants"
                  actual={wantsPct}
                  ideal={30}
                  color="bg-violet-100 text-violet-800"
                />
                <CategoryChip
                  label="Savings"
                  actual={savingsPct}
                  ideal={20}
                  color="bg-emerald-100 text-emerald-800"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Tiny bar-chart-like component using Recharts AreaChart ---------- */
function BarChartLike({ data }) {
  const transformed = data.map((d) => ({
    name: d.name,
    value: d.value,
  }));

  return (
    <AreaChart
      data={transformed}
      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
    >
      <CartesianGrid strokeDasharray="3 3" vertical={false} />
      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
      <YAxis tick={{ fontSize: 10 }} />
      <RechartsTooltip
        formatter={(value) => [`${value}%`, 'Actual % of income']}
      />
      <Area
        type="monotone"
        dataKey="value"
        stroke="#0f766e"
        fill="#0f766e"
        fillOpacity={0.2}
      />
    </AreaChart>
  );
}

function CategoryChip({ label, actual, ideal, color }) {
  const diff = actual - ideal;
  const above = diff > 2;
  const below = diff < -2;

  return (
    <div className={`rounded-lg px-2 py-2 ${color} flex flex-col gap-0.5`}>
      <div className="flex justify-between items-center">
        <span className="font-semibold text-[11px]">{label}</span>
        <span className="text-[11px] font-mono">
          {actual.toFixed(0)}%
        </span>
      </div>
      <div className="text-[10px] opacity-80">
        Ideal: {ideal}%{' '}
        {above && (
          <span className="text-rose-700 font-medium">
            (+{diff.toFixed(0)}%)
          </span>
        )}
        {below && (
          <span className="text-emerald-700 font-medium">
            ({diff.toFixed(0)}%)
          </span>
        )}
      </div>
    </div>
  );
}

/* ---------- Auto loan tab ---------- */
function AutoLoanTab() {
  const [price, setPrice] = useState('');
  const [down, setDown] = useState('');
  const [term, setTerm] = useState('60');
  const [rate, setRate] = useState('6.5');
  const [netIncome, setNetIncome] = useState('');

  const amount = Math.max(
    0,
    parseNumber(price) - parseNumber(down)
  );
  const r = parseNumber(rate) / 100 / 12;
  const n = parseNumber(term);

  const monthlyPayment =
    amount > 0 && r > 0 && n > 0
      ? (amount * r) / (1 - Math.pow(1 + r, -n))
      : 0;

  const totalPaid = monthlyPayment * n;
  const totalInterest = totalPaid - amount;
  const paymentToNet =
    parseNumber(netIncome) > 0
      ? (monthlyPayment / parseNumber(netIncome)) * 100
      : 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Auto Loan</h2>
      <p className="text-sm text-slate-600 max-w-2xl">
        Use this to pressure-test a car payment before you walk into the
        dealership. Focus on affordability vs &quot;how much you&apos;re
        approved for.&quot;
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="rounded-xl bg-white border border-slate-200 p-4">
            <div className="grid gap-3">
              <label className="text-sm text-slate-700">
                Vehicle price
                <input
                  type="number"
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </label>
              <label className="text-sm text-slate-700">
                Down payment
                <input
                  type="number"
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg"
                  value={down}
                  onChange={(e) => setDown(e.target.value)}
                />
              </label>
              <label className="text-sm text-slate-700">
                Interest rate (%)
                <input
                  type="number"
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                />
              </label>
              <label className="text-sm text-slate-700">
                Term (months)
                <input
                  type="number"
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                />
              </label>
              <label className="text-sm text-slate-700">
                Monthly take-home pay (net)
                <input
                  type="number"
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg"
                  value={netIncome}
                  onChange={(e) => setNetIncome(e.target.value)}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl bg-white border border-slate-200 p-4 text-sm space-y-2">
            <h3 className="font-semibold text-slate-900 mb-1">
              Payment summary
            </h3>
            <div className="flex justify-between">
              <span>Loan amount</span>
              <span className="font-semibold">
                {formatCurrency(amount || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Monthly payment</span>
              <span className="font-semibold text-emerald-700">
                {formatCurrency(monthlyPayment || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Total interest</span>
              <span>{formatCurrency(totalInterest || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Months</span>
              <span>{n || 0}</span>
            </div>
            {parseNumber(netIncome) > 0 && (
              <div className="flex justify-between">
                <span>Payment as % of net</span>
                <span
                  className={`font-semibold ${
                    paymentToNet > 15
                      ? 'text-amber-600'
                      : 'text-emerald-700'
                  }`}
                >
                  {paymentToNet.toFixed(1)}%
                </span>
              </div>
            )}
          </div>

          <div className="bg-slate-900 text-slate-100 rounded-xl p-4 text-xs space-y-2">
            <p className="font-semibold flex items-center gap-2">
              <Car size={14} /> Guardrails
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Many people aim for car payments ≤ 10–15% of net take-home
                pay.
              </li>
              <li>
                Total car cost (payment + insurance + gas) ideally fits
                inside your &quot;wants&quot; bucket, not crushing your
                savings.
              </li>
              <li>
                A used car with a solid inspection often beats stretching to
                a brand-new payment.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Mortgage tab ---------- */
function MortgageTab() {
  const [price, setPrice] = useState('');
  const [down, setDown] = useState('');
  const [loanType, setLoanType] = useState('conventional');
  const [termYears, setTermYears] = useState('30');
  const [rate, setRate] = useState('6.75');
  const [state, setState] = useState('TX');
  const [grossMonthly, setGrossMonthly] = useState('');
  const [netMonthly, setNetMonthly] = useState('');

  const homePrice = parseNumber(price);
  const downPayment = down
    ? parseNumber(down)
    : homePrice * 0.2;

  const loanAmount = Math.max(0, homePrice - downPayment);
  const annualRate = parseNumber(rate) / 100;
  const monthlyRate = annualRate / 12;
  const n = parseNumber(termYears) * 12;

  const monthlyPI =
    loanAmount > 0 && monthlyRate > 0 && n > 0
      ? (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -n))
      : 0;

  const territory = stateData[state];
  const taxRate = territory?.propertyTax ?? 1;
  const insuranceAnnual = territory?.insurance ?? 1500;

  const monthlyTax = (homePrice * (taxRate / 100)) / 12;
  const monthlyInsurance = insuranceAnnual / 12;

  let monthlyPMI = 0;
  const ltv = loanAmount > 0 && homePrice > 0 ? loanAmount / homePrice : 0;

  if (loanType === 'conventional' && ltv > 0.8) {
    monthlyPMI = (loanAmount * 0.007) / 12;
  } else if (loanType === 'fha') {
    monthlyPMI = (loanAmount * 0.0085) / 12;
  }

  const totalMonthly = monthlyPI + monthlyTax + monthlyInsurance + monthlyPMI;
  const pctGross =
    parseNumber(grossMonthly) > 0
      ? (totalMonthly / parseNumber(grossMonthly)) * 100
      : 0;
  const pctNet =
    parseNumber(netMonthly) > 0
      ? (totalMonthly / parseNumber(netMonthly)) * 100
      : 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Mortgage</h2>
      <p className="text-sm text-slate-600 max-w-2xl">
        Compare &quot;what the bank will approve&quot; with what actually fits
        your monthly cash flow. Includes principal, interest, taxes,
        insurance, and PMI / MIP estimates.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
            <label className="text-sm text-slate-700">
              Home price
              <input
                type="number"
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </label>
            <label className="text-sm text-slate-700">
              Down payment (or leave blank for 20%)
              <input
                type="number"
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg"
                value={down}
                onChange={(e) => setDown(e.target.value)}
              />
            </label>
            <label className="text-sm text-slate-700 flex flex-col">
              Loan type
              <select
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                value={loanType}
                onChange={(e) => setLoanType(e.target.value)}
              >
                <option value="conventional">Conventional</option>
                <option value="fha">FHA</option>
                <option value="jumbo">Jumbo</option>
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm text-slate-700">
                Term (years)
                <select
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  value={termYears}
                  onChange={(e) => setTermYears(e.target.value)}
                >
                  <option value="10">10</option>
                  <option value="15">15</option>
                  <option value="20">20</option>
                  <option value="30">30</option>
                </select>
              </label>
              <label className="text-sm text-slate-700">
                Rate (%)
                <input
                  type="number"
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                />
              </label>
            </div>
            <label className="text-sm text-slate-700 flex flex-col">
              State / territory
              <select
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                value={state}
                onChange={(e) => setState(e.target.value)}
              >
                {Object.entries(stateData).map(([code, info]) => (
                  <option key={code} value={code}>
                    {info.name} ({code})
                  </option>
                ))}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm text-slate-700">
                Monthly gross income
                <input
                  type="number"
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg"
                  value={grossMonthly}
                  onChange={(e) => setGrossMonthly(e.target.value)}
                />
              </label>
              <label className="text-sm text-slate-700">
                Monthly net (take-home)
                <input
                  type="number"
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg"
                  value={netMonthly}
                  onChange={(e) => setNetMonthly(e.target.value)}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-sm space-y-2">
            <h3 className="font-semibold text-slate-900 mb-1">
              Payment breakdown
            </h3>
            <div className="flex justify-between">
              <span>Loan amount</span>
              <span className="font-semibold">
                {formatCurrency(loanAmount || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Principal &amp; interest</span>
              <span className="font-semibold">
                {formatCurrency(monthlyPI || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Property tax</span>
              <span>{formatCurrency(monthlyTax || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Insurance</span>
              <span>{formatCurrency(monthlyInsurance || 0)}</span>
            </div>
            {monthlyPMI > 0 && (
              <div className="flex justify-between">
                <span>PMI / MIP</span>
                <span>{formatCurrency(monthlyPMI || 0)}</span>
              </div>
            )}
            <div className="border-t border-slate-200 my-2" />
            <div className="flex justify-between items-center">
              <span>Total monthly</span>
              <span className="font-semibold text-emerald-700">
                {formatCurrency(totalMonthly || 0)}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 text-sm space-y-2">
            <h3 className="font-semibold text-slate-900 mb-1 flex items-center gap-1">
              <Info size={14} /> Approval vs affordability
            </h3>
            {parseNumber(grossMonthly) > 0 && (
              <div className="flex justify-between">
                <span>As % of gross (bank view)</span>
                <span
                  className={`font-semibold ${
                    pctGross > 28 ? 'text-amber-600' : 'text-emerald-700'
                  }`}
                >
                  {pctGross.toFixed(1)}%
                </span>
              </div>
            )}
            {parseNumber(netMonthly) > 0 && (
              <div className="flex justify-between">
                <span>As % of net (your reality)</span>
                <span
                  className={`font-semibold ${
                    pctNet > 35 ? 'text-rose-600' : 'text-emerald-700'
                  }`}
                >
                  {pctNet.toFixed(1)}%
                </span>
              </div>
            )}
          </div>

          <div className="bg-slate-900 text-slate-100 rounded-xl p-4 text-xs space-y-2">
            <p className="font-semibold flex items-center gap-2">
              <Home size={14} /> Healthy guardrails
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Lenders often like housing ≤ 28% of gross income. That&apos;s for
                qualification.
              </li>
              <li>
                For affordability, many people aim for ≤ 30–35% of take-home
                pay across housing.
              </li>
              <li>
                A larger down payment reduces PMI and builds equity faster. But
                keep some cash for emergencies.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Debt payoff tab ---------- */
function DebtPayoffTab() {
  const [debts, setDebts] = useState([
    { name: '', balance: '', rate: '', minPayment: '' },
  ]);
  const [extra, setExtra] = useState('');
  const [method, setMethod] = useState('avalanche');

  const addDebt = () =>
    setDebts((prev) => [
      ...prev,
      { name: '', balance: '', rate: '', minPayment: '' },
    ]);

  const removeDebt = (i) =>
    setDebts((prev) => prev.filter((_, idx) => idx !== i));

  const updateDebt = (i, field, value) =>
    setDebts((prev) =>
      prev.map((d, idx) =>
        idx === i ? { ...d, [field]: value } : d
      )
    );

  const validDebts = debts.filter(
    (d) => parseNumber(d.balance) > 0 && parseNumber(d.rate) > 0
  );

  const totalDebt = validDebts.reduce(
    (sum, d) => sum + parseNumber(d.balance),
    0
  );
  const minPayments = validDebts.reduce(
    (sum, d) => sum + parseNumber(d.minPayment),
    0
  );
  const totalPayment = minPayments + parseNumber(extra);

  let months = 0;
  let avgRate = 0;
  let totalInterest = 0;

  if (validDebts.length > 0 && totalPayment > 0) {
    avgRate =
      validDebts.reduce(
        (sum, d) =>
          sum + parseNumber(d.balance) * parseNumber(d.rate),
        0
      ) / totalDebt;
    const monthlyRate = avgRate / 100 / 12;
    months =
      monthlyRate > 0
        ? Math.log(
            totalPayment /
              (totalPayment - totalDebt * monthlyRate)
          ) / Math.log(1 + monthlyRate)
        : totalDebt / totalPayment;
    totalInterest = totalPayment * months - totalDebt;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Debt Payoff</h2>
      <p className="text-sm text-slate-600 max-w-2xl">
        List your debts, pick a strategy, and see roughly how long it might
        take to be debt-free. This is an approximation—real life will move
        around—but it gives you a starting point.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
            <div className="flex justify-between items-center">
              <TermTooltipLabel
                term="avalanche"
                label="Debts (credit cards, personal loans, etc.)"
              />
              <button
                type="button"
                onClick={addDebt}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                + Add debt
              </button>
            </div>
            <div className="space-y-2 text-xs md:text-sm">
              {debts.map((d, i) => (
                <div
                  key={i}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.5fr,1fr,1fr,1fr,auto] gap-3 items-center"
                >
                  <input
                    className="w-full px-2 py-2 border border-slate-300 rounded-lg"
                    placeholder="Name (Visa, Car loan…)"
                    value={d.name}
                    onChange={(e) =>
                      updateDebt(i, 'name', e.target.value)
                    }
                  />

                  <input
                    type="number"
                    className="w-full px-2 py-2 border border-slate-300 rounded-lg"
                    placeholder="Balance"
                    value={d.balance}
                    onChange={(e) =>
                      updateDebt(i, 'balance', e.target.value)
                    }
                  />

                  <input
                    type="number"
                    className="w-full px-2 py-2 border border-slate-300 rounded-lg"
                    placeholder="Rate %"
                    value={d.rate}
                    onChange={(e) =>
                      updateDebt(i, 'rate', e.target.value)
                    }
                  />

                  <input
                    type="number"
                    className="w-full px-2 py-2 border border-slate-300 rounded-lg"
                    placeholder="Min pay"
                    value={d.minPayment}
                    onChange={(e) =>
                      updateDebt(i, 'minPayment', e.target.value)
                    }
                  />

                  {debts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDebt(i)}
                      className="text-slate-400 hover:text-red-500 justify-self-end"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 mt-3">
              <label className="text-xs md:text-sm text-slate-700">
                Extra payment toward debt each month
                <input
                  type="number"
                  className="mt-1 w-full px-2 py-2 border border-slate-300 rounded-lg"
                  value={extra}
                  onChange={(e) => setExtra(e.target.value)}
                />
              </label>
              <label className="text-xs md:text-sm text-slate-700">
                Strategy
                <select
                  className="mt-1 w-full px-2 py-2 border border-slate-300 rounded-lg text-sm"
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                >
                  <option value="avalanche">
                    Avalanche (highest rate)
                  </option>
                  <option value="snowball">
                    Snowball (smallest balance)
                  </option>
                </select>
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-sm space-y-2">
            <h3 className="font-semibold text-slate-900 mb-1">
              Payoff summary (approximate)
            </h3>
            <div className="flex justify-between">
              <span>Total debt</span>
              <span className="font-semibold">
                {formatCurrency(totalDebt)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Weighted avg rate</span>
              <span className="font-semibold">
                {avgRate.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Required minimum payments</span>
              <span>{formatCurrency(minPayments)}</span>
            </div>
            <div className="flex justify-between">
              <span>Total monthly with extra</span>
              <span className="font-semibold text-emerald-700">
                {formatCurrency(totalPayment)}
              </span>
            </div>
            {months > 0 && (
              <>
                <div className="border-t border-slate-200 my-2" />
                <div className="flex justify-between items-center">
                  <span>Est. months to debt-free</span>
                  <span className="font-semibold text-slate-900 flex items-center gap-1">
                    <Clock size={14} />
                    {Math.ceil(months)} months
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Approx. total interest</span>
                  <span>{formatCurrency(totalInterest)}</span>
                </div>
              </>
            )}
          </div>

          <div className="bg-slate-900 text-slate-100 rounded-xl p-4 text-xs space-y-2">
            <p className="font-semibold flex items-center gap-2">
              <Shield size={14} /> Strategy tips
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Avalanche: pay extra toward the highest interest rate. Best
                for minimizing interest paid.
              </li>
              <li>
                Snowball: pay extra toward the smallest balance. Best when you
                need quick wins and motivation.
              </li>
              <li>
                Protect your basics first: housing, food, utilities, minimum
                payments, then extra debt payoff.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Savings & investing tab ---------- */
function SavingsTab() {
  const [initial, setInitial] = useState('');
  const [monthly, setMonthly] = useState('');
  const [years, setYears] = useState('10');
  const [returnRate, setReturnRate] = useState('7');

  const principal = parseNumber(initial);
  const contrib = parseNumber(monthly);
  const nYears = parseNumber(years);
  const r = parseNumber(returnRate) / 100;

  let totalFuture = 0;
  let totalContrib = principal + contrib * 12 * nYears;
  const data = [];

  for (let year = 0; year <= nYears; year++) {
    const t = year;
    const futurePrincipal = principal * Math.pow(1 + r, t);
    let futureContrib = 0;
    if (contrib > 0) {
      const monthlyRate = r / 12;
      const m = year * 12;
      futureContrib =
        contrib *
        ((Math.pow(1 + monthlyRate, m) - 1) / monthlyRate);
    }
    const balance = futurePrincipal + futureContrib;
    if (year === nYears) {
      totalFuture = balance;
    }
    data.push({
      year,
      balance,
      contributions: principal + contrib * 12 * year,
    });
  }

  const interestEarned = totalFuture - totalContrib;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">
        Savings &amp; Investing
      </h2>
      <p className="text-sm text-slate-600 max-w-2xl">
        See how your money grows over time with consistent contributions and a
        reasonable long-term return assumption.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
            <label className="text-sm text-slate-700">
              Starting amount
              <input
                type="number"
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg"
                value={initial}
                onChange={(e) => setInitial(e.target.value)}
              />
            </label>
            <label className="text-sm text-slate-700">
              Monthly contribution
              <input
                type="number"
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg"
                value={monthly}
                onChange={(e) => setMonthly(e.target.value)}
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm text-slate-700">
                Years
                <input
                  type="number"
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg"
                  value={years}
                  onChange={(e) => setYears(e.target.value)}
                />
              </label>
              <label className="text-sm text-slate-700">
                Annual return (%)
                <input
                  type="number"
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg"
                  value={returnRate}
                  onChange={(e) => setReturnRate(e.target.value)}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-sm space-y-2">
            <h3 className="font-semibold text-slate-900 mb-1">
              Projection
            </h3>
            <div className="flex justify-between">
              <span>Total contributions</span>
              <span className="font-semibold">
                {formatCurrency(totalContrib || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Projected future value</span>
              <span className="font-semibold text-emerald-700">
                {formatCurrency(totalFuture || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Estimated growth (interest)</span>
              <span>{formatCurrency(interestEarned || 0)}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="year"
                    tick={{ fontSize: 10 }}
                    tickFormatter={(v) => `${v}y`}
                  />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    tickFormatter={(v) =>
                      v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
                    }
                  />
                  <RechartsTooltip
                    formatter={(value, key) => [
                      formatCurrency(value),
                      key === 'balance'
                        ? 'Projected balance'
                        : 'Contributions',
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="contributions"
                    name="Contributions"
                    stroke="#94a3b8"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="balance"
                    name="Projected balance"
                    stroke="#0f766e"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              Real returns vary year to year. This assumes a steady average
              return, just to show the power of consistency + time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Financial Health Score tab (300–850) ---------- */
function FinancialHealthTab() {
  const [netIncome, setNetIncome] = useState('');
  const [essentials, setEssentials] = useState('');
  const [debtPayments, setDebtPayments] = useState('');
  const [monthlySaving, setMonthlySaving] = useState('');
  const [emergencyFund, setEmergencyFund] = useState('');
  const [creditUtil, setCreditUtil] = useState('');

  const net = parseNumber(netIncome);
  const essentialsVal = parseNumber(essentials);
  const debtVal = parseNumber(debtPayments);
  const savingVal = parseNumber(monthlySaving);
  const efMonths = parseNumber(emergencyFund);
  const utilPct = parseNumber(creditUtil);

  const ratio = (num) => (net > 0 ? num / net : 0);

  const essentialsRatio = ratio(essentialsVal);
  const debtRatio = ratio(debtVal);
  const savingsRatio = ratio(savingVal);

  // Normalize each factor to 0–1
  const clamp01 = (x) => Math.max(0, Math.min(1, x));

  // 1) Essentials as % of net (lower is better, sweet spot <= 0.5)
  let essentialsScore = 0;
  if (essentialsRatio <= 0.5) {
    essentialsScore = 1;
  } else if (essentialsRatio <= 0.7) {
    // Linearly down from 1 to 0.4 between 50–70%
    essentialsScore =
      1 - ((essentialsRatio - 0.5) / 0.2) * (1 - 0.4);
  } else if (essentialsRatio <= 0.9) {
    // 70–90% → 0.4 down to 0.1
    essentialsScore =
      0.4 - ((essentialsRatio - 0.7) / 0.2) * (0.3);
  } else {
    essentialsScore = 0.05;
  }
  essentialsScore = clamp01(essentialsScore);

  // 2) Debt payments as % of net (lower is better, <=10% great, >40% rough)
  let debtScore = 0;
  if (debtRatio <= 0.1) {
    debtScore = 1;
  } else if (debtRatio <= 0.25) {
    debtScore = 1 - ((debtRatio - 0.1) / 0.15) * 0.4; // to 0.6
  } else if (debtRatio <= 0.4) {
    debtScore = 0.6 - ((debtRatio - 0.25) / 0.15) * 0.4; // to 0.2
  } else {
    debtScore = 0.05;
  }
  debtScore = clamp01(debtScore);

  // 3) Savings rate as % of net (higher is better, >=20% great)
  let saveScore = 0;
  if (savingsRatio >= 0.2) {
    saveScore = 1;
  } else if (savingsRatio >= 0.1) {
    // 10–20% → 0.6–1
    saveScore = 0.6 + ((savingsRatio - 0.1) / 0.1) * 0.4;
  } else if (savingsRatio >= 0.02) {
    // 2–10% → 0.2–0.6
    saveScore = 0.2 + ((savingsRatio - 0.02) / 0.08) * 0.4;
  } else {
    saveScore = 0.05;
  }
  saveScore = clamp01(saveScore);

  // 4) Emergency fund in months of expenses (>=3 good, >=6 excellent)
  let efScore = 0;
  if (efMonths >= 6) {
    efScore = 1;
  } else if (efMonths >= 3) {
    efScore = 0.7 + ((efMonths - 3) / 3) * 0.3; // 0.7–1
  } else if (efMonths >= 1) {
    efScore = 0.3 + ((efMonths - 1) / 2) * 0.4; // 0.3–0.7
  } else if (efMonths > 0) {
    efScore = 0.15;
  } else {
    efScore = 0.05;
  }
  efScore = clamp01(efScore);

  // 5) Credit utilization (lower is better, <=30% great)
  let utilScore = 0;
  if (utilPct <= 10) {
    utilScore = 1;
  } else if (utilPct <= 30) {
    utilScore = 1 - ((utilPct - 10) / 20) * 0.2; // 0.8–1
  } else if (utilPct <= 60) {
    utilScore = 0.4 + ((60 - utilPct) / 30) * 0.3; // 0.4–0.7
  } else if (utilPct <= 90) {
    utilScore = 0.15 + ((90 - utilPct) / 30) * 0.25; // 0.15–0.4
  } else {
    utilScore = 0.05;
  }
  utilScore = clamp01(utilScore);

  // Weighted blend to one normalized score
  const hasInputs =
    net > 0 &&
    (essentialsVal > 0 ||
      debtVal > 0 ||
      savingVal > 0 ||
      efMonths > 0 ||
      utilPct > 0);

  const normalized =
    hasInputs
      ? clamp01(
          essentialsScore * 0.25 +
            debtScore * 0.2 +
            saveScore * 0.2 +
            efScore * 0.2 +
            utilScore * 0.15
        )
      : 0;

  // Map 0–1 to 300–850 range
  const score = hasInputs
    ? Math.round(300 + normalized * 550)
    : null;

  let label = '—';
  let labelColor = 'text-slate-700';
  let chipColor = 'bg-slate-100 text-slate-700';

  if (score !== null) {
    if (score < 500) {
      label = 'Needs attention';
      labelColor = 'text-rose-600';
      chipColor = 'bg-rose-50 text-rose-700';
    } else if (score < 650) {
      label = 'Rebuilding';
      labelColor = 'text-amber-600';
      chipColor = 'bg-amber-50 text-amber-700';
    } else if (score < 740) {
      label = 'Strong';
      labelColor = 'text-emerald-600';
      chipColor = 'bg-emerald-50 text-emerald-700';
    } else {
      label = 'Excellent';
      labelColor = 'text-emerald-700';
      chipColor = 'bg-emerald-100 text-emerald-800';
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">
        Financial Health Score
      </h2>
      <p className="text-sm text-slate-600 max-w-2xl">
        A quick, credit-style snapshot (300–850) based on your cash flow,
        savings habits, debt load, and emergency cushion. Use rough numbers.
        This is not a credit score and not shared with anyone.
      </p>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        {/* Inputs */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">
              Monthly picture
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              <label className="text-sm text-slate-700">
                Monthly take-home pay (net)
                <input
                  type="number"
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg"
                  value={netIncome}
                  onChange={(e) => setNetIncome(e.target.value)}
                  placeholder="What hits your bank after taxes"
                />
              </label>
              <label className="text-sm text-slate-700">
                Essentials each month
                <input
                  type="number"
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg"
                  value={essentials}
                  onChange={(e) => setEssentials(e.target.value)}
                  placeholder="Rent, food, utilities, basics"
                />
              </label>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <label className="text-sm text-slate-700">
                Min. debt payments each month
                <input
                  type="number"
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg"
                  value={debtPayments}
                  onChange={(e) => setDebtPayments(e.target.value)}
                  placeholder="Cards, loans, car, etc."
                />
              </label>
              <label className="text-sm text-slate-700">
                Amount you save / invest each month
                <input
                  type="number"
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg"
                  value={monthlySaving}
                  onChange={(e) => setMonthlySaving(e.target.value)}
                  placeholder="401(k), IRA, brokerage, cash"
                />
              </label>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">
              Safety net &amp; credit habits
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              <label className="text-sm text-slate-700">
                Emergency fund (months of expenses)
                <input
                  type="number"
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg"
                  value={emergencyFund}
                  onChange={(e) => setEmergencyFund(e.target.value)}
                  placeholder="e.g. 0, 1, 3, 6"
                />
              </label>
              <label className="text-sm text-slate-700">
                Credit utilization (% of limits used)
                <input
                  type="number"
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg"
                  value={creditUtil}
                  onChange={(e) => setCreditUtil(e.target.value)}
                  placeholder="Best guess is fine"
                />
              </label>
            </div>
            <p className="text-[11px] text-slate-500">
              If you already used the other tabs, you can reuse numbers:
              budget for &quot;essentials&quot; and savings, debt payoff for
              minimums, etc.
            </p>
          </div>
        </div>

        {/* Score + insights */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
                  MoneyMap health score
                </p>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-semibold font-mono">
                    {score ?? '—'}
                  </span>
                  <span className={`text-sm font-medium ${labelColor}`}>
                    {label}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-300 max-w-xs">
                  300–850 scale inspired by credit scores, but based only on
                  the numbers you enter here. No banks, no bureaus, no hard
                  pulls.
                </p>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-[11px] font-medium flex items-center gap-1 ${chipColor}`}
              >
                <Activity size={12} />
                {score ? 'Snapshot today' : 'Enter numbers to see score'}
              </div>
            </div>

            {score && (
              <div className="mt-4 grid grid-cols-3 gap-3 text-[11px]">
                <ScorePill
                  label="Essentials load"
                  value={
                    essentialsRatio > 0
                      ? formatPercent(essentialsRatio, 0)
                      : '—'
                  }
                  good={essentialsRatio <= 0.5}
                />
                <ScorePill
                  label="Debt load"
                  value={
                    debtRatio > 0
                      ? formatPercent(debtRatio, 0)
                      : '—'
                  }
                  good={debtRatio <= 0.15}
                />
                <ScorePill
                  label="Savings rate"
                  value={
                    savingsRatio > 0
                      ? formatPercent(savingsRatio, 0)
                      : '—'
                  }
                  good={savingsRatio >= 0.2}
                />
                <ScorePill
                  label="Emergency fund"
                  value={efMonths ? `${efMonths.toFixed(1)} mo` : '—'}
                  good={efMonths >= 3}
                />
                <ScorePill
                  label="Credit utilization"
                  value={utilPct ? `${utilPct.toFixed(0)}%` : '—'}
                  good={utilPct <= 30}
                />
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 text-xs text-slate-700 space-y-2">
            <p className="font-semibold flex items-center gap-2 text-slate-900">
              <Info size={14} /> How to use this score
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Treat it as a dashboard, not a judgment. The goal is to move
                one metric at a time in the right direction.
              </li>
              <li>
                Focus first on <span className="font-semibold">
                  essentials
                </span>{' '}
                + <span className="font-semibold">debt load</span>. Getting
                those under control makes everything else easier.
              </li>
              <li>
                A big jump usually comes from building a small emergency fund
                and raising your savings rate a few percentage points.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScorePill({ label, value, good }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-slate-900/40 px-2 py-1.5">
      <span className="text-slate-300">{label}</span>
      <span
        className={`flex items-center gap-1 font-mono ${
          good ? 'text-emerald-300' : 'text-amber-300'
        }`}
      >
        {value}
        {good ? (
          <ArrowUpRight size={10} />
        ) : (
          <ArrowDownRight size={10} />
        )}
      </span>
    </div>
  );
}

/* ---------- Main app ---------- */
const MoneyMapLogo = ({ size = 32 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient
        id="mmGradient"
        x1="4"
        y1="28"
        x2="28"
        y2="4"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#0A6375" />
        <stop offset="0.5" stopColor="#0C3C75" />
        <stop offset="1" stopColor="#19A39D" />
      </linearGradient>
    </defs>

    {/* Rounded square background stroke */}
    <rect
      x="3"
      y="3"
      width="26"
      height="26"
      rx="8"
      stroke="#0A1A2F"
      strokeWidth="1.4"
      fill="none"
    />

    {/* Lower momentum arc (path / journey) */}
    <path
      d="M6 22C9.2 19 11.5 17.5 13.8 16.6C16.1 15.8 18.2 15.8 20.2 16.3C22.2 16.8 24 17.8 26 19.5"
      stroke="url(#mmGradient)"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Upper momentum arc (growth / analytics) */}
    <path
      d="M8 18.5C10.3 16 12.4 14.7 14.4 14.0C16.4 13.3 18.3 13.2 20.1 13.6C21.9 14.0 23.5 14.9 25 16.3"
      stroke="url(#mmGradient)"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* End-point node (target / goal) */}
    <circle
      cx="25.2"
      cy="16.3"
      r="1.4"
      fill="#19A39D"
    />
  </svg>
);

const FinancialCalculatorApp = () => {
  const [activeTab, setActiveTab] = useState('budget');
  const [showPrivacy, setShowPrivacy] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              {/* Left side: brand */}
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-sm">
                  <MoneyMapLogo size={28} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-[#0A6375] via-[#0C3C75] to-[#19A39D] bg-clip-text text-transparent">
                    MoneyMap
                  </h1>
                  <p className="text-xs text-slate-600">
                    Chart your financial future—quietly, on your own terms.
                  </p>
                </div>
              </div>
              {/* Right side: privacy */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowPrivacy(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium hover:bg-emerald-100 border border-emerald-100"
                >
                  <Shield size={14} />
                  <span>How your data is handled</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Privacy modal */}
        {showPrivacy && (
          <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50">
            <div className="bg-white max-w-lg w-full mx-4 rounded-2xl shadow-xl p-5 relative">
              <button
                className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
                onClick={() => setShowPrivacy(false)}
              >
                <X size={18} />
              </button>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                Privacy first
              </h2>
              <p className="text-sm text-slate-700 mb-3">
                Nothing you type here is sent to a server for calculations. The
                math runs in your browser. You can close the tab and it&apos;s
                gone.
              </p>
              <ul className="text-xs text-slate-600 list-disc list-inside space-y-1">
                <li>No account required.</li>
                <li>No credit pulls, no bank connections.</li>
                <li>You&apos;re just running numbers quietly for yourself.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Tab navigation */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex gap-2 overflow-x-auto py-3">
              <TabButton
                icon={DollarSign}
                label="Budget"
                active={activeTab === 'budget'}
                onClick={() => setActiveTab('budget')}
              />
              <TabButton
                icon={Car}
                label="Auto loan"
                active={activeTab === 'auto'}
                onClick={() => setActiveTab('auto')}
              />
              <TabButton
                icon={Home}
                label="Mortgage"
                active={activeTab === 'mortgage'}
                onClick={() => setActiveTab('mortgage')}
              />
              <TabButton
                icon={Shield}
                label="Debt payoff"
                active={activeTab === 'debt'}
                onClick={() => setActiveTab('debt')}
              />
              <TabButton
                icon={PiggyBankIcon}
                label="Savings"
                active={activeTab === 'savings'}
                onClick={() => setActiveTab('savings')}
              />
              <TabButton
                icon={Activity}
                label="Health score"
                active={activeTab === 'health'}
                onClick={() => setActiveTab('health')}
              />
              <TabButton
                icon={TrendingUp}
                label="Real estate ROI"
                active={activeTab === 'roi'}
                onClick={() => setActiveTab('roi')}
              />
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          {activeTab === 'budget' && <BudgetTab />}
          {activeTab === 'auto' && <AutoLoanTab />}
          {activeTab === 'mortgage' && <MortgageTab />}
          {activeTab === 'debt' && <DebtPayoffTab />}
          {activeTab === 'savings' && <SavingsTab />}
          {activeTab === 'health' && <FinancialHealthTab />}
          {activeTab === 'roi' && <RealEstateRoiCalculator />}
        </main>
      </div>
    </div>
  );
}

/* Small icon wrapper for savings tab label */
function PiggyBankIcon(props) {
  return <Calculator {...props} />;
}

/* Tab button component */
function TabButton({ icon: Icon, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
        active
          ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-md scale-[1.02]'
          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
      }`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );
}

export default FinancialCalculatorApp;
