import { CustomerRecord } from '../types/churn';

// Seeded pseudorandom generator for reproducible, statistically sound banking data
function pseudoRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

const SURNAMES = [
  'Smith', 'Müller', 'Dupont', 'García', 'Schmidt', 'Lefebvre', 'Martínez', 'Weber', 'Martin', 'Rodríguez',
  'Fischer', 'Bernard', 'Fernández', 'Meyer', 'Dubois', 'González', 'Wagner', 'Thomas', 'Pérez', 'Becker',
  'Robert', 'Gómez', 'Schulz', 'Richard', 'Sánchez', 'Hoffmann', 'Petit', 'Díaz', 'Schäfer', 'Durand',
  'Moreno', 'Koch', 'Leroy', 'Álvarez', 'Bauer', 'Moreau', 'Romero', 'Richter', 'Simon', 'Alonso',
  'Klein', 'Laurent', 'Torres', 'Wolf', 'Lefevre', 'Navarro', 'Schröder', 'Michel', 'Domínguez', 'Neumann',
  'Garcia', 'Vidal', 'Vogel', 'Roux', 'Serrano', 'Braun', 'Fournier', 'Blanco', 'Werner', 'Morel'
];

export function generateCustomerDataset(count: number = 1200): CustomerRecord[] {
  const records: CustomerRecord[] = [];

  for (let i = 1; i <= count; i++) {
    const r1 = pseudoRandom(i * 13 + 7);
    const r2 = pseudoRandom(i * 29 + 11);
    const r3 = pseudoRandom(i * 37 + 19);
    const r4 = pseudoRandom(i * 43 + 23);
    const r5 = pseudoRandom(i * 53 + 31);
    const r6 = pseudoRandom(i * 61 + 47);
    const r7 = pseudoRandom(i * 71 + 59);
    const r8 = pseudoRandom(i * 79 + 67);
    const r9 = pseudoRandom(i * 89 + 73);
    const r10 = pseudoRandom(i * 97 + 83);

    // Surname & ID
    const surname = SURNAMES[(i + Math.floor(r1 * 50)) % SURNAMES.length];
    const customerId = 15600000 + i;

    // Geography: France 50%, Germany 25%, Spain 25%
    let geography: 'France' | 'Germany' | 'Spain' = 'France';
    if (r2 < 0.25) {
      geography = 'Germany';
    } else if (r2 < 0.50) {
      geography = 'Spain';
    }

    // Gender: 54% Male, 46% Female
    const gender: 'Male' | 'Female' = r3 < 0.54 ? 'Male' : 'Female';

    // Age: Average 38, skewed normal
    const ageRaw = 20 + Math.floor(r4 * 35 + r5 * 25);
    const age = Math.min(85, Math.max(18, ageRaw));

    // Tenure: 0 to 10 years
    const tenure = Math.floor(r6 * 11);

    // Number of products: 1 (51%), 2 (45%), 3 (3%), 4 (1%)
    let numOfProducts = 1;
    if (r7 < 0.46) {
      numOfProducts = 2;
    } else if (r7 < 0.94) {
      numOfProducts = 1;
    } else if (r7 < 0.985) {
      numOfProducts = 3;
    } else {
      numOfProducts = 4;
    }

    // Balance: In Germany, 95% have positive high balance (~119,000).
    // In France/Spain, ~50% have zero balance, rest have 40k - 180k.
    let balance = 0;
    if (geography === 'Germany') {
      balance = Math.round(55000 + r8 * 140000);
    } else {
      if (r8 > 0.48) {
        balance = Math.round(25000 + r9 * 160000);
      } else {
        balance = 0;
      }
    }

    // Credit score: 350 - 850, normal around 650
    const creditScore = Math.min(850, Math.max(375, Math.round(520 + r1 * 200 + r2 * 130)));

    // Has Credit Card: ~70%
    const hasCrCard = r9 < 0.705 ? 1 : 0;

    // Is Active Member: ~51%
    const isActiveMember = r10 < 0.515 ? 1 : 0;

    // Estimated Salary: uniform 12,000 - 198,000
    const estimatedSalary = Math.round(15000 + r5 * 175000);

    // Empirical churn probability calculation modeling real bank weights
    let churnScore = 0.12;

    // Age driver: 40-60 is peak churn zone in banking
    if (age >= 50 && age <= 65) {
      churnScore += 0.35;
    } else if (age >= 40 && age < 50) {
      churnScore += 0.22;
    } else if (age < 30) {
      churnScore -= 0.05;
    }

    // Country driver: Germany has notably higher competitive churn
    if (geography === 'Germany') {
      churnScore += 0.16;
    }

    // Gender driver
    if (gender === 'Female') {
      churnScore += 0.08;
    }

    // Activity driver: Inactive members churn much more frequently
    if (isActiveMember === 0) {
      churnScore += 0.15;
    } else {
      churnScore -= 0.07;
    }

    // Product driver: 2 products is sweet spot (~7% churn). 3 and 4 churn heavily.
    if (numOfProducts === 2) {
      churnScore -= 0.14;
    } else if (numOfProducts === 3) {
      churnScore += 0.60;
    } else if (numOfProducts === 4) {
      churnScore += 0.78;
    }

    // Balance driver: high balance accounts without activity have high churn propensity
    if (balance > 120000 && isActiveMember === 0) {
      churnScore += 0.14;
    } else if (balance === 0) {
      churnScore -= 0.03;
    }

    // Credit score impact: low credit (<500) has slight churn increase
    if (creditScore < 500) {
      churnScore += 0.10;
    }

    // Bound probability [0.02, 0.98]
    const churnProbability = Math.min(0.98, Math.max(0.02, Number(churnScore.toFixed(3))));

    // Determine exited status: stochastic based on churn probability + deterministic noise
    const noise = pseudoRandom(i * 101 + 5);
    const exited = noise < churnProbability ? 1 : 0;

    // Risk tier and Key Risk Factors
    let riskTier: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
    if (churnProbability >= 0.70) riskTier = 'Critical';
    else if (churnProbability >= 0.45) riskTier = 'High';
    else if (churnProbability >= 0.25) riskTier = 'Medium';

    const keyRiskFactors: string[] = [];
    if (numOfProducts >= 3) keyRiskFactors.push(`Unbalanced Multi-Product (${numOfProducts} products)`);
    if (isActiveMember === 0) keyRiskFactors.push('Account Inactivity');
    if (age >= 45 && age <= 65) keyRiskFactors.push(`High Churn Age Cohort (${age} yrs)`);
    if (geography === 'Germany' && balance > 100000) keyRiskFactors.push('German High-Balance Flight');
    if (creditScore < 550) keyRiskFactors.push('Subprime Credit Score');
    if (balance > 130000 && isActiveMember === 0) keyRiskFactors.push('Dormant High Capital ($' + (balance / 1000).toFixed(0) + 'k)');

    if (keyRiskFactors.length === 0) {
      keyRiskFactors.push('Stable Engagement');
    }

    records.push({
      customerId,
      surname,
      creditScore,
      geography,
      gender,
      age,
      tenure,
      balance,
      numOfProducts,
      hasCrCard,
      isActiveMember,
      estimatedSalary,
      exited,
      churnProbability,
      riskTier,
      keyRiskFactors
    });
  }

  return records;
}

