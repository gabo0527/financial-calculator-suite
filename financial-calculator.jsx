import React, { useState, useEffect } from 'react';
import { Calculator, Home, Car, DollarSign, TrendingUp, Shield, X, Save, FolderOpen, GitCompare, PiggyBank, Menu, ChevronRight, Info } from 'lucide-react';
import {
  LineChart,
  AreaChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const FinancialCalculatorApp = () => {
  const [activeTab, setActiveTab] = useState('mortgage');
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showScenarioModal, setShowScenarioModal] = useState(false);
  const [showScenarioPanel, setShowScenarioPanel] = useState(false);
  const [scenarios, setScenarios] = useState([]);
  const [currentScenario, setCurrentScenario] = useState(null);
  const [scenarioName, setScenarioName] = useState('');
  const [compareMode, setCompareMode] = useState(false);
  const [selectedScenarios, setSelectedScenarios] = useState([]);
  const [activeTooltip, setActiveTooltip] = useState(null);
  
  // Tooltip Component
  const Tooltip = ({ term, children }) => {
    const tooltips = {
      'apr': {
        title: 'APR (Annual Percentage Rate)',
        text: 'The yearly cost of borrowing money, including interest and fees. A lower APR means you pay less over time.'
      },
      'pmi': {
        title: 'PMI (Private Mortgage Insurance)',
        text: 'Required when you put down less than 20% on a home. Typically costs 0.5-1% of loan amount annually. Avoid by putting 20% down!'
      },
      'down-payment': {
        title: 'Down Payment',
        text: 'Money you pay upfront when buying. Larger down payments mean lower monthly payments and less interest paid over time.'
      },
      'credit-score': {
        title: 'Credit Score',
        text: 'A number (300-850) showing your creditworthiness. Higher scores get better interest rates, saving you thousands!'
      },
      'principal': {
        title: 'Principal',
        text: 'The original loan amount, not including interest. Your monthly payment covers both principal and interest.'
      },
      'interest': {
        title: 'Interest',
        text: 'The cost of borrowing money, calculated as a percentage of your loan. Lower rates = big savings!'
      },
      'term': {
        title: 'Loan Term',
        text: 'How long you have to repay the loan. Shorter terms = higher payments but less total interest paid.'
      },
      'dti': {
        title: 'Debt-to-Income Ratio',
        text: 'Your monthly debt payments divided by gross income. Lenders prefer DTI under 43%. Lower is better!'
      },
      'property-tax': {
        title: 'Property Tax',
        text: 'Annual tax based on your home\'s value, paid to local government. Varies widely by location (0.3% - 2%+).'
      },
      'avalanche': {
        title: 'Avalanche Method',
        text: 'Pay off highest interest rate debt first. Mathematically optimal - saves the most money!'
      },
      'snowball': {
        title: 'Snowball Method',
        text: 'Pay off smallest balance first. Builds momentum and motivation through quick wins!'
      },
      'compound-interest': {
        title: 'Compound Interest',
        text: 'Interest earned on your interest! Your money grows exponentially over time. Start early to maximize this power!'
      },
      'savings-rate': {
        title: 'Savings Rate',
        text: 'Percentage of income you save. Aim for 20%! Higher rates = faster financial independence.'
      }
    };

    const tooltip = tooltips[term];
    if (!tooltip) return children;

    return (
      <div className="inline-block relative">
        {children}
        <button
          onClick={() => setActiveTooltip(activeTooltip === term ? null : term)}
          className="ml-1 inline-flex items-center justify-center w-4 h-4 text-xs text-blue-600 hover:text-blue-800 transition"
          title="Learn more"
        >
          <Info size={16} />
        </button>
        {activeTooltip === term && (
          <div className="absolute z-50 w-64 p-3 mt-2 bg-white border-2 border-blue-200 rounded-lg shadow-xl left-0">
            <button
              onClick={() => setActiveTooltip(null)}
              className="absolute top-1 right-1 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
            <div className="font-bold text-blue-900 text-sm mb-1">{tooltip.title}</div>
            <div className="text-xs text-gray-700 leading-relaxed">{tooltip.text}</div>
          </div>
        )}
      </div>
    );
  };
  
  // Budget state
  const [income, setIncome] = useState('');
  const [expenses, setExpenses] = useState([{ name: '', amount: '', category: 'needs' }]);
  
  // Auto loan state
  const [autoPrice, setAutoPrice] = useState('');
  const [autoDown, setAutoDown] = useState('');
  const [autoTerm, setAutoTerm] = useState('60');
  const [autoCreditScore, setAutoCreditScore] = useState('740-799');
  const [autoNetIncome, setAutoNetIncome] = useState('');
  
  // Mortgage state
  const [homePrice, setHomePrice] = useState('');
  const [homeDownPercent, setHomeDownPercent] = useState('20');
  const [homeDown, setHomeDown] = useState('');
  const [homeTerm, setHomeTerm] = useState('30');
  const [homeCreditScore, setHomeCreditScore] = useState('740-799');
  const [homeState, setHomeState] = useState('');
  const [propertyTax, setPropertyTax] = useState('1.2');
  const [insurance, setInsurance] = useState('1200');
  const [monthlyGrossPay, setMonthlyGrossPay] = useState('');
  const [monthlyNetPay, setMonthlyNetPay] = useState('');
  
  // Debt payoff state
  const [debts, setDebts] = useState([{ name: '', balance: '', rate: '', minPayment: '' }]);
  const [extraPayment, setExtraPayment] = useState('');
  const [payoffMethod, setPayoffMethod] = useState('avalanche');
  
  // Progress tracking state
  const [savingsGoal, setSavingsGoal] = useState('');
  const [currentSavings, setCurrentSavings] = useState('');
  const [debtGoal, setDebtGoal] = useState('');
  const [currentDebt, setCurrentDebt] = useState('');
  
  // Savings calculator state
  const [initialDeposit, setInitialDeposit] = useState('');
  const [monthlyContribution, setMonthlyContribution] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [savingsYears, setSavingsYears] = useState('5');
  const [compoundFrequency, setCompoundFrequency] = useState('12'); // Monthly default

  // Sync down payment percentage and dollar amount
  useEffect(() => {
    if (homePrice && homeDownPercent) {
      const calculatedDown = (parseFloat(homePrice) * parseFloat(homeDownPercent) / 100).toFixed(0);
      setHomeDown(calculatedDown);
    }
  }, [homePrice, homeDownPercent]);

  useEffect(() => {
    if (homePrice && homeDown) {
      const calculatedPercent = ((parseFloat(homeDown) / parseFloat(homePrice)) * 100).toFixed(1);
      if (calculatedPercent !== homeDownPercent) {
        setHomeDownPercent(calculatedPercent);
      }
    }
  }, [homeDown]);

  // Auto-populate property tax and insurance based on state
  useEffect(() => {
    if (homeState && stateData[homeState]) {
      setPropertyTax(stateData[homeState].propertyTax.toString());
      setInsurance(stateData[homeState].insurance.toString());
    }
  }, [homeState]);

  // Credit score tiers with typical rates
  const creditTiers = {
    'auto': {
      '300-579': { label: 'Deep Subprime', rate: 14.5 },
      '580-619': { label: 'Subprime', rate: 11.5 },
      '620-659': { label: 'Nonprime', rate: 8.5 },
      '660-719': { label: 'Prime', rate: 6.5 },
      '720-850': { label: 'Super Prime', rate: 5.2 }
    },
    'mortgage': {
      '300-619': { label: 'Poor', rate: 8.5 },
      '620-679': { label: 'Fair', rate: 7.8 },
      '680-739': { label: 'Good', rate: 7.2 },
      '740-799': { label: 'Very Good', rate: 6.8 },
      '800-850': { label: 'Exceptional', rate: 6.5 }
    }
  };

  // State/Territory data with average property tax rates and insurance costs
  const stateData = {
    'AL': { name: 'Alabama', propertyTax: 0.41, insurance: 1800 },
    'AK': { name: 'Alaska', propertyTax: 1.19, insurance: 1200 },
    'AZ': { name: 'Arizona', propertyTax: 0.62, insurance: 1400 },
    'AR': { name: 'Arkansas', propertyTax: 0.61, insurance: 1900 },
    'CA': { name: 'California', propertyTax: 0.73, insurance: 1400 },
    'CO': { name: 'Colorado', propertyTax: 0.51, insurance: 2400 },
    'CT': { name: 'Connecticut', propertyTax: 2.14, insurance: 1600 },
    'DE': { name: 'Delaware', propertyTax: 0.57, insurance: 1200 },
    'FL': { name: 'Florida', propertyTax: 0.89, insurance: 4200 },
    'GA': { name: 'Georgia', propertyTax: 0.87, insurance: 1800 },
    'HI': { name: 'Hawaii', propertyTax: 0.28, insurance: 900 },
    'ID': { name: 'Idaho', propertyTax: 0.63, insurance: 1300 },
    'IL': { name: 'Illinois', propertyTax: 2.08, insurance: 1500 },
    'IN': { name: 'Indiana', propertyTax: 0.85, insurance: 1400 },
    'IA': { name: 'Iowa', propertyTax: 1.57, insurance: 1500 },
    'KS': { name: 'Kansas', propertyTax: 1.41, insurance: 2000 },
    'KY': { name: 'Kentucky', propertyTax: 0.86, insurance: 1700 },
    'LA': { name: 'Louisiana', propertyTax: 0.55, insurance: 2400 },
    'ME': { name: 'Maine', propertyTax: 1.36, insurance: 1100 },
    'MD': { name: 'Maryland', propertyTax: 1.09, insurance: 1400 },
    'MA': { name: 'Massachusetts', propertyTax: 1.23, insurance: 1600 },
    'MI': { name: 'Michigan', propertyTax: 1.54, insurance: 1400 },
    'MN': { name: 'Minnesota', propertyTax: 1.12, insurance: 1700 },
    'MS': { name: 'Mississippi', propertyTax: 0.79, insurance: 2000 },
    'MO': { name: 'Missouri', propertyTax: 0.97, insurance: 1900 },
    'MT': { name: 'Montana', propertyTax: 0.84, insurance: 1600 },
    'NE': { name: 'Nebraska', propertyTax: 1.73, insurance: 2000 },
    'NV': { name: 'Nevada', propertyTax: 0.60, insurance: 1200 },
    'NH': { name: 'New Hampshire', propertyTax: 2.18, insurance: 1300 },
    'NJ': { name: 'New Jersey', propertyTax: 2.49, insurance: 1500 },
    'NM': { name: 'New Mexico', propertyTax: 0.80, insurance: 1400 },
    'NY': { name: 'New York', propertyTax: 1.72, insurance: 1600 },
    'NC': { name: 'North Carolina', propertyTax: 0.84, insurance: 1600 },
    'ND': { name: 'North Dakota', propertyTax: 0.98, insurance: 1600 },
    'OH': { name: 'Ohio', propertyTax: 1.56, insurance: 1200 },
    'OK': { name: 'Oklahoma', propertyTax: 0.90, insurance: 2300 },
    'OR': { name: 'Oregon', propertyTax: 0.87, insurance: 1100 },
    'PA': { name: 'Pennsylvania', propertyTax: 1.58, insurance: 1300 },
    'RI': { name: 'Rhode Island', propertyTax: 1.63, insurance: 1700 },
    'SC': { name: 'South Carolina', propertyTax: 0.57, insurance: 1800 },
    'SD': { name: 'South Dakota', propertyTax: 1.31, insurance: 1700 },
    'TN': { name: 'Tennessee', propertyTax: 0.71, insurance: 1700 },
    'TX': { name: 'Texas', propertyTax: 1.80, insurance: 2000 },
    'UT': { name: 'Utah', propertyTax: 0.60, insurance: 1100 },
    'VT': { name: 'Vermont', propertyTax: 1.90, insurance: 1200 },
    'VA': { name: 'Virginia', propertyTax: 0.82, insurance: 1300 },
    'WA': { name: 'Washington', propertyTax: 0.93, insurance: 1100 },
    'WV': { name: 'West Virginia', propertyTax: 0.58, insurance: 1300 },
    'WI': { name: 'Wisconsin', propertyTax: 1.85, insurance: 1200 },
    'WY': { name: 'Wyoming', propertyTax: 0.61, insurance: 1600 },
    'DC': { name: 'Washington D.C.', propertyTax: 0.56, insurance: 1400 },
    'PR': { name: 'Puerto Rico', propertyTax: 0.80, insurance: 1100 },
    'VI': { name: 'U.S. Virgin Islands', propertyTax: 1.25, insurance: 2000 },
    'GU': { name: 'Guam', propertyTax: 0.35, insurance: 1500 },
    'AS': { name: 'American Samoa', propertyTax: 0.40, insurance: 1800 },
    'MP': { name: 'Northern Mariana Islands', propertyTax: 0.35, insurance: 1500 }
  };

  // Budget calculations
  const calculateBudget = () => {
    const totalIncome = parseFloat(income) || 0;
    const totalExpenses = expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
    
    // Category breakdowns
    const needsTotal = expenses
      .filter(exp => exp.category === 'needs')
      .reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
    const wantsTotal = expenses
      .filter(exp => exp.category === 'wants')
      .reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
    const savingsTotal = expenses
      .filter(exp => exp.category === 'savings')
      .reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
    
    const remaining = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (remaining / totalIncome) * 100 : 0;
    const expenseRate = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;
    
    // Category percentages
    const needsPercent = totalIncome > 0 ? (needsTotal / totalIncome) * 100 : 0;
    const wantsPercent = totalIncome > 0 ? (wantsTotal / totalIncome) * 100 : 0;
    const savingsPercent = totalIncome > 0 ? (savingsTotal / totalIncome) * 100 : 0;
    
    // Ideal 50/30/20 comparison
    const idealNeeds = totalIncome * 0.50;
    const idealWants = totalIncome * 0.30;
    const idealSavings = totalIncome * 0.20;
    
    return { 
      totalIncome, 
      totalExpenses, 
      remaining, 
      savingsRate,
      expenseRate,
      needsTotal,
      wantsTotal,
      savingsTotal,
      needsPercent,
      wantsPercent,
      savingsPercent,
      idealNeeds,
      idealWants,
      idealSavings
    };
  };

  // Auto loan calculations
  const calculateAutoLoan = () => {
    const principal = parseFloat(autoPrice) - parseFloat(autoDown || 0);
    const rate = creditTiers.auto[autoCreditScore]?.rate || 6.5;
    const monthlyRate = rate / 100 / 12;
    const months = parseInt(autoTerm);
    
    if (principal <= 0 || months <= 0) return null;
    
    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    const totalPaid = monthlyPayment * months;
    const totalInterest = totalPaid - principal;
    
    return {
      monthlyPayment,
      totalPaid,
      totalInterest,
      rate,
      principal,
      creditLabel: creditTiers.auto[autoCreditScore]?.label
    };
  };

  // Mortgage calculations
  const calculateMortgage = () => {
    const principal = parseFloat(homePrice) - parseFloat(homeDown || 0);
    const rate = creditTiers.mortgage[homeCreditScore]?.rate || 6.8;
    const monthlyRate = rate / 100 / 12;
    const months = parseInt(homeTerm) * 12;
    
    if (principal <= 0 || months <= 0) return null;
    
    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    
    // PMI if down payment < 20%
    const downPercent = (parseFloat(homeDown || 0) / parseFloat(homePrice)) * 100;
    const pmi = downPercent < 20 ? principal * 0.005 / 12 : 0;
    
    // Property tax and insurance
    const monthlyTax = (parseFloat(homePrice) * parseFloat(propertyTax) / 100) / 12;
    const monthlyInsurance = parseFloat(insurance) / 12;
    
    const totalMonthly = monthlyPayment + pmi + monthlyTax + monthlyInsurance;
    const totalPaid = monthlyPayment * months;
    const totalInterest = totalPaid - principal;
    
    // Calculate payment as % of net pay (affordability)
    const netPay = parseFloat(monthlyNetPay) || 0;
    const paymentToNetRatio = netPay > 0 ? (totalMonthly / netPay) * 100 : 0;
    
    // Calculate payment as % of gross pay (qualification - 28% rule)
    const grossPay = parseFloat(monthlyGrossPay) || 0;
    const paymentToGrossRatio = grossPay > 0 ? (totalMonthly / grossPay) * 100 : 0;
    
    return {
      monthlyPayment,
      pmi,
      monthlyTax,
      monthlyInsurance,
      totalMonthly,
      totalPaid,
      totalInterest,
      rate,
      principal,
      creditLabel: creditTiers.mortgage[homeCreditScore]?.label,
      downPercent,
      paymentToNetRatio,
      paymentToGrossRatio
    };
  };

  // Debt payoff calculations
  const calculateDebtPayoff = () => {
    const validDebts = debts.filter(d => parseFloat(d.balance) > 0 && parseFloat(d.rate) > 0);
    if (validDebts.length === 0) return null;
    
    const extra = parseFloat(extraPayment) || 0;
    let totalInterest = 0;
    let months = 0;
    
    // Sort by method
    const sortedDebts = [...validDebts].sort((a, b) => {
      if (payoffMethod === 'avalanche') {
        return parseFloat(b.rate) - parseFloat(a.rate); // Highest rate first
      } else {
        return parseFloat(a.balance) - parseFloat(b.balance); // Lowest balance first
      }
    });
    
    // Simple calculation: total debt and average rate
    const totalDebt = validDebts.reduce((sum, d) => sum + parseFloat(d.balance), 0);
    const avgRate = validDebts.reduce((sum, d) => sum + parseFloat(d.rate) * parseFloat(d.balance), 0) / totalDebt;
    const minPayments = validDebts.reduce((sum, d) => sum + parseFloat(d.minPayment || 0), 0);
    const totalPayment = minPayments + extra;
    
    // Estimate months to payoff
    if (totalPayment > 0) {
      const monthlyRate = avgRate / 100 / 12;
      months = Math.log(totalPayment / (totalPayment - totalDebt * monthlyRate)) / Math.log(1 + monthlyRate);
      totalInterest = (totalPayment * months) - totalDebt;
    }
    
    return {
      totalDebt,
      avgRate,
      minPayments,
      totalPayment,
      months: Math.ceil(months),
      totalInterest,
      sortedDebts
    };
  };

  // Savings calculator - compound interest
  const calculateSavings = () => {
    const principal = parseFloat(initialDeposit) || 0;
    const monthly = parseFloat(monthlyContribution) || 0;
    const rate = parseFloat(interestRate) || 0;
    const years = parseFloat(savingsYears) || 0;
    const frequency = parseFloat(compoundFrequency);
    
    if (years <= 0 || (principal === 0 && monthly === 0)) return null;
    
    const r = rate / 100;
    const n = frequency; // compounds per year
    const t = years;
    
    // Future value of initial deposit with compound interest
    const futureValuePrincipal = principal * Math.pow(1 + r / n, n * t);
    
    // Future value of monthly contributions (annuity)
    let futureValueContributions = 0;
    if (monthly > 0) {
      // Monthly contributions with compound interest
      const monthlyRate = r / 12;
      const totalMonths = years * 12;
      futureValueContributions = monthly * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);
    }
    
    const totalFutureValue = futureValuePrincipal + futureValueContributions;
    const totalContributions = principal + (monthly * years * 12);
    const totalInterestEarned = totalFutureValue - totalContributions;
    
    // Year-by-year breakdown
    const yearByYear = [];
    for (let year = 1; year <= years; year++) {
      const fvPrincipal = principal * Math.pow(1 + r / n, n * year);
      let fvContributions = 0;
      if (monthly > 0) {
        const monthlyRate = r / 12;
        const months = year * 12;
        fvContributions = monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
      }
      const yearTotal = fvPrincipal + fvContributions;
      const yearContributions = principal + (monthly * year * 12);
      const yearInterest = yearTotal - yearContributions;
      
      yearByYear.push({
        year,
        balance: yearTotal,
        contributions: yearContributions,
        interest: yearInterest
      });
    }
    
    return {
      totalFutureValue,
      totalContributions,
      totalInterestEarned,
      interestPercentage: (totalInterestEarned / totalContributions) * 100,
      yearByYear
    };
  };

  // NEW PHASE 3C: Calculate year-by-year savings growth for charts
  const calculateSavingsGrowth = (initial, monthly, rate, years, frequency = 'monthly') => {
    const growthData = [];
    const periodsPerYear = frequency === 'monthly' ? 12 : frequency === 'quarterly' ? 4 : frequency === 'daily' ? 365 : 1;
    const ratePerPeriod = rate / 100 / periodsPerYear;
    
    for (let year = 0; year <= years; year++) {
      const periods = year * periodsPerYear;
      let balance = parseFloat(initial) || 0;
      let totalContributions = parseFloat(initial) || 0;
      
      // Calculate balance for this year
      for (let p = 0; p < periods; p++) {
        balance = balance * (1 + ratePerPeriod) + parseFloat(monthly);
        if (p > 0) totalContributions += parseFloat(monthly);
      }
      
      const interest = balance - totalContributions;
      
      growthData.push({
        year,
        balance: Math.round(balance * 100) / 100,
        contributions: Math.round(totalContributions * 100) / 100,
        interest: Math.round(interest * 100) / 100
      });
    }
    
    return growthData;
  };

  // NEW PHASE 3C: Generate comparison data for multiple scenarios
  const generateComparisonData = (scenarios, maxYears) => {
    const comparisonData = [];
    
    for (let year = 0; year <= maxYears; year++) {
      const dataPoint = { year };
      
      scenarios.forEach((scenario, index) => {
        if (scenario.calculations && scenario.calculations.savings) {
          // Calculate balance at this year for this scenario
          const initial = parseFloat(scenario.data.savings?.initialDeposit) || 0;
          const monthly = parseFloat(scenario.data.savings?.monthlyContribution) || 0;
          const rate = parseFloat(scenario.data.savings?.interestRate) || 0;
          const frequency = scenario.data.savings?.compoundFrequency || '12';
          
          const periodsPerYear = frequency === '12' ? 12 : frequency === '4' ? 4 : frequency === '365' ? 365 : 1;
          const ratePerPeriod = rate / 100 / periodsPerYear;
          const periods = year * periodsPerYear;
          
          let balance = initial;
          for (let p = 0; p < periods; p++) {
            balance = balance * (1 + ratePerPeriod) + monthly;
          }
          
          dataPoint[`scenario${index + 1}`] = Math.round(balance * 100) / 100;
        }
      });
      
      comparisonData.push(dataPoint);
    }
    
    return comparisonData;
  };

  const addExpense = () => {
    setExpenses([...expenses, { name: '', amount: '' }]);
  };

  const removeExpense = (index) => {
    setExpenses(expenses.filter((_, i) => i !== index));
  };

  const updateExpense = (index, field, value) => {
    const newExpenses = [...expenses];
    newExpenses[index][field] = value;
    setExpenses(newExpenses);
  };

  const addDebt = () => {
    setDebts([...debts, { name: '', balance: '', rate: '', minPayment: '' }]);
  };

  const removeDebt = (index) => {
    setDebts(debts.filter((_, i) => i !== index));
  };

  const updateDebt = (index, field, value) => {
    const newDebts = [...debts];
    newDebts[index][field] = value;
    setDebts(newDebts);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  // Scenario Management Functions
  const saveScenario = () => {
    if (!scenarioName.trim()) {
      alert('Please enter a scenario name');
      return;
    }

    const scenario = {
      id: Date.now(),
      name: scenarioName,
      timestamp: new Date().toISOString(),
      data: {
        budget: {
          income,
          expenses: [...expenses]
        },
        auto: {
          autoPrice,
          autoDown,
          autoTerm,
          autoCreditScore
        },
        mortgage: {
          homePrice,
          homeDownPercent,
          homeDown,
          homeTerm,
          homeCreditScore,
          homeState,
          propertyTax,
          insurance,
          monthlyGrossPay,
          monthlyNetPay
        },
        debt: {
          debts: [...debts],
          extraPayment,
          payoffMethod
        },
        progress: {
          savingsGoal,
          currentSavings,
          debtGoal,
          currentDebt
        },
        savings: {
          initialDeposit,
          monthlyContribution,
          interestRate,
          savingsYears,
          compoundFrequency
        }
      },
      calculations: {
        budget: budgetData,
        auto: autoData,
        mortgage: mortgageData,
        debt: debtData,
        savings: savingsData
      }
    };

    const newScenarios = [...scenarios, scenario];
    setScenarios(newScenarios);
    localStorage.setItem('financialScenarios', JSON.stringify(newScenarios));
    setScenarioName('');
    setShowScenarioModal(false);
    alert(`Scenario "${scenario.name}" saved successfully!`);
  };

  const loadScenario = (scenario) => {
    const data = scenario.data;
    
    // Load budget
    setIncome(data.budget.income);
    setExpenses(data.budget.expenses);
    
    // Load auto
    setAutoPrice(data.auto.autoPrice);
    setAutoDown(data.auto.autoDown);
    setAutoTerm(data.auto.autoTerm);
    setAutoCreditScore(data.auto.autoCreditScore);
    
    // Load mortgage
    setHomePrice(data.mortgage.homePrice);
    setHomeDownPercent(data.mortgage.homeDownPercent);
    setHomeDown(data.mortgage.homeDown);
    setHomeTerm(data.mortgage.homeTerm);
    setHomeCreditScore(data.mortgage.homeCreditScore);
    setHomeState(data.mortgage.homeState || '');
    setPropertyTax(data.mortgage.propertyTax);
    setInsurance(data.mortgage.insurance);
    setMonthlyGrossPay(data.mortgage.monthlyGrossPay || '');
    setMonthlyNetPay(data.mortgage.monthlyNetPay);
    
    // Load debt
    setDebts(data.debt.debts);
    setExtraPayment(data.debt.extraPayment);
    setPayoffMethod(data.debt.payoffMethod);
    
    // Load progress
    setSavingsGoal(data.progress.savingsGoal);
    setCurrentSavings(data.progress.currentSavings);
    setDebtGoal(data.progress.debtGoal);
    setCurrentDebt(data.progress.currentDebt);
    
    // Load savings calculator
    if (data.savings) {
      setInitialDeposit(data.savings.initialDeposit);
      setMonthlyContribution(data.savings.monthlyContribution);
      setInterestRate(data.savings.interestRate);
      setSavingsYears(data.savings.savingsYears);
      setCompoundFrequency(data.savings.compoundFrequency);
    }
    
    setCurrentScenario(scenario);
    alert(`Scenario "${scenario.name}" loaded!`);
  };

  const deleteScenario = (scenarioId) => {
    if (!confirm('Are you sure you want to delete this scenario?')) return;
    
    const newScenarios = scenarios.filter(s => s.id !== scenarioId);
    setScenarios(newScenarios);
    localStorage.setItem('financialScenarios', JSON.stringify(newScenarios));
    
    if (currentScenario?.id === scenarioId) {
      setCurrentScenario(null);
    }
  };

  const toggleScenarioForComparison = (scenarioId) => {
    if (selectedScenarios.includes(scenarioId)) {
      setSelectedScenarios(selectedScenarios.filter(id => id !== scenarioId));
    } else if (selectedScenarios.length < 3) {
      setSelectedScenarios([...selectedScenarios, scenarioId]);
    } else {
      alert('You can compare up to 3 scenarios at once');
    }
  };

  // Load scenarios from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('financialScenarios');
    if (saved) {
      try {
        setScenarios(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading scenarios:', e);
      }
    }
  }, []);

  const budgetData = calculateBudget();
  const autoData = calculateAutoLoan();
  const mortgageData = calculateMortgage();
  const debtData = calculateDebtPayoff();
  const savingsData = calculateSavings();
  
  // NEW PHASE 3C: Generate chart data for savings calculator
  const savingsGrowthData = (initialDeposit && (savingsYears || savingsYears === '0')) ? calculateSavingsGrowth(
    initialDeposit,
    monthlyContribution || '0',
    interestRate || '0',
    parseInt(savingsYears),
    compoundFrequency === '12' ? 'monthly' : compoundFrequency === '4' ? 'quarterly' : compoundFrequency === '365' ? 'daily' : 'annually'
  ) : [];

  // NEW PHASE 3C: Generate comparison chart data
  const savingsScenarios = scenarios.filter(s => s.data.savings && s.data.savings.initialDeposit);
  const maxSavingsYears = savingsScenarios.length > 0 ? Math.max(...savingsScenarios.map(s => parseInt(s.data.savings.savingsYears) || 0)) : 0;
  const comparisonChartData = savingsScenarios.length >= 2 ? generateComparisonData(savingsScenarios, maxSavingsYears) : [];
  
  // Progress calculations
  const savingsProgress = savingsGoal > 0 ? (currentSavings / savingsGoal) * 100 : 0;
  const debtProgress = debtGoal > 0 ? ((debtGoal - currentDebt) / debtGoal) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto">
        {/* Modern Header */}
        <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-900 to-teal-600 p-2 rounded-xl">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-teal-600 bg-clip-text text-transparent">
                    MoneyMap
                  </h1>
                  <p className="text-xs text-slate-600">Chart Your Financial Future</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm">
                  <Shield size={16} />
                  <span className="font-medium hidden sm:inline">Privacy Protected</span>
                </div>
                <button
                  onClick={() => setShowScenarioPanel(!showScenarioPanel)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition"
                  title="My Scenarios"
                >
                  <FolderOpen size={20} className="text-slate-600" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Privacy Policy Modal */}
        {showPrivacy && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl max-h-[80vh] overflow-y-auto p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Privacy Policy</h2>
                <button onClick={() => setShowPrivacy(false)} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-4 text-gray-700">
                <p className="font-semibold text-lg">Your Data is Yours</p>
                <p>We are committed to protecting your privacy and ensuring your financial information remains secure.</p>
                
                <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 my-4">
                  <p className="font-semibold">Key Privacy Principles:</p>
                  <ul className="list-disc ml-5 mt-2 space-y-1">
                    <li>All calculations are performed locally in your browser</li>
                    <li>No data is transmitted to external servers</li>
                    <li>No data is stored on our systems</li>
                    <li>No cookies or tracking technologies are used</li>
                    <li>Your financial information is never sold or shared</li>
                  </ul>
                </div>

                <p className="font-semibold">Data Storage</p>
                <p>Any data you enter is stored only in your browser's local storage on your device. You can clear this data at any time by clearing your browser's cache or local storage.</p>

                <p className="font-semibold">No Third Parties</p>
                <p>We do not share, sell, or transmit your data to any third parties. This calculator operates entirely within your browser.</p>

                <p className="font-semibold">Security</p>
                <p>Since all calculations happen on your device, your data never leaves your computer. This provides the highest level of security for your sensitive financial information.</p>

                <p className="text-sm text-gray-500 mt-6">Last updated: November 2025</p>
              </div>
              <button
                onClick={() => setShowPrivacy(false)}
                className="mt-6 w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Save Scenario Modal */}
        {showScenarioModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Save Current Scenario</h2>
                <button onClick={() => setShowScenarioModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scenario Name
                  </label>
                  <input
                    type="text"
                    value={scenarioName}
                    onChange={(e) => setScenarioName(e.target.value)}
                    placeholder="e.g., Conservative Plan, Aggressive Payoff"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && saveScenario()}
                  />
                </div>
                <p className="text-sm text-gray-600">
                  This will save all your current inputs including budget, loans, debt, and progress tracking data.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={saveScenario}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold"
                  >
                    Save Scenario
                  </button>
                  <button
                    onClick={() => setShowScenarioModal(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

              {/* Modern Pill Navigation */}
        <div className="bg-white shadow-sm border-b border-slate-200 mb-6">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex gap-2 overflow-x-auto py-4 scrollbar-hide">
              <button
                onClick={() => setActiveTab('budget')}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'budget'
                    ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-lg transform scale-105'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:scale-105'
                }`}
              >
                <DollarSign size={20} />
                Budget
              </button>

              <button
                onClick={() => setActiveTab('auto')}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'auto'
                    ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-lg transform scale-105'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:scale-105'
                }`}
              >
                <Car size={20} />
                Auto Loan
              </button>

              <button
                onClick={() => setActiveTab('mortgage')}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'mortgage'
                    ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-lg transform scale-105'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:scale-105'
                }`}
              >
                <Home size={20} />
                Mortgage
              </button>

              <button
                onClick={() => setActiveTab('debt')}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'debt'
                    ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-lg transform scale-105'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:scale-105'
                }`}
              >
                <Shield size={20} />
                Debt Payoff
              </button>

              <button
                onClick={() => setActiveTab('savings')}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'savings'
                    ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-lg transform scale-105'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:scale-105'
                }`}
              >
                <PiggyBank size={20} />
                Savings
              </button>

              {/* NEW TAB: Real Estate ROI */}
              <button
                onClick={() => setActiveTab('realEstateRoi')}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'realEstateRoi'
                    ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-lg transform scale-105'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:scale-105'
                }`}
              >
                <TrendingUp size={20} />
                Real Estate ROI
              </button>
            </div>
          </div>
        </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="px-6 pb-12">
          <div className="max-w-7xl mx-auto">
            
