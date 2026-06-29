'use client';

import { useEffect, useMemo, useState } from 'react';
import SelectDropdown from './SelectDropdown';
import ThemeToggle from './ThemeToggle';
import { US_STATES } from '@/lib/us-states';

interface Customer {
  customer_id: string;
  name: string;
}

interface Niche {
  id: string;
  name: string;
  description: string;
}

interface Strategy {
  id: string;
  name: string;
  description: string;
  config: any;
}

interface BuildResult {
  campaignName: string;
  steps: string[];
  warnings: string[];
}

export default function Dashboard() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [niches, setNiches] = useState<Niche[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);

  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('');
  const [selectedStrategy, setSelectedStrategy] = useState('');

  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [loadingNiches, setLoadingNiches] = useState(false);
  const [loadingStrategies, setLoadingStrategies] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Builder form state
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [dailyBudget, setDailyBudget] = useState('50');
  const [adGroupKeys, setAdGroupKeys] = useState<string[]>([]);
  const [building, setBuilding] = useState(false);
  const [result, setResult] = useState<BuildResult | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (selectedCustomer) fetchNiches();
  }, [selectedCustomer]);

  useEffect(() => {
    if (selectedNiche) fetchStrategies();
  }, [selectedNiche]);

  const selectedStrategyObj = useMemo(
    () => strategies.find((s) => s.id === selectedStrategy),
    [strategies, selectedStrategy]
  );
  const builder: string | undefined = selectedStrategyObj?.config?.builder;
  const isBuilder = builder === 'commercial_cleaning';
  const availableAdGroups: { key: string; name: string }[] =
    selectedStrategyObj?.config?.ad_groups || [];

  // When a builder strategy is selected, prefill company name and ad groups
  useEffect(() => {
    if (isBuilder) {
      const customer = customers.find(
        (c) => c.customer_id === selectedCustomer
      );
      setCompanyName((prev) => prev || customer?.name || '');
      setAdGroupKeys(availableAdGroups.map((g) => g.key));
      setResult(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStrategy]);

  async function fetchCustomers() {
    try {
      setLoadingCustomers(true);
      setError(null);
      const res = await fetch('/api/google-ads/customers');
      if (!res.ok) throw new Error('Falha ao buscar clientes');
      setCustomers(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoadingCustomers(false);
    }
  }

  async function fetchNiches() {
    try {
      setLoadingNiches(true);
      setError(null);
      const res = await fetch('/api/niches');
      if (!res.ok) throw new Error('Falha ao buscar nichos');
      setNiches(await res.json());
      setSelectedNiche('');
      setStrategies([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoadingNiches(false);
    }
  }

  async function fetchStrategies() {
    try {
      setLoadingStrategies(true);
      setError(null);
      const res = await fetch(`/api/strategies?niche_id=${selectedNiche}`);
      if (!res.ok) throw new Error('Falha ao buscar estratégias');
      setStrategies(await res.json());
      setSelectedStrategy('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoadingStrategies(false);
    }
  }

  function toggleAdGroup(key: string) {
    setAdGroupKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  async function handleBuild() {
    if (!selectedCustomer || !selectedStrategyObj) return;
    if (!companyName.trim() || !website.trim()) {
      setError('Preencha nome da empresa e website.');
      return;
    }
    if (!state) {
      setError('Selecione o estado.');
      return;
    }
    if (adGroupKeys.length === 0) {
      setError('Selecione pelo menos um grupo de anúncios.');
      return;
    }

    try {
      setBuilding(true);
      setError(null);
      setResult(null);

      const res = await fetch('/api/google-ads/build-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          builder,
          customer_id: selectedCustomer,
          company_name: companyName.trim(),
          website: website.trim(),
          state,
          city: city.trim(),
          daily_budget: Number(dailyBudget) || 50,
          ad_group_keys: adGroupKeys,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Falha ao criar a estrutura');
      }
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar campanha');
    } finally {
      setBuilding(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-indigo-100 dark:from-slate-950 dark:to-slate-900 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Dashboard de Campanhas
            </h1>
            <p className="text-gray-700 dark:text-gray-300">
              Selecione um cliente, nicho e estratégia para criar um rascunho de campanha
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm dark:bg-red-950 dark:border-red-800 dark:text-red-300">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <SelectDropdown
              label="Cliente"
              value={selectedCustomer}
              onChange={(value) => {
                setSelectedCustomer(value);
                setSelectedNiche('');
                setSelectedStrategy('');
                setCompanyName('');
                setResult(null);
              }}
              options={customers.map((c) => ({
                id: c.customer_id,
                name: c.name,
              }))}
              isLoading={loadingCustomers}
              placeholder="Escolha um cliente"
            />

            <SelectDropdown
              label="Nicho"
              value={selectedNiche}
              onChange={setSelectedNiche}
              options={niches}
              isLoading={loadingNiches}
              placeholder="Escolha um nicho"
              disabled={!selectedCustomer}
            />

            <SelectDropdown
              label="Estratégia"
              value={selectedStrategy}
              onChange={setSelectedStrategy}
              options={strategies}
              isLoading={loadingStrategies}
              placeholder="Escolha uma estratégia"
              disabled={!selectedNiche}
            />

            {selectedStrategyObj && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-950 dark:border-blue-800">
                <h3 className="font-semibold text-blue-900 mb-2 dark:text-blue-200">
                  {selectedStrategyObj.name}
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  {selectedStrategyObj.description}
                </p>
              </div>
            )}

            {/* Builder form (only for code-driven strategies) */}
            {isBuilder && !result && (
              <div className="space-y-5 border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Nome da empresa">
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="First Choice Janitorial"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Website (URL final)">
                    <input
                      type="text"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://exemplo.com"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Estado">
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Escolha um estado</option>
                      {US_STATES.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Cidade (opcional)">
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Boston (vazio = usa o estado)"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Orçamento diário (US$)">
                    <input
                      type="number"
                      min={1}
                      value={dailyBudget}
                      onChange={(e) => setDailyBudget(e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    Grupos de anúncios a criar
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {availableAdGroups.map((g) => (
                      <label
                        key={g.key}
                        className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200 p-2 rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        <input
                          type="checkbox"
                          checked={adGroupKeys.includes(g.key)}
                          onChange={() => toggleAdGroup(g.key)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        {g.name}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Result panel */}
            {result && (
              <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-950 dark:border-green-800">
                  <h3 className="font-semibold text-green-900 dark:text-green-200 mb-1">
                    ✅ Campanha criada (pausada)
                  </h3>
                  <p className="text-sm text-green-800 dark:text-green-300">
                    {result.campaignName}
                  </p>
                </div>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  {result.steps.map((s, i) => (
                    <li key={i}>• {s}</li>
                  ))}
                </ul>
                {result.warnings.length > 0 && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-950 dark:border-amber-800">
                    <p className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-1">
                      Avisos
                    </p>
                    <ul className="text-sm text-amber-800 dark:text-amber-300 space-y-1">
                      {result.warnings.map((w, i) => (
                        <li key={i}>• {w}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <button
                  onClick={() => setResult(null)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Criar outra campanha
                </button>
              </div>
            )}

            {/* Submit button */}
            {!result && (
              <button
                onClick={handleBuild}
                disabled={!isBuilder || building}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:cursor-not-allowed dark:disabled:bg-gray-700 dark:disabled:text-gray-400"
              >
                {building
                  ? 'Criando estrutura no Google Ads...'
                  : 'Criar Estrutura no Google Ads'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const inputClass =
  'w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100';

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-gray-800 dark:text-gray-200">
        {label}
      </label>
      {children}
    </div>
  );
}
