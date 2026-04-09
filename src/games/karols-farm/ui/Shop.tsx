'use client';

import { useState } from 'react';
import { useGameStore } from '@/games/karols-farm/store/gameStore';
import { SEED_LIST } from '@/games/karols-farm/core/data/seeds';
import { TREE_LIST } from '@/games/karols-farm/core/data/trees';
import { FIELD_DEFS } from '@/games/karols-farm/core/data/world';
import { BASIC_UPGRADES, ADVANCED_UPGRADES } from '@/games/karols-farm/core/data/upgrades';
import { WORKER_TIERS } from '@/games/karols-farm/core/data/workers';
import { getNextWorkerCost } from '@/games/karols-farm/core/systems/workers';

type ShopTab = 'seeds' | 'trees' | 'fields' | 'upgrades' | 'advanced' | 'workers';

const TABS: { id: ShopTab; label: string; emoji: string }[] = [
  { id: 'seeds', label: 'Nasiona', emoji: '🌱' },
  { id: 'trees', label: 'Drzewa', emoji: '🌳' },
  { id: 'fields', label: 'Pola', emoji: '🌾' },
  { id: 'upgrades', label: 'Ulepszenia', emoji: '⚒️' },
  { id: 'advanced', label: 'Zaawans.', emoji: '🔬' },
  { id: 'workers', label: 'Ludzie', emoji: '👷' },
];

