'use client';

import { useEffect, useState } from 'react';
import SelectDropdown from './SelectDropdown';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Dashboard de Campanhas
          </h1>
          <p className="text-gray-600">
            Selecione um cliente, nicho e estratégia para criar um rascunho de campanha
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
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
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                {(() => {
                  const strategy = strategies.find(
                    (s) => s.id === selectedStrategy
                  );
                  return strategy ? (
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-2">
                        {strategy.name}
                      </h3>
                      <p className="text-sm text-blue-800">
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
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              Criar Rascunho de Campanha
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 shadow">
            <h3 className="font-semibold text-gray-900 mb-2">📋 Cliente</h3>
            <p className="text-sm text-gray-600">
              Selecione a conta do Google Ads do cliente
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <h3 className="font-semibold text-gray-900 mb-2">🎯 Nicho</h3>
            <p className="text-sm text-gray-600">
              Escolha o nicho/setor da campanha
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <h3 className="font-semibold text-gray-900 mb-2">⚡ Estratégia</h3>
            <p className="text-sm text-gray-600">
              Defina a estrutura e o tipo de campanha
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
