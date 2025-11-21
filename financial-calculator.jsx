import React, { useState } from 'react';
import {
  Calculator,
  Home,
  Car,
  DollarSign,
  TrendingUp,
  CreditCard,
  PiggyBank,
  Menu,
  Info,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

/* ---------- generic helpers ---------- */

const parseNumber = (v, fallback = 0) => {
  if (v === undefined || v === null) return fallback;
  const n = parseFloat(String(v).replace(/,/g, ''));
  return isNaN(n) ? fallback : n;
};

const formatCurrency = (n) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

const formatPercent = (n, digits = 1) => `${(n * 100).toFixed(digits)}%`;

/* =========================================================
   REAL ESTATE ROI / CAP RATE / CASH-ON-CASH CALCULATOR
   ========================================================= */

const RealEstateRoiCalculator = () => {
  const [purchasePrice, setPurchasePrice] = useState('300000');
  const [closingCosts, setClosingCosts] = useState('9000');
  const [rehabCosts, setRehabCosts] = useState('15000');

  const [monthlyRent, setMonthlyRent] = useState('2500');
  const [otherIncome, setOtherIncome] = useState('0');
  const [vacancyRate, setVacancyRate] = useState('5'); // %

  const [opExPercent, setOpExPercent] = useState('35'); // %

  const [downPaymentPercent, setDownPaymentPercent] = useState('20'); // %
  const [interestRate, setInterestRate] = useState('6.5'); // annual %
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
        Plug in your deal and get cap rate, cash-on-cash return, DSCR, and annual cash
        flow so you can see if the risk matches the numbers.
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
                Enter deal details to calculate.
              </p>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <RoiMetric
                    label="Cap Rate"
                    value={formatPercent(results.capRate)}
                  />
                  <RoiMetric
                    label="Cash-on-Cash"
                    value={formatPercent(results.cashOnCash)}
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
                    value={formatCurrency(results.annualCashFlow)}
                    emphasize={results.annualCashFlow < 0 ? 'bad' : 'good'}
                  />
                </div>

                <hr className="my-4" />

                <dl className="space-y-1 text-sm text-slate-700">
                  <RoiRow label="NOI" value={formatCurrency(results.noi)} />
                  <RoiRow
                    label="Annual debt service"
                    value={formatCurrency(results.annualDebtService)}
                  />
                  <RoiRow
                    label="Total cash invested"
                    value={formatCurrency(results.totalCashInvested)}
                  />
                  <RoiRow
                    label="Loan amount"
                    value={formatCurrency(results.loanAmount)}
                  />
                </dl>
              </>
            )}
          </div>

          <div className="rounded-2xl bg-slate-900 p-4 text-sm text-slate-100">
            <p className="font-semibold mb-2">How to read this:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>
                <span className="font-semibold">Cap Rate</span> assumes you paid
                all cash.
              </li>
              <li>
                <span className="font-semibold">Cash-on-Cash</span> is your
                return on the actual cash invested.
              </li>
              <li>
                <span className="font-semibold">DSCR</span> shows how safely NOI
                covers loan payments. Many lenders like &gt; 1.20.
              </li>
              <li>
                <span className="font-semibold">Annual Cash Flow</span> is money
                left after expenses and loan payments, before taxes.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const RoiField = ({ label, value, onChange, prefix, suffix }) => (
  <label className="flex flex-col gap-1 text-sm text-slate-700">
    <span>{label}</span>
    <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
      {prefix && <span className="mr-1 text-slate-400 text-xs">{prefix}</span>}
      <input
        className="w-full bg-transparent text-sm text-slate-900 outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode="decimal"
      />
      {suffix && <span className="ml-1 text-slate-400 text-xs">{suffix}</span>}
    </div>
  </label>
);

const RoiMetric = ({ label, value, emphasize }) => {
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
};

const RoiRow = ({ label, value }) => (
  <div className="flex justify-between gap-4">
    <dt>{label}</dt>
    <dd className="font-mono">{value}</dd>
  </div>
);

/* =========================================================
   OTHER CALCULATORS
   ========================================================= */