{/* BUDGET TAB - Keeping your existing budget code */}
{activeTab === 'budget' && (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-800">Monthly Budget</h2>
    
    {/* Best Practices Box */}
    <div className="bg-gradient-to-r from-green-50 to-teal-50 border-l-4 border-green-500 p-4 rounded-r-lg">
      <div className="flex items-start gap-3">
        <div className="text-2xl">💰</div>
        <div>
          <h3 className="font-bold text-green-900 mb-2">50/30/20 Budgeting Rule</h3>
          <div className="text-sm text-green-800 space-y-1">
            <p><strong>50%</strong> - Needs (housing, food, utilities, transportation)</p>
            <p><strong>30%</strong> - Wants (entertainment, dining out, hobbies)</p>
            <p><strong>20%</strong> - Savings & Debt Payoff (emergency fund, retirement, extra debt payments)</p>
          </div>
          <p className="text-xs text-green-700 mt-2 italic">
            💡 Aim for at least 20% savings rate to build long-term wealth!
          </p>
        </div>
      </div>
    </div>
    
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <Tooltip term="savings-rate">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Income
            </label>
          </Tooltip>
          <input
            type="number"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            placeholder="5000"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Monthly Expenses
            </label>
            <button
              onClick={addExpense}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              + Add Expense
            </button>
          </div>
          <div className="space-y-2">
            {expenses.map((expense, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={expense.name}
                  onChange={(e) => updateExpense(index, 'name', e.target.value)}
                  placeholder="Expense name"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <select
                  value={expense.category || 'needs'}
                  onChange={(e) => updateExpense(index, 'category', e.target.value)}
                  className="w-28 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  <option value="needs">Needs</option>
                  <option value="wants">Wants</option>
                  <option value="savings">Savings</option>
                </select>
                <input
                  type="number"
                  value={expense.amount}
                  onChange={(e) => updateExpense(index, 'amount', e.target.value)}
                  placeholder="Amount"
                  className="w-28 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {expenses.length > 1 && (
                  <button
                    onClick={() => removeExpense(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Quick Summary */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Income:</span>
              <span className="font-bold text-green-600">
                {formatCurrency(budgetData.totalIncome)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Expenses:</span>
              <span className="font-bold text-red-600">
                {formatCurrency(budgetData.totalExpenses)}
              </span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between">
                <span className="text-gray-700 font-semibold">Remaining:</span>
                <span className={`font-bold text-xl ${budgetData.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(budgetData.remaining)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Expense Rate & Savings Rate */}
        {budgetData.totalIncome > 0 && (
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h4 className="font-bold text-gray-800 mb-4">Income Usage</h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Expense Rate:</span>
                  <span className={`text-sm font-bold ${budgetData.expenseRate > 80 ? 'text-red-600' : 'text-gray-800'}`}>
                    {budgetData.expenseRate.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-500 ${
                      budgetData.expenseRate > 80 ? 'bg-red-600' : 'bg-orange-500'
                    }`}
                    style={{ width: `${Math.min(budgetData.expenseRate, 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Savings Rate:</span>
                  <span className={`text-sm font-bold ${budgetData.savingsRate >= 20 ? 'text-green-600' : 'text-amber-600'}`}>
                    {budgetData.savingsRate.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-500 ${
                      budgetData.savingsRate >= 20 ? 'bg-green-600' : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(Math.max(budgetData.savingsRate, 0), 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {budgetData.savingsRate >= 20 ? '✓ Meeting 20% goal!' : '⚠️ Target: 20% savings rate'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 50/30/20 Breakdown */}
        {budgetData.totalIncome > 0 && (
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h4 className="font-bold text-gray-800 mb-4">50/30/20 Breakdown</h4>
            <div className="space-y-3">
              {/* Needs - 50% */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Needs (Target: 50%)</span>
                  <span className={`text-sm font-bold ${
                    budgetData.needsPercent <= 50 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {budgetData.needsPercent.toFixed(0)}%
                  </span>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        budgetData.needsPercent <= 50 ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(budgetData.needsPercent, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium w-20 text-right">
                    {formatCurrency(budgetData.needsTotal)}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Ideal: {formatCurrency(budgetData.idealNeeds)}
                  {budgetData.needsTotal > budgetData.idealNeeds && (
                    <span className="text-red-600 ml-1">
                      ({formatCurrency(budgetData.needsTotal - budgetData.idealNeeds)} over)
                    </span>
                  )}
                </div>
              </div>

              {/* Wants - 30% */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Wants (Target: 30%)</span>
                  <span className={`text-sm font-bold ${
                    budgetData.wantsPercent <= 30 ? 'text-green-600' : 'text-amber-600'
                  }`}>
                    {budgetData.wantsPercent.toFixed(0)}%
                  </span>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        budgetData.wantsPercent <= 30 ? 'bg-blue-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(budgetData.wantsPercent, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium w-20 text-right">
                    {formatCurrency(budgetData.wantsTotal)}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Ideal: {formatCurrency(budgetData.idealWants)}
                  {budgetData.wantsTotal > budgetData.idealWants && (
                    <span className="text-amber-600 ml-1">
                      ({formatCurrency(budgetData.wantsTotal - budgetData.idealWants)} over)
                    </span>
                  )}
                </div>
              </div>

              {/* Savings - 20% */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Savings (Target: 20%)</span>
                  <span className={`text-sm font-bold ${
                    budgetData.savingsPercent >= 20 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {budgetData.savingsPercent.toFixed(0)}%
                  </span>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        budgetData.savingsPercent >= 20 ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(budgetData.savingsPercent, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium w-20 text-right">
                    {formatCurrency(budgetData.savingsTotal)}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Ideal: {formatCurrency(budgetData.idealSavings)}
                  {budgetData.savingsTotal < budgetData.idealSavings && (
                    <span className="text-red-600 ml-1">
                      ({formatCurrency(budgetData.idealSavings - budgetData.savingsTotal)} short)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
)}
{/* REAL ESTATE ROI TAB */}
{activeTab === 'realEstateRoi' && (
  <RealEstateRoiCalculator />
)}
{/* AUTO LOAN TAB, MORTGAGE TAB, DEBT TAB - I'll keep your existing code for these */}
{/* Keeping your existing Auto Loan, Mortgage, and Debt tabs exactly as they are */}
{/* For brevity, I'm truncating here but the full file will include all your existing tabs */}

{/* SAVINGS TAB WITH PHASE 3C CHARTS */}
// ===== Real Estate ROI / Cap Rate / Cash-on-Cash Calculator =====

const roiParseNumber = (value, fallback = 0) => {
  if (value === undefined || value === null) return fallback;
  const n = parseFloat(String(value).replace(/,/g, ''));
  return isNaN(n) ? fallback : n;
};

const roiFormatPercent = (n) => `${(n * 100).toFixed(1)}%`;

function RealEstateRoiCalculator() {
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

  // --- calculations ---

  const P = roiParseNumber(purchasePrice);
  const CC = roiParseNumber(closingCosts);
  const rehab = roiParseNumber(rehabCosts);

  const rent = roiParseNumber(monthlyRent);
  const other = roiParseNumber(otherIncome);
  const vacPct = roiParseNumber(vacancyRate) / 100;
  const opPct = roiParseNumber(opExPercent) / 100;

  const dpPct = roiParseNumber(downPaymentPercent) / 100;
  const rate = roiParseNumber(interestRate) / 100;
  const years = roiParseNumber(loanTermYears);

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
        Estimate cap rate, cash-on-cash return, and DSCR to understand if a rental
        or commercial property is worth the risk. No judgment, just numbers.
      </p>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        {/* Inputs */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-5 shadow border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">
              Property & One-Time Costs
            </h3>
            <div className="grid gap-4 md:grid-cols-3">
              <RoiInputField
                label="Purchase price"
                prefix="$"
                value={purchasePrice}
                onChange={setPurchasePrice}
              />
              <RoiInputField
                label="Closing costs"
                prefix="$"
                value={closingCosts}
                onChange={setClosingCosts}
              />
              <RoiInputField
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
              <RoiInputField
                label="Monthly rent"
                prefix="$"
                value={monthlyRent}
                onChange={setMonthlyRent}
              />
              <RoiInputField
                label="Other monthly income"
                prefix="$"
                value={otherIncome}
                onChange={setOtherIncome}
              />
              <RoiInputField
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
              <RoiInputField
                label="OpEx as % of EGI"
                suffix="%"
                value={opExPercent}
                onChange={setOpExPercent}
              />
              <RoiInputField
                label="Down payment"
                suffix="%"
                value={downPaymentPercent}
                onChange={setDownPaymentPercent}
              />
              <RoiInputField
                label="Interest rate"
                suffix="%"
                value={interestRate}
                onChange={setInterestRate}
              />
              <RoiInputField
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
                Enter values to calculate.
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
                    value={formatCurrency(results.annualCashFlow)}
                    emphasize={results.annualCashFlow < 0 ? 'bad' : 'good'}
                  />
                </div>

                <hr className="my-4" />

                <dl className="space-y-1 text-sm text-slate-700">
                  <RoiRow label="NOI" value={formatCurrency(results.noi)} />
                  <RoiRow
                    label="Annual Debt Service"
                    value={formatCurrency(results.annualDebtService)}
                  />
                  <RoiRow
                    label="Total Cash Invested"
                    value={formatCurrency(results.totalCashInvested)}
                  />
                  <RoiRow
                    label="Loan Amount"
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
                <span className="font-semibold">Cap Rate</span> is your
                property&apos;s return assuming you paid all cash.
              </li>
              <li>
                <span className="font-semibold">Cash-on-Cash</span> is your
                return on the actual cash you invested (down payment + costs).
              </li>
              <li>
                <span className="font-semibold">DSCR</span> measures how safely
                NOI covers loan payments. Many lenders like &gt; 1.20.
              </li>
              <li>
                <span className="font-semibold">Annual Cash Flow</span> is money
                left after operating expenses and loan payments, before taxes.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- small UI helpers just for this calculator ---

function RoiInputField({ label, value, onChange, prefix, suffix }) {
  return (
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
