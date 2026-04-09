'use client';

import { useRef, useCallback } from 'react';
import { useGameStore } from '@/games/karols-farm/store/gameStore';

const CHEAT_PHRASE = 'karoljestsuer';

export function Help() {
  const helpOpen = useGameStore((s) => s.helpOpen);
  const toggleHelp = useGameStore((s) => s.toggleHelp);
  const cheatActive = useGameStore((s) => s.cheatActive);
  const activateCheat = useGameStore((s) => s.activateCheat);
  const cheatBuffer = useRef('');

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!helpOpen || cheatActive) return;
    cheatBuffer.current += e.key.toLowerCase();
    if (cheatBuffer.current.length > CHEAT_PHRASE.length) {
      cheatBuffer.current = cheatBuffer.current.slice(-CHEAT_PHRASE.length);
    }
    if (cheatBuffer.current === CHEAT_PHRASE) {
      activateCheat();
      cheatBuffer.current = '';
    }
  }, [helpOpen, cheatActive, activateCheat]);

  if (!helpOpen) return null;

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="bg-gray-900/95 text-white rounded-2xl shadow-2xl w-[90vw] max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-xl font-bold">📖 Pomoc</h2>
          <button onClick={toggleHelp} className="text-2xl hover:text-red-400 transition-colors">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 text-sm">
          <Section title="🎮 Sterowanie">
            <Row left="WASD" right="Ruch" />
            <Row left="← →" right="Obrót kamery" />
            <Row left="↑ ↓" right="Pochylenie kamery" />
            <Row left="E / Spacja" right="Akcja (sadź/podlej/zbierz)" />
            <Row left="Q" right="Sklep" />
            <Row left="1-8" right="Wybór nasion" />
            <Row left="9, 0" right="Wybór drzew" />
            <Row left="R" right="Masowy zbiór 5×5" />
            <Row left="B" right="Sen (przy łóżku)" />
            <Row left="P" right="Pomoc" />
            <Row left="ESC" right="Zamknij okno" />
          </Section>

          <Section title="🌱 Jak grać">
            <p>1. Wybierz nasiono klawiszami 1-8</p>
            <p>2. Podejdź do pola i naciśnij E aby posadzić</p>
            <p>3. Naciśnij E ponownie aby podlać</p>
            <p>4. Czekaj aż roślina wyrośnie</p>
            <p>5. Zbierz dojrzałą roślinę klawiszem E</p>
            <p>6. Idź na targ (🏪) i naciśnij E aby sprzedać</p>
          </Section>

          <Section title="⚡ Energia">
            <p>Każda akcja kosztuje energię. Sadzenie: 2⚡, Podlewanie: 1⚡, Zbieranie: 1⚡</p>
            <p>W nocy energia spada. Idź spać do łóżka (🛏️) klawiszem B.</p>
            <p>Przy niskiej energii (&lt;20) poruszasz się wolniej.</p>
          </Section>

          <Section title="🌤️ Pogoda">
            <p>☀️ Słonecznie — normalna prędkość wzrostu</p>
            <p>🌧️ Deszcz — szybszy wzrost + auto-podlewanie</p>
            <p>⛈️ Burza — wolny wzrost + niszczenie roślin!</p>
            <p>🏜️ Susza — wolny wzrost + wysuszanie</p>
            <p>🌫️ Mgła — lekko wolniejszy wzrost</p>
          </Section>

          <Section title="🌸 Pory roku">
            <p>Zmieniają się co 7 dni: Wiosna → Lato → Jesień → Zima</p>
            <p>Każda pora wpływa na szybkość wzrostu i pogodę.</p>
            <p>Sadzenie roślin w ich ulubioną porę daje bonus +30%!</p>
          </Section>

          <Section title="🌳 Drzewa">
            <p>Drzewa rosną dłużej, ale zrzucają owoce automatycznie!</p>
            <p>Zrzucone nasiona lądują na 3×3 wokół drzewa.</p>
          </Section>

          <Section title="👷 Pracownicy">
            <p>Kupuj w sklepie. Automatycznie podlewają, zbierają i sprzedają!</p>
            <p>Każdy kolejny jest droższy, ale lepszy.</p>
          </Section>

          <Section title="🔥 Combo">
            <p>Zbieraj szybko aby budować combo!</p>
            <p>×3: efekt ognia | ×5: +50💰 | ×10: +200💰</p>
            <p>Combo zwiększa cenę sprzedaży (max ×1.5)</p>
          </Section>

          <Section title="⭐ Złote rośliny">
            <p>5% szans na złotą roślinę (25% z ulepszeniem)</p>
            <p>Złota = ×3 cena sprzedaży + ×5 XP!</p>
          </Section>

          {cheatActive && (
            <Section title="🎉 CHEAT MODE">
              <p className="text-green-400">Aktywny! Wszystkie ceny = 0</p>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-bold text-base mb-2">{title}</h3>
      <div className="space-y-1 text-gray-300">{children}</div>
    </div>
  );
}

function Row({ left, right }: { left: string; right: string }) {
  return (
    <div className="flex gap-3">
      <span className="text-yellow-400 font-mono w-20 text-right">{left}</span>
      <span>{right}</span>
    </div>
  );
}
