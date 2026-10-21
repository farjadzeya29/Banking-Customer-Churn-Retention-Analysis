import React, { useState } from 'react';
import { PYTHON_MODEL_STATS } from '../../data/mockBankData';
import { 
  BrainCircuit, 
  Code, 
  Sparkles, 
  Sliders, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  Copy, 
  Check, 
  Layers,
  Activity,
  AlertCircle
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from 'recharts';

export const PythonMlExplorer: React.FC = () => {
  const [activeCodeTab, setActiveCodeTab] = useState<'pipeline' | 'feature_importance' | 'shap'>('pipeline');
  const [copied, setCopied] = useState(false);

  // Interactive What-If Simulator state
  const [simAge, setSimAge] = useState<number>(46);
  const [simBalance, setSimBalance] = useState<number>(115000);
  const [simProducts, setSimProducts] = useState<number>(3);
  const [simActive, setSimActive] = useState<boolean>(false);
  const [simCountry, setSimCountry] = useState<'France' | 'Germany' | 'Spain'>('Germany');
  const [simCreditScore, setSimCreditScore] = useState<number>(640);

  // Compute what-if churn probability
  const calculateSimulatedChurn = () => {
    let score = 0.12;
    if (simAge >= 50 && simAge <= 65) score += 0.35;
    else if (simAge >= 40 && simAge < 50) score += 0.22;
    else if (simAge < 30) score -= 0.05;

    if (simCountry === 'Germany') score += 0.16;

    if (!simActive) score += 0.15;
    else score -= 0.08;

    if (simProducts === 2) score -= 0.14;
    else if (simProducts === 3) score += 0.60;
    else if (simProducts === 4) score += 0.78;

    if (simBalance > 100000 && !simActive) score += 0.14;
    else if (simBalance === 0) score -= 0.03;

    if (simCreditScore < 550) score += 0.09;

    const prob = Math.min(0.98, Math.max(0.03, score));
    return Number((prob * 100).toFixed(1));
  };

  const simProb = calculateSimulatedChurn();

  const codeSnippets = {
    pipeline: `# ============================================================
# Python Scikit-Learn Pipeline: Bank Customer Churn Modeling
# ============================================================
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, roc_auc_score

# 1. Load Data from Bank Data Warehouse
df = pd.read_sql("SELECT * FROM customers", connection)

# 2. Separate Features & Target
X = df.drop(columns=['customer_id', 'surname', 'exited'])
y = df['exited']

num_features = ['credit_score', 'age', 'tenure', 'balance', 'num_of_products', 'estimated_salary']
cat_features = ['geography', 'gender']

# 3. Preprocessing Pipeline
preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), num_features),
        ('cat', OneHotEncoder(drop='first'), cat_features)
    ],
    remainder='passthrough'
)

# 4. Train/Test Split (Stratified 80/20)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)

# 5. Tuned Random Forest Classifier
rf_clf = RandomForestClassifier(
    n_estimators=300,
    max_depth=12,
    min_samples_split=4,
    class_weight='balanced',
    random_state=42
)

X_train_proc = preprocessor.fit_transform(X_train)
X_test_proc = preprocessor.transform(X_test)

rf_clf.fit(X_train_proc, y_train)
y_pred_proba = rf_clf.predict_proba(X_test_proc)[:, 1]

print(f"ROC-AUC Score: {roc_auc_score(y_test, y_pred_proba):.3f}")`,
    feature_importance: `# ============================================================
# Feature Importance Extraction & Drivers Analysis
# ============================================================
import matplotlib.pyplot as plt

# Extract feature names from ColumnTransformer
feature_names = (
    num_features + 
    list(preprocessor.named_transformers_['cat'].get_feature_names_out(cat_features)) +
    ['has_cr_card', 'is_active_member']
)

importances = rf_clf.feature_importances_
importance_df = pd.DataFrame({
    'Feature': feature_names,
    'Importance': importances
}).sort_values('Importance', ascending=False)

print("Top 5 Churn Drivers:")
print(importance_df.head(5))
# Output:
# 1. Age: 0.284
# 2. NumOfProducts: 0.246
# 3. Balance: 0.165
# 4. IsActiveMember: 0.138
# 5. Geography_Germany: 0.082`,
    shap: `# ============================================================
# SHAP (SHapley Additive exPlanations) Interpretability
# ============================================================
import shap

explainer = shap.TreeExplainer(rf_clf)
shap_values = explainer.shap_values(X_test_proc)

# Global Feature Summary Plot
shap.summary_plot(shap_values[1], X_test_proc, feature_names=feature_names)

# Key Takeaway:
# - High Age pushes SHAP value strongly positive (high churn hazard)
# - Inactive Member (0) pushes SHAP positive
# - NumOfProducts == 2 pushes SHAP negative (protective anchor)
# - Geography == Germany strongly increases churn propensity`
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeSnippets[activeCodeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <BrainCircuit className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white">
                Python Machine Learning: Churn Drivers & SHAP Interpretability
              </h2>
            </div>
            <p className="text-xs text-slate-300 max-w-3xl">
              Trained predictive classification models (Random Forest, XGBoost, Logistic Regression) to uncover feature weights and non-linear interactions between 
              <strong> customer age, product holding counts, activity status, and deposit balance</strong>.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-indigo-950/60 border border-indigo-800/80 px-3.5 py-1.5 rounded-lg text-xs font-mono text-indigo-300">
            <span>Optimal Model: <strong>Random Forest (AUC 0.868)</strong></span>
          </div>
        </div>
      </div>

      {/* Model Benchmark Comparison Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Algorithm Performance Benchmark (80/20 Stratified Validation)</span>
          </h3>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4">Model Architecture</th>
                <th className="py-2.5 px-4 text-right">Accuracy</th>
                <th className="py-2.5 px-4 text-right">Precision</th>
                <th className="py-2.5 px-4 text-right">Recall</th>
                <th className="py-2.5 px-4 text-right">F1-Score</th>
                <th className="py-2.5 px-4 text-right">ROC-AUC</th>
                <th className="py-2.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/60">
              {PYTHON_MODEL_STATS.models.map(m => (
                <tr key={m.name} className={m.best ? 'bg-indigo-950/30' : 'hover:bg-slate-800/40'}>
                  <td className="py-3 px-4 font-semibold text-white flex items-center space-x-2">
                    {m.best && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                    <span>{m.name}</span>
                  </td>
                  <td className="py-3 px-4 text-right text-slate-300">{(m.accuracy * 100).toFixed(1)}%</td>
                  <td className="py-3 px-4 text-right text-slate-300">{(m.precision * 100).toFixed(1)}%</td>
                  <td className="py-3 px-4 text-right text-slate-300">{(m.recall * 100).toFixed(1)}%</td>
                  <td className="py-3 px-4 text-right text-slate-300">{(m.f1 * 100).toFixed(1)}%</td>
                  <td className="py-3 px-4 text-right font-bold text-amber-400">{m.roc_auc.toFixed(3)}</td>
                  <td className="py-3 px-4 text-center">
                    {m.best ? (
                      <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded text-[10px] font-bold">
                        Production Selected
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[10px]">Evaluated</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feature Importance & Interactive Simulator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* Feature Importance Bar Chart */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Random Forest Feature Importance Weights</span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                  Gini Impurity
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Identifies which customer attributes drive the model's split decisions.
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={PYTHON_MODEL_STATS.featureImportances}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} domain={[0, 0.35]} tickFormatter={v => `${(v * 100).toFixed(0)}%`} />
                <YAxis dataKey="feature" type="category" stroke="#94a3b8" fontSize={10} width={100} />
                <Tooltip 
                  formatter={(val: any) => [`${(Number(val) * 100).toFixed(1)}%`, 'Relative Weight']}
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', fontSize: '11px' }}
                />
                <Bar dataKey="importance" name="Feature Importance" fill="#6366f1" radius={[0, 4, 4, 0]}>
                  {PYTHON_MODEL_STATS.featureImportances.map((f, i) => (
                    <Cell 
                      key={`f-${i}`} 
                      fill={i === 0 ? '#f43f5e' : i === 1 ? '#ec4899' : i === 2 ? '#f59e0b' : '#6366f1'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 space-y-1.5 text-[11px] border-t border-slate-800 pt-3">
            {PYTHON_MODEL_STATS.featureImportances.slice(0, 4).map(f => (
              <div key={f.feature} className="flex items-start justify-between gap-2 text-slate-300">
                <span className="font-semibold text-white font-mono">{f.feature}:</span>
                <span className="text-slate-400 text-right">{f.insight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive What-If Simulator */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>What-If Churn Probability Simulator</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">Live In-Browser Inference</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Adjust customer attributes to observe the non-linear churn risk prediction in real-time.
            </p>

            <div className="space-y-3 text-xs">
              {/* Age Slider */}
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Customer Age: <strong>{simAge} years</strong></span>
                  <span className={simAge >= 45 && simAge <= 60 ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                    {simAge >= 45 && simAge <= 60 ? 'Peak Churn Zone' : 'Standard'}
                  </span>
                </div>
                <input
                  type="range"
                  min={18}
                  max={80}
                  value={simAge}
                  onChange={e => setSimAge(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              {/* Deposit Balance Slider */}
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Deposit Balance: <strong>${simBalance.toLocaleString()}</strong></span>
                  <span className="font-mono text-amber-400">${(simBalance / 1000).toFixed(0)}k</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={250000}
                  step={5000}
                  value={simBalance}
                  onChange={e => setSimBalance(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Products Held */}
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Number of Products: <strong>{simProducts}</strong></span>
                  <span className={`text-[11px] font-semibold ${
                    simProducts === 2 ? 'text-emerald-400' : simProducts >= 3 ? 'text-rose-400' : 'text-slate-400'
                  }`}>
                    {simProducts === 2 ? 'Optimal Stickiness' : simProducts >= 3 ? 'Critical Risk' : 'Baseline'}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map(p => (
                    <button
                      key={p}
                      onClick={() => setSimProducts(p)}
                      className={`py-1 rounded border text-xs font-medium cursor-pointer ${
                        simProducts === p
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {p} Prod{p > 1 ? 's' : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Toggle & Country */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-slate-400 mb-1 text-[11px]">Country</label>
                  <select
                    value={simCountry}
                    onChange={e => setSimCountry(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-slate-200 text-xs"
                  >
                    <option value="Germany">Germany (High Flight)</option>
                    <option value="France">France</option>
                    <option value="Spain">Spain</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 text-[11px]">Activity Status</label>
                  <button
                    onClick={() => setSimActive(!simActive)}
                    className={`w-full py-1.5 px-2 rounded-lg border text-xs font-semibold flex items-center justify-center space-x-1.5 cursor-pointer ${
                      simActive
                        ? 'bg-emerald-950/60 text-emerald-400 border-emerald-700'
                        : 'bg-rose-950/60 text-rose-400 border-rose-700'
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>{simActive ? 'Active Member' : 'Inactive Member'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Real-Time Prediction Gauge */}
          <div className="mt-4 pt-3 border-t border-slate-800 bg-slate-950 p-3.5 rounded-xl border">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Predicted Churn Probability</span>
                <span className={`text-2xl font-extrabold font-mono ${
                  simProb > 50 ? 'text-rose-400' : simProb > 25 ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {simProb}%
                </span>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                simProb > 65 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                simProb > 30 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                {simProb > 65 ? 'Severe Attrition Risk' : simProb > 30 ? 'Moderate Risk' : 'High Retention Safe'}
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full mt-2.5 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${
                  simProb > 50 ? 'bg-rose-500' : simProb > 25 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${simProb}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Python Code Viewer */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
        <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Code className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-white">Production Python Modeling Scripts</span>
            <div className="flex items-center space-x-1 ml-4">
              <button
                onClick={() => setActiveCodeTab('pipeline')}
                className={`text-xs px-2.5 py-1 rounded cursor-pointer ${
                  activeCodeTab === 'pipeline' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                Pipeline & Training
              </button>
              <button
                onClick={() => setActiveCodeTab('feature_importance')}
                className={`text-xs px-2.5 py-1 rounded cursor-pointer ${
                  activeCodeTab === 'feature_importance' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                Feature Importances
              </button>
              <button
                onClick={() => setActiveCodeTab('shap')}
                className={`text-xs px-2.5 py-1 rounded cursor-pointer ${
                  activeCodeTab === 'shap' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                SHAP Explainer
              </button>
            </div>
          </div>

          <button
            onClick={handleCopyCode}
            className="flex items-center space-x-1 text-xs text-slate-300 hover:text-white bg-slate-800 px-2.5 py-1 rounded border border-slate-700 cursor-pointer"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy Code'}</span>
          </button>
        </div>

        <pre className="p-4 bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed max-h-96">
          <code>{codeSnippets[activeCodeTab]}</code>
        </pre>
      </div>
    </div>
  );
};