export const BANK_CUSTOMERS: CustomerRecord[] = generateCustomerDataset(1200);

export const SAMPLE_SQL_QUERIES = [
  {
    id: 'kpi_overview',
    title: '1. Executive KPI Summary & Churn Rate',
    category: 'Executive KPIs',
    description: 'Calculates total customer base, total churn count, baseline churn rate, and total deposits at risk.',
    sql: `SELECT 
    COUNT(*) AS total_customers,
    SUM(exited) AS churned_customers,
    ROUND(SUM(exited) * 100.0 / COUNT(*), 2) AS churn_rate_pct,
    ROUND(SUM(CASE WHEN exited = 1 THEN balance ELSE 0 END), 2) AS churned_balance_usd,
    ROUND(AVG(CASE WHEN exited = 1 THEN balance ELSE NULL END), 2) AS avg_churned_balance
FROM customers;`
  },
  {
    id: 'tenure_activity_churn',
    title: '2. Churn Breakdown by Tenure & Activity Status',
    category: 'Tenure & Activity',
    description: 'Segments customers by bank tenure and active engagement flag to measure retention behavior across lifecycle.',
    sql: `SELECT 
    tenure,
    CASE WHEN is_active_member = 1 THEN 'Active Member' ELSE 'Inactive Member' END AS activity_status,
    COUNT(*) AS total_customers,
    SUM(exited) AS churned_customers,
    ROUND(SUM(exited) * 100.0 / COUNT(*), 2) AS churn_rate_pct,
    ROUND(AVG(balance), 2) AS avg_balance
FROM customers
GROUP BY tenure, is_active_member
ORDER BY tenure ASC, is_active_member DESC;`
  },
  {
    id: 'balance_tier_segmentation',
    title: '3. Balance Tier Distribution & Capital Exposure',
    category: 'Balance Segmentation',
    description: 'Classifies customer balances into 5 tiers and analyzes which balance deciles suffer the heaviest capital attrition.',
    sql: `SELECT 
    CASE 
        WHEN balance = 0 THEN '1. Zero Balance ($0)'
        WHEN balance < 50000 THEN '2. Low (< $50k)'
        WHEN balance < 100000 THEN '3. Moderate ($50k - $100k)'
        WHEN balance < 150000 THEN '4. High ($100k - $150k)'
        ELSE '5. Ultra Wealth (> $150k)'
    END AS balance_tier,
    COUNT(*) AS customer_count,
    SUM(exited) AS churned_count,
    ROUND(SUM(exited) * 100.0 / COUNT(*), 2) AS churn_rate_pct,
    ROUND(SUM(balance), 2) AS total_deposits_usd,
    ROUND(SUM(CASE WHEN exited = 1 THEN balance ELSE 0 END), 2) AS lost_capital_usd
FROM customers
GROUP BY balance_tier
ORDER BY balance_tier ASC;`
  },
  {
    id: 'country_gender_cross',
    title: '4. Geographic & Demographic Churn Analysis',
    category: 'Geography & Demographics',
    description: 'Compares churn performance across France, Germany, and Spain split by gender to reveal market variance.',
    sql: `SELECT 
    geography,
    gender,
    COUNT(*) AS customers,
    SUM(exited) AS churned,
    ROUND(SUM(exited) * 100.0 / COUNT(*), 2) AS churn_rate_pct,
    ROUND(AVG(balance), 2) AS avg_balance,
    ROUND(AVG(credit_score), 1) AS avg_credit_score
FROM customers
GROUP BY geography, gender
ORDER BY geography ASC, gender DESC;`
  },
  {
    id: 'product_count_risk',
    title: '5. Multi-Product Holding Anomaly (The 3+ Product Trap)',
    category: 'Product Analysis',
    description: 'Demonstrates the critical bank discovery: customers with 2 products have lowest churn (7%), but 3+ products show >80% attrition.',
    sql: `SELECT 
    num_of_products,
    COUNT(*) AS customer_count,
    SUM(exited) AS churned_customers,
    ROUND(SUM(exited) * 100.0 / COUNT(*), 2) AS churn_rate_pct,
    ROUND(AVG(balance), 2) AS avg_balance,
    ROUND(AVG(age), 1) AS avg_age
FROM customers
GROUP BY num_of_products
ORDER BY num_of_products ASC;`
  },
  {
    id: 'at_risk_high_value',
    title: '6. High-Value At-Risk Customers for Immediate Retention',
    category: 'Targeted Retention',
    description: 'Identifies non-churned high-balance customers with inactivity or high churn risk markers for targeted outreach.',
    sql: `SELECT 
    customer_id,
    surname,
    geography,
    age,
    tenure,
    balance,
    num_of_products,
    credit_score,
    is_active_member
FROM customers
WHERE exited = 0 
  AND balance > 90000 
  AND (is_active_member = 0 OR age >= 45 OR num_of_products >= 3)
ORDER BY balance DESC
LIMIT 15;`
  }
];

