import React from 'react';
import { 
  Heart, Zap, Shield, AlertTriangle, User, Eye, Sparkles
} from 'lucide-react';

export default function PartyHUD({ 
  party = [], 
  onSelectCharacter, 
  selectedCharId,
  isGm 
}) {
  if (!party || party.length === 0) return null;

  return (
    <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 mb-4 backdrop-blur-md shadow-xl">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-800/80">
        <div className="flex items-center space-x-2">
          <span className="text-base">🛡️</span>
          <h3 className="font-bold text-xs uppercase tracking-wider text-amber-300">
            {isGm ? 'Panel del Director: Estado del Grupo en Vivo' : 'Compañeros de Aventuras'}
          </h3>
        </div>
        <span className="text-[11px] text-stone-400 font-medium">
          {party.length} {party.length === 1 ? 'héroe' : 'héroes'} en la mesa
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {party.map((char) => {
          const hpCurr = parseInt(char.hp_current, 10) || 0;
          const hpMax = parseInt(char.hp_max, 10) || 10;
          const hpPercent = Math.min(100, Math.max(0, (hpCurr / hpMax) * 100));

          const wpCurr = parseInt(char.wp_current, 10) || 0;
          const wpMax = parseInt(char.wp_max, 10) || 10;
          const wpPercent = Math.min(100, Math.max(0, (wpCurr / wpMax) * 100));

          const conditions = char.conditions || {};
          const activeConds = Object.entries(conditions).filter(([_, val]) => !!val).map(([k]) => k);

          const isSelected = selectedCharId === char.id;

          let hpColor = 'bg-emerald-500';
          if (hpPercent <= 25) hpColor = 'bg-rose-600 animate-pulse';
          else if (hpPercent <= 50) hpColor = 'bg-amber-500';

          return (
            <div
              key={char.id}
              onClick={() => onSelectCharacter(char.id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer relative group ${
                isSelected
                  ? 'bg-amber-950/40 border-amber-500/80 shadow-lg ring-1 ring-amber-500/50'
                  : 'bg-stone-950/70 border-stone-800/80 hover:border-stone-700 hover:bg-stone-900/60'
              }`}
            >
              {/* Encabezado del Héroe */}
              <div className="flex items-start justify-between mb-2">
                <div className="truncate pr-1">
                  <div className="font-bold text-xs text-stone-100 truncate group-hover:text-amber-200 transition-colors">
                    {char.name || 'Sin nombre'}
                  </div>
                  <div className="text-[10px] text-stone-400 truncate">
                    {char.kin} {char.profession ? `· ${char.profession}` : ''}
                    {char.player_name ? ` (${char.player_name})` : ''}
                  </div>
                </div>
                <button
                  title="Ver hoja"
                  className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-amber-300 transition-opacity p-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Barras de Estado (PV y PVol) */}
              <div className="space-y-1.5 mb-2">
                {/* Puntos de Vida */}
                <div>
                  <div className="flex justify-between text-[10px] mb-0.5">
                    <span className="flex items-center space-x-1 text-rose-400 font-bold">
                      <Heart className="w-2.5 h-2.5" />
                      <span>PV</span>
                    </span>
                    <span className="font-mono text-stone-300 font-bold">
                      {hpCurr}/{hpMax}
                    </span>
                  </div>
                  <div className="w-full bg-stone-900 h-1.5 rounded-full overflow-hidden border border-stone-800">
                    <div 
                      className={`h-full transition-all duration-300 ${hpColor}`} 
                      style={{ width: `${hpPercent}%` }}
                    />
                  </div>
                </div>

                {/* Puntos de Voluntad */}
                <div>
                  <div className="flex justify-between text-[10px] mb-0.5">
                    <span className="flex items-center space-x-1 text-sky-400 font-bold">
                      <Zap className="w-2.5 h-2.5" />
                      <span>PVol</span>
                    </span>
                    <span className="font-mono text-stone-300 font-bold">
                      {wpCurr}/{wpMax}
                    </span>
                  </div>
                  <div className="w-full bg-stone-900 h-1.5 rounded-full overflow-hidden border border-stone-800">
                    <div 
                      className="h-full bg-sky-500 transition-all duration-300" 
                      style={{ width: `${wpPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Insignias de Condiciones */}
              {activeConds.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1 border-t border-stone-800/60">
                  {activeConds.map((cond) => (
                    <span 
                      key={cond}
                      className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-rose-950/80 text-rose-300 border border-rose-800/60 uppercase tracking-tighter"
                    >
                      {cond}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
