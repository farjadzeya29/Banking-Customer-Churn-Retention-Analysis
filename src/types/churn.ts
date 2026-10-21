export interface CustomerRecord {
  customerId: number;
  surname: string;
  creditScore: number;
  geography: 'France' | 'Germany' | 'Spain';
  gender: 'Male' | 'Female';
  age: number;
  tenure: number;
  balance: number;
  numOfProducts: number;
  hasCrCard: number;
  isActiveMember: number;
  estimatedSalary: number;
  exited: number;
  churnProbability: number;
  riskTier: 'Low' | 'Medium' | 'High' | 'Critical';
  keyRiskFactors: string[];
}

export interface DashboardFilterState {
  geography: string; // 'All' | 'France' | 'Germany' | 'Spain'
  gender: string; // 'All' | 'Male' | 'Female'
  activityStatus: string; // 'All' | 'Active' | 'Inactive'
  tenureBucket: string; // 'All' | '0-2 yrs' | '3-5 yrs' | '6-8 yrs' | '9+ yrs'
  balanceTier: string; // 'All' | 'Zero ($0)' | 'Low (<$50k)' | 'Mid ($50k-$100k)' | 'High ($100k-$150k)' | 'Ultra (>$150k)'
  numOfProducts: string; // 'All' | '1' | '2' | '3' | '4'
  ageGroup: string; // 'All' | '<30' | '30-40' | '40-50' | '50-60' | '60+'
  searchQuery: string;
}

export interface KpiMetrics {
  totalCustomers: number;
  churnedCustomers: number;
  churnRate: number;
  retainedCustomers: number;
  totalBalanceAtRisk: number;
  avgBalanceChurned: number;
  avgCreditScore: number;
  inactiveChurnRate: number;
  activeChurnRate: number;
  germanyChurnRate: number;
  multiProductRiskRate: number;
}

export interface TenureChurnData {
  tenure: number;
  total: number;
  churned: number;
  churnRate: number;
  retained: number;
}

export interface BalanceTierData {
  tier: string;
  total: number;
  churned: number;
  churnRate: number;
  avgBalance: number;
  balanceSum: number;
}

export interface ActivityChurnData {
  status: string;
  total: number;
  churned: number;
  churnRate: number;
}

export interface ProductCountData {
  products: number;
  total: number;
  churned: number;
  churnRate: number;
  riskLevel: 'Safe' | 'Low' | 'High' | 'Severe';
}

export interface GeographyChurnData {
  country: string;
  total: number;
  churned: number;
  churnRate: number;
  totalBalance: number;
}

export interface AgeCohortData {
  ageRange: string;
  total: number;
  churned: number;
  churnRate: number;
}

export interface FeatureImportanceItem {
  feature: string;
  importance: number;
  category: 'Demographic' | 'Engagement' | 'Financial';
  direction: 'Positive (Increases Churn)' | 'Negative (Decreases Churn)';
  insight: string;
}

export interface SqlSampleQuery {
  id: string;
  title: string;
  category: string;
  description: string;
  sql: string;
}

export interface RetentionCampaign {
  id: string;
  name: string;
  targetSegment: string;
  description: string;
  eligibleCustomers: number;
  estimatedCostPerCustomer: number;
  expectedRetentionBoost: number; // e.g. 0.35
  avgBalance: number;
}