const BudgetCalculator = () => {
  const [income, setIncome] = useState('5000');
  const [needs, setNeeds] = useState('60');
  const [wants, setWants] = useState('25');
  const [savings, setSavings] = useState('15');

  const inc = parseNumber(income);
  const nPct = parseNumber(needs) / 100;
  const wPct = parseNumber(wants) / 100;
  const sPct = parseNumber(savings) / 100;

  const needsAmt = inc * nPct;
  const wantsAmt = inc * wPct;
  const savingsAmt = inc * sPct;

  const chartData = [
    { name: 'Needs', value: needsAmt },
    { name: 'Wants', value: wantsAmt },
    { name: 'Savings', value: savingsAmt },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Monthly Budget</h2>
      <p className="text-sm text-slate-600 max-w-2xl">
        Start with your monthly take-home income and see how much goes to needs,
        wants, and savings. Adjust the percentages to fit your reality.
      </p>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="rounded-2xl bg-white p-5 shadow border border-slate-100 space-y-4">
            <Field
              label="Monthly take-home income"
              prefix="$"
              value={income}
              onChange={setIncome}
            />
            <div className="grid gap-4 md:grid-cols-3">
              <Field
                label="Needs %"
                suffix="%"
                value={needs}
                onChange={setNeeds}
              />
              <Field
                label="Wants %"
                suffix="%"
                value={wants}
                onChange={setWants}
              />
              <Field
                label="Savings %"
                suffix="%"
                value={savings}
                onChange={setSavings}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl bg-white p-5 shadow border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">
              Monthly breakdown
            </h3>
            <div className="space-y-2 text-sm text-slate-700">
              <div className="flex justify-between">
                <span>Needs</span>
                <span className="font-mono">
                  {formatCurrency(needsAmt)} ({formatPercent(nPct)})
                </span>
              </div>
              <div className="flex justify-between">
                <span>Wants</span>
                <span className="font-mono">
                  {formatCurrency(wantsAmt)} ({formatPercent(wPct)})
                </span>
              </div>
              <div className="flex justify-between">
                <span>Savings / Debt Paydown</span>
                <span className="font-mono">
                  {formatCurrency(savingsAmt)} ({formatPercent(sPct)})
                </span>
              </div>
            </div>

            <div className="mt-4 h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#2563eb" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AutoLoanCalculator = () => {
  const [price, setPrice] = useState('35000');
  const [down, setDown] = useState('5000');
  const [rate, setRate] = useState('7');
  const [term, setTerm] = useState('72');

  const P = parseNumber(price) - parseNumber(down);
  const r = parseNumber(rate) / 100 / 12;
  const n = parseNumber(term);

  const monthly =
    P > 0 && n > 0
      ? r === 0
        ? P / n
        : P * (r / (1 - Math.pow(1 + r, -n)))
      : 0;

  const totalPaid = monthly * n;
  const interest = totalPaid - P;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Auto Loan</h2>
      <p className="text-sm text-slate-600 max-w-2xl">
        Estimate your payment before you walk into the dealership. Change term and
        rate to see how the monthly changes.
      </p>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="rounded-2xl bg-white p-5 shadow border border-slate-100 space-y-4">
          <Field label="Vehicle price" prefix="$" value={price} onChange={setPrice} />
          <Field label="Down payment" prefix="$" value={down} onChange={setDown} />
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Interest rate" suffix="%" value={rate} onChange={setRate} />
            <Field label="Term (months)" value={term} onChange={setTerm} />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow border border-slate-100 space-y-2">
          <Metric
            label="Estimated monthly payment"
            value={formatCurrency(monthly || 0)}
          />
          <Row label="Amount financed" value={formatCurrency(P || 0)} />
          <Row label="Total paid over term" value={formatCurrency(totalPaid || 0)} />
          <Row label="Total interest" value={formatCurrency(interest || 0)} />
        </div>
      </div>
    </div>
  );
};

const MortgageCalculator = () => {
  const [price, setPrice] = useState('450000');
  const [down, setDown] = useState('90000');
  const [rate, setRate] = useState('6.5');
  const [term, setTerm] = useState('30');
  const [taxes, setTaxes] = useState('350');
  const [insurance, setInsurance] = useState('150');

  const loan = parseNumber(price) - parseNumber(down);
  const r = parseNumber(rate) / 100 / 12;
  const n = parseNumber(term) * 12;

  const principalAndInterest =
    loan > 0 && n > 0
      ? r === 0
        ? loan / n
        : loan * (r / (1 - Math.pow(1 + r, -n)))
      : 0;

  const monthly = principalAndInterest + parseNumber(taxes) + parseNumber(insurance);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Mortgage</h2>
      <p className="text-sm text-slate-600 max-w-2xl">
        Estimate a realistic monthly payment including principal, interest, taxes, and
        insurance so you&apos;re not surprised later.
      </p>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="rounded-2xl bg-white p-5 shadow border border-slate-100 space-y-4">
          <Field label="Home price" prefix="$" value={price} onChange={setPrice} />
          <Field label="Down payment" prefix="$" value={down} onChange={setDown} />
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Rate" suffix="%" value={rate} onChange={setRate} />
            <Field label="Term (years)" value={term} onChange={setTerm} />
            <Field
              label="Taxes (monthly)"
              prefix="$"
              value={taxes}
              onChange={setTaxes}
            />
          </div>
          <Field
            label="Insurance (monthly)"
            prefix="$"
            value={insurance}
            onChange={setInsurance}
          />
        </div>

        <div className="rounded-2xl bg-white p-5 shadow border border-slate-100 space-y-2">
          <Metric
            label="Estimated monthly payment"
            value={formatCurrency(monthly || 0)}
          />
          <Row
            label="Principal & interest"
            value={formatCurrency(principalAndInterest || 0)}
          />
          <Row label="Taxes" value={formatCurrency(parseNumber(taxes))} />
          <Row label="Insurance" value={formatCurrency(parseNumber(insurance))} />
        </div>
      </div>
    </div>
  );
};

