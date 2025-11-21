import React, { useState, useEffect } from 'react';
import {
  Home,
  Car,
  DollarSign,
  TrendingUp,
  Shield,
  X,
  PiggyBank,
  Info,
  CreditCard,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from 'recharts';

/* ---------- Generic helpers ---------- */

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(isNaN(value) ? 0 : value);

const parseNumber = (v, fallback = 0) => {
  if (v === undefined || v === null) return fallback;
  const n = parseFloat(String(v).replace(/,/g, ''));
  return isNaN(n) ? fallback : n;
};

/* ---------- Inline financial-literacy tooltip ---------- */

const InlineTooltip = ({ label, term }) => {
  const [open, setOpen] = useState(false);

  const tips = {
    apr: {
      title: 'APR – Annual Percentage Rate',
      text: 'The yearly cost of borrowing, including interest and some fees. Lower APR usually means paying less over the life of the loan.',
    },
    dti: {
      title: 'DTI – Debt-to-Income Ratio',
      text: 'Your monthly debt payments divided by gross income. Many lenders prefer DTI under 43%. Lower is safer for you.',
    },
    pmi: {
      title: 'PMI – Private Mortgage Insurance',
      text: 'Extra insurance charged when you put less than 20% down on a conventional mortgage. It protects the lender, not you.',
    },
    downPayment: {
      title: 'Down Payment',
      text: 'Cash you pay upfront. Higher down payment lowers your monthly payment and total interest, and can remove PMI.',
    },
    savingsRate: {
      title: 'Savings Rate',
      text: 'Percent of your income you keep. A 20% savings rate is a strong baseline for long-term stability.',
    },
    avalanche: {
      title: 'Avalanche Method',
      text: 'Pay extra on the highest-interest debt first. You save the most money on interest.',
    },
    snowball: {
      title: 'Snowball Method',
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
        <Info size={10} />
      </button>
      {open && (
        <div className="absolute z-50 top-5 left-0 w-64 bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs">
          <button
            className="absolute right-1 top-1 text-slate-400 hover:text-slate-600"
            onClick={() => setOpen(false)}
          >
            <X size={12} />
          </button>
          <div className="font-semibold text-slate-900 mb-1">
            {tip.title}
          </div>
          <div className="text-slate-600 text-[11px] leading-relaxed">
            {tip.text}
          </div>
        </div>
      )}
    </span>
  );
};

/* ---------- Real Estate ROI / Cap Rate / Cash-on-Cash ---------- */

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
      <h2 className="text-2xl font-bold text-slate-900">
        Real Estate ROI, Cap Rate & Cash-on-Cash
      </h2>
      <p className="text-sm text-slate-600 max-w-2xl">
        See cap rate, cash-on-cash return, and DSCR before you buy a rental or
        commercial property. Simple inputs, clear risk picture.
      </p>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        {/* Inputs */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-5 shadow border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">
              Property & One-Time Costs
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
              Income & Vacancy
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
              Operating Expenses & Financing
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
                Enter values to see ROI, cap rate, cash-on-cash, and DSCR.
              </p>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <RoiMetric label="Cap Rate" value={roiFormatPercent(results.capRate)} />
                  <RoiMetric
                    label="Cash-on-Cash"
                    value={roiFormatPercent(results.cashOnCash)}
                  />
                  <RoiMetric
                    label="DSCR"
                    value={results.dscr.toFixed(2)}
                    emphasize={
                      results.dscr < 1.2 ? 'bad' : results.dscr < 1.3 ? 'warn' : 'good'
                    }
                  />
                  <RoiMetric
                    label="Annual Cash Flow"
                    value={roiFormatCurrency(results.annualCashFlow)}
                    emphasize={results.annualCashFlow < 0 ? 'bad' : 'good'}
                  />
                </div>

                <hr className="my-4" />

                <dl className="space-y-1 text-sm text-slate-700">
                  <RoiRow label="NOI" value={roiFormatCurrency(results.noi)} />
                  <RoiRow
                    label="Annual debt service"
                    value={roiFormatCurrency(results.annualDebtService)}
                  />
                  <RoiRow
                    label="Total cash invested"
                    value={roiFormatCurrency(results.totalCashInvested)}
                  />
                  <RoiRow
                    label="Loan amount"
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
                <span className="font-semibold">Cap Rate</span> treats it like
                you paid all cash. Good for property-to-property comparisons.
              </li>
              <li>
                <span className="font-semibold">Cash-on-Cash</span> shows your
                return on the actual cash you put in (down payment + costs).
              </li>
              <li>
                <span className="font-semibold">DSCR</span> compares NOI to loan
                payments. Many lenders want DSCR ≥ 1.20.
              </li>
              <li>
                <span className="font-semibold">Annual Cash Flow</span> is what
                is left after operations and debt, before taxes and reserves.
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

function RoiMetric({ label, value, emphasize }) {
  let color = 'text-slate-900';
  if (emphasize === 'good') color = 'text-emerald-600';
  if (emphasize === 'bad') color = 'text-rose-600';
  if (emphasize === 'warn') color = 'text-amber-600';

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">
        {label}
      </div>
      <div className={`text-xl font-semibold ${color} font-mono`}>{value}</div>
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
  MP: { name: 'Northern Mariana Islands', propertyTax: 0.35, insurance: 1500 },
};

/* ---------- Budget tab (Needs / Wants / Savings, 50/30/20) ---------- */

function BudgetTab() {
  const [income, setIncome] = useState('');
  const [expenses, setExpenses] = useState([
    { name: 'Rent / Mortgage', amount: '1200', category: 'needs' },
    { name: 'Groceries', amount: '400', category: 'needs' },
    { name: 'Eating out', amount: '200', category: 'wants' },
    { name: 'Investing / Savings', amount: '500', category: 'savings' },
  ]);

  const totalIncome = parseNumber(income);
  const totals = expenses.reduce(
    (acc, e) => {
      const a = parseNumber(e.amount);
      acc.total += a;
      if (e.category === 'needs') acc.needs += a;
      else if (e.category === 'wants') acc.wants += a;
      else acc.savings += a;
      return acc;
    },
    { total: 0, needs: 0, wants: 0, savings: 0 },
  );

  const remaining = totalIncome - totals.total;
  const savingsRate = totalIncome > 0 ? (totals.savings / totalIncome) * 100 : 0;
  const expenseRate = totalIncome > 0 ? (totals.total / totalIncome) * 100 : 0;

  const idealNeeds = totalIncome * 0.5;
  const idealWants = totalIncome * 0.3;
  const idealSavings = totalIncome * 0.2;

  const chartData = [
    {
      name: 'Needs',
      actual: totals.needs,
      ideal: idealNeeds,
    },
    {
      name: 'Wants',
      actual: totals.wants,
      ideal: idealWants,
    },
    {
      name: 'Savings',
      actual: totals.savings,
      ideal: idealSavings,
    },
  ];

  const addExpense = () =>
    setExpenses((prev) => [...prev, { name: '', amount: '', category: 'needs' }]);

  const updateExpense = (index, field, value) => {
    setExpenses((prev) =>
      prev.map((e, i) => (i === index ? { ...e, [field]: value } : e)),
    );
  };

  const removeExpense = (index) =>
    setExpenses((prev) => prev.filter((_, i) => i !== index));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Monthly Budget</h2>

      <div className="bg-gradient-to-r from-green-50 to-teal-50 border-l-4 border-green-500 p-4 rounded-r-xl">
        <div className="flex items-start gap-3">
          <div className="text-2xl">💰</div>
          <div>
            <h3 className="font-bold text-green-900 mb-1">
              50 / 30 / 20 – Simple rule of thumb
            </h3>
            <p className="text-sm text-green-800">
              50% Needs, 30% Wants, 20% Savings & debt payoff. It&apos;s a
              guide, not a law, but it gives you a clear target.
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <InlineTooltip label="Monthly take-home income" term="savingsRate" />
            <input
              type="number"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              placeholder="5000"
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
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
                <div key={i} className="flex gap-2 items-center">
                  <input
                    className="flex-1 px-2 py-2 border border-slate-300 rounded-lg text-sm"
                    placeholder="Name"
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

        {/* Summary + chart */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-3">Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Total income</span>
                <span className="font-semibold text-emerald-700">
                  {formatCurrency(totalIncome)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Total expenses</span>
                <span className="font-semibold text-rose-600">
                  {formatCurrency(totals.total)}
                </span>
              </div>
              <div className="border-t border-slate-200 pt-2 mt-1 flex justify-between">
                <span className="font-semibold text-slate-800">
                  Remaining / deficit
                </span>
                <span
                  className={`font-semibold ${
                    remaining >= 0 ? 'text-emerald-700' : 'text-rose-600'
                  }`}
                >
                  {formatCurrency(remaining)}
                </span>
              </div>
              <div className="pt-2 text-xs text-slate-600 space-y-1">
                <div>
                  Expense rate:{' '}
                  <span
                    className={
                      expenseRate > 80 ? 'text-rose-600 font-semibold' : ''
                    }
                  >
                    {expenseRate.toFixed(1)}%
                  </span>
                </div>
                <div>
                  Savings rate:{' '}
                  <span
                    className={
                      savingsRate >= 20
                        ? 'text-emerald-700 font-semibold'
                        : 'text-amber-600 font-semibold'
                    }
                  >
                    {savingsRate.toFixed(1)}%
                  </span>{' '}
                  (target: 20%+)
                </div>
              </div>
            </div>
          </div>

          {totalIncome > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-3">
                50 / 30 / 20 breakdown
              </h3>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip
                      formatter={(val) => formatCurrency(val)}
                    />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      name="Actual"
                      stroke="#0f766e"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="ideal"
                      name="Ideal"
                      stroke="#94a3b8"
                      strokeDasharray="4 4"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-2 text-[11px] text-slate-500">
                The closer your bars are to the grey &quot;Ideal&quot; line, the
                closer you are to the 50 / 30 / 20 target. Use this as a guide
                to tweak a few expenses at a time.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Auto loan tab ---------- */

function AutoLoanTab() {
  const [price, setPrice] = useState('35000');
  const [down, setDown] = useState('5000');
  const [term, setTerm] = useState('60');
  const [creditTier, setCreditTier] = useState('720-850');
  const [netIncome, setNetIncome] = useState('4500');

  const tiers = {
    '300-579': { label: 'Deep subprime', rate: 14.5 },
    '580-619': { label: 'Subprime', rate: 11.5 },
    '620-659': { label: 'Non-prime', rate: 8.5 },
    '660-719': { label: 'Prime', rate: 6.5 },
    '720-850': { label: 'Super prime', rate: 5.2 },
  };

  const principal = Math.max(0, parseNumber(price) - parseNumber(down));
  const months = parseNumber(term);
  const tier = tiers[creditTier] || tiers['660-719'];
  const monthlyRate = tier.rate / 100 / 12;

  let monthlyPayment = 0;
  if (principal > 0 && months > 0 && monthlyRate > 0) {
    monthlyPayment =
      (principal *
        monthlyRate *
        Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);
  }

  const totalPaid = monthlyPayment * months;
  const totalInterest = totalPaid - principal;
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
                Term (months)
                <select
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                >
                  <option value="36">36</option>
                  <option value="48">48</option>
                  <option value="60">60</option>
                  <option value="72">72</option>
                  <option value="84">84</option>
                </select>
              </label>
              <label className="text-sm text-slate-700">
                Credit tier (estimate)
                <select
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg"
                  value={creditTier}
                  onChange={(e) => setCreditTier(e.target.value)}
                >
                  {Object.entries(tiers).map(([key, v]) => (
                    <option key={key} value={key}>
                      {key} – {v.label} (≈{v.rate}% APR)
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm text-slate-700">
                Monthly take-home pay (after tax)
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
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="font-semibold text-slate-900 mb-3">
              Payment & cost of financing
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Loan amount</span>
                <span className="font-semibold">
                  {formatCurrency(principal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated APR</span>
                <span className="font-semibold">{tier.rate.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-200 pt-2 mt-1">
                <span className="font-semibold">Estimated payment</span>
                <span className="font-semibold text-emerald-700 text-lg">
                  {formatCurrency(monthlyPayment || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total paid over loan</span>
                <span className="font-semibold">
                  {formatCurrency(totalPaid || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Interest cost</span>
                <span className="font-semibold text-rose-600">
                  {formatCurrency(totalInterest || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <InlineTooltip
                  label="Payment as % of take-home pay"
                  term="dti"
                />
                <span
                  className={`font-semibold ${
                    paymentToNet > 15 ? 'text-rose-600' : 'text-emerald-700'
                  }`}
                >
                  {paymentToNet.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 text-slate-100 rounded-xl p-4 text-xs space-y-2">
            <p className="font-semibold flex items-center gap-2">
              <Car size={14} /> Healthy rules of thumb
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Try to keep your car payment under **10–15%** of your take-home
                pay.
              </li>
              <li>Shorter terms (36–60 months) = higher payment, less interest.</li>
              <li>
                Aim to own the car for a few years after it&apos;s paid off so
                cash flow frees up.
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
  const [price, setPrice] = useState('400000');
  const [downPercent, setDownPercent] = useState('20');
  const [loanType, setLoanType] = useState('conventional');
  const [termYears, setTermYears] = useState('30');
  const [state, setState] = useState('PR');
  const [propertyTaxRate, setPropertyTaxRate] = useState('0.8');
  const [insuranceYearly, setInsuranceYearly] = useState('1100');
  const [grossMonthly, setGrossMonthly] = useState('9000');
  const [netMonthly, setNetMonthly] = useState('6500');
  const [creditTier, setCreditTier] = useState('740-799');

  const mortgageTiers = {
    '300-619': { label: 'Poor', rate: 8.5 },
    '620-679': { label: 'Fair', rate: 7.8 },
    '680-739': { label: 'Good', rate: 7.2 },
    '740-799': { label: 'Very good', rate: 6.8 },
    '800-850': { label: 'Exceptional', rate: 6.5 },
  };

  useEffect(() => {
    const data = stateData[state];
    if (data) {
      setPropertyTaxRate(String(data.propertyTax));
      setInsuranceYearly(String(data.insurance));
    }
  }, [state]);

  const p = parseNumber(price);
  const dpPct = parseNumber(downPercent) / 100;
  const downAmount = p * dpPct;
  const principal = Math.max(0, p - downAmount);

  const term = parseNumber(termYears) * 12;
  const tier = mortgageTiers[creditTier] || mortgageTiers['680-739'];
  const monthlyRate = tier.rate / 100 / 12;

  let principalAndInterest = 0;
  if (principal > 0 && term > 0) {
    principalAndInterest =
      (principal *
        monthlyRate *
        Math.pow(1 + monthlyRate, term)) /
      (Math.pow(1 + monthlyRate, term) - 1);
  }

  const taxMonthly = (p * (parseNumber(propertyTaxRate) / 100)) / 12;
  const insuranceMonthly = parseNumber(insuranceYearly) / 12;

  let pmiMonthly = 0;
  if (loanType === 'conventional' && dpPct < 0.2) {
    pmiMonthly = (principal * 0.0075) / 12; // ≈0.75%/yr
  } else if (loanType === 'fha') {
    pmiMonthly = (principal * 0.0085) / 12; // FHA MIP approx
  }

  const totalMonthly =
    principalAndInterest + taxMonthly + insuranceMonthly + pmiMonthly;

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
              Down payment (% of price)
              <input
                type="number"
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg"
                value={downPercent}
                onChange={(e) => setDownPercent(e.target.value)}
              />
            </label>
            <label className="text-sm text-slate-700">
              Loan type
              <select
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg"
                value={loanType}
                onChange={(e) => setLoanType(e.target.value)}
              >
                <option value="conventional">Conventional</option>
                <option value="fha">FHA</option>
                <option value="jumbo">Jumbo</option>
              </select>
            </label>
            <label className="text-sm text-slate-700">
              Term (years)
              <select
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg"
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
              Credit tier (estimate)
              <select
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg"
                value={creditTier}
                onChange={(e) => setCreditTier(e.target.value)}
              >
                {Object.entries(mortgageTiers).map(([key, v]) => (
                  <option key={key} value={key}>
                    {key} – {v.label} (≈{v.rate}% rate)
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
            <label className="text-sm text-slate-700">
              State / territory
              <select
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg"
                value={state}
                onChange={(e) => setState(e.target.value)}
              >
                {Object.entries(stateData).map(([code, d]) => (
                  <option key={code} value={code}>
                    {code} – {d.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm text-slate-700">
              Property tax rate (% of value / year)
              <input
                type="number"
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg"
                value={propertyTaxRate}
                onChange={(e) => setPropertyTaxRate(e.target.value)}
              />
            </label>
            <label className="text-sm text-slate-700">
              Home insurance (yearly)
              <input
                type="number"
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg"
                value={insuranceYearly}
                onChange={(e) => setInsuranceYearly(e.target.value)}
              />
            </label>
            <label className="text-sm text-slate-700">
              Gross monthly income (before tax)
              <input
                type="number"
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg"
                value={grossMonthly}
                onChange={(e) => setGrossMonthly(e.target.value)}
              />
            </label>
            <label className="text-sm text-slate-700">
              Net monthly income (take-home)
              <input
                type="number"
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg"
                value={netMonthly}
                onChange={(e) => setNetMonthly(e.target.value)}
              />
            </label>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2 text-sm">
            <h3 className="font-semibold text-slate-900 mb-2">
              Monthly payment breakdown
            </h3>
            <div className="flex justify-between">
              <span>Loan amount</span>
              <span className="font-semibold">
                {formatCurrency(principal)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Rate (est.)</span>
              <span className="font-semibold">{tier.rate.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 mt-1">
              <span>Principal & interest</span>
              <span className="font-semibold">
                {formatCurrency(principalAndInterest || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Property tax</span>
              <span>{formatCurrency(taxMonthly || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Insurance</span>
              <span>{formatCurrency(insuranceMonthly || 0)}</span>
            </div>
            {pmiMonthly > 0 && (
              <div className="flex justify-between">
                <InlineTooltip label="PMI / MIP (est.)" term="pmi" />
                <span>{formatCurrency(pmiMonthly)}</span>
              </div>
            )}
            <div className="flex justify-between items-center border-t border-slate-200 pt-2 mt-1">
              <span className="font-semibold">Total monthly payment</span>
              <span className="font-semibold text-emerald-700 text-lg">
                {formatCurrency(totalMonthly || 0)}
              </span>
            </div>
            <div className="flex justify-between mt-2">
              <InlineTooltip
                label="% of gross income (what lender looks at)"
                term="dti"
              />
              <span
                className={`font-semibold ${
                  pctGross > 28 ? 'text-rose-600' : 'text-emerald-700'
                }`}
              >
                {pctGross.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>% of take-home pay (what you feel)</span>
              <span
                className={`font-semibold ${
                  pctNet > 35 ? 'text-rose-600' : 'text-emerald-700'
                }`}
              >
                {pctNet.toFixed(1)}%
              </span>
            </div>
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
                For affordability, many people aim for **≤ 30–35% of take-home
                pay** across housing.
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
    {
      name: 'Credit card',
      type: 'credit-card',
      balance: '5000',
      rate: '22',
      minPayment: '150',
    },
  ]);
  const [extraPayment, setExtraPayment] = useState('200');
  const [method, setMethod] = useState('avalanche');

  const addDebt = () =>
    setDebts((prev) => [
      ...prev,
      { name: '', type: 'credit-card', balance: '', rate: '', minPayment: '' },
    ]);

  const updateDebt = (i, field, value) =>
    setDebts((prev) => prev.map((d, idx) => (idx === i ? { ...d, [field]: value } : d)));

  const removeDebt = (i) =>
    setDebts((prev) => prev.filter((_, idx) => idx !== i));

  const validDebts = debts.filter(
    (d) => parseNumber(d.balance) > 0 && parseNumber(d.rate) > 0,
  );
  const totalDebt = validDebts.reduce(
    (sum, d) => sum + parseNumber(d.balance),
    0,
  );

  let avgRate = 0;
  if (totalDebt > 0) {
    avgRate =
      validDebts.reduce(
        (sum, d) => sum + parseNumber(d.balance) * parseNumber(d.rate),
        0,
      ) / totalDebt;
  }

  const minPayments = validDebts.reduce(
    (sum, d) => sum + parseNumber(d.minPayment),
    0,
  );
  const payment = minPayments + parseNumber(extraPayment);

  let months = 0;
  let interestTotal = 0;

  if (payment > 0 && totalDebt > 0 && avgRate > 0) {
    const r = avgRate / 100 / 12;
    months =
      Math.log(payment / (payment - totalDebt * r)) / Math.log(1 + r);
    interestTotal = payment * months - totalDebt;
  }

  const sortedForOrder = [...validDebts].sort((a, b) => {
    if (method === 'avalanche') {
      return parseNumber(b.rate) - parseNumber(a.rate);
    }
    return parseNumber(a.balance) - parseNumber(b.balance);
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Debt Payoff</h2>
      <p className="text-sm text-slate-600 max-w-2xl">
        Stack your debts, choose a payoff strategy, and see an approximate
        payoff timeline using either Avalanche (highest interest first) or
        Snowball (smallest balance first).
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-slate-800">
                Debts
              </span>
              <button
                onClick={addDebt}
                className="text-xs text-indigo-600 hover:text-indigo-800"
              >
                + Add debt
              </button>
            </div>
            <div className="space-y-2">
              {debts.map((d, i) => (
                <div key={i} className="border border-slate-200 rounded-lg p-2">
                  <div className="flex justify-between gap-2 mb-1">
                    <input
                      className="flex-1 text-xs px-2 py-1 border border-slate-200 rounded"
                      placeholder="Name"
                      value={d.name}
                      onChange={(e) =>
                        updateDebt(i, 'name', e.target.value)
                      }
                    />
                    <select
                      className="w-28 text-xs px-2 py-1 border border-slate-200 rounded"
                      value={d.type}
                      onChange={(e) =>
                        updateDebt(i, 'type', e.target.value)
                      }
                    >
                      <option value="credit-card">Credit card</option>
                      <option value="personal-loan">Personal loan</option>
                      <option value="auto-loan">Auto loan</option>
                      <option value="student-loan">Student loan</option>
                      <option value="other">Other</option>
                    </select>
                    {debts.length > 1 && (
                      <button
                        className="text-rose-500"
                        type="button"
                        onClick={() => removeDebt(i)}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <label className="flex flex-col">
                      <span>Balance</span>
                      <input
                        type="number"
                        className="mt-0.5 px-2 py-1 border border-slate-200 rounded"
                        value={d.balance}
                        onChange={(e) =>
                          updateDebt(i, 'balance', e.target.value)
                        }
                      />
                    </label>
                    <label className="flex flex-col">
                      <span>Rate %</span>
                      <input
                        type="number"
                        className="mt-0.5 px-2 py-1 border border-slate-200 rounded"
                        value={d.rate}
                        onChange={(e) =>
                          updateDebt(i, 'rate', e.target.value)
                        }
                      />
                    </label>
                    <label className="flex flex-col">
                      <span>Min pay</span>
                      <input
                        type="number"
                        className="mt-0.5 px-2 py-1 border border-slate-200 rounded"
                        value={d.minPayment}
                        onChange={(e) =>
                          updateDebt(i, 'minPayment', e.target.value)
                        }
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
            <label className="text-sm text-slate-700">
              <InlineTooltip
                label="Extra payment toward debt each month"
                term="avalanche"
              />
              <input
                type="number"
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg"
                value={extraPayment}
                onChange={(e) => setExtraPayment(e.target.value)}
              />
            </label>
            <label className="text-sm text-slate-700">
              Strategy
              <select
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
              >
                <option value="avalanche">Avalanche – highest rate first</option>
                <option value="snowball">Snowball – smallest balance first</option>
              </select>
            </label>
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
                {formatCurrency(payment)}
              </span>
            </div>
            {months > 0 && (
              <>
                <div className="flex justify-between border-t border-slate-200 pt-2 mt-1">
                  <span>Estimated months to debt-free</span>
                  <span className="font-semibold">
                    {Math.ceil(months)} months
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Approximate interest paid</span>
                  <span className="font-semibold text-rose-600">
                    {formatCurrency(interestTotal)}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="bg-slate-900 text-slate-100 rounded-xl p-4 text-xs space-y-2">
            <p className="font-semibold flex items-center gap-2">
              <CreditCard size={14} /> How to use this
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Avalanche saves the most interest. Snowball creates faster
                psychological wins. The &quot;best&quot; method is the one you
                can stick to.
              </li>
              <li>
                Protect a small emergency fund before going aggressive so one
                surprise doesn&apos;t send you back to the card.
              </li>
            </ul>
          </div>

          {sortedForOrder.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-4 text-xs">
              <h4 className="font-semibold text-slate-900 mb-2">
                Order to attack ({method === 'avalanche' ? 'highest rate → lowest' : 'smallest balance → largest'})
              </h4>
              <ol className="list-decimal list-inside space-y-1">
                {sortedForOrder.map((d, i) => (
                  <li key={i}>
                    {d.name || 'Unnamed debt'} – balance{' '}
                    {formatCurrency(parseNumber(d.balance))}, rate{' '}
                    {parseNumber(d.rate).toFixed(1)}%
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Savings tab ---------- */

function SavingsTab() {
  const [initialDeposit, setInitialDeposit] = useState('5000');
  const [monthlyContribution, setMonthlyContribution] = useState('300');
  const [rate, setRate] = useState('7');
  const [years, setYears] = useState('15');

  const principal = parseNumber(initialDeposit);
  const monthly = parseNumber(monthlyContribution);
  const r = parseNumber(rate) / 100;
  const nYears = parseNumber(years);

  let futureValue = 0;
  let totalContributions = principal;

  const data = [];

  for (let year = 0; year <= nYears; year++) {
    // compound principal yearly
    const fvPrincipal = principal * Math.pow(1 + r, year);

    // contributions: monthly compounding
    const monthlyRate = r / 12;
    const months = year * 12;
    let fvContrib = 0;
    if (monthly > 0 && monthlyRate > 0) {
      fvContrib =
        monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    } else if (monthly > 0) {
      fvContrib = monthly * months;
    }

    const balance = fvPrincipal + fvContrib;
    const contribs = principal + monthly * 12 * year;

    if (year === nYears) {
      futureValue = balance;
      totalContributions = contribs;
    }

    data.push({
      year,
      balance,
      contributions: contribs,
    });
  }

  const interestEarned = futureValue - totalContributions;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Savings & Investing</h2>
      <p className="text-sm text-slate-600 max-w-2xl">
        See how consistent contributions plus compound interest grow over time.
        This is not investment advice—just math.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <label className="text-sm text-slate-700">
            Starting amount
            <input
              type="number"
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg"
              value={initialDeposit}
              onChange={(e) => setInitialDeposit(e.target.value)}
            />
          </label>
          <label className="text-sm text-slate-700">
            Monthly contribution
            <input
              type="number"
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(e.target.value)}
            />
          </label>
          <label className="text-sm text-slate-700">
            Expected annual return (%)
            <input
              type="number"
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
            />
          </label>
          <label className="text-sm text-slate-700">
            Years to grow
            <input
              type="number"
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg"
              value={years}
              onChange={(e) => setYears(e.target.value)}
            />
          </label>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-sm space-y-2">
            <h3 className="font-semibold text-slate-900 mb-1">
              Projection summary
            </h3>
            <div className="flex justify-between">
              <span>Total contributions</span>
              <span className="font-semibold">
                {formatCurrency(totalContributions)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Projected value</span>
              <span className="font-semibold text-emerald-700">
                {formatCurrency(futureValue)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Growth / interest</span>
              <span className="font-semibold text-emerald-700">
                {formatCurrency(interestEarned)}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <RechartsTooltip
                    formatter={(val) => formatCurrency(val)}
                    labelFormatter={(year) => `Year ${year}`}
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
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-900 to-teal-600 p-2 rounded-xl">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-teal-600 bg-clip-text text-transparent">
                    MoneyMap
                  </h1>
                  <p className="text-xs text-slate-600">
                    Chart your financial future—quietly, on your own terms.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowPrivacy(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs"
                >
                  <Shield size={14} />
                  <span>Privacy first</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Privacy modal */}
        {showPrivacy && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
              <button
                className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
                onClick={() => setShowPrivacy(false)}
              >
                <X size={20} />
              </button>
              <h2 className="text-lg font-bold text-slate-900 mb-3">
                How your data is handled
              </h2>
              <p className="text-sm text-slate-600 mb-3">
                This tool is designed to be used without sharing your numbers
                with anyone:
              </p>
              <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                <li>Calculations run in your browser.</li>
                <li>No accounts, log-ins, or emails are required.</li>
                <li>You can clear your data any time via your browser.</li>
              </ul>
              <button
                className="mt-4 w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-semibold"
                onClick={() => setShowPrivacy(false)}
              >
                Got it
              </button>
            </div>
          </div>
        )}

        {/* Tab navigation */}
        <div className="bg-white shadow-sm border-b border-slate-200 mb-6">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex gap-2 overflow-x-auto py-3">
              <TabButton
                label="Budget"
                icon={DollarSign}
                active={activeTab === 'budget'}
                onClick={() => setActiveTab('budget')}
              />
              <TabButton
                label="Auto loan"
                icon={Car}
                active={activeTab === 'auto'}
                onClick={() => setActiveTab('auto')}
              />
              <TabButton
                label="Mortgage"
                icon={Home}
                active={activeTab === 'mortgage'}
                onClick={() => setActiveTab('mortgage')}
              />
              <TabButton
                label="Debt payoff"
                icon={Shield}
                active={activeTab === 'debt'}
                onClick={() => setActiveTab('debt')}
              />
              <TabButton
                label="Savings"
                icon={PiggyBank}
                active={activeTab === 'savings'}
                onClick={() => setActiveTab('savings')}
              />
              <TabButton
                label="Real Estate ROI"
                icon={TrendingUp}
                active={activeTab === 'realEstateRoi'}
                onClick={() => setActiveTab('realEstateRoi')}
              />
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="max-w-7xl mx-auto px-6 pb-12">
          {activeTab === 'budget' && <BudgetTab />}
          {activeTab === 'auto' && <AutoLoanTab />}
          {activeTab === 'mortgage' && <MortgageTab />}
          {activeTab === 'debt' && <DebtPayoffTab />}
          {activeTab === 'savings' && <SavingsTab />}
          {activeTab === 'realEstateRoi' && <RealEstateRoiCalculator />}
        </main>
      </div>
    </div>
  );
};

function TabButton({ label, icon: Icon, active, onClick }) {
  return (
    <button
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
