import React, { useState, useEffect } from 'react';
import { 
  Tv, Maximize2, Minimize2, Heart, Zap, MapPin, 
  Compass, Flame, Shield, Users, Sparkles, Clock, Sun, Moon
} from 'lucide-react';

export default function ProjectorView({
  campaign,
  party = [],
  apiBase,
  isGm
}) {
  const [screenData, setScreenData] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Polling silencioso en segundo plano cada 2 segundos para recibir transmisiones del Master
  useEffect(() => {
    const fetchScreen = () => {
      const campCode = campaign?.code ? `?campaign_code=${campaign.code}` : '';
      fetch(`${apiBase}/screen.php${campCode}`)
        .then(r => r.json())
        .then(data => {
          if (data.success && data.screen) {
            setScreenData(data.screen);
          }
        })
        .catch(() => {});
    };

    fetchScreen();
    const interval = setInterval(fetchScreen, 2000);
    return () => clearInterval(interval);
  }, [campaign?.code, apiBase]);

  // Alternar pantalla completa nativa del navegador
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const travelState = campaign?.travel_state || {};
  const currentShiftName = travelState.shift === 'manana' ? 'Mañana' :
    travelState.shift === 'dia' ? 'Mediodía' :
    travelState.shift === 'tarde' ? 'Tarde' : 'Noche';

  const isScreenActive = screenData && (screenData.is_active === 1 || screenData.is_active === true) && screenData.title;

  return (
    <div className="min-h-[85vh] bg-stone-950 text-stone-100 flex flex-col justify-between p-4 sm:p-8 rounded-3xl border border-stone-800 shadow-2xl relative overflow-hidden font-sans">
      
      {/* Luces y ambientación de fondo sutil */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-rose-600/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-amber-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* ===================================================================== */}
      {/* BARRA SUPERIOR CINEMÁTICA: UBICACIÓN, HORA Y BOTÓN PANTALLA COMPLETA  */}
      {/* ===================================================================== */}
      <header className="relative z-10 flex items-center justify-between border-b border-stone-800/80 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-500 shadow-lg">
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-black tracking-widest text-stone-400">
              Dragonbane · Pantalla de la Mesa
            </div>
            <div className="text-sm sm:text-base font-black text-stone-100 flex items-center space-x-2">
              <span className="text-amber-400">{campaign?.name || 'Campaña Dragonbane'}</span>
              <span className="text-stone-600">|</span>
              <span className="text-rose-400 flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{campaign?.active_location || 'Puerto Brumoso'}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Momento del día y día de viaje */}
          <div className="hidden sm:flex items-center space-x-2 bg-stone-900/80 border border-stone-800 px-3 py-1.5 rounded-xl text-xs">
            {travelState.shift === 'noche' ? (
              <Moon className="w-4 h-4 text-indigo-400" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
            <span className="font-bold text-stone-200">
              {currentShiftName} {travelState.day ? `(Día ${travelState.day})` : ''}
            </span>
            {travelState.weather && (
              <span className="text-stone-400 text-[11px] capitalize">· {travelState.weather}</span>
            )}
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-stone-900 border border-stone-800 hover:border-stone-700 text-stone-300 hover:text-white transition-colors shadow-md"
            title="Pantalla Completa"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* ===================================================================== */}
      {/* CUERPO CENTRAL: CONTENIDO TRANSMITIDO POR EL MASTER O AMBIENTACIÓN    */}
      {/* ===================================================================== */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center my-6 text-center max-w-4xl mx-auto w-full">
        {isScreenActive ? (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            {/* Icono o Retrato Gigante */}
            <div className="relative inline-block">
              <div className="w-32 h-32 sm:w-44 sm:h-44 mx-auto rounded-3xl bg-stone-900/90 border-2 border-rose-500/50 shadow-2xl flex items-center justify-center text-7xl sm:text-8xl backdrop-blur-md drop-shadow-[0_10px_25px_rgba(225,29,72,0.3)]">
                {screenData.image_url || '🐉'}
              </div>
            </div>

            {/* Subtítulo / Categoría */}
            {screenData.subtitle && (
              <div className="inline-block bg-rose-950/80 border border-rose-700/60 text-rose-300 text-xs sm:text-sm font-extrabold uppercase tracking-widest px-4 py-1 rounded-full shadow-lg">
                {screenData.subtitle}
              </div>
            )}

            {/* Título en grande */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-stone-100 tracking-tight drop-shadow-lg">
              {screenData.title}
            </h1>

            {/* Descripción atmosférica */}
            {screenData.description && (
              <p className="text-sm sm:text-lg text-stone-300 max-w-2xl mx-auto leading-relaxed italic bg-stone-900/60 border border-stone-800/80 rounded-2xl p-4 sm:p-6 backdrop-blur-sm shadow-xl">
                "{screenData.description}"
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4 text-center">
            <div className="w-24 h-24 mx-auto rounded-3xl bg-stone-900/50 border border-stone-800/80 flex items-center justify-center text-5xl shadow-2xl">
              ⚔️
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-rose-600 tracking-tight drop-shadow">
              DRAGONBANE
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 max-w-md mx-auto">
              La mesa de juego está activa. Cuando el Director de Juego transmita un monstruo, un NPC o un mapa, aparecerá aquí automáticamente en tamaño completo.
            </p>
          </div>
        )}
      </main>

      {/* ===================================================================== */}
      {/* TICKER INFERIOR: ESTADO EN VIVO DE TODOS LOS HÉROES DE LA PARTY      */}
      {/* ===================================================================== */}
      <footer className="relative z-10 border-t border-stone-800/80 pt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-stone-400 flex items-center space-x-1.5">
            <Users className="w-3.5 h-3.5 text-amber-500" />
            <span>Estado del Grupo en Vivo ({party.length} héroes)</span>
          </span>
          <span className="text-[10px] text-stone-400">
            Actualización automática
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {party.map((hero) => {
            const hpCurr = parseInt(hero.hp_current, 10) || 0;
            const hpMax = parseInt(hero.hp_max, 10) || 10;
            const hpPercent = Math.min(100, Math.max(0, (hpCurr / hpMax) * 100));

            const wpCurr = parseInt(hero.wp_current, 10) || 0;
            const wpMax = parseInt(hero.wp_max, 10) || 10;

            const isDead = hpCurr <= 0;

            return (
              <div
                key={hero.id}
                className={`bg-stone-900/90 border rounded-xl p-2.5 shadow-md flex flex-col justify-between ${
                  isDead ? 'border-rose-900/80 bg-rose-950/20' : 'border-stone-800/80'
                }`}
              >
                <div className="truncate mb-1">
                  <div className="font-bold text-xs text-stone-100 truncate">
                    {hero.name || 'Sin nombre'}
                  </div>
                  <div className="text-[10px] text-stone-400 truncate">
                    {hero.kin} · {hero.profession}
                  </div>
                </div>

                <div className="space-y-1">
                  {/* Vida */}
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-rose-400 font-bold flex items-center space-x-0.5">
                      <Heart className="w-2.5 h-2.5 text-rose-500" />
                      <span>PV</span>
                    </span>
                    <span className="font-mono font-bold text-white">
                      {hpCurr} / {hpMax}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-stone-950 rounded-full overflow-hidden border border-stone-800">
                    <div
                      className={`h-full transition-all duration-300 ${
                        hpPercent <= 25 ? 'bg-rose-600' : hpPercent <= 50 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${hpPercent}%` }}
                    />
                  </div>

                  {/* Voluntad */}
                  <div className="flex items-center justify-between text-[10px] pt-0.5">
                    <span className="text-sky-400 font-bold flex items-center space-x-0.5">
                      <Zap className="w-2.5 h-2.5 text-sky-500" />
                      <span>PC</span>
                    </span>
                    <span className="font-mono font-bold text-sky-200">
                      {wpCurr} / {wpMax}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </footer>

    </div>
  );
}
