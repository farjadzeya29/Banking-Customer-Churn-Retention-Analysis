import { 
  CustomerRecord, 
  DashboardFilterState, 
  KpiMetrics, 
  TenureChurnData, 
  BalanceTierData, 
  ActivityChurnData, 
  ProductCountData, 
  GeographyChurnData, 
  AgeCohortData 
} from '../types/churn';

export function filterCustomerDataset(customers: CustomerRecord[], filters: DashboardFilterState): CustomerRecord[] {
  return customers.filter(c => {
    // Geography
    if (filters.geography !== 'All' && c.geography !== filters.geography) return false;

    // Gender
    if (filters.gender !== 'All' && c.gender !== filters.gender) return false;

    // Activity
    if (filters.activityStatus === 'Active' && c.isActiveMember !== 1) return false;
    if (filters.activityStatus === 'Inactive' && c.isActiveMember !== 0) return false;

    // Tenure Bucket
    if (filters.tenureBucket !== 'All') {
      if (filters.tenureBucket === '0-2 yrs' && c.tenure > 2) return false;
      if (filters.tenureBucket === '3-5 yrs' && (c.tenure < 3 || c.tenure > 5)) return false;
      if (filters.tenureBucket === '6-8 yrs' && (c.tenure < 6 || c.tenure > 8)) return false;
      if (filters.tenureBucket === '9+ yrs' && c.tenure < 9) return false;
    }

    // Balance Tier
    if (filters.balanceTier !== 'All') {
      if (filters.balanceTier === 'Zero ($0)' && c.balance !== 0) return false;
      if (filters.balanceTier === 'Low (<$50k)' && (c.balance === 0 || c.balance >= 50000)) return false;
      if (filters.balanceTier === 'Mid ($50k-$100k)' && (c.balance < 50000 || c.balance >= 100000)) return false;
      if (filters.balanceTier === 'High ($100k-$150k)' && (c.balance < 100000 || c.balance >= 150000)) return false;
      if (filters.balanceTier === 'Ultra (>$150k)' && c.balance < 150000) return false;
    }

    // Number of products
    if (filters.numOfProducts !== 'All') {
      const prodVal = parseInt(filters.numOfProducts, 10);
      if (c.numOfProducts !== prodVal) return false;
    }

    // Age Group
    if (filters.ageGroup !== 'All') {
      if (filters.ageGroup === '<30' && c.age >= 30) return false;
      if (filters.ageGroup === '30-40' && (c.age < 30 || c.age >= 40)) return false;
      if (filters.ageGroup === '40-50' && (c.age < 40 || c.age >= 50)) return false;
      if (filters.ageGroup === '50-60' && (c.age < 50 || c.age >= 60)) return false;
      if (filters.ageGroup === '60+' && c.age < 60) return false;
    }

    // Search Query
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      const matchSurname = c.surname.toLowerCase().includes(q);
      const matchId = c.customerId.toString().includes(q);
      const matchCountry = c.geography.toLowerCase().includes(q);
      if (!matchSurname && !matchId && !matchCountry) return false;
    }

    return true;
  });
}

export function computeKpiMetrics(customers: CustomerRecord[]): KpiMetrics {
  const totalCustomers = customers.length;
  if (totalCustomers === 0) {
    return {
      totalCustomers: 0,
      churnedCustomers: 0,
      churnRate: 0,
      retainedCustomers: 0,
      totalBalanceAtRisk: 0,
      avgBalanceChurned: 0,
      avgCreditScore: 0,
      inactiveChurnRate: 0,
      activeChurnRate: 0,
      germanyChurnRate: 0,
      multiProductRiskRate: 0
    };
  }

  const churned = customers.filter(c => c.exited === 1);
  const churnedCustomers = churned.length;
  const churnRate = (churnedCustomers / totalCustomers) * 100;
  const retainedCustomers = totalCustomers - churnedCustomers;

  const totalBalanceAtRisk = churned.reduce((acc, c) => acc + c.balance, 0);
  const avgBalanceChurned = churnedCustomers > 0 ? totalBalanceAtRisk / churnedCustomers : 0;
  const avgCreditScore = Math.round(customers.reduce((acc, c) => acc + c.creditScore, 0) / totalCustomers);

  const inactiveList = customers.filter(c => c.isActiveMember === 0);
  const activeList = customers.filter(c => c.isActiveMember === 1);
  const inactiveChurnRate = inactiveList.length > 0
    ? (inactiveList.filter(c => c.exited === 1).length / inactiveList.length) * 100
    : 0;
  const activeChurnRate = activeList.length > 0
    ? (activeList.filter(c => c.exited === 1).length / activeList.length) * 100
    : 0;

  const germanyList = customers.filter(c => c.geography === 'Germany');
  const germanyChurnRate = germanyList.length > 0
    ? (germanyList.filter(c => c.exited === 1).length / germanyList.length) * 100
    : 0;

  const multiProdList = customers.filter(c => c.numOfProducts >= 3);
  const multiProductRiskRate = multiProdList.length > 0
    ? (multiProdList.filter(c => c.exited === 1).length / multiProdList.length) * 100
    : 0;

  return {
    totalCustomers,
    churnedCustomers,
    churnRate: Number(churnRate.toFixed(2)),
    retainedCustomers,
    totalBalanceAtRisk,
    avgBalanceChurned,
    avgCreditScore,
    inactiveChurnRate: Number(inactiveChurnRate.toFixed(2)),
    activeChurnRate: Number(activeChurnRate.toFixed(2)),
    germanyChurnRate: Number(germanyChurnRate.toFixed(2)),
    multiProductRiskRate: Number(multiProductRiskRate.toFixed(2))
  };
}

