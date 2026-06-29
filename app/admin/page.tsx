'use client';

import { useState, useEffect } from 'react';

interface Niche {
  id: string;
  name: string;
  description: string;
}

interface Strategy {
  id: string;
  niche_id: string;
  name: string;
  description: string;
  config: any;
}

export default function AdminPage() {
  const [niches, setNiches] = useState<Niche[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [selectedNicheId, setSelectedNicheId] = useState('');

  const [newNicheName, setNewNicheName] = useState('');
  const [newNicheDescription, setNewNicheDescription] = useState('');

  const [newStrategyName, setNewStrategyName] = useState('');
  const [newStrategyDescription, setNewStrategyDescription] = useState('');
  const [newStrategyConfig, setNewStrategyConfig] = useState('{}');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchNiches();
  }, []);

  useEffect(() => {
    if (selectedNicheId) {
      fetchStrategies(selectedNicheId);
    }
  }, [selectedNicheId]);

  async function fetchNiches() {
    try {
      const res = await fetch('/api/niches');
      if (!res.ok) throw new Error('Falha ao buscar nichos');
      const data = await res.json();
      setNiches(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar nichos');
    }
  }

  async function fetchStrategies(nicheId: string) {
    try {
      const res = await fetch(`/api/strategies?niche_id=${nicheId}`);
      if (!res.ok) throw new Error('Falha ao buscar estratégias');
      const data = await res.json();
      setStrategies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar estratégias');
    }
  }

  async function handleAddNiche(e: React.FormEvent) {
    e.preventDefault();
    if (!newNicheName.trim()) {
      setError('Nome do nicho é obrigatório');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const res = await fetch('/api/niches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newNicheName,
          description: newNicheDescription,
        }),
      });

      if (!res.ok) throw new Error('Falha ao criar nicho');

      setNewNicheName('');
      setNewNicheDescription('');
      setSuccess('Nicho criado com sucesso!');
      await fetchNiches();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar nicho');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddStrategy(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedNicheId) {
      setError('Selecione um nicho');
      return;
    }
    if (!newStrategyName.trim()) {
      setError('Nome da estratégia é obrigatório');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const config = JSON.parse(newStrategyConfig);

      const res = await fetch('/api/strategies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          niche_id: selectedNicheId,
          name: newStrategyName,
          description: newStrategyDescription,
          config: config,
        }),
      });

      if (!res.ok) throw new Error('Falha ao criar estratégia');

      setNewStrategyName('');
      setNewStrategyDescription('');
      setNewStrategyConfig('{}');
      setSuccess('Estratégia criada com sucesso!');
      await fetchStrategies(selectedNicheId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar estratégia');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          ⚙️ Painel de Administração
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Nichos Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              🎯 Nichos
            </h2>

            {/* Form to add niche */}
            <form onSubmit={handleAddNiche} className="mb-6 space-y-4">
              <input
                type="text"
                placeholder="Nome do nicho (ex: E-commerce)"
                value={newNicheName}
                onChange={(e) => setNewNicheName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                placeholder="Descrição (opcional)"
                value={newNicheDescription}
                onChange={(e) => setNewNicheDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Adicionar Nicho
              </button>
            </form>

            {/* List of niches */}
            <div className="space-y-2">
              {niches.map((niche) => (
                <button
                  key={niche.id}
                  onClick={() => setSelectedNicheId(niche.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedNicheId === niche.id
                      ? 'bg-blue-100 border-2 border-blue-500'
                      : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
                  }`}
                >
                  <div className="font-semibold text-gray-900">{niche.name}</div>
                  {niche.description && (
                    <div className="text-sm text-gray-600">{niche.description}</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Strategies Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              ⚡ Estratégias
            </h2>

            {selectedNicheId ? (
              <>
                {/* Form to add strategy */}
                <form onSubmit={handleAddStrategy} className="mb-6 space-y-4">
                  <input
                    type="text"
                    placeholder="Nome da estratégia"
                    value={newStrategyName}
                    onChange={(e) => setNewStrategyName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    placeholder="Descrição (opcional)"
                    value={newStrategyDescription}
                    onChange={(e) => setNewStrategyDescription(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    placeholder="Config JSON (campanhas, ad groups, keywords, etc)"
                    value={newStrategyConfig}
                    onChange={(e) => setNewStrategyConfig(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Adicionar Estratégia
                  </button>
                </form>

                {/* List of strategies */}
                <div className="space-y-2">
                  {strategies.map((strategy) => (
                    <div
                      key={strategy.id}
                      className="p-3 bg-gray-100 rounded-lg border border-gray-300"
                    >
                      <div className="font-semibold text-gray-900">
                        {strategy.name}
                      </div>
                      {strategy.description && (
                        <div className="text-sm text-gray-600 mb-2">
                          {strategy.description}
                        </div>
                      )}
                      <details className="text-xs">
                        <summary className="cursor-pointer text-blue-600 hover:underline">
                          Ver configuração
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-50 rounded overflow-x-auto text-gray-700">
                          {JSON.stringify(strategy.config, null, 2)}
                        </pre>
                      </details>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center text-gray-500 py-8">
                Selecione um nicho para gerenciar estratégias
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