const DebtPayoffCalculator = () => {
  const [balance, setBalance] = useState('12000');
  const [rate, setRate] = useState('19.9');
  const [payment, setPayment] = useState('400');

  const bal = parseNumber(balance);
  const r = parseNumber(rate) / 100 / 12;
  const pmt = parseNumber(payment);

  let months = 0;
  let remaining = bal;
  let totalInterest = 0;

  if (bal > 0 && pmt > 0 && pmt > bal * r) {
    while (remaining > 0 && months < 600) {
      const interestPortion = remaining * r;
      const principalPortion = pmt - interestPortion;
      remaining -= principalPortion;
      totalInterest += interestPortion;
      months += 1;
    }
  }

  const years = months / 12;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Debt Payoff</h2>
      <p className="text-sm text-slate-600 max-w-2xl">
        See how long it takes to clear a balance with a fixed monthly payment. Increase
        the payment and watch the payoff time drop.
      </p>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="rounded-2xl bg-white p-5 shadow border border-slate-100 space-y-4">
          <Field label="Balance" prefix="$" value={balance} onChange={setBalance} />
          <Field label="Interest rate" suffix="%" value={rate} onChange={setRate} />
          <Field
            label="Monthly payment"
            prefix="$"
            value={payment}
            onChange={setPayment}
          />
        </div>

        <div className="rounded-2xl bg-white p-5 shadow border border-slate-100 space-y-2">
          {months === 0 ? (
            <p className="text-sm text-slate-500">
              Payment must be higher than monthly interest to create a payoff schedule.
            </p>
          ) : (
            <>
              <Metric
                label="Time to payoff"
                value={`${months} months (${years.toFixed(1)} years)`}
              />
              <Row
                label="Total interest"
                value={formatCurrency(totalInterest || 0)}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const SavingsCalculator = () => {
  const [monthly, setMonthly] = useState('500');
  const [rate, setRate] = useState('7');
  const [years, setYears] = useState('10');

  const m = parseNumber(monthly);
  const r = parseNumber(rate) / 100 / 12;
  const n = parseNumber(years) * 12;

  const fv =
    r === 0 ? m * n : m * ((Math.pow(1 + r, n) - 1) / r);

  const simpleChart = Array.from(
    { length: years ? parseInt(years, 10) + 1 : 0 },
    (_, i) => {
      const months = i * 12;
      const val =
        r === 0 ? m * months : m * ((Math.pow(1 + r, months) - 1) / r);
      return { year: i, value: val };
    }
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">
        Savings & Investment Growth
      </h2>
      <p className="text-sm text-slate-600 max-w-2xl">
        See how consistent monthly investing grows over time using compound interest.
      </p>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="rounded-2xl bg-white p-5 shadow border border-slate-100 space-y-4">
          <Field
            label="Monthly contribution"
            prefix="$"
            value={monthly}
            onChange={setMonthly}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Expected annual return"
              suffix="%"
              value={rate}
              onChange={setRate}
            />
            <Field label="Years" value={years} onChange={setYears} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl bg-white p-5 shadow border border-slate-100">
            <Metric
              label="Projected future value"
              value={formatCurrency(fv || 0)}
            />
          </div>

          <div className="rounded-2xl bg-white p-4 shadow border border-slate-100 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={simpleChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#16a34a" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------- shared small UI pieces ---------- */

const Field = ({ label, value, onChange, prefix, suffix }) => (
  <label className="flex flex-col gap-1 text-sm text-slate-700">
    <span>{label}</span>
    <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
      {prefix && <span className="mr-1 text-slate-400 text-xs">{prefix}</span>}
      <input
        className="w-full bg-transparent text-sm text-slate-900 outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode="decimal"
      />
      {suffix && <span className="ml-1 text-slate-400 text-xs">{suffix}</span>}
    </div>
  </label>
);

const Metric = ({ label, value }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
    <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">
      {label}
    </div>
    <div className="text-xl font-semibold text-slate-900 font-mono">
      {value}
    </div>
  </div>
);

const Row = ({ label, value }) => (
  <div className="flex justify-between gap-4 text-sm text-slate-700">
    <span>{label}</span>
    <span className="font-mono">{value}</span>
  </div>
);

/* =========================================================
   MAIN APP SHELL
   ========================================================= */

const FinancialCalculatorApp = () => {
  const [activeTab, setActiveTab] = useState('budget');
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-900 to-teal-600 p-2 rounded-xl">
              <Calculator className="text-white" size={22} />
            </div>
            <div>
              <div className="text-lg font-bold bg-gradient-to-r from-blue-900 to-teal-600 bg-clip-text text-transparent">
                MoneyMap
              </div>
              <div className="text-xs text-slate-500">
                Chart your financial picture in private.
              </div>
            </div>
          </div>
          <button
            className="md:hidden p-2 rounded-lg border border-slate-200"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <Menu size={18} />
          </button>
        </div>
      </header>

      {/* Nav */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div
            className={`flex flex-wrap gap-2 ${
              menuOpen ? '' : 'max-md:hidden md:flex'
            }`}
          >
            <NavButton
              icon={DollarSign}
              label="Budget"
              active={activeTab === 'budget'}
              onClick={() => setActiveTab('budget')}
            />
            <NavButton
              icon={Car}
              label="Auto Loan"
              active={activeTab === 'auto'}
              onClick={() => setActiveTab('auto')}
            />
            <NavButton
              icon={Home}
              label="Mortgage"
              active={activeTab === 'mortgage'}
              onClick={() => setActiveTab('mortgage')}
            />
            <NavButton
              icon={CreditCard}
              label="Debt Payoff"
              active={activeTab === 'debt'}
              onClick={() => setActiveTab('debt')}
            />
            <NavButton
              icon={PiggyBank}
              label="Savings"
              active={activeTab === 'savings'}
              onClick={() => setActiveTab('savings')}
            />
            <NavButton
              icon={TrendingUp}
              label="Real Estate ROI"
              active={activeTab === 'realEstateRoi'}
              onClick={() => setActiveTab('realEstateRoi')}
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'budget' && <BudgetCalculator />}
        {activeTab === 'auto' && <AutoLoanCalculator />}
        {activeTab === 'mortgage' && <MortgageCalculator />}
        {activeTab === 'debt' && <DebtPayoffCalculator />}
        {activeTab === 'savings' && <SavingsCalculator />}
        {activeTab === 'realEstateRoi' && <RealEstateRoiCalculator />}
      </main>

      <footer className="border-t border-slate-200 py-4 mt-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 px-4">
          <Info size={14} />
          <span>
            These tools help you understand your numbers. They do not replace
            personalized advice from a professional.
          </span>
        </div>
      </footer>
    </div>
  );
};

const NavButton = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
      active
        ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow'
        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
    }`}
  >
    <Icon size={18} />
    {label}
  </button>
);

export default FinancialCalculatorApp;
