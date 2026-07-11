'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import SelectDropdown from './SelectDropdown';
import ThemeToggle from './ThemeToggle';
import { US_STATES } from '@/lib/us-states';
import { supabase } from '@/lib/supabase';

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

interface Sitelink {
  text: string;
  slug: string;
  hasPage: boolean;
}

interface Service {
  key: string;
  label: string;
  slug: string;
  hasPage: boolean;
  create: boolean;
  custom: boolean;
}

const DEFAULT_SITELINKS: Sitelink[] = [
  { text: 'About Us', slug: 'about-us', hasPage: true },
  { text: 'Get a Quote', slug: 'quote', hasPage: false },
  { text: 'Our Services', slug: 'services', hasPage: false },
  { text: 'Contact Us', slug: 'contact', hasPage: true },
  { text: 'Service Area', slug: 'service-area', hasPage: false },
];

export default function Dashboard() {
  const router = useRouter();
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
  const [cities, setCities] = useState<string[]>([]);
  const [dailyBudget, setDailyBudget] = useState('50');
  const [sitelinks, setSitelinks] = useState<Sitelink[]>([]);
  const [services, setServices] = useState<Service[]>([]);
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

  // Load the selected state's cities into the city autocomplete
  useEffect(() => {
    setCity('');
    if (!state) {
      setCities([]);
      return;
    }
    fetch(`/api/cities?state=${encodeURIComponent(state)}`)
      .then((r) => r.json())
      .then((data) => setCities(Array.isArray(data) ? data : []))
      .catch(() => setCities([]));
  }, [state]);

  const selectedStrategyObj = useMemo(
    () => strategies.find((s) => s.id === selectedStrategy),
    [strategies, selectedStrategy]
  );
  const builder: string | undefined = selectedStrategyObj?.config?.builder;
  const isBuilder = builder === 'commercial_cleaning';
  const availableAdGroups: { key: string; name: string }[] =
    selectedStrategyObj?.config?.ad_groups || [];

  // When a builder strategy is selected, prefill company, ad groups, sitelinks
  // and service pages with sensible defaults.
  useEffect(() => {
    if (isBuilder) {
      const customer = customers.find(
        (c) => c.customer_id === selectedCustomer
      );
      setCompanyName((prev) => prev || customer?.name || '');
      setSitelinks(DEFAULT_SITELINKS.map((s) => ({ ...s })));
      setServices(
        availableAdGroups.map((g) => ({
          key: g.key,
          label: g.name.replace(/^AG - /, ''),
          slug: g.key.replace(/_/g, '-'),
          hasPage: false,
          create: true,
          custom: false,
        }))
      );
      setResult(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStrategy]);

  function updateSitelink(i: number, patch: Partial<Sitelink>) {
    setSitelinks((prev) =>
      prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s))
    );
  }
  function addSitelink() {
    setSitelinks((prev) => [...prev, { text: '', slug: '', hasPage: false }]);
  }
  function removeSitelink(i: number) {
    setSitelinks((prev) => prev.filter((_, idx) => idx !== i));
  }
  function updateService(i: number, patch: Partial<Service>) {
    setServices((prev) =>
      prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s))
    );
  }
  function addService() {
    setServices((prev) => [
      ...prev,
      {
        key: `custom-${Date.now()}`,
        label: '',
        slug: '',
        hasPage: false,
        create: true,
        custom: true,
      },
    ]);
  }
  function removeService(i: number) {
    setServices((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace('/login');
  }

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
    const chosenServices = services.filter(
      (s) => s.create && s.label.trim() && s.slug.trim()
    );
    if (chosenServices.length === 0) {
      setError('Marque pelo menos um serviço (com nome e slug).');
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
          sitelinks: sitelinks
            .filter((s) => s.text.trim() && s.slug.trim())
            .map((s) => ({
              text: s.text.trim(),
              slug: s.slug.trim(),
              hasPage: s.hasPage,
            })),
          services: chosenServices.map((s) => ({
            key: s.key,
            label: s.label.trim(),
            slug: s.slug.trim(),
            hasPage: s.hasPage,
            custom: s.custom,
          })),
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
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              title="Sair"
              className="h-10 px-3 inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Sair
            </button>
          </div>
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
                      list="cities-list"
                      disabled={!state}
                      placeholder={
                        state
                          ? `Selecione ou digite (${cities.length} cidades)`
                          : 'Escolha o estado primeiro'
                      }
                      className={inputClass}
                    />
                    <datalist id="cities-list">
                      {cities.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
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

                {/* Services = ad groups + their pages (unified) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      Serviços (grupos de anúncio)
                    </p>
                    <button
                      type="button"
                      onClick={addService}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      + Adicionar
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Cada serviço vira um grupo de anúncios. Marque "página
                    individual" pra o anúncio apontar pra <code>/slug</code>;
                    senão vai pra home.
                  </p>
                  <div className="space-y-2">
                    {services.map((s, i) => (
                      <div
                        key={s.key}
                        className="flex items-center gap-2 flex-wrap"
                      >
                        <input
                          type="checkbox"
                          checked={s.create}
                          title="Criar este grupo"
                          onChange={(e) =>
                            updateService(i, { create: e.target.checked })
                          }
                          className="h-4 w-4 rounded border-gray-300 shrink-0"
                        />
                        {s.custom ? (
                          <input
                            type="text"
                            value={s.label}
                            placeholder="Nome do serviço"
                            onChange={(e) =>
                              updateService(i, { label: e.target.value })
                            }
                            className={`${inputClass} flex-1 min-w-[130px] py-1.5`}
                          />
                        ) : (
                          <span className="text-sm text-gray-700 dark:text-gray-300 w-36 shrink-0">
                            {s.label}
                          </span>
                        )}
                        <span className="text-sm text-gray-400">/</span>
                        <input
                          type="text"
                          value={s.slug}
                          placeholder="slug"
                          onChange={(e) =>
                            updateService(i, { slug: e.target.value })
                          }
                          className={`${inputClass} flex-1 min-w-[100px] py-1.5`}
                        />
                        <label className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300 shrink-0">
                          <input
                            type="checkbox"
                            checked={s.hasPage}
                            onChange={(e) =>
                              updateService(i, { hasPage: e.target.checked })
                            }
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          página individual
                        </label>
                        {s.custom && (
                          <button
                            type="button"
                            onClick={() => removeService(i)}
                            title="Remover"
                            className="text-gray-400 hover:text-red-500 text-lg leading-none shrink-0"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sitelinks */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      Sitelinks
                    </p>
                    <button
                      type="button"
                      onClick={addSitelink}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      + Adicionar
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Título + slug. Marque "página individual" pra usar{' '}
                    <code>/slug</code>; senão vira <code>/#slug</code>.
                  </p>
                  <div className="space-y-2">
                    {sitelinks.map((s, i) => (
                      <div key={i} className="flex items-center gap-2 flex-wrap">
                        <input
                          type="text"
                          value={s.text}
                          placeholder="Título"
                          onChange={(e) =>
                            updateSitelink(i, { text: e.target.value })
                          }
                          className={`${inputClass} flex-1 min-w-[110px] py-1.5`}
                        />
                        <input
                          type="text"
                          value={s.slug}
                          placeholder="slug"
                          onChange={(e) =>
                            updateSitelink(i, { slug: e.target.value })
                          }
                          className={`${inputClass} flex-1 min-w-[100px] py-1.5`}
                        />
                        <label className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300 shrink-0">
                          <input
                            type="checkbox"
                            checked={s.hasPage}
                            onChange={(e) =>
                              updateSitelink(i, { hasPage: e.target.checked })
                            }
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          página individual
                        </label>
                        <button
                          type="button"
                          onClick={() => removeSitelink(i)}
                          title="Remover"
                          className="text-gray-400 hover:text-red-500 text-lg leading-none shrink-0"
                        >
                          ×
                        </button>
                      </div>
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