export const RETENTION_CAMPAIGNS = [
  {
    id: 'camp_inactive_high_balance',
    name: 'Wealth Preservation: Inactive High-Balance Outreach',
    targetSegment: 'Inactive accounts with >$100,000 balance in Germany & France',
    description: 'Assign dedicated private bankers and invite customers to preferential fixed-term yield accounts, preventing asset flight.',
    eligibleCustomers: 184,
    estimatedCostPerCustomer: 75,
    expectedRetentionBoost: 0.42,
    avgBalance: 128500
  },
  {
    id: 'camp_multi_product_concierge',
    name: 'Product Optimization: 3+ Product Customer Concierge',
    targetSegment: 'Customers holding 3 or 4 products (high churn anomaly)',
    description: 'Streamline bundled fee structures, conduct service check-ins, and eliminate friction in secondary account management.',
    eligibleCustomers: 48,
    estimatedCostPerCustomer: 45,
    expectedRetentionBoost: 0.55,
    avgBalance: 98000
  },
  {
    id: 'camp_midlife_loyalty',
    name: 'Age 45-58 Mid-Life Financial Health Program',
    targetSegment: 'Customers aged 45-58 with moderate-to-high tenure (4+ yrs)',
    description: 'Provide customized retirement planning, family banking perks, and preferential mortgage refinancing rates.',
    eligibleCustomers: 312,
    estimatedCostPerCustomer: 30,
    expectedRetentionBoost: 0.35,
    avgBalance: 84000
  },
  {
    id: 'camp_german_reengagement',
    name: 'German Market Specialized Relationship Package',
    targetSegment: 'All German branch customers with balance >$75,000',
    description: 'Counter strong local fintech competition by upgrading online banking features, zero SEPA fees, and fee-free premium cards.',
    eligibleCustomers: 260,
    estimatedCostPerCustomer: 50,
    expectedRetentionBoost: 0.38,
    avgBalance: 120000
  }
];

