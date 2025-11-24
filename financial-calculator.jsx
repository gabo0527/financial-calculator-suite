import React, { useState } from 'react';
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
  }).format(n ?? 0);

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
        className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full border border-emerald-400 text-emerald-300 text-[10px] hover:bg-emerald-500/10"
        onClick={() => setOpen((v) => !v)}
      >
        ?
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-72 rounded-md border border-slate-700 bg-slate-900 shadow-xl p-3 text-xs text-slate-100">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="font-semibold">{tip.title}</div>
            <button
              type="button"
              className="text-slate-400 hover:text-slate-200"
              onClick={() => setOpen(false)}
            >
              <X size={12} />
            </button>
          </div>
          <p className="leading-snug text-slate-300">{tip.text}</p>
        </div>
      )}
    </span>
  );
}

/* =======================================================
   REAL ESTATE ROI / CAP RATE / CASH-ON-CASH CALCULATOR
   (Year 1 metrics – same logic you had working)
   ======================================================= */

const roiCurrency = (n) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
const roiPercent = (n) => `${(n * 100).toFixed(1)}%`;

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

  let results = null;

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
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-50">
          Real Estate ROI
        </h2>
        <p className="text-sm text-slate-400 max-w-2xl mt-1">
          Estimate cap rate, cash-on-cash return, and DSCR to understand if a
          rental or commercial property fits your risk and cash flow comfort.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        {/* Inputs */}
        <div className="space-y-5">
          <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5">
            <h3 className="text-sm font-semibold text-slate-100 mb-3">
              Property & one-time costs
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

          <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5">
            <h3 className="text-sm font-semibold text-slate-100 mb-3">
              Income & vacancy
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

          <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5">
            <h3 className="text-sm font-semibold text-slate-100 mb-3">
              Operating expenses & financing
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
        <div className="space-y-5">
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5">
            <h3 className="text-sm font-semibold text-slate-100 mb-3">
              Key metrics (year 1)
            </h3>

            {!results ? (
              <p className="text-sm text-slate-400">
                Enter property values to see cap rate, cash-on-cash, DSCR, and
                cash flow.
              </p>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <RoiMetricTile
                    label="Cap rate"
                    value={roiPercent(results.capRate)}
                  />
                  <RoiMetricTile
                    label="Cash-on-cash"
                    value={roiPercent(results.cashOnCash)}
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
                    label="Annual cash flow"
                    value={roiCurrency(results.annualCashFlow)}
                    emphasize={results.annualCashFlow < 0 ? 'bad' : 'good'}
                  />
                </div>

                <hr className="my-4 border-slate-800" />

                <dl className="space-y-1 text-sm text-slate-300">
                  <RoiRow label="NOI" value={roiCurrency(results.noi)} />
                  <RoiRow
                    label="Annual debt service"
                    value={roiCurrency(results.annualDebtService)}
                  />
                  <RoiRow
                    label="Total cash invested"
                    value={roiCurrency(results.totalCashInvested)}
                  />
                  <RoiRow
                    label="Loan amount"
                    value={roiCurrency(results.loanAmount)}
                  />
                </dl>
              </>
            )}
          </div>

          <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4 text-xs text-slate-200">
            <p className="font-semibold mb-2">How to read this</p>
            <ul className="space-y-1 list-disc list-inside text-slate-300">
              <li>
                <span className="font-semibold">Cap rate</span> is the
                property&apos;s return if you paid all cash.
              </li>
              <li>
                <span className="font-semibold">Cash-on-cash</span> is return on
                your actual cash invested (down payment + closing + rehab).
              </li>
              <li>
                <span className="font-semibold">DSCR</span> compares NOI to loan
                payments. Many lenders like DSCR ≥ 1.20.
              </li>
              <li>
                <span className="font-semibold">Annual cash flow</span> is
                what&apos;s left after expenses and loan payments, before taxes
                and reserves.
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
    <label className="flex flex-col gap-1 text-sm text-slate-200">
      <span>{label}</span>
      <div className="flex items-center rounded-xl border border-slate-700 bg-slate-900 px-3 py-2">
        {prefix && (
          <span className="mr-1 text-slate-500 text-xs">{prefix}</span>
        )}
        <input
          className="w-full bg-transparent text-sm text-slate-100 outline-none"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          inputMode="decimal"
        />
        {suffix && (
          <span className="ml-1 text-slate-500 text-xs">{suffix}</span>
        )}
      </div>
    </label>
  );
}