export function Shop() {
  const shopOpen = useGameStore((s) => s.shopOpen);
  const toggleShop = useGameStore((s) => s.toggleShop);
  const money = useGameStore((s) => s.money);
  const cheatActive = useGameStore((s) => s.cheatActive);
  const [activeTab, setActiveTab] = useState<ShopTab>('seeds');

  if (!shopOpen) return null;

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900/95 text-white rounded-2xl shadow-2xl w-[90vw] max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-xl font-bold">🛒 Sklep</h2>
          <div className="flex items-center gap-4">
            <span className="text-yellow-400 font-mono">💰 {money}</span>
            <button onClick={toggleShop} className="text-2xl hover:text-red-400 transition-colors">✕</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-2 border-b border-white/10 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
                ${activeTab === tab.id ? 'bg-green-600' : 'bg-white/10 hover:bg-white/20'}`}
            >
              {tab.emoji} {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'seeds' && <SeedsTab />}
          {activeTab === 'trees' && <TreesTab />}
          {activeTab === 'fields' && <FieldsTab />}
          {activeTab === 'upgrades' && <UpgradesTab />}
          {activeTab === 'advanced' && <AdvancedTab />}
          {activeTab === 'workers' && <WorkersTab />}
        </div>
      </div>
    </div>
  );
}

function SeedsTab() {
  const buySeed = useGameStore((s) => s.buySeed);
  const selectSeed = useGameStore((s) => s.selectSeed);
  const money = useGameStore((s) => s.money);
  const cheatActive = useGameStore((s) => s.cheatActive);

  return (
    <div className="grid gap-2">
      {SEED_LIST.map((seed) => {
        const cost = cheatActive ? 0 : seed.cost;
        const canBuy = seed.cost === 0 || money >= cost;
        return (
          <div key={seed.id} className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
            <span className="text-2xl">{seed.emoji}</span>
            <div className="flex-1">
              <div className="font-medium">{seed.name}</div>
              <div className="text-xs text-gray-400">
                Sprzedaż: {seed.sellPrice}💰 | Czas: {seed.growTime}s | Zysk: +{seed.sellPrice - seed.cost}
              </div>
            </div>
            <button
              onClick={() => { selectSeed(seed.id); }}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-sm"
            >
              Wybierz
            </button>
            {seed.cost > 0 && (
              <button
                onClick={() => buySeed(seed.id, 1)}
                disabled={!canBuy}
                className={`px-3 py-1 rounded text-sm ${canBuy ? 'bg-green-600 hover:bg-green-500' : 'bg-gray-600 cursor-not-allowed'}`}
              >
                {cost}💰
              </button>
            )}
            {seed.cost === 0 && <span className="text-green-400 text-sm">Darmowe</span>}
          </div>
        );
      })}
    </div>
  );
}

function TreesTab() {
  const buyTree = useGameStore((s) => s.buyTree);
  const money = useGameStore((s) => s.money);
  const cheatActive = useGameStore((s) => s.cheatActive);

  return (
    <div className="grid gap-2">
      {TREE_LIST.map((tree) => {
        const cost = cheatActive ? 0 : tree.cost;
        const canBuy = money >= cost;
        return (
          <div key={tree.id} className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
            <span className="text-2xl">{tree.emoji}</span>
            <div className="flex-1">
              <div className="font-medium">{tree.name}</div>
              <div className="text-xs text-gray-400">
                Wzrost: {tree.growTime}s | Zrzuca: {tree.dropCount}× co {tree.dropInterval}s
              </div>
            </div>
            <button
              onClick={() => buyTree(tree.id)}
              disabled={!canBuy}
              className={`px-3 py-1 rounded text-sm ${canBuy ? 'bg-green-600 hover:bg-green-500' : 'bg-gray-600 cursor-not-allowed'}`}
            >
              {cost}💰
            </button>
          </div>
        );
      })}
    </div>
  );
}

function FieldsTab() {
  const buyField = useGameStore((s) => s.buyField);
  const fields = useGameStore((s) => s.fields);
  const money = useGameStore((s) => s.money);
  const cheatActive = useGameStore((s) => s.cheatActive);

  return (
    <div className="grid gap-2">
      {fields.map((field) => {
        const def = FIELD_DEFS.find(d => d.id === field.id)!;
        const cost = cheatActive ? 0 : def.cost;
        const prevOwned = field.id === 1 || fields.find(f => f.id === field.id - 1)?.owned;
        const canBuy = !field.owned && prevOwned && money >= cost;
        return (
          <div key={field.id} className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
            <span className="text-2xl">🌾</span>
            <div className="flex-1">
              <div className="font-medium">Pole #{field.id}</div>
              <div className="text-xs text-gray-400">
                Rozmiar: {def.width}×{def.height} | Działki: {def.width * def.height}
              </div>
            </div>
            {field.owned ? (
              <span className="text-green-400 text-sm">✓ Posiadane</span>
            ) : (
              <button
                onClick={() => buyField(field.id)}
                disabled={!canBuy}
                className={`px-3 py-1 rounded text-sm ${canBuy ? 'bg-green-600 hover:bg-green-500' : 'bg-gray-600 cursor-not-allowed'}`}
              >
                {cost}💰
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

function UpgradesTab() {
  const buyBasicUpgrade = useGameStore((s) => s.buyBasicUpgrade);
  const upgrades = useGameStore((s) => s.upgrades);
  const money = useGameStore((s) => s.money);
  const cheatActive = useGameStore((s) => s.cheatActive);

  return (
    <div className="grid gap-2">
      {BASIC_UPGRADES.map((upg) => {
        const currentLevel = upgrades[upg.id];
        const maxed = currentLevel >= upg.costs.length - 1;
        const nextCost = maxed ? 0 : (cheatActive ? 0 : upg.costs[currentLevel + 1]);
        const canBuy = !maxed && money >= nextCost;
        return (
          <div key={upg.id} className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
            <span className="text-2xl">{upg.emoji}</span>
            <div className="flex-1">
              <div className="font-medium">{upg.name}</div>
              <div className="text-xs text-gray-400">
                Poziom: {currentLevel}/{upg.costs.length - 1} | Wartość: {upg.values[currentLevel]}
                {!maxed && ` → ${upg.values[currentLevel + 1]}`}
              </div>
            </div>
            {maxed ? (
              <span className="text-yellow-400 text-sm">MAX</span>
            ) : (
              <button
                onClick={() => buyBasicUpgrade(upg.id)}
                disabled={!canBuy}
                className={`px-3 py-1 rounded text-sm ${canBuy ? 'bg-green-600 hover:bg-green-500' : 'bg-gray-600 cursor-not-allowed'}`}
              >
                {nextCost}💰
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

function AdvancedTab() {
  const buyAdvancedUpgrade = useGameStore((s) => s.buyAdvancedUpgrade);
  const advancedUpgrades = useGameStore((s) => s.advancedUpgrades);
  const money = useGameStore((s) => s.money);
  const cheatActive = useGameStore((s) => s.cheatActive);

  return (
    <div className="grid gap-2">
      {ADVANCED_UPGRADES.map((upg) => {
        const owned = upg.id === 'fertilizerCharges'
          ? false // always buyable
          : (advancedUpgrades as unknown as Record<string, boolean | number>)[upg.id] === true;
        const cost = cheatActive ? 0 : upg.cost;
        const canBuy = !owned && money >= cost;
        return (
          <div key={upg.id} className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
            <span className="text-2xl">{upg.emoji}</span>
            <div className="flex-1">
              <div className="font-medium">{upg.name}</div>
              <div className="text-xs text-gray-400">{upg.description}</div>
              {upg.id === 'fertilizerCharges' && (
                <div className="text-xs text-green-400">Ładunki: {advancedUpgrades.fertilizerCharges}</div>
              )}
            </div>
            {owned ? (
              <span className="text-green-400 text-sm">✓ Posiadane</span>
            ) : (
              <button
                onClick={() => buyAdvancedUpgrade(upg.id)}
                disabled={!canBuy}
                className={`px-3 py-1 rounded text-sm ${canBuy ? 'bg-green-600 hover:bg-green-500' : 'bg-gray-600 cursor-not-allowed'}`}
              >
                {cost}💰
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

function WorkersTab() {
  const buyWorker = useGameStore((s) => s.buyWorker);
  const workers = useGameStore((s) => s.workers);
  const money = useGameStore((s) => s.money);
  const cheatActive = useGameStore((s) => s.cheatActive);

  const next = getNextWorkerCost(workers);
  const cost = next ? (cheatActive ? 0 : next.cost) : 0;
  const canBuy = next && money >= cost;

  return (
    <div className="grid gap-2">
      <div className="text-sm text-gray-400 mb-2">
        Zatrudnionych: {workers.length}/5
      </div>
      {Object.values(WORKER_TIERS).map((tier) => {
        const hired = workers.some(w => w.tier === tier.tier);
        const isNext = next?.tier === tier.tier;
        return (
          <div key={tier.tier} className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: tier.color }} />
            <div className="flex-1">
              <div className="font-medium">{tier.name}</div>
              <div className="text-xs text-gray-400">
                Prędkość: ×{tier.speed} | Woda: {tier.waterMax} | Plecak: {tier.carryCapacity}
              </div>
            </div>
            {hired ? (
              <span className="text-green-400 text-sm">✓ Zatrudniony</span>
            ) : isNext ? (
              <button
                onClick={buyWorker}
                disabled={!canBuy}
                className={`px-3 py-1 rounded text-sm ${canBuy ? 'bg-green-600 hover:bg-green-500' : 'bg-gray-600 cursor-not-allowed'}`}
              >
                {cost}💰
              </button>
            ) : (
              <span className="text-gray-500 text-sm">🔒</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