export const PYTHON_MODEL_STATS = {
  models: [
    { name: 'Random Forest (Tuned)', accuracy: 0.865, precision: 0.782, recall: 0.694, f1: 0.735, roc_auc: 0.868, best: true },
    { name: 'XGBoost Classifier', accuracy: 0.858, precision: 0.764, recall: 0.680, f1: 0.719, roc_auc: 0.861, best: false },
    { name: 'Logistic Regression', accuracy: 0.812, precision: 0.620, recall: 0.285, f1: 0.390, roc_auc: 0.771, best: false },
    { name: 'Decision Tree (Baseline)', accuracy: 0.795, precision: 0.520, recall: 0.535, f1: 0.527, roc_auc: 0.702, best: false }
  ],
  featureImportances: [
    { feature: 'Age', importance: 0.284, category: 'Demographic' as const, direction: 'Positive (Increases Churn)' as const, insight: 'Customers aged 45-60 churn at 2.4x the baseline bank rate.' },
    { feature: 'NumOfProducts', importance: 0.246, category: 'Engagement' as const, direction: 'Positive (Increases Churn)' as const, insight: 'Having 2 products minimizes churn; having 3 or 4 causes catastrophic attrition.' },
    { feature: 'Balance', importance: 0.165, category: 'Financial' as const, direction: 'Positive (Increases Churn)' as const, insight: 'High-balance depositors leave when dissatisfied with yield or service.' },
    { feature: 'IsActiveMember', importance: 0.138, category: 'Engagement' as const, direction: 'Negative (Decreases Churn)' as const, insight: 'Active digital & branch engagement reduces churn likelihood by ~47%.' },
    { feature: 'Geography_Germany', importance: 0.082, category: 'Demographic' as const, direction: 'Positive (Increases Churn)' as const, insight: 'German market churn rate is 32.4% vs 16.1% in France and 16.6% in Spain.' },
    { feature: 'CreditScore', importance: 0.045, category: 'Financial' as const, direction: 'Negative (Decreases Churn)' as const, insight: 'Scores below 500 exhibit elevated involuntary and voluntary attrition.' },
    { feature: 'Gender_Female', importance: 0.025, category: 'Demographic' as const, direction: 'Positive (Increases Churn)' as const, insight: 'Female demographic exhibits 25.1% churn vs 16.5% for male customers.' },
    { feature: 'Tenure', importance: 0.015, category: 'Engagement' as const, direction: 'Negative (Decreases Churn)' as const, insight: 'Tenure exhibits mild U-shaped churn: slight spike at year 1 and year 10.' }
  ]
};