function RoiMetricTile({ label, value, emphasize }) {
  let color = 'text-slate-100';
  if (emphasize === 'good') color = 'text-emerald-400';
  if (emphasize === 'bad') color = 'text-rose-400';
  if (emphasize === 'warn') color = 'text-amber-300';

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3">
      <div className="text-[11px] uppercase tracking-wide text-slate-400 mb-1">
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
      <dt className="text-slate-300">{label}</dt>
      <dd className="font-mono text-slate-100">{value}</dd>
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

  const chartData = [
    { name: 'Needs', value: Math.round(needsPct) },
    { name: 'Wants', value: Math.round(wantsPct) },
    { name: 'Savings', value: Math.round(savingsPct) },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 flex gap-3 items-start">
        <div className="mt-1 rounded-full bg-emerald-500 text-slate-950 w-7 h-7 flex items-center justify-center text-sm">
          <BarChart3 size={16} />
        </div>
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-emerald-100">
            50/30/20 in real life
          </h2>
          <p className="text-xs text-emerald-50/80 leading-snug">
            Start simple: aim for 50% of take-home pay to needs, 30% to
            wants, 20% to savings and debt payoff. It does not have to be
            perfect—this just gives you a target.
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4">
            <label className="text-sm text-slate-200">
              <TermTooltipLabel term="50-30-20" label="Monthly income" />
              <input
                type="number"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                className="mt-2 w-full px-3 py-2 border border-slate-700 rounded-lg text-sm bg-slate-950 text-slate-100"
                placeholder="e.g. 5000"
              />
            </label>
          </div>

          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 space-y-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-slate-100">
                Monthly expenses
              </span>
              <button
                onClick={addExpense}
                className="text-xs text-emerald-300 hover:text-emerald-100 font-medium"
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
                    className="flex-1 px-2 py-2 border border-slate-700 rounded-lg text-sm bg-slate-950 text-slate-100"
                    placeholder="Name (rent, groceries, Netflix…)"
                    value={e.name}
                    onChange={(ev) =>
                      updateExpense(i, 'name', ev.target.value)
                    }
                  />
                  <select
                    className="w-28 px-2 py-2 border border-slate-700 rounded-lg text-xs bg-slate-950 text-slate-100"
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
                    className="w-28 px-2 py-2 border border-slate-700 rounded-lg text-sm bg-slate-950 text-slate-100"
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
                      className="text-slate-500 hover:text-rose-400"
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
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4">
            <h3 className="text-sm font-semibold text-slate-100 mb-3 flex items-center gap-2">
              <PieChart size={16} /> Monthly overview
            </h3>
            <div className="space-y-2 text-xs text-slate-200">
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
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 space-y-4">
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
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
                  color="bg-sky-500/10 text-sky-100"
                />
                <CategoryChip
                  label="Wants"
                  actual={wantsPct}
                  ideal={30}
                  color="bg-violet-500/10 text-violet-100"
                />
                <CategoryChip
                  label="Savings"
                  actual={savingsPct}
                  ideal={20}
                  color="bg-emerald-500/10 text-emerald-100"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Tiny bar-chart-like component using AreaChart ---------- */
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
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
      <XAxis
        dataKey="name"
        tick={{ fontSize: 10, fill: '#9ca3af' }}
        axisLine={{ stroke: '#1f2937' }}
      />
      <YAxis
        tick={{ fontSize: 10, fill: '#9ca3af' }}
        axisLine={{ stroke: '#1f2937' }}
      />
      <RechartsTooltip
        contentStyle={{
          backgroundColor: '#020617',
          borderColor: '#1f2937',
          fontSize: 11,
        }}
        formatter={(value) => [`${value}%`, 'Actual % of income']}
      />
      <Area
        type="monotone"
        dataKey="value"
        stroke="#22c55e"
        fill="#22c55e"
        fillOpacity={0.25}
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
      <div className="text-[10px] opacity-90">
        Ideal: {ideal}%{' '}
        {above && (
          <span className="text-rose-300 font-medium">
            (+{diff.toFixed(0)}%)
          </span>
        )}
        {below && (
          <span className="text-emerald-300 font-medium">
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
      <div>
        <h2 className="text-xl font-semibold text-slate-50">Auto loan</h2>
        <p className="text-sm text-slate-400 max-w-2xl mt-1">
          Use this to pressure-test a car payment before you walk into the
          dealership. Focus on affordability vs &quot;how much you&apos;re
          approved for.&quot;
        </p>
      </div>

      <div className="grid xl:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4">
            <div className="grid gap-3">
              <LabeledNumberInput
                label="Vehicle price"
                value={price}
                onChange={setPrice}
              />
              <LabeledNumberInput
                label="Down payment"
                value={down}
                onChange={setDown}
              />
              <LabeledNumberInput
                label="Interest rate (%)"
                value={rate}
                onChange={setRate}
              />
              <LabeledNumberInput
                label="Term (months)"
                value={term}
                onChange={setTerm}
              />
              <LabeledNumberInput
                label="Monthly take-home pay (net)"
                value={netIncome}
                onChange={setNetIncome}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 text-sm space-y-2">
            <h3 className="font-semibold text-slate-100 mb-1">
              Payment summary
            </h3>
            <Row label="Loan amount" value={formatCurrency(amount || 0)} />
            <Row
              label="Monthly payment"
              value={formatCurrency(monthlyPayment || 0)}
              valueClass="text-emerald-400"
            />
            <Row
              label="Total interest"
              value={formatCurrency(totalInterest || 0)}
            />
            <Row label="Months" value={n || 0} />
            {parseNumber(netIncome) > 0 && (
              <Row
                label="Payment as % of net"
                value={`${paymentToNet.toFixed(1)}%`}
                valueClass={
                  paymentToNet > 15 ? 'text-amber-300' : 'text-emerald-400'
                }
              />
            )}
          </div>

          <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4 text-xs space-y-2 text-slate-200">
            <p className="font-semibold flex items-center gap-2">
              <Car size={14} /> Guardrails
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              <li>
                Many people aim for car payments ≤ 10–15% of net take-home pay.
              </li>
              <li>
                Total car cost (payment + insurance + gas) ideally fits inside
                your &quot;wants&quot; bucket.
              </li>
              <li>
                A solid used car with a lower payment often beats stretching for
                a brand-new one.
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
  const downPayment = down ? parseNumber(down) : homePrice * 0.2;

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
      <div>
        <h2 className="text-xl font-semibold text-slate-50">Mortgage</h2>
        <p className="text-sm text-slate-400 max-w-2xl mt-1">
          Compare &quot;what the bank will approve&quot; with what actually
          fits your monthly cash flow. Includes principal, interest, taxes,
          insurance, and PMI / MIP estimates.
        </p>
      </div>

      <div className="grid xl:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-4 space-y-3">
            <LabeledNumberInput
              label="Home price"
              value={price}
              onChange={setPrice}
            />
            <LabeledNumberInput
              label="Down payment (or leave blank for 20%)"
              value={down}
              onChange={setDown}
            />
            <label className="text-sm text-slate-200 flex flex-col gap-1">
              Loan type
              <select
                className="w-full px-3 py-2 border border-slate-700 rounded-lg text-sm bg-slate-950 text-slate-100"
                value={loanType}
                onChange={(e) => setLoanType(e.target.value)}
              >
                <option value="conventional">Conventional</option>
                <option value="fha">FHA</option>
                <option value="jumbo">Jumbo</option>
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm text-slate-200 flex flex-col gap-1">
                Term (years)
                <select
                  className="w-full px-3 py-2 border border-slate-700 rounded-lg text-sm bg-slate-950 text-slate-100"
                  value={termYears}
                  onChange={(e) => setTermYears(e.target.value)}
                >
                  <option value="10">10</option>
                  <option value="15">15</option>
                  <option value="20">20</option>
                  <option value="30">30</option>
                </select>
              </label>
              <LabeledNumberInput
                label="Rate (%)"
                value={rate}
                onChange={setRate}
              />
            </div>
            <label className="text-sm text-slate-200 flex flex-col gap-1">
              State / territory
              <select
                className="w-full px-3 py-2 border border-slate-700 rounded-lg text-sm bg-slate-950 text-slate-100"
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
              <LabeledNumberInput
                label="Monthly gross income"
                value={grossMonthly}
                onChange={setGrossMonthly}
              />
              <LabeledNumberInput
                label="Monthly net (take-home)"
                value={netMonthly}
                onChange={setNetMonthly}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 text-sm space-y-2">
            <h3 className="font-semibold text-slate-100 mb-1">
              Payment breakdown
            </h3>
            <Row
              label="Loan amount"
              value={formatCurrency(loanAmount || 0)}
            />
            <Row
              label="Principal & interest"
              value={formatCurrency(monthlyPI || 0)}
            />
            <Row
              label="Property tax"
              value={formatCurrency(monthlyTax || 0)}
            />
            <Row
              label="Insurance"
              value={formatCurrency(monthlyInsurance || 0)}
            />
            {monthlyPMI > 0 && (
              <Row
                label="PMI / MIP"
                value={formatCurrency(monthlyPMI || 0)}
              />
            )}
            <div className="border-t border-slate-800 my-2" />
            <Row
              label="Total monthly"
              value={formatCurrency(totalMonthly || 0)}
              valueClass="text-emerald-400"
            />
          </div>

          <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-4 text-sm space-y-2">
            <h3 className="font-semibold text-slate-100 mb-1 flex items-center gap-1">
              <Info size={14} /> Approval vs affordability
            </h3>
            {parseNumber(grossMonthly) > 0 && (
              <Row
                label="As % of gross (bank view)"
                value={`${pctGross.toFixed(1)}%`}
                valueClass={
                  pctGross > 28 ? 'text-amber-300' : 'text-emerald-400'
                }
              />
            )}
            {parseNumber(netMonthly) > 0 && (
              <Row
                label="As % of net (your reality)"
                value={`${pctNet.toFixed(1)}%`}
                valueClass={
                  pctNet > 35 ? 'text-rose-300' : 'text-emerald-400'
                }
              />
            )}
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
      <div>
        <h2 className="text-xl font-semibold text-slate-50">
          Debt payoff
        </h2>
        <p className="text-sm text-slate-400 max-w-2xl mt-1">
          List your debts, pick a strategy, and see roughly how long it might
          take to be debt-free. This is an approximation—real life will move
          around—but it gives you a starting point.
        </p>
      </div>

      <div className="grid xl:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-4 space-y-3">
            <div className="flex justify-between items-center">
              <TermTooltipLabel
                term="avalanche"
                label="Debts (credit cards, personal loans, etc.)"
              />
              <button
                type="button"
                onClick={addDebt}
                className="text-xs text-emerald-300 hover:text-emerald-100 font-medium"
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
                    className="w-full px-2 py-2 border border-slate-700 rounded-lg bg-slate-950 text-slate-100"
                    placeholder="Name (Visa, Car loan…)"
                    value={d.name}
                    onChange={(e) =>
                      updateDebt(i, 'name', e.target.value)
                    }
                  />

                  <input
                    type="number"
                    className="w-full px-2 py-2 border border-slate-700 rounded-lg bg-slate-950 text-slate-100"
                    placeholder="Balance"
                    value={d.balance}
                    onChange={(e) =>
                      updateDebt(i, 'balance', e.target.value)
                    }
                  />

                  <input
                    type="number"
                    className="w-full px-2 py-2 border border-slate-700 rounded-lg bg-slate-950 text-slate-100"
                    placeholder="Rate %"
                    value={d.rate}
                    onChange={(e) =>
                      updateDebt(i, 'rate', e.target.value)
                    }
                  />

                  <input
                    type="number"
                    className="w-full px-2 py-2 border border-slate-700 rounded-lg bg-slate-950 text-slate-100"
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
                      className="text-slate-500 hover:text-rose-400 justify-self-end"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800 mt-3">
              <LabeledNumberInput
                label="Extra payment toward debt each month"
                value={extra}
                onChange={setExtra}
                small
              />
              <label className="text-xs md:text-sm text-slate-200">
                Strategy
                <select
                  className="mt-1 w-full px-2 py-2 border border-slate-700 rounded-lg text-sm bg-slate-950 text-slate-100"
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
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 text-sm space-y-2">
            <h3 className="font-semibold text-slate-100 mb-1">
              Payoff summary (approximate)
            </h3>
            <Row
              label="Total debt"
              value={formatCurrency(totalDebt)}
            />
            <Row
              label="Weighted avg rate"
              value={`${avgRate.toFixed(2)}%`}
            />
            <Row
              label="Required minimum payments"
              value={formatCurrency(minPayments)}
            />
            <Row
              label="Total monthly with extra"
              value={formatCurrency(totalPayment)}
              valueClass="text-emerald-400"
            />
            {months > 0 && (
              <>
                <div className="border-t border-slate-800 my-2" />
                <div className="flex justify-between items-center">
                  <span>Est. months to debt-free</span>
                  <span className="font-semibold text-slate-100 flex items-center gap-1">
                    <Clock size={14} />
                    {Math.ceil(months)} months
                  </span>
                </div>
                <Row
                  label="Approx. total interest"
                  value={formatCurrency(totalInterest)}
                />
              </>
            )}
          </div>

          <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-4 text-xs space-y-2 text-slate-200">
            <p className="font-semibold flex items-center gap-2">
              <Shield size={14} /> Strategy tips
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
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

/* ---------- Savings tab ---------- */
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
      <div>
        <h2 className="text-xl font-semibold text-slate-50">
          Savings & investing
        </h2>
        <p className="text-sm text-slate-400 max-w-2xl mt-1">
          See how your money grows over time with consistent contributions and a
          reasonable long-term return assumption.
        </p>
      </div>

      <div className="grid xl:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-4 space-y-3">
            <LabeledNumberInput
              label="Starting amount"
              value={initial}
              onChange={setInitial}
            />
            <LabeledNumberInput
              label="Monthly contribution"
              value={monthly}
              onChange={setMonthly}
            />
            <div className="grid grid-cols-2 gap-3">
              <LabeledNumberInput
                label="Years"
                value={years}
                onChange={setYears}
              />
              <LabeledNumberInput
                label="Annual return (%)"
                value={returnRate}
                onChange={setReturnRate}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 text-sm space-y-2">
            <h3 className="font-semibold text-slate-100 mb-1">
              Projection
            </h3>
            <Row
              label="Total contributions"
              value={formatCurrency(totalContrib || 0)}
            />
            <Row
              label="Projected future value"
              value={formatCurrency(totalFuture || 0)}
              valueClass="text-emerald-400"
            />
            <Row
              label="Estimated growth (interest)"
              value={formatCurrency(interestEarned || 0)}
            />
          </div>

          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-4">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#1f2937"
                  />
                  <XAxis
                    dataKey="year"
                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                    tickFormatter={(v) => `${v}y`}
                    axisLine={{ stroke: '#1f2937' }}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                    tickFormatter={(v) =>
                      v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
                    }
                    axisLine={{ stroke: '#1f2937' }}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#020617',
                      borderColor: '#1f2937',
                      fontSize: 11,
                    }}
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
                    stroke="#64748b"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="balance"
                    name="Projected balance"
                    stroke="#22c55e"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-2 text-[11px] text-slate-400">
              Real returns vary year to year. This assumes a steady average
              return, just to show the power of consistency + time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Shared small UI pieces ---------- */

function LabeledNumberInput({ label, value, onChange, small }) {
  return (
    <label
      className={`${
        small ? 'text-xs' : 'text-sm'
      } text-slate-200 flex flex-col gap-1`}
    >
      {label}
      <input
        type="number"
        className="mt-1 w-full px-3 py-2 border border-slate-700 rounded-lg bg-slate-950 text-slate-100 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function Row({ label, value, valueClass }) {
  return (
    <div className="flex justify-between text-sm text-slate-200">
      <span>{label}</span>
      <span className={`font-semibold ${valueClass ?? ''}`}>{value}</span>
    </div>
  );
}

/* =======================================================
   MAIN APP WITH PREMIUM DARK LAYOUT + LEFT SIDEBAR + RIGHT TIPS
   ======================================================= */

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
        <stop stopColor="#22c55e" />
        <stop offset="0.5" stopColor="#0ea5e9" />
        <stop offset="1" stopColor="#6366f1" />
      </linearGradient>
    </defs>

    <rect
      x="3"
      y="3"
      width="26"
      height="26"
      rx="9"
      stroke="#020617"
      strokeWidth="1.4"
      fill="#020617"
    />

    <path
      d="M6 22C9.2 19 11.5 17.5 13.8 16.6C16.1 15.8 18.2 15.8 20.2 16.3C22.2 16.8 24 17.8 26 19.5"
      stroke="url(#mmGradient)"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 18.5C10.3 16 12.4 14.7 14.4 14.0C16.4 13.3 18.3 13.2 20.1 13.6C21.9 14.0 23.5 14.9 25 16.3"
      stroke="url(#mmGradient)"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="25.2" cy="16.3" r="1.5" fill="#22c55e" />
  </svg>
);

const tabs = [
  { id: 'budget', label: 'Budget', icon: DollarSign },
  { id: 'auto', label: 'Auto loan', icon: Car },
  { id: 'mortgage', label: 'Mortgage', icon: Home },
  { id: 'debt', label: 'Debt payoff', icon: Shield },
  { id: 'savings', label: 'Savings', icon: Calculator },
  { id: 'roi', label: 'Real estate ROI', icon: TrendingUp },
];

function TipsPanel({ activeTab }) {
  if (activeTab === 'mortgage') {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 text-xs text-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wide text-slate-400">
              <Home size={12} /> Housing
            </span>
            <span className="text-[10px] text-slate-500">
              Context only, not advice
            </span>
          </div>
          <p className="font-semibold mb-1 text-slate-100">
            Homebuying guardrails
          </p>
          <ul className="space-y-1.5 list-disc list-inside text-slate-300">
            <li>
              Lenders typically care about % of gross income. You live on net
              income, not gross.
            </li>
            <li>
              Keep total housing ideally around 30–35% of take-home pay if you
              want room to breathe.
            </li>
            <li>
              Don&apos;t drain every dollar into the down payment—emergency
              cash still matters.
            </li>
          </ul>
        </div>

        <ReminderCard />
      </div>
    );
  }

  if (activeTab === 'debt') {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 text-xs text-slate-200">
          <p className="font-semibold mb-1 text-slate-100">
            Avalanche vs snowball
          </p>
          <ul className="space-y-1 list-disc list-inside text-slate-300">
            <li>
              Avalanche frees up the most interest cost. Great if you&apos;re
              numbers-driven.
            </li>
            <li>
              Snowball creates faster wins. Great if motivation is the main
              battle.
            </li>
            <li>
              Either method works better than paying &quot;whatever&apos;s
              left&quot; with no plan.
            </li>
          </ul>
        </div>
        <ReminderCard />
      </div>
    );
  }

  if (activeTab === 'savings') {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 text-xs text-slate-200">
          <p className="font-semibold mb-1 text-slate-100">
            Compounding in plain language
          </p>
          <ul className="space-y-1 list-disc list-inside text-slate-300">
            <li>
              The earlier dollars have more time to work. Time matters more
              than the perfect product.
            </li>
            <li>
              A boring, diversified index fund plus consistency usually beats
              chasing the &quot;perfect&quot; stock.
            </li>
            <li>
              The graph here is not a prediction—just a way to see how steady
              monthly contributions add up.
            </li>
          </ul>
        </div>
        <ReminderCard />
      </div>
    );
  }

  if (activeTab === 'roi') {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 text-xs text-slate-200">
          <p className="font-semibold mb-1 text-slate-100">
            Reading ROI metrics
          </p>
          <ul className="space-y-1 list-disc list-inside text-slate-300">
            <li>
              Cap rate helps compare properties ignoring financing. Good for
              apples-to-apples evaluation.
            </li>
            <li>
              Cash-on-cash is what your down payment is doing for you each
              year—your personal return.
            </li>
            <li>
              DSCR below ~1.2 usually feels tight. You want some room for
              vacancies, repairs, and noise.
            </li>
          </ul>
        </div>
        <ReminderCard />
      </div>
    );
  }

  if (activeTab === 'auto') {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 text-xs text-slate-200">
          <p className="font-semibold mb-1 text-slate-100">
            Car-buying framing
          </p>
          <ul className="space-y-1 list-disc list-inside text-slate-300">
            <li>
              Total monthly car cost (payment + insurance + gas) still has to
              fit inside your budget map.
            </li>
            <li>
              If a car payment competes with your emergency fund or high-interest
              debt payoff, that&apos;s a signal.
            </li>
          </ul>
        </div>
        <ReminderCard />
      </div>
    );
  }

  // Budget (default) and any others
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 text-xs text-slate-200">
        <p className="font-semibold mb-1 text-slate-100">
          Budget map, not budget prison
        </p>
        <ul className="space-y-1 list-disc list-inside text-slate-300">
          <li>
            The 50/30/20 split is a starting line, not a grade. The point is
            clarity, not perfection.
          </li>
          <li>
            If your needs are high for now, your first move might be shrinking
            fixed costs over time.
          </li>
          <li>
            The leftover number isn&apos;t &quot;extra&quot;—it&apos;s how you
            fund future you (savings, investing, debt payoff).
          </li>
        </ul>
      </div>
      <ReminderCard />
    </div>
  );
}

