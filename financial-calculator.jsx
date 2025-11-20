import React, { useState, useEffect } from 'react';
import { Calculator, Home, Car, DollarSign, TrendingUp, Shield, X, Save, FolderOpen, GitCompare, PiggyBank, Menu, ChevronRight, Info } from 'lucide-react';

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
                <Calculator size={20} />
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
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="px-6 pb-12">
          <div className="max-w-7xl mx-auto">
            {/* Budget Tab */}
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

            {/* Auto Loan Tab */}
            {activeTab === 'auto' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800">Auto Loan Calculator</h2>
                
                {/* Financial Insight Box */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">💡</div>
                    <div>
                      <h3 className="font-bold text-blue-900 mb-1">Smart Auto Buying</h3>
                      <p className="text-sm text-blue-800 leading-relaxed">
                        <strong>The 10% Rule:</strong> Keep your auto payment under 10% of your monthly net (take-home) income. This ensures you can comfortably afford the payment while meeting other financial obligations and saving for the future.
                      </p>
                      <p className="text-sm text-blue-800 mt-2 leading-relaxed">
                        <strong>Pro Tip:</strong> A larger down payment (20%+) and shorter loan term (48-60 months) will save you thousands in interest and build equity faster.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vehicle Price
                      </label>
                      <input
                        type="number"
                        value={autoPrice}
                        onChange={(e) => setAutoPrice(e.target.value)}
                        placeholder="35000"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Down Payment
                      </label>
                      <input
                        type="number"
                        value={autoDown}
                        onChange={(e) => setAutoDown(e.target.value)}
                        placeholder="5000"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Loan Term (months)
                      </label>
                      <select
                        value={autoTerm}
                        onChange={(e) => setAutoTerm(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="36">36 months (3 years)</option>
                        <option value="48">48 months (4 years)</option>
                        <option value="60">60 months (5 years)</option>
                        <option value="72">72 months (6 years)</option>
                        <option value="84">84 months (7 years)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Credit Score Range
                      </label>
                      <select
                        value={autoCreditScore}
                        onChange={(e) => setAutoCreditScore(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        {Object.entries(creditTiers.auto).map(([range, data]) => (
                          <option key={range} value={range}>
                            {range} - {data.label} ({data.rate}% APR)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Monthly Net Income (after taxes) <span className="text-xs text-gray-500">- Optional</span>
                      </label>
                      <input
                        type="number"
                        value={autoNetIncome}
                        onChange={(e) => setAutoNetIncome(e.target.value)}
                        placeholder="4000"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        💡 Used to check if payment fits the 10% rule of thumb
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Loan Summary</h3>
                    {autoData ? (
                      <div className="space-y-3">
                        <div className="bg-white rounded-lg p-4 mb-4">
                          <div className="text-sm text-gray-600 mb-1">Credit Tier</div>
                          <div className="font-bold text-indigo-600">{autoData.creditLabel}</div>
                          <div className="text-sm text-gray-600 mt-1">Interest Rate: {autoData.rate}%</div>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Loan Amount:</span>
                          <span className="font-bold">{formatCurrency(autoData.principal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Monthly Payment:</span>
                          <span className="font-bold text-xl text-indigo-600">
                            {formatCurrency(autoData.monthlyPayment)}
                          </span>
                        </div>
                        <div className="border-t pt-3 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Paid:</span>
                            <span className="font-semibold">{formatCurrency(autoData.totalPaid)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Interest:</span>
                            <span className="font-semibold text-red-600">
                              {formatCurrency(autoData.totalInterest)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                          <div className="text-sm text-yellow-800">
                            <strong>Interest Cost:</strong> You'll pay {formatCurrency(autoData.totalInterest)} in interest over the life of the loan ({((autoData.totalInterest / autoData.principal) * 100).toFixed(1)}% of loan amount).
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">Enter vehicle details to see calculations</p>
                    )}

                    {/* Affordability Checker - 10% Rule */}
                    {autoData && autoNetIncome && parseFloat(autoNetIncome) > 0 && (
                      <div className="mt-4">
                        {(() => {
                          const netIncome = parseFloat(autoNetIncome);
                          const payment = autoData.monthlyPayment;
                          const percentage = (payment / netIncome) * 100;
                          
                          let bgColor, borderColor, textColor, icon, message, recommendation;
                          
                          if (percentage <= 10) {
                            bgColor = 'bg-green-50';
                            borderColor = 'border-green-200';
                            textColor = 'text-green-800';
                            icon = '✅';
                            message = 'Excellent! Well within budget';
                            recommendation = 'Your payment is under the recommended 10% guideline. This leaves plenty of room for other expenses and savings.';
                          } else if (percentage <= 15) {
                            bgColor = 'bg-yellow-50';
                            borderColor = 'border-yellow-200';
                            textColor = 'text-yellow-800';
                            icon = '⚠️';
                            message = 'Manageable but tight';
                            recommendation = 'Your payment exceeds the 10% guideline but is still manageable. Consider if you can comfortably afford this while meeting other financial goals.';
                          } else {
                            bgColor = 'bg-red-50';
                            borderColor = 'border-red-200';
                            textColor = 'text-red-800';
                            icon = '❌';
                            message = 'Above recommended limit';
                            recommendation = 'Your payment significantly exceeds the 10% guideline. This may strain your budget. Consider a lower-priced vehicle, larger down payment, or longer term.';
                          }
                          
                          return (
                            <div className={`${bgColor} border-2 ${borderColor} rounded-lg p-4`}>
                              <div className="flex items-start gap-2 mb-2">
                                <span className="text-2xl">{icon}</span>
                                <div className="flex-1">
                                  <div className={`font-bold ${textColor} text-lg`}>
                                    {percentage.toFixed(1)}% of Net Income
                                  </div>
                                  <div className={`text-sm ${textColor} font-semibold`}>
                                    {message}
                                  </div>
                                </div>
                              </div>
                              <div className={`text-sm ${textColor} mt-2 leading-relaxed`}>
                                <strong>📊 The 10% Rule:</strong> Financial experts recommend keeping auto payments under 10% of your net (take-home) income.
                              </div>
                              <div className={`text-sm ${textColor} mt-2 leading-relaxed`}>
                                {recommendation}
                              </div>
                              <div className={`text-xs ${textColor} mt-3 pt-3 border-t ${borderColor}`}>
                                ${formatCurrency(payment)} payment ÷ ${formatCurrency(netIncome)} net income = {percentage.toFixed(1)}%
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Mortgage Tab */}
            {activeTab === 'mortgage' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800">Mortgage Calculator</h2>
                
                {/* Best Practices Box */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">🏠</div>
                    <div>
                      <h3 className="font-bold text-blue-900 mb-2">Smart Home Buying</h3>
                      <div className="text-sm text-blue-800 space-y-1">
                        <p><strong>20% Down Payment:</strong> Avoid PMI and get better rates</p>
                        <p><strong>28% Rule:</strong> Keep housing costs under 28% of gross income</p>
                        <p><strong>36% Rule:</strong> Keep total debt under 36% of gross income</p>
                        <p><strong>15-Year vs 30-Year:</strong> Shorter term = way less interest paid!</p>
                      </div>
                      <p className="text-xs text-blue-700 mt-2 italic">
                        💡 Every 1% lower interest rate saves thousands over the life of the loan!
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Home Price
                      </label>
                      <input
                        type="number"
                        value={homePrice}
                        onChange={(e) => setHomePrice(e.target.value)}
                        placeholder="400000"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Property Location
                      </label>
                      <select
                        value={homeState}
                        onChange={(e) => setHomeState(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="">Select state/territory...</option>
                        {Object.entries(stateData).map(([code, data]) => (
                          <option key={code} value={code}>
                            {data.name}
                          </option>
                        ))}
                      </select>
                      {homeState && (
                        <p className="text-xs text-green-600 mt-1">
                          ✓ Auto-filled property tax ({stateData[homeState].propertyTax}%) and insurance (${stateData[homeState].insurance}/yr)
                        </p>
                      )}
                    </div>

                    <div>
                      <Tooltip term="down-payment">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Down Payment (%)
                        </label>
                      </Tooltip>
                      <input
                        type="number"
                        step="0.1"
                        value={homeDownPercent}
                        onChange={(e) => setHomeDownPercent(e.target.value)}
                        placeholder="20"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      {homePrice && homeDownPercent && (
                        <div className="mt-2 p-3 bg-indigo-50 rounded-lg">
                          <div className="text-sm text-gray-700">
                            Down Payment Amount: <span className="font-bold text-indigo-700">{formatCurrency(parseFloat(homeDown))}</span>
                          </div>
                          {parseFloat(homeDownPercent) < 20 && (
                            <div className="text-xs text-amber-700 mt-1">
                              ⚠️ PMI required (less than 20% down)
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="border-t pt-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Your Income</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Monthly Gross Income (before taxes)
                          </label>
                          <input
                            type="number"
                            value={monthlyGrossPay}
                            onChange={(e) => setMonthlyGrossPay(e.target.value)}
                            placeholder="8000"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Used for qualification (28% rule)
                          </p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Monthly Net Income (after taxes)
                          </label>
                          <input
                            type="number"
                            value={monthlyNetPay}
                            onChange={(e) => setMonthlyNetPay(e.target.value)}
                            placeholder="6000"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Used for affordability analysis
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Loan Term
                      </label>
                      <select
                        value={homeTerm}
                        onChange={(e) => setHomeTerm(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="15">15 years</option>
                        <option value="20">20 years</option>
                        <option value="30">30 years</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Credit Score Range
                      </label>
                      <select
                        value={homeCreditScore}
                        onChange={(e) => setHomeCreditScore(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        {Object.entries(creditTiers.mortgage).map(([range, data]) => (
                          <option key={range} value={range}>
                            {range} - {data.label} ({data.rate}% APR)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Tooltip term="property-tax">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Property Tax (%)
                          </label>
                        </Tooltip>
                        <input
                          type="number"
                          step="0.01"
                          value={propertyTax}
                          onChange={(e) => setPropertyTax(e.target.value)}
                          placeholder="1.2"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Annual Insurance
                        </label>
                        <input
                          type="number"
                          value={insurance}
                          onChange={(e) => setInsurance(e.target.value)}
                          placeholder="1200"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Mortgage Summary</h3>
                    {mortgageData ? (
                      <div className="space-y-3">
                        <div className="bg-white rounded-lg p-4 mb-4">
                          <div className="text-sm text-gray-600 mb-1">Credit Tier</div>
                          <div className="font-bold text-indigo-600">{mortgageData.creditLabel}</div>
                          <div className="text-sm text-gray-600 mt-1">Interest Rate: {mortgageData.rate}%</div>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Loan Amount:</span>
                          <span className="font-bold">{formatCurrency(mortgageData.principal)}</span>
                        </div>
                        
                        <div className="bg-white rounded-lg p-3 space-y-2">
                          <div className="font-semibold text-gray-700 mb-2">Monthly Payment Breakdown:</div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Principal & Interest:</span>
                            <span>{formatCurrency(mortgageData.monthlyPayment)}</span>
                          </div>
                          {mortgageData.pmi > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">PMI:</span>
                              <span>{formatCurrency(mortgageData.pmi)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Property Tax:</span>
                            <span>{formatCurrency(mortgageData.monthlyTax)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Insurance:</span>
                            <span>{formatCurrency(mortgageData.monthlyInsurance)}</span>
                          </div>
                          <div className="border-t pt-2 flex justify-between font-bold">
                            <span>Total Monthly:</span>
                            <span className="text-xl text-indigo-600">
                              {formatCurrency(mortgageData.totalMonthly)}
                            </span>
                          </div>
                        </div>

                        {/* Qualification & Affordability Analysis */}
                        {(monthlyGrossPay || monthlyNetPay) && (parseFloat(monthlyGrossPay) > 0 || parseFloat(monthlyNetPay) > 0) && (
                          <div className="space-y-3">
                            {/* Qualification (Gross Income) */}
                            {monthlyGrossPay && parseFloat(monthlyGrossPay) > 0 && (
                              <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="font-semibold text-gray-800">Qualification (28% Rule)</div>
                                  <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                    Lender's View
                                  </div>
                                </div>
                                <div className="flex justify-between mb-2 text-sm">
                                  <span className="text-gray-600">Monthly Gross Income:</span>
                                  <span className="font-bold">{formatCurrency(parseFloat(monthlyGrossPay))}</span>
                                </div>
                                <div className="flex justify-between mb-3">
                                  <span className="text-gray-700 font-medium">Payment % of Gross:</span>
                                  <span className={`font-bold text-lg ${
                                    mortgageData.paymentToGrossRatio > 28 ? 'text-red-600' : 
                                    mortgageData.paymentToGrossRatio > 25 ? 'text-amber-600' : 
                                    'text-green-600'
                                  }`}>
                                    {mortgageData.paymentToGrossRatio.toFixed(1)}%
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                                  <div
                                    className={`h-3 rounded-full transition-all duration-500 ${
                                      mortgageData.paymentToGrossRatio > 28 ? 'bg-red-500' : 
                                      mortgageData.paymentToGrossRatio > 25 ? 'bg-amber-500' : 
                                      'bg-green-500'
                                    }`}
                                    style={{ width: `${Math.min(mortgageData.paymentToGrossRatio, 100)}%` }}
                                  />
                                </div>
                                <div className="text-xs text-gray-700 mt-2">
                                  {mortgageData.paymentToGrossRatio <= 25 && '✓ Excellent - Well under 28% guideline'}
                                  {mortgageData.paymentToGrossRatio > 25 && mortgageData.paymentToGrossRatio <= 28 && '✓ Good - Within 28% qualification limit'}
                                  {mortgageData.paymentToGrossRatio > 28 && mortgageData.paymentToGrossRatio <= 31 && '⚠️ High - Above 28% guideline, may face approval issues'}
                                  {mortgageData.paymentToGrossRatio > 31 && '❌ Very High - Likely won\'t qualify with most lenders'}
                                </div>
                              </div>
                            )}

                            {/* Affordability (Net Income) */}
                            {monthlyNetPay && parseFloat(monthlyNetPay) > 0 && (
                              <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="font-semibold text-gray-800">Affordability (Take-Home)</div>
                                  <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    Your Reality
                                  </div>
                                </div>
                                <div className="flex justify-between mb-2 text-sm">
                                  <span className="text-gray-600">Monthly Net Income:</span>
                                  <span className="font-bold">{formatCurrency(parseFloat(monthlyNetPay))}</span>
                                </div>
                                <div className="flex justify-between mb-3">
                                  <span className="text-gray-700 font-medium">Payment % of Net:</span>
                                  <span className={`font-bold text-lg ${
                                    mortgageData.paymentToNetRatio > 35 ? 'text-red-600' : 
                                    mortgageData.paymentToNetRatio > 28 ? 'text-amber-600' : 
                                    'text-green-600'
                                  }`}>
                                    {mortgageData.paymentToNetRatio.toFixed(1)}%
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                                  <div
                                    className={`h-3 rounded-full transition-all duration-500 ${
                                      mortgageData.paymentToNetRatio > 35 ? 'bg-red-500' : 
                                      mortgageData.paymentToNetRatio > 28 ? 'bg-amber-500' : 
                                      'bg-green-500'
                                    }`}
                                    style={{ width: `${Math.min(mortgageData.paymentToNetRatio, 100)}%` }}
                                  />
                                </div>
                                <div className="text-xs text-gray-700 mt-2">
                                  {mortgageData.paymentToNetRatio <= 25 && '✓ Comfortable - Plenty of room in budget'}
                                  {mortgageData.paymentToNetRatio > 25 && mortgageData.paymentToNetRatio <= 28 && '✓ Manageable - Reasonable budget pressure'}
                                  {mortgageData.paymentToNetRatio > 28 && mortgageData.paymentToNetRatio <= 35 && '⚠️ Tight - Limited flexibility for other expenses'}
                                  {mortgageData.paymentToNetRatio > 35 && '❌ Stretched - High risk of financial stress'}
                                </div>
                              </div>
                            )}

                            {monthlyGrossPay && monthlyNetPay && parseFloat(monthlyGrossPay) > 0 && parseFloat(monthlyNetPay) > 0 && (
                              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                                <div className="text-sm text-indigo-800">
                                  <strong>💡 Key Insight:</strong> Lenders use gross income (qualification), but you pay with net income (affordability). Both must work for your situation.
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className="border-t pt-3 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Paid (P&I only):</span>
                            <span className="font-semibold">{formatCurrency(mortgageData.totalPaid)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Interest:</span>
                            <span className="font-semibold text-red-600">
                              {formatCurrency(mortgageData.totalInterest)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                          <div className="text-sm text-yellow-800">
                            <strong>Interest Cost:</strong> You'll pay {formatCurrency(mortgageData.totalInterest)} in interest over {homeTerm} years ({((mortgageData.totalInterest / mortgageData.principal) * 100).toFixed(1)}% of loan amount).
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">Enter home details to see calculations</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Debt Payoff Tab */}
            {activeTab === 'debt' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800">Debt Payoff Calculator</h2>
                
                {/* Debt Payoff Strategies Box */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500 p-4 rounded-r-lg">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">📊</div>
                    <div>
                      <h3 className="font-bold text-purple-900 mb-2">Two Proven Debt Payoff Methods</h3>
                      <div className="space-y-2 text-sm text-purple-800">
                        <div>
                          <Tooltip term="avalanche">
                            <strong className="text-purple-900">Avalanche Method</strong>
                          </Tooltip>
                          <p className="ml-1 inline">- Pay highest interest rate first. Saves the most money mathematically!</p>
                        </div>
                        <div>
                          <Tooltip term="snowball">
                            <strong className="text-purple-900">Snowball Method</strong>
                          </Tooltip>
                          <p className="ml-1 inline">- Pay smallest balance first. Builds momentum through quick wins!</p>
                        </div>
                      </div>
                      <p className="text-xs text-purple-700 mt-2 italic">
                        💡 Both methods work! Choose based on whether you prioritize math (avalanche) or motivation (snowball).
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Your Debts
                        </label>
                        <button
                          onClick={addDebt}
                          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                          + Add Debt
                        </button>
                      </div>
                      <div className="space-y-3">
                        {debts.map((debt, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <input
                                type="text"
                                value={debt.name}
                                onChange={(e) => updateDebt(index, 'name', e.target.value)}
                                placeholder="Debt name (e.g., Credit Card)"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              />
                              {debts.length > 1 && (
                                <button
                                  onClick={() => removeDebt(index)}
                                  className="ml-2 text-red-500 hover:text-red-700"
                                >
                                  <X size={20} />
                                </button>
                              )}
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <input
                                type="number"
                                value={debt.balance}
                                onChange={(e) => updateDebt(index, 'balance', e.target.value)}
                                placeholder="Balance"
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              />
                              <input
                                type="number"
                                step="0.1"
                                value={debt.rate}
                                onChange={(e) => updateDebt(index, 'rate', e.target.value)}
                                placeholder="Rate %"
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              />
                              <input
                                type="number"
                                value={debt.minPayment}
                                onChange={(e) => updateDebt(index, 'minPayment', e.target.value)}
                                placeholder="Min Pay"
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Extra Monthly Payment
                      </label>
                      <input
                        type="number"
                        value={extraPayment}
                        onChange={(e) => setExtraPayment(e.target.value)}
                        placeholder="200"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payoff Method
                      </label>
                      <select
                        value={payoffMethod}
                        onChange={(e) => setPayoffMethod(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="avalanche">Avalanche (Highest rate first)</option>
                        <option value="snowball">Snowball (Lowest balance first)</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        {payoffMethod === 'avalanche' 
                          ? 'Saves the most money on interest' 
                          : 'Provides quick wins for motivation'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Payoff Summary</h3>
                    {debtData ? (
                      <div className="space-y-4">
                        <div className="bg-white rounded-lg p-4">
                          <div className="flex justify-between mb-2">
                            <span className="text-gray-600">Total Debt:</span>
                            <span className="font-bold text-xl text-red-600">
                              {formatCurrency(debtData.totalDebt)}
                            </span>
                          </div>
                          <div className="flex justify-between mb-2">
                            <span className="text-gray-600">Average Rate:</span>
                            <span className="font-semibold">{debtData.avgRate.toFixed(2)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Monthly Payment:</span>
                            <span className="font-bold text-indigo-600">
                              {formatCurrency(debtData.totalPayment)}
                            </span>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg p-4">
                          <div className="flex justify-between mb-2">
                            <span className="text-gray-600">Payoff Time:</span>
                            <span className="font-bold text-lg">
                              {debtData.months} months ({Math.floor(debtData.months / 12)} years {debtData.months % 12} months)
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Interest:</span>
                            <span className="font-bold text-red-600">
                              {formatCurrency(debtData.totalInterest)}
                            </span>
                          </div>
                        </div>

                        <div>
                          <div className="font-semibold text-gray-700 mb-2">Payment Order:</div>
                          <div className="space-y-2">
                            {debtData.sortedDebts.map((debt, index) => (
                              <div key={index} className="bg-white rounded p-3 text-sm">
                                <div className="font-medium">{index + 1}. {debt.name || `Debt ${index + 1}`}</div>
                                <div className="text-gray-600">
                                  {formatCurrency(debt.balance)} @ {debt.rate}% APR
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="text-sm text-blue-800">
                            <strong>Tip:</strong> Adding {formatCurrency(parseFloat(extraPayment) || 0)} extra per month saves you interest and helps you become debt-free faster!
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">Enter your debts to see payoff plan</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Savings Calculator Tab */}
            {activeTab === 'savings' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800">Savings & Investment Calculator</h2>
                
                {/* Compound Interest Education Box */}
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-l-4 border-emerald-500 p-4 rounded-r-lg">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">📈</div>
                    <div>
                      <h3 className="font-bold text-emerald-900 mb-2">The Power of Compound Interest</h3>
                      <Tooltip term="compound-interest">
                        <p className="text-sm text-emerald-800">
                          Albert Einstein called it the "8th wonder of the world" - your money earns interest, and that interest earns more interest!
                        </p>
                      </Tooltip>
                      <div className="text-sm text-emerald-800 mt-2 space-y-1">
                        <p><strong>Time is your friend:</strong> Starting early makes a huge difference</p>
                        <p><strong>Consistency wins:</strong> Regular contributions add up fast</p>
                        <p><strong>Rates matter:</strong> Even 1-2% difference = thousands over time</p>
                      </div>
                      <p className="text-xs text-emerald-700 mt-2 italic">
                        💡 A 25-year-old who saves $200/month at 7% will have over $500,000 by age 65!
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Initial Deposit
                      </label>
                      <input
                        type="number"
                        value={initialDeposit}
                        onChange={(e) => setInitialDeposit(e.target.value)}
                        placeholder="10000"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Monthly Contribution
                      </label>
                      <input
                        type="number"
                        value={monthlyContribution}
                        onChange={(e) => setMonthlyContribution(e.target.value)}
                        placeholder="500"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Annual Interest Rate (%)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={interestRate}
                        onChange={(e) => setInterestRate(e.target.value)}
                        placeholder="4.5"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Examples: High-yield savings ~4-5%, CD ~5-6%, S&P 500 avg ~10%
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Time Period (years)
                      </label>
                      <select
                        value={savingsYears}
                        onChange={(e) => setSavingsYears(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="1">1 year</option>
                        <option value="2">2 years</option>
                        <option value="3">3 years</option>
                        <option value="5">5 years</option>
                        <option value="10">10 years</option>
                        <option value="15">15 years</option>
                        <option value="20">20 years</option>
                        <option value="30">30 years</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Compound Frequency
                      </label>
                      <select
                        value={compoundFrequency}
                        onChange={(e) => setCompoundFrequency(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="1">Annually</option>
                        <option value="4">Quarterly</option>
                        <option value="12">Monthly</option>
                        <option value="365">Daily</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        How often interest is calculated and added
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Growth Summary</h3>
                    {savingsData ? (
                      <div className="space-y-4">
                        <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                          <div className="text-sm text-gray-600 mb-1">Final Balance</div>
                          <div className="font-bold text-3xl text-green-600">
                            {formatCurrency(savingsData.totalFutureValue)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            After {savingsYears} years at {interestRate}% APY
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Your Contributions:</span>
                            <span className="font-bold">{formatCurrency(savingsData.totalContributions)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Interest Earned:</span>
                            <span className="font-bold text-green-600">
                              {formatCurrency(savingsData.totalInterestEarned)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Return on Investment:</span>
                            <span className="font-bold text-green-600">
                              {savingsData.interestPercentage.toFixed(1)}%
                            </span>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg p-4">
                          <div className="font-semibold text-gray-700 mb-3">Growth Breakdown</div>
                          <div className="w-full bg-gray-200 rounded-full h-6 mb-2">
                            <div className="flex h-6 rounded-full overflow-hidden">
                              <div
                                className="bg-blue-500 flex items-center justify-center text-xs text-white font-semibold"
                                style={{ 
                                  width: `${(savingsData.totalContributions / savingsData.totalFutureValue) * 100}%` 
                                }}
                                title="Your Contributions"
                              >
                                {((savingsData.totalContributions / savingsData.totalFutureValue) * 100).toFixed(0)}%
                              </div>
                              <div
                                className="bg-green-500 flex items-center justify-center text-xs text-white font-semibold"
                                style={{ 
                                  width: `${(savingsData.totalInterestEarned / savingsData.totalFutureValue) * 100}%` 
                                }}
                                title="Interest Earned"
                              >
                                {((savingsData.totalInterestEarned / savingsData.totalFutureValue) * 100).toFixed(0)}%
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 bg-blue-500 rounded"></div>
                              <span>Contributions</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 bg-green-500 rounded"></div>
                              <span>Interest</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-green-100 to-emerald-100 border border-green-300 rounded-lg p-4">
                          <div className="text-sm text-green-800">
                            <strong>Power of Compound Interest:</strong> Your money will earn {formatCurrency(savingsData.totalInterestEarned)} in interest, growing your wealth by {savingsData.interestPercentage.toFixed(1)}%!
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">Enter values to see your savings growth</p>
                    )}
                  </div>
                </div>

                {/* Year-by-Year Breakdown */}
                {savingsData && savingsData.yearByYear && (
                  <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Year-by-Year Growth</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b-2 border-gray-200">
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Year</th>
                            <th className="text-right py-3 px-4 font-semibold text-gray-700">Total Balance</th>
                            <th className="text-right py-3 px-4 font-semibold text-gray-700">Your Contributions</th>
                            <th className="text-right py-3 px-4 font-semibold text-gray-700">Interest Earned</th>
                          </tr>
                        </thead>
                        <tbody>
                          {savingsData.yearByYear.map((yearData) => (
                            <tr key={yearData.year} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4 font-medium">{yearData.year}</td>
                              <td className="text-right py-3 px-4 font-bold text-green-600">
                                {formatCurrency(yearData.balance)}
                              </td>
                              <td className="text-right py-3 px-4">
                                {formatCurrency(yearData.contributions)}
                              </td>
                              <td className="text-right py-3 px-4 text-green-600">
                                {formatCurrency(yearData.interest)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Comparison Examples */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Common Savings Scenarios</h3>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-white rounded-lg p-4">
                      <div className="font-semibold text-gray-800 mb-2">High-Yield Savings</div>
                      <div className="text-gray-600 space-y-1">
                        <div>Rate: ~4.5% APY</div>
                        <div>FDIC insured</div>
                        <div>Liquid, no lock-up</div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <div className="font-semibold text-gray-800 mb-2">Certificate of Deposit</div>
                      <div className="text-gray-600 space-y-1">
                        <div>Rate: ~5-6% APY</div>
                        <div>FDIC insured</div>
                        <div>Fixed term (6mo-5yr)</div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <div className="font-semibold text-gray-800 mb-2">Index Fund (S&P 500)</div>
                      <div className="text-gray-600 space-y-1">
                        <div>Historical avg: ~10%</div>
                        <div>Not FDIC insured</div>
                        <div>Market volatility</div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-3">
                    Tip: Use this calculator to compare different savings products side-by-side using the Scenarios feature!
                  </p>
                </div>
              </div>
            )}

            {/* Progress Tab */}
            {activeTab === 'progress' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800">Financial Progress Tracker</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Savings Goal */}
                  <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Savings Goal</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Savings Goal
                        </label>
                        <input
                          type="number"
                          value={savingsGoal}
                          onChange={(e) => setSavingsGoal(e.target.value)}
                          placeholder="10000"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Savings
                        </label>
                        <input
                          type="number"
                          value={currentSavings}
                          onChange={(e) => setCurrentSavings(e.target.value)}
                          placeholder="3500"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      
                      {savingsGoal > 0 && (
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 mt-4">
                          <div className="flex justify-between mb-2">
                            <span className="text-gray-700 font-semibold">Progress</span>
                            <span className="text-green-600 font-bold">
                              {savingsProgress.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-4 mb-3">
                            <div
                              className="bg-gradient-to-r from-green-500 to-emerald-500 h-4 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(savingsProgress, 100)}%` }}
                            />
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Current:</span>
                              <span className="font-semibold">{formatCurrency(parseFloat(currentSavings) || 0)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Goal:</span>
                              <span className="font-semibold">{formatCurrency(parseFloat(savingsGoal))}</span>
                            </div>
                            <div className="flex justify-between border-t pt-1">
                              <span className="text-gray-700 font-medium">Remaining:</span>
                              <span className="font-bold text-green-600">
                                {formatCurrency(Math.max(0, parseFloat(savingsGoal) - (parseFloat(currentSavings) || 0)))}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Debt Reduction Goal */}
                  <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Debt Reduction Goal</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Starting Debt
                        </label>
                        <input
                          type="number"
                          value={debtGoal}
                          onChange={(e) => setDebtGoal(e.target.value)}
                          placeholder="25000"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Debt
                        </label>
                        <input
                          type="number"
                          value={currentDebt}
                          onChange={(e) => setCurrentDebt(e.target.value)}
                          placeholder="18000"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                      
                      {debtGoal > 0 && (
                        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-4 mt-4">
                          <div className="flex justify-between mb-2">
                            <span className="text-gray-700 font-semibold">Progress</span>
                            <span className="text-indigo-600 font-bold">
                              {debtProgress.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-4 mb-3">
                            <div
                              className="bg-gradient-to-r from-indigo-500 to-blue-500 h-4 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(Math.max(debtProgress, 0), 100)}%` }}
                            />
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Starting Debt:</span>
                              <span className="font-semibold">{formatCurrency(parseFloat(debtGoal))}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Current Debt:</span>
                              <span className="font-semibold">{formatCurrency(parseFloat(currentDebt) || 0)}</span>
                            </div>
                            <div className="flex justify-between border-t pt-1">
                              <span className="text-gray-700 font-medium">Paid Off:</span>
                              <span className="font-bold text-indigo-600">
                                {formatCurrency(Math.max(0, parseFloat(debtGoal) - (parseFloat(currentDebt) || 0)))}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Combined Summary */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Overall Financial Health</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">Net Worth Change</div>
                      <div className="font-bold text-2xl text-purple-600">
                        {formatCurrency(
                          (parseFloat(currentSavings) || 0) - (parseFloat(currentDebt) || 0)
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Savings minus debt
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">Savings Progress</div>
                      <div className="font-bold text-2xl text-green-600">
                        {savingsProgress.toFixed(0)}%
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Toward goal
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">Debt Reduction</div>
                      <div className="font-bold text-2xl text-indigo-600">
                        {debtProgress.toFixed(0)}%
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Progress made
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Scenarios Tab */}
            {activeTab === 'scenarios' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-800">Saved Scenarios</h2>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setCompareMode(!compareMode)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                        compareMode 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <GitCompare size={20} />
                      {compareMode ? 'Exit Compare' : 'Compare Mode'}
                    </button>
                  </div>
                </div>

                {scenarios.length === 0 ? (
                  <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                    <FolderOpen size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Saved Scenarios</h3>
                    <p className="text-gray-600 mb-4">
                      Create your first scenario by entering data in the calculators and clicking "Save Scenario"
                    </p>
                    <button
                      onClick={() => setActiveTab('budget')}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                      Get Started
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Scenario List */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {scenarios.map((scenario) => (
                        <div 
                          key={scenario.id}
                          className={`bg-white border-2 rounded-lg p-4 transition ${
                            selectedScenarios.includes(scenario.id) 
                              ? 'border-indigo-500 bg-indigo-50' 
                              : 'border-gray-200 hover:border-indigo-300'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-800">{scenario.name}</h3>
                              <p className="text-xs text-gray-500">
                                {new Date(scenario.timestamp).toLocaleDateString()} at{' '}
                                {new Date(scenario.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            {compareMode && (
                              <input
                                type="checkbox"
                                checked={selectedScenarios.includes(scenario.id)}
                                onChange={() => toggleScenarioForComparison(scenario.id)}
                                className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                              />
                            )}
                          </div>

                          <div className="space-y-2 mb-4 text-sm">
                            {scenario.calculations.mortgage && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Mortgage:</span>
                                <span className="font-semibold">{formatCurrency(scenario.calculations.mortgage.totalMonthly)}/mo</span>
                              </div>
                            )}
                            {scenario.calculations.auto && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Auto Loan:</span>
                                <span className="font-semibold">{formatCurrency(scenario.calculations.auto.monthlyPayment)}/mo</span>
                              </div>
                            )}
                            {scenario.calculations.budget && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Net Budget:</span>
                                <span className={`font-semibold ${scenario.calculations.budget.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {formatCurrency(scenario.calculations.budget.remaining)}
                                </span>
                              </div>
                            )}
                          </div>

                          {!compareMode && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => loadScenario(scenario)}
                                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition text-sm font-semibold"
                              >
                                Load
                              </button>
                              <button
                                onClick={() => deleteScenario(scenario.id)}
                                className="px-4 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Comparison View */}
                    {compareMode && selectedScenarios.length > 0 && (
                      <div className="bg-white border-2 border-indigo-200 rounded-lg p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">
                          Scenario Comparison ({selectedScenarios.length} selected)
                        </h3>
                        
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b-2 border-gray-200">
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Metric</th>
                                {selectedScenarios.map(id => {
                                  const scenario = scenarios.find(s => s.id === id);
                                  return (
                                    <th key={id} className="text-right py-3 px-4 font-semibold text-gray-700">
                                      {scenario.name}
                                    </th>
                                  );
                                })}
                              </tr>
                            </thead>
                            <tbody className="text-sm">
                              {/* Mortgage Comparison */}
                              <tr className="border-b border-gray-100">
                                <td className="py-3 px-4 font-medium text-gray-800 bg-gray-50" colSpan={selectedScenarios.length + 1}>
                                  Mortgage
                                </td>
                              </tr>
                              <tr className="border-b border-gray-100">
                                <td className="py-2 px-4 text-gray-600">Home Price</td>
                                {selectedScenarios.map(id => {
                                  const scenario = scenarios.find(s => s.id === id);
                                  return (
                                    <td key={id} className="text-right py-2 px-4">
                                      {scenario.data.mortgage.homePrice ? formatCurrency(scenario.data.mortgage.homePrice) : '-'}
                                    </td>
                                  );
                                })}
                              </tr>
                              <tr className="border-b border-gray-100">
                                <td className="py-2 px-4 text-gray-600">Down Payment</td>
                                {selectedScenarios.map(id => {
                                  const scenario = scenarios.find(s => s.id === id);
                                  return (
                                    <td key={id} className="text-right py-2 px-4">
                                      {scenario.data.mortgage.homeDownPercent ? `${scenario.data.mortgage.homeDownPercent}%` : '-'}
                                    </td>
                                  );
                                })}
                              </tr>
                              <tr className="border-b border-gray-100 bg-indigo-50">
                                <td className="py-2 px-4 font-semibold text-gray-800">Monthly Payment</td>
                                {selectedScenarios.map(id => {
                                  const scenario = scenarios.find(s => s.id === id);
                                  return (
                                    <td key={id} className="text-right py-2 px-4 font-semibold">
                                      {scenario.calculations.mortgage ? formatCurrency(scenario.calculations.mortgage.totalMonthly) : '-'}
                                    </td>
                                  );
                                })}
                              </tr>
                              <tr className="border-b border-gray-100">
                                <td className="py-2 px-4 text-gray-600">Total Interest</td>
                                {selectedScenarios.map(id => {
                                  const scenario = scenarios.find(s => s.id === id);
                                  return (
                                    <td key={id} className="text-right py-2 px-4 text-red-600">
                                      {scenario.calculations.mortgage ? formatCurrency(scenario.calculations.mortgage.totalInterest) : '-'}
                                    </td>
                                  );
                                })}
                              </tr>
                              <tr className="border-b border-gray-100">
                                <td className="py-2 px-4 text-gray-600">Payment % of Gross (Qualification)</td>
                                {selectedScenarios.map(id => {
                                  const scenario = scenarios.find(s => s.id === id);
                                  return (
                                    <td key={id} className="text-right py-2 px-4">
                                      {scenario.calculations.mortgage?.paymentToGrossRatio 
                                        ? `${scenario.calculations.mortgage.paymentToGrossRatio.toFixed(1)}%` 
                                        : '-'}
                                    </td>
                                  );
                                })}
                              </tr>
                              <tr className="border-b border-gray-100">
                                <td className="py-2 px-4 text-gray-600">Payment % of Net (Affordability)</td>
                                {selectedScenarios.map(id => {
                                  const scenario = scenarios.find(s => s.id === id);
                                  return (
                                    <td key={id} className="text-right py-2 px-4">
                                      {scenario.calculations.mortgage?.paymentToNetRatio 
                                        ? `${scenario.calculations.mortgage.paymentToNetRatio.toFixed(1)}%` 
                                        : '-'}
                                    </td>
                                  );
                                })}
                              </tr>

                              {/* Auto Loan Comparison */}
                              <tr className="border-b border-gray-100">
                                <td className="py-3 px-4 font-medium text-gray-800 bg-gray-50" colSpan={selectedScenarios.length + 1}>
                                  Auto Loan
                                </td>
                              </tr>
                              <tr className="border-b border-gray-100">
                                <td className="py-2 px-4 text-gray-600">Vehicle Price</td>
                                {selectedScenarios.map(id => {
                                  const scenario = scenarios.find(s => s.id === id);
                                  return (
                                    <td key={id} className="text-right py-2 px-4">
                                      {scenario.data.auto.autoPrice ? formatCurrency(scenario.data.auto.autoPrice) : '-'}
                                    </td>
                                  );
                                })}
                              </tr>
                              <tr className="border-b border-gray-100 bg-indigo-50">
                                <td className="py-2 px-4 font-semibold text-gray-800">Monthly Payment</td>
                                {selectedScenarios.map(id => {
                                  const scenario = scenarios.find(s => s.id === id);
                                  return (
                                    <td key={id} className="text-right py-2 px-4 font-semibold">
                                      {scenario.calculations.auto ? formatCurrency(scenario.calculations.auto.monthlyPayment) : '-'}
                                    </td>
                                  );
                                })}
                              </tr>
                              <tr className="border-b border-gray-100">
                                <td className="py-2 px-4 text-gray-600">Total Interest</td>
                                {selectedScenarios.map(id => {
                                  const scenario = scenarios.find(s => s.id === id);
                                  return (
                                    <td key={id} className="text-right py-2 px-4 text-red-600">
                                      {scenario.calculations.auto ? formatCurrency(scenario.calculations.auto.totalInterest) : '-'}
                                    </td>
                                  );
                                })}
                              </tr>

                              {/* Budget Comparison */}
                              <tr className="border-b border-gray-100">
                                <td className="py-3 px-4 font-medium text-gray-800 bg-gray-50" colSpan={selectedScenarios.length + 1}>
                                  Budget
                                </td>
                              </tr>
                              <tr className="border-b border-gray-100">
                                <td className="py-2 px-4 text-gray-600">Monthly Income</td>
                                {selectedScenarios.map(id => {
                                  const scenario = scenarios.find(s => s.id === id);
                                  return (
                                    <td key={id} className="text-right py-2 px-4">
                                      {scenario.calculations.budget ? formatCurrency(scenario.calculations.budget.totalIncome) : '-'}
                                    </td>
                                  );
                                })}
                              </tr>
                              <tr className="border-b border-gray-100">
                                <td className="py-2 px-4 text-gray-600">Monthly Expenses</td>
                                {selectedScenarios.map(id => {
                                  const scenario = scenarios.find(s => s.id === id);
                                  return (
                                    <td key={id} className="text-right py-2 px-4">
                                      {scenario.calculations.budget ? formatCurrency(scenario.calculations.budget.totalExpenses) : '-'}
                                    </td>
                                  );
                                })}
                              </tr>
                              <tr className="border-b border-gray-100 bg-indigo-50">
                                <td className="py-2 px-4 font-semibold text-gray-800">Net Remaining</td>
                                {selectedScenarios.map(id => {
                                  const scenario = scenarios.find(s => s.id === id);
                                  const remaining = scenario.calculations.budget?.remaining;
                                  return (
                                    <td key={id} className={`text-right py-2 px-4 font-semibold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                      {scenario.calculations.budget ? formatCurrency(remaining) : '-'}
                                    </td>
                                  );
                                })}
                              </tr>
                              <tr className="border-b border-gray-100">
                                <td className="py-2 px-4 text-gray-600">Savings Rate</td>
                                {selectedScenarios.map(id => {
                                  const scenario = scenarios.find(s => s.id === id);
                                  return (
                                    <td key={id} className="text-right py-2 px-4">
                                      {scenario.calculations.budget ? `${scenario.calculations.budget.savingsRate.toFixed(1)}%` : '-'}
                                    </td>
                                  );
                                })}
                              </tr>

                              {/* Savings Calculator Comparison */}
                              <tr className="border-b border-gray-100">
                                <td className="py-3 px-4 font-medium text-gray-800 bg-gray-50" colSpan={selectedScenarios.length + 1}>
                                  Savings Growth
                                </td>
                              </tr>
                              <tr className="border-b border-gray-100">
                                <td className="py-2 px-4 text-gray-600">Interest Rate</td>
                                {selectedScenarios.map(id => {
                                  const scenario = scenarios.find(s => s.id === id);
                                  return (
                                    <td key={id} className="text-right py-2 px-4">
                                      {scenario.data.savings?.interestRate ? `${scenario.data.savings.interestRate}%` : '-'}
                                    </td>
                                  );
                                })}
                              </tr>
                              <tr className="border-b border-gray-100">
                                <td className="py-2 px-4 text-gray-600">Time Period</td>
                                {selectedScenarios.map(id => {
                                  const scenario = scenarios.find(s => s.id === id);
                                  return (
                                    <td key={id} className="text-right py-2 px-4">
                                      {scenario.data.savings?.savingsYears ? `${scenario.data.savings.savingsYears} years` : '-'}
                                    </td>
                                  );
                                })}
                              </tr>
                              <tr className="border-b border-gray-100 bg-green-50">
                                <td className="py-2 px-4 font-semibold text-gray-800">Final Balance</td>
                                {selectedScenarios.map(id => {
                                  const scenario = scenarios.find(s => s.id === id);
                                  return (
                                    <td key={id} className="text-right py-2 px-4 font-semibold text-green-600">
                                      {scenario.calculations.savings ? formatCurrency(scenario.calculations.savings.totalFutureValue) : '-'}
                                    </td>
                                  );
                                })}
                              </tr>
                              <tr className="border-b border-gray-100">
                                <td className="py-2 px-4 text-gray-600">Interest Earned</td>
                                {selectedScenarios.map(id => {
                                  const scenario = scenarios.find(s => s.id === id);
                                  return (
                                    <td key={id} className="text-right py-2 px-4 text-green-600">
                                      {scenario.calculations.savings ? formatCurrency(scenario.calculations.savings.totalInterestEarned) : '-'}
                                    </td>
                                  );
                                })}
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-sm text-blue-800">
                            <strong>Quick Insights:</strong> Compare up to 3 scenarios side-by-side to see which financial strategy works best for your goals.
                          </p>
                        </div>
                      </div>
                    )}

                    {compareMode && selectedScenarios.length === 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                        <p className="text-yellow-800">
                          Select 2-3 scenarios using the checkboxes to compare them side-by-side
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Scenario Side Panel */}
        {showScenarioPanel && (
          <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">My Scenarios</h2>
                <button
                  onClick={() => setShowScenarioPanel(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition"
                >
                  <X size={24} />
                </button>
              </div>

              {scenarios.length === 0 ? (
                <div className="text-center py-12">
                  <FolderOpen size={48} className="mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-600 mb-4">No saved scenarios yet</p>
                  <button
                    onClick={() => {
                      setShowScenarioPanel(false);
                      setShowScenarioModal(true);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-lg hover:shadow-lg transition"
                  >
                    Create Your First Scenario
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {scenarios.map((scenario) => (
                    <div
                      key={scenario.id}
                      className="bg-slate-50 rounded-lg p-4 hover:bg-slate-100 transition"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-slate-900">{scenario.name}</h3>
                        <button
                          onClick={() => deleteScenario(scenario.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 mb-3">
                        {new Date(scenario.timestamp).toLocaleDateString()}
                      </p>
                      {scenario.calculations.mortgage && (
                        <div className="text-sm text-slate-600 mb-2">
                          Mortgage: <span className="font-semibold">{formatCurrency(scenario.calculations.mortgage.totalMonthly)}/mo</span>
                        </div>
                      )}
                      <button
                        onClick={() => {
                          loadScenario(scenario);
                          setShowScenarioPanel(false);
                        }}
                        className="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                      >
                        Load Scenario
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Overlay when panel is open */}
        {showScenarioPanel && (
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-40"
            onClick={() => setShowScenarioPanel(false)}
          />
        )}

        {/* Floating Save Button */}
        {(homePrice || autoPrice || income || initialDeposit) && (
          <button
            onClick={() => setShowScenarioModal(true)}
            className="fixed bottom-8 right-8 bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all z-50 flex items-center gap-2 group"
          >
            <Save size={24} />
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap pr-0 group-hover:pr-3">
              Save Scenario
            </span>
          </button>
        )}

        {/* Footer */}
        <div className="text-center text-slate-600 text-sm pb-8 px-6">
          <p>All calculations are estimates. Consult with a financial professional for personalized advice.</p>
          <p className="mt-2">Your data is stored locally in your browser and never transmitted.</p>
        </div>
      </div>
    </div>
  );
};

export default FinancialCalculatorApp;