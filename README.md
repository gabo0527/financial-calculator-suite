# Financial Calculator Suite

A comprehensive financial planning tool with budget tracking, loan calculators, debt payoff planning, savings growth modeling, and scenario comparison.

## Features

- **Budget Calculator** - Track income vs expenses, calculate savings rate
- **Auto Loan Calculator** - Calculate payments with credit score-based rates
- **Mortgage Calculator** - Full payment breakdown including PMI, taxes, insurance, and payment-to-income ratio
- **Debt Payoff Calculator** - Avalanche vs Snowball methods with payoff timeline
- **Savings Calculator** - Compound interest with year-by-year breakdown
- **Progress Tracker** - Visual tracking of savings goals and debt reduction
- **Scenario Management** - Save and compare up to 3 scenarios side-by-side

## Quick Start

### Run Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

### Deploy to Production

**Option 1: Vercel (Easiest)**
```bash
npm install -g vercel
vercel
```

**Option 2: Netlify**
```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod
```

**Option 3: GitHub Pages**
```bash
npm install --save-dev gh-pages
npm run deploy
```

## File Structure

```
financial-calculator-suite/
├── financial-calculator.jsx   # Main app component
├── main.jsx                    # React entry point
├── index.html                  # HTML template
├── package.json                # Dependencies
├── vite.config.js             # Build config
├── DEPLOYMENT_GUIDE.md        # Full deployment & monetization guide
└── README.md                  # This file
```

## Tech Stack

- React 18
- Vite
- Tailwind CSS (via CDN)
- Lucide React (icons)
- LocalStorage (data persistence)

## Privacy

All calculations are performed client-side in the browser. No data is sent to external servers. User data is stored only in browser localStorage and can be cleared at any time.

## License

MIT License - Free to use, modify, and distribute

## Next Steps

See `DEPLOYMENT_GUIDE.md` for:
- Detailed deployment instructions
- Monetization strategies
- Marketing recommendations
- Legal requirements
- Revenue projections
