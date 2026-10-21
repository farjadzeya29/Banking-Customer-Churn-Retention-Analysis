import { CustomerRecord } from '../types/churn';

export interface SqlQueryResult {
  columns: string[];
  rows: Record<string, any>[];
  rowCount: number;
  executionTimeMs: number;
  error?: string;
}

export function executeBankingSqlQuery(sql: string, dataset: CustomerRecord[]): SqlQueryResult {
  const startTime = performance.now();
  const trimmed = sql.trim();

  try {
    const normalized = trimmed.replace(/\s+/g, ' ').toLowerCase();

    // Check if it's Query 1: KPI overview
    if (normalized.includes('round(sum(exited) * 100.0 / count(*), 2) as churn_rate_pct') && !normalized.includes('group by')) {
      const total = dataset.length;
      const churned = dataset.filter(c => c.exited === 1).length;
      const rate = total > 0 ? (churned * 100 / total) : 0;
      const churnedBal = dataset.filter(c => c.exited === 1).reduce((acc, c) => acc + c.balance, 0);
      const avgChurnedBal = churned > 0 ? churnedBal / churned : 0;

      return {
        columns: ['total_customers', 'churned_customers', 'churn_rate_pct', 'churned_balance_usd', 'avg_churned_balance'],
        rows: [{
          total_customers: total,
          churned_customers: churned,
          churn_rate_pct: `${rate.toFixed(2)}%`,
          churned_balance_usd: `$${churnedBal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          avg_churned_balance: `$${avgChurnedBal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        }],
        rowCount: 1,
        executionTimeMs: Math.round(performance.now() - startTime + 4)
      };
    }

    // Check if it's Query 2: tenure & activity
    if (normalized.includes('group by tenure, is_active_member') || (normalized.includes('tenure') && normalized.includes('activity_status'))) {
      const groups = new Map<string, { tenure: number; isActive: number; total: number; churned: number; balanceSum: number }>();
      
      dataset.forEach(c => {
        const key = `${c.tenure}_${c.isActiveMember}`;
        if (!groups.has(key)) {
          groups.set(key, { tenure: c.tenure, isActive: c.isActiveMember, total: 0, churned: 0, balanceSum: 0 });
        }
        const item = groups.get(key)!;
        item.total++;
        if (c.exited === 1) item.churned++;
        item.balanceSum += c.balance;
      });

      const rows = Array.from(groups.values())
        .sort((a, b) => a.tenure === b.tenure ? b.isActive - a.isActive : a.tenure - b.tenure)
        .map(g => ({
          tenure: `${g.tenure} ${g.tenure === 1 ? 'Year' : 'Years'}`,
          activity_status: g.isActive === 1 ? 'Active Member' : 'Inactive Member',
          total_customers: g.total,
          churned_customers: g.churned,
          churn_rate_pct: `${((g.churned / g.total) * 100).toFixed(2)}%`,
          avg_balance: `$${Math.round(g.balanceSum / g.total).toLocaleString()}`
        }));

      return {
        columns: ['tenure', 'activity_status', 'total_customers', 'churned_customers', 'churn_rate_pct', 'avg_balance'],
        rows,
        rowCount: rows.length,
        executionTimeMs: Math.round(performance.now() - startTime + 8)
      };
    }

    // Check if it's Query 3: balance tiers
    if (normalized.includes('balance_tier') || normalized.includes('zero balance ($0)')) {
      const tiers = [
        { name: '1. Zero Balance ($0)', min: 0, max: 0, total: 0, churned: 0, balSum: 0, churnBalSum: 0 },
        { name: '2. Low (< $50k)', min: 0.01, max: 50000, total: 0, churned: 0, balSum: 0, churnBalSum: 0 },
        { name: '3. Moderate ($50k - $100k)', min: 50000, max: 100000, total: 0, churned: 0, balSum: 0, churnBalSum: 0 },
        { name: '4. High ($100k - $150k)', min: 100000, max: 150000, total: 0, churned: 0, balSum: 0, churnBalSum: 0 },
        { name: '5. Ultra Wealth (> $150k)', min: 150000, max: Infinity, total: 0, churned: 0, balSum: 0, churnBalSum: 0 }
      ];

      dataset.forEach(c => {
        let t = tiers[0];
        if (c.balance === 0) t = tiers[0];
        else if (c.balance < 50000) t = tiers[1];
        else if (c.balance < 100000) t = tiers[2];
        else if (c.balance < 150000) t = tiers[3];
        else t = tiers[4];

        t.total++;
        t.balSum += c.balance;
        if (c.exited === 1) {
          t.churned++;
          t.churnBalSum += c.balance;
        }
      });

      const rows = tiers.map(t => ({
        balance_tier: t.name,
        customer_count: t.total,
        churned_count: t.churned,
        churn_rate_pct: t.total > 0 ? `${((t.churned / t.total) * 100).toFixed(2)}%` : '0.00%',
        total_deposits_usd: `$${Math.round(t.balSum).toLocaleString()}`,
        lost_capital_usd: `$${Math.round(t.churnBalSum).toLocaleString()}`
      }));

      return {
        columns: ['balance_tier', 'customer_count', 'churned_count', 'churn_rate_pct', 'total_deposits_usd', 'lost_capital_usd'],
        rows,
        rowCount: rows.length,
        executionTimeMs: Math.round(performance.now() - startTime + 6)
      };
    }

    // Check if it's Query 4: geography & gender
    if (normalized.includes('group by geography, gender') || (normalized.includes('geography') && normalized.includes('avg_credit_score'))) {
      const groups = new Map<string, { geo: string; gen: string; total: number; churned: number; balSum: number; credSum: number }>();

      dataset.forEach(c => {
        const key = `${c.geography}_${c.gender}`;
        if (!groups.has(key)) {
          groups.set(key, { geo: c.geography, gen: c.gender, total: 0, churned: 0, balSum: 0, credSum: 0 });
        }
        const item = groups.get(key)!;
        item.total++;
        if (c.exited === 1) item.churned++;
        item.balSum += c.balance;
        item.credSum += c.creditScore;
      });

      const rows = Array.from(groups.values())
        .sort((a, b) => a.geo.localeCompare(b.geo) || b.gen.localeCompare(a.gen))
        .map(g => ({
          geography: g.geo,
          gender: g.gen,
          customers: g.total,
          churned: g.churned,
          churn_rate_pct: `${((g.churned / g.total) * 100).toFixed(2)}%`,
          avg_balance: `$${Math.round(g.balSum / g.total).toLocaleString()}`,
          avg_credit_score: (g.credSum / g.total).toFixed(1)
        }));

      return {
        columns: ['geography', 'gender', 'customers', 'churned', 'churn_rate_pct', 'avg_balance', 'avg_credit_score'],
        rows,
        rowCount: rows.length,
        executionTimeMs: Math.round(performance.now() - startTime + 5)
      };
    }

    // Check if it's Query 5: product count
    if (normalized.includes('group by num_of_products') || normalized.includes('num_of_products')) {
      const groups = new Map<number, { count: number; churned: number; balSum: number; ageSum: number }>();
      [1, 2, 3, 4].forEach(p => groups.set(p, { count: 0, churned: 0, balSum: 0, ageSum: 0 }));

      dataset.forEach(c => {
        if (!groups.has(c.numOfProducts)) groups.set(c.numOfProducts, { count: 0, churned: 0, balSum: 0, ageSum: 0 });
        const item = groups.get(c.numOfProducts)!;
        item.count++;
        if (c.exited === 1) item.churned++;
        item.balSum += c.balance;
        item.ageSum += c.age;
      });

      const rows = Array.from(groups.entries())
        .sort(([a], [b]) => a - b)
        .map(([prod, val]) => ({
          num_of_products: prod,
          customer_count: val.count,
          churned_customers: val.churned,
          churn_rate_pct: val.count > 0 ? `${((val.churned / val.count) * 100).toFixed(2)}%` : '0.00%',
          avg_balance: val.count > 0 ? `$${Math.round(val.balSum / val.count).toLocaleString()}` : '$0',
          avg_age: val.count > 0 ? (val.ageSum / val.count).toFixed(1) : '0'
        }));

      return {
        columns: ['num_of_products', 'customer_count', 'churned_customers', 'churn_rate_pct', 'avg_balance', 'avg_age'],
        rows,
        rowCount: rows.length,
        executionTimeMs: Math.round(performance.now() - startTime + 5)
      };
    }

    // Check if it's Query 6: at risk high balance
    if (normalized.includes('exited = 0') && normalized.includes('balance > 90000')) {
      const filtered = dataset
        .filter(c => c.exited === 0 && c.balance > 90000 && (c.isActiveMember === 0 || c.age >= 45 || c.numOfProducts >= 3))
        .sort((a, b) => b.balance - a.balance)
        .slice(0, 15);

      const rows = filtered.map(c => ({
        customer_id: c.customerId,
        surname: c.surname,
        geography: c.geography,
        age: c.age,
        tenure: `${c.tenure} yrs`,
        balance: `$${c.balance.toLocaleString()}`,
        num_of_products: c.numOfProducts,
        credit_score: c.creditScore,
        is_active_member: c.isActiveMember === 1 ? 'Yes' : 'No'
      }));

      return {
        columns: ['customer_id', 'surname', 'geography', 'age', 'tenure', 'balance', 'num_of_products', 'credit_score', 'is_active_member'],
        rows,
        rowCount: rows.length,
        executionTimeMs: Math.round(performance.now() - startTime + 7)
      };
    }

    // Generic fallback for custom queries on customers table
    let working = [...dataset];

    // Simple WHERE matching
    if (normalized.includes('where')) {
      const wherePart = normalized.split('where')[1].split('group by')[0].split('order by')[0].split('limit')[0];
      if (wherePart.includes('geography = \'germany\'') || wherePart.includes('geography = "germany"')) {
        working = working.filter(c => c.geography === 'Germany');
      } else if (wherePart.includes('geography = \'france\'')) {
        working = working.filter(c => c.geography === 'France');
      } else if (wherePart.includes('geography = \'spain\'')) {
        working = working.filter(c => c.geography === 'Spain');
      }

      if (wherePart.includes('exited = 1')) working = working.filter(c => c.exited === 1);
      if (wherePart.includes('exited = 0')) working = working.filter(c => c.exited === 0);
      if (wherePart.includes('is_active_member = 0')) working = working.filter(c => c.isActiveMember === 0);
      if (wherePart.includes('is_active_member = 1')) working = working.filter(c => c.isActiveMember === 1);
      if (wherePart.includes('balance > 0')) working = working.filter(c => c.balance > 0);
    }

    // Handle limit
    let limit = 50;
    const limitMatch = normalized.match(/limit\s+(\d+)/);
    if (limitMatch) {
      limit = parseInt(limitMatch[1], 10);
    }

    // Select raw columns
    const sliced = working.slice(0, limit);
    const columns = ['customer_id', 'surname', 'geography', 'gender', 'age', 'tenure', 'balance', 'num_of_products', 'credit_score', 'is_active_member', 'exited'];
    const rows = sliced.map(c => ({
      customer_id: c.customerId,
      surname: c.surname,
      geography: c.geography,
      gender: c.gender,
      age: c.age,
      tenure: c.tenure,
      balance: `$${c.balance.toLocaleString()}`,
      num_of_products: c.numOfProducts,
      credit_score: c.creditScore,
      is_active_member: c.isActiveMember,
      exited: c.exited
    }));

    return {
      columns,
      rows,
      rowCount: rows.length,
      executionTimeMs: Math.round(performance.now() - startTime + 6)
    };
  } catch (err: any) {
    return {
      columns: [],
      rows: [],
      rowCount: 0,
      executionTimeMs: Math.round(performance.now() - startTime),
      error: err.message || 'Syntax error in SQL query'
    };
  }
}
