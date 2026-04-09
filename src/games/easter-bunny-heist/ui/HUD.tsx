'use client';

import { useGameStore } from '../store/gameStore';
import { t } from '../i18n';
import { formatTime } from '../core/systems/scoring';
import { getBuffColor } from '../core/systems/buffs';
import { BUFF_DURATION } from '../core/config';
import { isNearPorch, isNearDeliveryPoint } from '../core/systems/interaction';
import type { BuffType } from '../core/types';
import { DetectionBar } from './DetectionBar';

export function HUD() {
  const screen = useGameStore((s) => s.screen);
  const language = useGameStore((s) => s.language);
  const giftsDelivered = useGameStore((s) => s.giftsDelivered);
  const gifts = useGameStore((s) => s.gifts);
  const gameTime = useGameStore((s) => s.gameTime);
  const eggsCollected = useGameStore((s) => s.eggsCollected);
  const detections = useGameStore((s) => s.detections);
  const player = useGameStore((s) => s.player);
  const buffs = useGameStore((s) => s.buffs);
  const deliveryPoints = useGameStore((s) => s.deliveryPoints);
  if (screen !== 'playing') return null;

  const totalGifts = gifts.length;
  const nearPorch = !player.isCarrying && isNearPorch(player);
  const nearDP = player.isCarrying && isNearDeliveryPoint(player, deliveryPoints);
  const mode = player.isSneaking
    ? t('sneaking', language)
    : player.isSprinting
      ? t('sprinting', language)
      : t('walking', language);

  const activeBuffs = (Object.entries(buffs) as [BuffType, number][]).filter(
    ([, v]) => v > 0,
  );

  // Show hints only until first delivery
  const showHints = giftsDelivered === 0;

  return (
    <div className="absolute inset-0 pointer-events-none" data-ui>
      {/* Top left: gift counter */}
      <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-sm rounded-xl px-3 py-2 text-white text-sm font-bold">
        🎁 {giftsDelivered}/{totalGifts}
      </div>

      {/* Top right: time, eggs, detections */}
      <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm rounded-xl px-3 py-2 text-white text-sm space-y-1">
        <div>⏱ {formatTime(gameTime)}</div>
        <div>🥚 {eggsCollected}</div>
        <div>👁 {detections}</div>
      </div>

      {/* Detection bar */}
      <DetectionBar />

      {/* Active buffs (right side) */}
      {activeBuffs.length > 0 && (
        <div className="absolute top-20 right-3 space-y-1">
          {activeBuffs.map(([type, timeLeft]) => (
            <div
              key={type}
              className="bg-black/40 backdrop-blur-sm rounded-lg px-2 py-1 text-white text-xs font-bold flex items-center gap-2"
            >
              <span>{t(`buff_${type}`, language)}</span>
              <div className="w-12 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(timeLeft / BUFF_DURATION) * 100}%`,
                    backgroundColor: getBuffColor(type),
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom left: movement mode */}
      <div className="absolute bottom-16 left-3 bg-black/40 backdrop-blur-sm rounded-xl px-3 py-1.5 text-white text-xs font-bold">
        {player.isSneaking ? '🐾' : player.isSprinting ? '💨' : '🚶'} {mode}
      </div>

      {/* Bottom center: carry indicator + hints */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-center">
        {player.isCarrying && (
          <div className="bg-pink-500/80 backdrop-blur-sm rounded-xl px-4 py-2 text-white font-bold text-sm mb-2">
            🎁 {t('carrying', language)}
          </div>
        )}

        {/* Interaction prompts */}
        {nearPorch && !player.isCarrying && (
          <div className="bg-green-500/80 backdrop-blur-sm rounded-xl px-4 py-2 text-white font-bold text-sm pointer-events-auto">
            {t('interactHint', language)} [E]
          </div>
        )}
        {nearDP && player.isCarrying && (
          <div className="bg-blue-500/80 backdrop-blur-sm rounded-xl px-4 py-2 text-white font-bold text-sm pointer-events-auto">
            {t('deliverActionHint', language)} [E]
          </div>
        )}

        {/* Hints for new players */}
        {showHints && !nearPorch && !nearDP && !player.isCarrying && (
          <div className="bg-black/30 backdrop-blur-sm rounded-xl px-3 py-1.5 text-white/70 text-xs">
            {t('pickupHint', language)}
          </div>
        )}
        {showHints && player.isCarrying && !nearDP && (
          <div className="bg-black/30 backdrop-blur-sm rounded-xl px-3 py-1.5 text-white/70 text-xs">
            {t('deliverHint', language)}
          </div>
        )}
      </div>
    </div>
  );
}