export function getTenureChurnDistribution(customers: CustomerRecord[]): TenureChurnData[] {
  const result: TenureChurnData[] = [];
  for (let t = 0; t <= 10; t++) {
    const list = customers.filter(c => c.tenure === t);
    const total = list.length;
    const churned = list.filter(c => c.exited === 1).length;
    const churnRate = total > 0 ? Number(((churned / total) * 100).toFixed(1)) : 0;
    result.push({
      tenure: t,
      total,
      churned,
      churnRate,
      retained: total - churned
    });
  }
  return result;
}

export function getBalanceTierDistribution(customers: CustomerRecord[]): BalanceTierData[] {
  const tiers = [
    { name: 'Zero ($0)', min: 0, max: 0 },
    { name: 'Low (<$50k)', min: 0.01, max: 50000 },
    { name: 'Mid ($50k-$100k)', min: 50000, max: 100000 },
    { name: 'High ($100k-$150k)', min: 100000, max: 150000 },
    { name: 'Ultra (>$150k)', min: 150000, max: Infinity }
  ];

  return tiers.map(t => {
    let list: CustomerRecord[] = [];
    if (t.name === 'Zero ($0)') {
      list = customers.filter(c => c.balance === 0);
    } else {
      list = customers.filter(c => c.balance >= t.min && c.balance < t.max);
    }
    const total = list.length;
    const churned = list.filter(c => c.exited === 1).length;
    const churnRate = total > 0 ? Number(((churned / total) * 100).toFixed(1)) : 0;
    const balanceSum = list.reduce((acc, c) => acc + c.balance, 0);
    const avgBalance = total > 0 ? Math.round(balanceSum / total) : 0;

    return {
      tier: t.name,
      total,
      churned,
      churnRate,
      avgBalance,
      balanceSum
    };
  });
}

export function getActivityChurnDistribution(customers: CustomerRecord[]): ActivityChurnData[] {
  const activeList = customers.filter(c => c.isActiveMember === 1);
  const inactiveList = customers.filter(c => c.isActiveMember === 0);

  const activeTotal = activeList.length;
  const activeChurned = activeList.filter(c => c.exited === 1).length;
  const activeRate = activeTotal > 0 ? Number(((activeChurned / activeTotal) * 100).toFixed(1)) : 0;

  const inactiveTotal = inactiveList.length;
  const inactiveChurned = inactiveList.filter(c => c.exited === 1).length;
  const inactiveRate = inactiveTotal > 0 ? Number(((inactiveChurned / inactiveTotal) * 100).toFixed(1)) : 0;

  return [
    { status: 'Active Member', total: activeTotal, churned: activeChurned, churnRate: activeRate },
    { status: 'Inactive Member', total: inactiveTotal, churned: inactiveChurned, churnRate: inactiveRate }
  ];
}

export function getProductCountDistribution(customers: CustomerRecord[]): ProductCountData[] {
  return [1, 2, 3, 4].map(p => {
    const list = customers.filter(c => c.numOfProducts === p);
    const total = list.length;
    const churned = list.filter(c => c.exited === 1).length;
    const churnRate = total > 0 ? Number(((churned / total) * 100).toFixed(1)) : 0;
    let riskLevel: 'Safe' | 'Low' | 'High' | 'Severe' = 'Low';
    if (churnRate > 75) riskLevel = 'Severe';
    else if (churnRate > 40) riskLevel = 'High';
    else if (churnRate < 12) riskLevel = 'Safe';

    return {
      products: p,
      total,
      churned,
      churnRate,
      riskLevel
    };
  });
}