function ReminderCard() {
  return (
    <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4 text-xs text-slate-300">
      <p className="font-semibold mb-1 text-slate-100">Reminder</p>
      <p>
        MoneyMap is a sandbox. It is not financial advice and does not know your
        full situation. Use it to pressure-test ideas before you make decisions
        in the real world.
      </p>
    </div>
  );
}

const FinancialCalculatorApp = () => {
  const [activeTab, setActiveTab] = useState('budget');
  const [showPrivacy, setShowPrivacy] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
              <MoneyMapLogo size={28} />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-50">
                MoneyMap
              </h1>
              <p className="text-xs text-slate-400">
                Chart your financial future quietly, on your own terms.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowPrivacy(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-200 rounded-full text-xs font-medium hover:bg-emerald-500/20 border border-emerald-500/30"
          >
            <Shield size={14} />
            <span>How your data is handled</span>
          </button>
        </div>
      </header>

      {/* Privacy modal */}
      {showPrivacy && (
        <div className="fixed inset-0 bg-slate-950/70 flex items-center justify-center z-50">
          <div className="bg-slate-950 border border-slate-800 max-w-lg w-full mx-4 rounded-2xl shadow-xl p-5 relative">
            <button
              className="absolute top-3 right-3 text-slate-500 hover:text-slate-200"
              onClick={() => setShowPrivacy(false)}
            >
              <X size={18} />
            </button>
            <h2 className="text-lg font-semibold text-slate-50 mb-2">
              Privacy first
            </h2>
            <p className="text-sm text-slate-300 mb-3">
              Nothing you type here is sent to a server for the math. The
              calculations run in your browser. Close the tab and it&apos;s
              gone.
            </p>
            <ul className="text-xs text-slate-400 list-disc list-inside space-y-1">
              <li>No account required.</li>
              <li>No credit pulls, no bank connections.</li>
              <li>You&apos;re just running numbers quietly for yourself.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Main layout */}
      <div className="max-w-7xl mx-auto px-6 py-6 flex gap-6">
        {/* Left sidebar */}
        <aside className="w-56 shrink-0 hidden md:block">
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-emerald-500 to-sky-500 text-slate-950 shadow-md'
                    : 'bg-slate-900/60 border border-slate-800 text-slate-300 hover:bg-slate-800/80'
                }`}
              >
                <tab.icon size={16} />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 space-y-6">
          {/* On mobile, show top tabs */}
          <div className="md:hidden mb-2 flex gap-2 overflow-x-auto pb-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-800 text-slate-200'
                }`}
              >
                <tab.icon size={14} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {activeTab === 'budget' && <BudgetTab />}
          {activeTab === 'auto' && <AutoLoanTab />}
          {activeTab === 'mortgage' && <MortgageTab />}
          {activeTab === 'debt' && <DebtPayoffTab />}
          {activeTab === 'savings' && <SavingsTab />}
          {activeTab === 'roi' && <RealEstateRoiCalculator />}
        </main>

        {/* Right tips panel (desktop only) */}
        <aside className="w-80 shrink-0 hidden lg:block">
          <TipsPanel activeTab={activeTab} />
        </aside>
      </div>
    </div>
  );
};

export default FinancialCalculatorApp;
