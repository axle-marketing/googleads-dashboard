'use client';

import { useEffect, useState } from 'react';
import SelectDropdown from './SelectDropdown';
import ThemeToggle from './ThemeToggle';

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

  // Fetch customers on mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Fetch niches when customer is selected
  useEffect(() => {
    if (selectedCustomer) {
      fetchNiches();
    }
  }, [selectedCustomer]);

  // Fetch strategies when niche is selected
  useEffect(() => {
    if (selectedNiche) {
      fetchStrategies();
    }
  }, [selectedNiche]);

  async function fetchCustomers() {
    try {
      setLoadingCustomers(true);
      setError(null);
      const res = await fetch('/api/google-ads/customers');
      if (!res.ok) throw new Error('Falha ao buscar clientes');
      const data = await res.json();
      setCustomers(data);
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
      const data = await res.json();
      setNiches(data);
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
      const data = await res.json();
      setStrategies(data);
      setSelectedStrategy('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoadingStrategies(false);
    }
  }

  async function handleCreateCampaign() {
    if (!selectedCustomer || !selectedNiche || !selectedStrategy) {
      setError('Por favor, selecione cliente, nicho e estratégia');
      return;
    }

    try {
      setError(null);
      const strategy = strategies.find((s) => s.id === selectedStrategy);
      if (!strategy) throw new Error('Estratégia não encontrada');

      const res = await fetch('/api/google-ads/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: selectedCustomer,
          campaign_name: `Draft - ${strategy.name}`,
          config: strategy.config,
        }),
      });

      if (!res.ok) throw new Error('Falha ao criar rascunho de campanha');
      const data = await res.json();
      alert('Rascunho de campanha criado com sucesso!');
      console.log('Campaign draft created:', data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar campanha');
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
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm dark:bg-red-950 dark:border-red-800 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Form */}
          <div className="space-y-6">
            {/* Customer Dropdown */}
            <SelectDropdown
              label="Cliente"
              value={selectedCustomer}
              onChange={(value) => {
                setSelectedCustomer(value);
                setSelectedNiche('');
                setSelectedStrategy('');
              }}
              options={customers.map((c) => ({
                id: c.customer_id,
                name: c.name,
              }))}
              isLoading={loadingCustomers}
              placeholder="Escolha um cliente"
            />

            {/* Niche Dropdown */}
            <SelectDropdown
              label="Nicho"
              value={selectedNiche}
              onChange={setSelectedNiche}
              options={niches}
              isLoading={loadingNiches}
              placeholder="Escolha um nicho"
              disabled={!selectedCustomer}
            />

            {/* Strategy Dropdown */}
            <SelectDropdown
              label="Estratégia"
              value={selectedStrategy}
              onChange={setSelectedStrategy}
              options={strategies}
              isLoading={loadingStrategies}
              placeholder="Escolha uma estratégia"
              disabled={!selectedNiche}
            />

            {/* Strategy Info */}
            {selectedStrategy && strategies.length > 0 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-950 dark:border-blue-800">
                {(() => {
                  const strategy = strategies.find(
                    (s) => s.id === selectedStrategy
                  );
                  return strategy ? (
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-2 dark:text-blue-200">
                        {strategy.name}
                      </h3>
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        {strategy.description}
                      </p>
                    </div>
                  ) : null;
                })()}
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleCreateCampaign}
              disabled={
                !selectedCustomer || !selectedNiche || !selectedStrategy
              }
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:cursor-not-allowed dark:disabled:bg-gray-700 dark:disabled:text-gray-400"
            >
              Criar Rascunho de Campanha
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">📋 Cliente</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Selecione a conta do Google Ads do cliente
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">🎯 Nicho</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Escolha o nicho/setor da campanha
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">⚡ Estratégia</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Defina a estrutura e o tipo de campanha
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