export function getGeographyDistribution(customers: CustomerRecord[]): GeographyChurnData[] {
  const countries = ['France', 'Germany', 'Spain'] as const;
  return countries.map(cName => {
    const list = customers.filter(c => c.geography === cName);
    const total = list.length;
    const churned = list.filter(c => c.exited === 1).length;
    const churnRate = total > 0 ? Number(((churned / total) * 100).toFixed(1)) : 0;
    const totalBalance = list.reduce((acc, c) => acc + c.balance, 0);

    return {
      country: cName,
      total,
      churned,
      churnRate,
      totalBalance
    };
  });
}

export function getAgeCohortDistribution(customers: CustomerRecord[]): AgeCohortData[] {
  const cohorts = [
    { range: '18-29 (Young)', min: 18, max: 30 },
    { range: '30-39 (Career)', min: 30, max: 40 },
    { range: '40-49 (Prime)', min: 40, max: 50 },
    { range: '50-59 (Mature)', min: 50, max: 60 },
    { range: '60+ (Senior)', min: 60, max: 120 }
  ];

  return cohorts.map(c => {
    const list = customers.filter(cust => cust.age >= c.min && cust.age < c.max);
    const total = list.length;
    const churned = list.filter(cust => cust.exited === 1).length;
    const churnRate = total > 0 ? Number(((churned / total) * 100).toFixed(1)) : 0;

    return {
      ageRange: c.range,
      total,
      churned,
      churnRate
    };
  });
}

export interface RiskSegmentCell {
  tenureTier: 'New (0-2y)' | 'Mid (3-6y)' | 'Loyal (7-10y)';
  activity: 'Active' | 'Inactive';
  balanceClass: 'Zero/Low' | 'Moderate ($50-100k)' | 'High ($100k+)';
  total: number;
  churned: number;
  churnRate: number;
  balanceSum: number;
  riskSeverity: 'Critical' | 'Elevated' | 'Moderate' | 'Low';
}

export function getRiskSegmentMatrix(customers: CustomerRecord[]): RiskSegmentCell[] {
  const tenureTiers: ('New (0-2y)' | 'Mid (3-6y)' | 'Loyal (7-10y) ')[] = ['New (0-2y)', 'Mid (3-6y)', 'Loyal (7-10y) '];
  const activities: ('Active' | 'Inactive')[] = ['Active', 'Inactive'];
  const balances: ('Zero/Low' | 'Moderate ($50-100k)' | 'High ($100k+)')[] = ['Zero/Low', 'Moderate ($50-100k)', 'High ($100k+)'];

  const cells: RiskSegmentCell[] = [];

  tenureTiers.forEach(tTier => {
    activities.forEach(act => {
      balances.forEach(balClass => {
        const list = customers.filter(c => {
          // Tenure
          if (tTier === 'New (0-2y)' && c.tenure > 2) return false;
          if (tTier === 'Mid (3-6y)' && (c.tenure < 3 || c.tenure > 6)) return false;
          if (tTier.startsWith('Loyal') && c.tenure < 7) return false;

          // Activity
          if (act === 'Active' && c.isActiveMember !== 1) return false;
          if (act === 'Inactive' && c.isActiveMember !== 0) return false;

          // Balance
          if (balClass === 'Zero/Low' && c.balance >= 50000) return false;
          if (balClass === 'Moderate ($50-100k)' && (c.balance < 50000 || c.balance >= 100000)) return false;
          if (balClass === 'High ($100k+)' && c.balance < 100000) return false;

          return true;
        });

        const total = list.length;
        const churned = list.filter(c => c.exited === 1).length;
        const churnRate = total > 0 ? Number(((churned / total) * 100).toFixed(1)) : 0;
        const balanceSum = list.reduce((acc, c) => acc + c.balance, 0);

        let riskSeverity: 'Critical' | 'Elevated' | 'Moderate' | 'Low' = 'Low';
        if (churnRate >= 45 || (churnRate >= 30 && balanceSum > 5000000)) riskSeverity = 'Critical';
        else if (churnRate >= 28) riskSeverity = 'Elevated';
        else if (churnRate >= 16) riskSeverity = 'Moderate';

        cells.push({
          tenureTier: tTier.trim() as any,
          activity: act,
          balanceClass: balClass,
          total,
          churned,
          churnRate,
          balanceSum,
          riskSeverity
        });
      });
    });
  });

  return cells.sort((a, b) => b.churnRate - a.churnRate);
}
