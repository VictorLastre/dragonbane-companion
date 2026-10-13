import React, { useState, useEffect } from 'react';
import { 
  Compass, Sun, Moon, CloudFog, CloudRain, Snowflake, CloudLightning,
  AlertTriangle, Flame, Utensils, Tent, Shield, Eye, Crosshair,
  Footprints, ChevronRight, CheckCircle2, RefreshCw, Sparkles,
  Dice5, Plus, Skull, Heart, Info, Coffee, Award, MapPin
} from 'lucide-react';
import { 
  SHIFTS, 
  WEATHER_TYPES, 
  TERRAIN_TYPES, 
  TRAVEL_MISHAPS,
  rollRandomMishap,
  rollHuntingPrey,
  calculateMarchProgress
} from '../utils/travelRules';
import { rollCheck } from '../utils/dragonbaneRules';

export default function TravelView({
  campaign,
  isGm,
  party = [],
  onUpdateCharacter,
  onUpdateCampaign,
  apiBase,
  showNotification
}) {
  // Estado general de viaje extraído de la campaña o inicializado
  const initialTravel = campaign?.travel_state || {
    day: 1,
    shift: 'manana',
    shifts_walked_today: 0,
    total_km: 0,
    weather: 'despejado',
    terrain: 'camino',
    is_mounted: false,
    has_map: true,
    has_spyglass: false,
    roles: {
      explorer_id: null,
      lookout_id: null,
      hunter_id: null,
      cook_id: null
    },
    camp: {
      tent_pitched: false,
      fire_lit: false,
      sheltered: false
    },
    log: [
      { id: 1, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: 'Inicio de la expedición por el Valle Brumoso.', type: 'info' }
    ]
  };

  const [travelState, setTravelState] = useState(initialTravel);
  const [activeMishap, setActiveMishap] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [huntingResult, setHuntingResult] = useState(null);

  // Sincronizar automáticamente en vivo si cambia travel_state desde el polling del servidor
  useEffect(() => {
    if (campaign?.travel_state) {
      setTravelState(campaign.travel_state);
    }
  }, [JSON.stringify(campaign?.travel_state)]);

  // Guardar estado de viaje en el servidor MySQL
  const persistTravelState = async (newState) => {
    setTravelState(newState);
    if (!campaign) return;
    try {
      await fetch(`${apiBase}/campaigns-settings.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: campaign.code,
          travel_state: newState
        })
      });
      // Notificar al estado de campaña para sincronización local inmediata
      if (onUpdateCampaign) {
        onUpdateCampaign({ ...campaign, travel_state: newState });
      }
    } catch (e) {
      console.error('Error guardando estado de viaje:', e);
    }
  };

  const addLogEntry = (text, type = 'info') => {
    const newEntry = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text,
      type
    };
    return [newEntry, ...(travelState.log || [])].slice(0, 30);
  };

  const currentShift = SHIFTS.find(s => s.id === travelState.shift) || SHIFTS[0];
  const currentWeather = WEATHER_TYPES.find(w => w.id === travelState.weather) || WEATHER_TYPES[0];
  const currentTerrain = TERRAIN_TYPES.find(t => t.id === travelState.terrain) || TERRAIN_TYPES[0];

  // Helper para buscar héroe asignado
  const getHeroById = (id) => party.find(p => p.id === parseInt(id, 10));

  // Asignar rol a un personaje
  const handleAssignRole = (roleKey, charId) => {
    const updatedRoles = { ...travelState.roles, [roleKey]: charId ? parseInt(charId, 10) : null };
    persistTravelState({
      ...travelState,
      roles: updatedRoles
    });
    showNotification?.('Roles de marcha actualizados');
  };

  // 1. TIRADA DE ORIENTACIÓN / EXPLORADOR
  const handleRollExploration = () => {
    const explorer = getHeroById(travelState.roles.explorer_id);
    if (!explorer) {
      alert('Debes asignar primero a un héroe como Explorador / Líder de Marcha.');
      return;
    }

    // Buscar habilidad de Supervivencia del personaje
    let survSkill = 8;
    if (explorer.skills) {
      let skillsArr = Array.isArray(explorer.skills) ? explorer.skills : [];
      if (typeof explorer.skills === 'string') {
        try { skillsArr = JSON.parse(explorer.skills); } catch(e) {}
      }
      const found = skillsArr.find(s => s.name?.toLowerCase().includes('supervivencia'));
      if (found) survSkill = found.level || 8;
    }

    // Calcular ventajas / desventajas según reglas oficiales
    let rollMode = 'normal';
    if (!travelState.has_map || travelState.terrain === 'pantano' || travelState.weather === 'niebla') {
      rollMode = 'bane';
    }
    if (travelState.has_spyglass) {
      rollMode = rollMode === 'bane' ? 'normal' : 'boon';
    }

    const result = rollCheck(survSkill, rollMode);
    let logMsg = '';
    let kmGained = 0;
    let newMishap = null;

    if (result.resultType === 'dragon') {
      kmGained = calculateMarchProgress(travelState.is_mounted, true, travelState.weather === 'niebla');
      logMsg = `¡DRAGÓN! ${explorer.name} descubrió un atajo milagroso. El grupo avanzó ${kmGained} km a paso veloz sin contratiempos.`;
      showNotification?.('¡Atajo épico encontrado! Distancia duplicada.');
    } else if (result.resultType === 'success') {
      kmGained = calculateMarchProgress(travelState.is_mounted, false, travelState.weather === 'niebla');
      logMsg = `Éxito: ${explorer.name} guió al grupo con firmeza (tirada: ${result.finalRoll} vs ${survSkill}). Avanzaron ${kmGained} km.`;
      showNotification?.(`Marcha exitosa: +${kmGained} km recorridos.`);
    } else {
      // Fallo: Percance de Viaje
      newMishap = rollRandomMishap();
      setActiveMishap(newMishap);
      logMsg = `Fallo en Supervivencia (${result.finalRoll} vs ${survSkill}): El grupo sufrió un contratiempo: "${newMishap.title}". ${newMishap.desc}`;
      showNotification?.(`¡Contratiempo en la marcha: ${newMishap.title}!`);
    }

    const newShiftsWalked = (travelState.shifts_walked_today || 0) + 1;
    let warningForced = '';

    // Marcha forzada (3er tramo)
    if (newShiftsWalked >= 3) {
      warningForced = ' ¡Marcha Forzada! Todos los personajes quedan AGOTADOS por el sobreesfuerzo.';
      party.forEach(p => {
        const cond = p.conditions || {};
        cond.exhausted = true;
        onUpdateCharacter?.({ ...p, conditions: cond });
      });
    }

    const newLog = addLogEntry(logMsg + warningForced, result.resultType === 'failure' ? 'danger' : 'success');

    persistTravelState({
      ...travelState,
      shifts_walked_today: newShiftsWalked,
      total_km: (travelState.total_km || 0) + kmGained,
      log: newLog
    });
  };

  // 2. TIRADA DE CAZA
  const handleRollHunting = () => {
    const hunter = getHeroById(travelState.roles.hunter_id);
    if (!hunter) {
      alert('Debes asignar primero a un Cazador.');
      return;
    }

    const prey = rollHuntingPrey();
    setHuntingResult(prey);

    let logText = `${hunter.name} partió de cacería y avistó: ${prey.animal} (${prey.rations} raciones).`;
    if (prey.hostile) {
      logText += ' ¡CUIDADO! El jabalí se volvió agresivo y amenazó a los aventureros.';
    }

    const newLog = addLogEntry(logText, prey.hostile ? 'warning' : 'success');
    persistTravelState({ ...travelState, log: newLog });
    showNotification?.(`¡Caza conseguida: ${prey.animal} (+${prey.rations} raciones)!`);
  };

  // 3. TIRADA DE FORRAJEO (PLANTAS Y BAYAS)
  const handleRollForaging = () => {
    const hunter = getHeroById(travelState.roles.hunter_id) || getHeroById(travelState.roles.explorer_id);
    const rationsWon = Math.floor(Math.random() * 3) + 1;
    const logText = `${hunter?.name || 'El grupo'} forrajeó entre el sotobosque y recolectó ${rationsWon} raciones de bayas y raíces comestibles.`;
    const newLog = addLogEntry(logText, 'success');
    persistTravelState({ ...travelState, log: newLog });
    showNotification?.(`¡Forrajeo completado: +${rationsWon} raciones de viaje!`);
  };

  // 4. MONTAR CAMPAMENTO Y TIENDAS
  const handlePitchCamp = () => {
    const cook = getHeroById(travelState.roles.cook_id) || getHeroById(travelState.roles.explorer_id);
    const logText = `${cook?.name || 'El grupo'} montó el campamento, aseguró las tiendas y encendió una hoguera para protegerse del frío de la noche.`;
    const newLog = addLogEntry(logText, 'info');
    
    persistTravelState({
      ...travelState,
      camp: {
        tent_pitched: true,
        fire_lit: true,
        sheltered: true
      },
      log: newLog
    });
    showNotification?.('¡Campamento montado con éxito!');
  };

  // 5. DESCANSO LARGO EN EL CAMPAMENTO (RESTAURACIÓN TOTAL)
  const handleLongRest = () => {
    if (!confirm('¿Realizar un Descanso Largo en el campamento? Cada héroe consumirá 1 ración de viaje y recuperará todos sus PV y PC.')) return;

    party.forEach(p => {
      const maxHp = p.hp_max || p.constitution || 10;
      const maxWp = p.wp_max || p.willpower || 10;
      
      // Descontar 1 ración del inventario si existe
      let inv = Array.isArray(p.inventory) ? [...p.inventory] : [];
      const racIndex = inv.findIndex(item => item.name?.toLowerCase().includes('ración'));
      if (racIndex >= 0) {
        inv.splice(racIndex, 1);
      }

      const updated = {
        ...p,
        hp_current: maxHp,
        wp_current: maxWp,
        inventory: inv
      };
      onUpdateCharacter?.(updated);
    });

    const newLog = addLogEntry('El grupo durmió un tramo largo al calor de la hoguera. Todos los héroes han recuperado sus Puntos de Golpe y Voluntad.', 'success');
    
    persistTravelState({
      ...travelState,
      log: newLog
    });
    showNotification?.('¡Descanso Largo completado! Grupo restablecido.');
  };

  // 6. AVANZAR AL SIGUIENTE TRAMO
  const handleNextShift = () => {
    const shiftOrder = ['manana', 'dia', 'tarde', 'noche'];
    const currentIndex = shiftOrder.indexOf(travelState.shift);
    
    let nextIndex = (currentIndex + 1) % 4;
    let nextDay = travelState.day;
    let nextShiftsWalked = travelState.shifts_walked_today;

    // Si pasamos de noche a mañana, es un nuevo día
    if (currentIndex === 3) {
      nextDay += 1;
      nextShiftsWalked = 0; // Se resetea el esfuerzo diario
    }

    const nextShiftId = shiftOrder[nextIndex];
    const shiftObj = SHIFTS.find(s => s.id === nextShiftId);

    const logText = `Avanza el día: Ahora es la ${shiftObj.name} (Día ${nextDay}).`;
    const newLog = addLogEntry(logText, 'info');

    persistTravelState({
      ...travelState,
      day: nextDay,
      shift: nextShiftId,
      shifts_walked_today: nextShiftsWalked,
      camp: nextShiftId === 'manana' ? { tent_pitched: false, fire_lit: false, sheltered: false } : travelState.camp,
      log: newLog
    });
    showNotification?.(`Tramo actual: ${shiftObj.name} (Día ${nextDay})`);
  };

  // Tirada de Percance manual por el Master
  const handleTriggerMishap = () => {
    const mishap = rollRandomMishap();
    setActiveMishap(mishap);
    const newLog = addLogEntry(`[Director] Percance provocado: ${mishap.title}. ${mishap.desc}`, 'danger');
    persistTravelState({ ...travelState, log: newLog });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-6">
      
      {/* CABECERA PRINCIPAL DE EXPEDICIÓN */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400 flex items-center space-x-1">
                <Compass className="w-3.5 h-3.5" />
                <span>Capítulo 8 · Reglas de Viaje y Aventura</span>
              </span>
              <span className="text-[11px] bg-stone-800 text-stone-300 font-bold px-2.5 py-0.5 rounded-full border border-stone-700">
                Día {travelState.day} de Viaje
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-stone-100 flex items-center space-x-2.5">
              <span>Rumbo desde {campaign?.active_location || 'Puerto Brumoso'}</span>
            </h1>

            <p className="text-xs sm:text-sm text-stone-400 max-w-2xl">
              Gestión de marcha por tramos, roles de supervivencia, tiradas de orientación, caza de víveres y montaje de campamentos.
            </p>
          </div>

          {/* Estadísticas de la Jornada */}
          <div className="flex flex-wrap items-center gap-3 bg-stone-950 p-3 rounded-2xl border border-stone-800">
            <div className="px-3 py-1 text-center border-r border-stone-800">
              <div className="text-[10px] text-stone-400 uppercase font-bold">Progreso Total</div>
              <div className="text-base font-black text-amber-300">{travelState.total_km || 0} km</div>
            </div>
            
            <div className="px-3 py-1 text-center border-r border-stone-800">
              <div className="text-[10px] text-stone-400 uppercase font-bold">Tramos Caminados Hoy</div>
              <div className={`text-base font-black ${
                travelState.shifts_walked_today >= 3 ? 'text-rose-400 animate-pulse' :
                travelState.shifts_walked_today === 2 ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {travelState.shifts_walked_today || 0} / 2
              </div>
            </div>

            <div className="px-2 py-1 text-center">
              <div className="text-[10px] text-stone-400 uppercase font-bold">Transporte</div>
              <button
                onClick={() => persistTravelState({ ...travelState, is_mounted: !travelState.is_mounted })}
                className={`text-xs font-bold px-2 py-0.5 rounded mt-0.5 transition-colors ${
                  travelState.is_mounted ? 'bg-sky-600/30 text-sky-300 border border-sky-500/40' : 'bg-stone-800 text-stone-300'
                }`}
              >
                {travelState.is_mounted ? '🐎 Monturas (30km)' : '🚶 A pie (15km)'}
              </button>
            </div>
          </div>
        </div>

        {/* TRAMOS DEL DÍA Y CLIMA */}
        <div className="mt-5 pt-4 border-t border-stone-800 grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Barra de Tramos (Mañana / Día / Tarde / Noche) */}
          <div className="space-y-1.5">
            <div className="text-[11px] uppercase font-bold text-stone-400 flex items-center justify-between">
              <span>Tramo Actual del Día:</span>
              {isGm && (
                <button
                  onClick={handleNextShift}
                  className="bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-black px-2.5 py-1 rounded-lg text-[10px] flex items-center space-x-1 shadow transition-all"
                >
                  <ChevronRight className="w-3 h-3" />
                  <span>Avanzar Tramo</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {SHIFTS.map(s => {
                const isActive = travelState.shift === s.id;
                return (
                  <div
                    key={s.id}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      isActive
                        ? 'bg-amber-600/20 border-amber-500 text-amber-200 shadow-md ring-1 ring-amber-500/30 font-bold'
                        : 'bg-stone-950 border-stone-800 text-stone-500'
                    }`}
                  >
                    <div className="text-xs">{s.name}</div>
                    <div className="text-[9px] text-stone-400 mt-0.5 hidden sm:block truncate">{s.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Clima y Terreno */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-stone-950 border border-stone-800 p-2.5 rounded-xl space-y-1">
              <div className="text-[10px] text-stone-400 uppercase font-bold flex items-center justify-between">
                <span>Clima:</span>
                {isGm && (
                  <select
                    value={travelState.weather}
                    onChange={(e) => persistTravelState({ ...travelState, weather: e.target.value })}
                    className="bg-stone-900 text-stone-200 rounded px-1.5 py-0.5 text-[10px] border border-stone-700 outline-none"
                  >
                    {WEATHER_TYPES.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                )}
              </div>
              <div className="text-xs font-bold text-sky-300">{currentWeather.name}</div>
              <div className="text-[10px] text-stone-400 leading-tight">{currentWeather.desc}</div>
            </div>

            <div className="bg-stone-950 border border-stone-800 p-2.5 rounded-xl space-y-1">
              <div className="text-[10px] text-stone-400 uppercase font-bold flex items-center justify-between">
                <span>Terreno:</span>
                {isGm && (
                  <select
                    value={travelState.terrain}
                    onChange={(e) => persistTravelState({ ...travelState, terrain: e.target.value })}
                    className="bg-stone-900 text-stone-200 rounded px-1.5 py-0.5 text-[10px] border border-stone-700 outline-none"
                  >
                    {TERRAIN_TYPES.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                )}
              </div>
              <div className="text-xs font-bold text-emerald-300">{currentTerrain.name}</div>
              <div className="text-[10px] text-stone-400 leading-tight">{currentTerrain.note}</div>
            </div>
          </div>

        </div>
      </div>

      {/* ALERTA DE PERCANCE ACTIVO */}
      {activeMishap && (
        <div className="bg-rose-950/40 border border-rose-600/80 rounded-2xl p-4 shadow-xl flex items-start justify-between gap-3 animate-in fade-in">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-rose-600/20 text-rose-400 rounded-xl mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs uppercase font-extrabold text-rose-400 tracking-wider">
                Percance de Viaje (D12: {activeMishap.roll || activeMishap.d12})
              </div>
              <div className="text-sm font-bold text-stone-100 mt-0.5">{activeMishap.title}</div>
              <div className="text-xs text-rose-200/90 mt-1">{activeMishap.desc}</div>
            </div>
          </div>
          <button
            onClick={() => setActiveMishap(null)}
            className="text-stone-400 hover:text-white text-xs font-bold p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* ROLES DE MARCHA DEL GRUPO */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-black uppercase tracking-wider text-stone-400">
            Roles de Marcha Oficiales
          </h2>
          {isGm && (
            <button
              onClick={handleTriggerMishap}
              className="text-xs font-bold text-rose-400 hover:text-rose-300 bg-rose-950/30 border border-rose-800/60 px-2.5 py-1 rounded-lg transition-colors"
            >
              🎲 Tirar Percance D12
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* ROL 1: EXPLORADOR / LÍDER */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-3 shadow-md">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-black text-stone-100">Explorador</h3>
                <span className="text-[10px] text-stone-400">Supervivencia (Ruta)</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-stone-400 font-bold uppercase">Héroe Asignado:</label>
              <select
                value={travelState.roles.explorer_id || ''}
                onChange={(e) => handleAssignRole('explorer_id', e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-2.5 py-1.5 text-xs text-amber-200 font-bold outline-none cursor-pointer"
              >
                <option value="">Sin asignar</option>
                {party.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.profession})</option>
                ))}
              </select>
            </div>

            {/* Ayudas de viaje (mapa y catalejo) */}
            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-stone-800/80">
              <label className="flex items-center space-x-1.5 cursor-pointer text-stone-300">
                <input
                  type="checkbox"
                  checked={travelState.has_map}
                  onChange={(e) => persistTravelState({ ...travelState, has_map: e.target.checked })}
                  className="rounded text-amber-600 bg-stone-950 border-stone-700"
                />
                <span>Lleva Mapa</span>
              </label>

              <label className="flex items-center space-x-1.5 cursor-pointer text-stone-300">
                <input
                  type="checkbox"
                  checked={travelState.has_spyglass}
                  onChange={(e) => persistTravelState({ ...travelState, has_spyglass: e.target.checked })}
                  className="rounded text-amber-600 bg-stone-950 border-stone-700"
                />
                <span>Catalejo</span>
              </label>
            </div>

            <button
              onClick={handleRollExploration}
              disabled={!travelState.roles.explorer_id}
              className={`w-full py-2 rounded-xl text-xs font-black shadow-md flex items-center justify-center space-x-1.5 transition-all ${
                travelState.roles.explorer_id
                  ? 'bg-amber-600 hover:bg-amber-500 text-stone-950 active:scale-95'
                  : 'bg-stone-800 text-stone-500 cursor-not-allowed'
              }`}
            >
              <Footprints className="w-3.5 h-3.5" />
              <span>Avanzar Tramo de Marcha</span>
            </button>
          </div>

          {/* ROL 2: VIGÍA / CENTINELA */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-3 shadow-md">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <Eye className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-black text-stone-100">Vigía / Centinela</h3>
                <span className="text-[10px] text-stone-400">Alerta (Emboscadas)</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-stone-400 font-bold uppercase">Héroe Asignado:</label>
              <select
                value={travelState.roles.lookout_id || ''}
                onChange={(e) => handleAssignRole('lookout_id', e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-2.5 py-1.5 text-xs text-sky-200 font-bold outline-none cursor-pointer"
              >
                <option value="">Sin asignar</option>
                {party.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.profession})</option>
                ))}
              </select>
            </div>

            <p className="text-[11px] text-stone-400 pt-1 leading-snug">
              Previene ataques por sorpresa de monstruos y bandidos durante la marcha y las guardias nocturnas.
            </p>

            <button
              onClick={() => {
                const lookout = getHeroById(travelState.roles.lookout_id);
                if (!lookout) return;
                const log = addLogEntry(`${lookout.name} mantuvo la mirada atenta sobre los cerros y matorrales. No se perciben emboscadas.`, 'info');
                persistTravelState({ ...travelState, log });
                showNotification?.(`Vigilancia activa por ${lookout.name}`);
              }}
              disabled={!travelState.roles.lookout_id}
              className={`w-full py-2 rounded-xl text-xs font-bold border flex items-center justify-center space-x-1.5 transition-all ${
                travelState.roles.lookout_id
                  ? 'bg-sky-950/60 border-sky-600/40 text-sky-300 hover:bg-sky-900/60'
                  : 'bg-stone-800 border-stone-700 text-stone-500 cursor-not-allowed'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Guardia Preventiva</span>
            </button>
          </div>

          {/* ROL 3: CAZADOR / PESCADOR */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-3 shadow-md">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Crosshair className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-black text-stone-100">Cazador / Pescador</h3>
                <span className="text-[10px] text-stone-400">Caza y Pesca (Víveres)</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-stone-400 font-bold uppercase">Héroe Asignado:</label>
              <select
                value={travelState.roles.hunter_id || ''}
                onChange={(e) => handleAssignRole('hunter_id', e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-2.5 py-1.5 text-xs text-emerald-200 font-bold outline-none cursor-pointer"
              >
                <option value="">Sin asignar</option>
                {party.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.profession})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <button
                onClick={handleRollHunting}
                disabled={!travelState.roles.hunter_id}
                className="py-1.5 px-2 rounded-xl text-[11px] font-bold bg-emerald-950/60 border border-emerald-600/40 text-emerald-300 hover:bg-emerald-900/60 transition-all text-center"
              >
                🏹 Cazar (D6)
              </button>
              <button
                onClick={handleRollForaging}
                className="py-1.5 px-2 rounded-xl text-[11px] font-bold bg-stone-950 border border-stone-800 text-stone-300 hover:text-white transition-all text-center"
              >
                🍄 Forrajear
              </button>
            </div>

            {huntingResult && (
              <div className="text-[10px] bg-stone-950 p-2 rounded-lg border border-stone-800 text-emerald-300">
                Última presa: <strong>{huntingResult.animal}</strong> (+{huntingResult.rations} rac.)
              </div>
            )}
          </div>

          {/* ROL 4: COCINERO Y ACAMPADA */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-3 shadow-md">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
                <Utensils className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-black text-stone-100">Cocinero / Acampada</h3>
                <span className="text-[10px] text-stone-400">Supervivencia (Descanso)</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-stone-400 font-bold uppercase">Héroe Asignado:</label>
              <select
                value={travelState.roles.cook_id || ''}
                onChange={(e) => handleAssignRole('cook_id', e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-2.5 py-1.5 text-xs text-orange-200 font-bold outline-none cursor-pointer"
              >
                <option value="">Sin asignar</option>
                {party.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.profession})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <button
                onClick={handlePitchCamp}
                className="py-1.5 px-2 rounded-xl text-[11px] font-bold bg-orange-950/60 border border-orange-600/40 text-orange-300 hover:bg-orange-900/60 transition-all text-center"
              >
                ⛺ Acampar
              </button>
              <button
                onClick={handleLongRest}
                className="py-1.5 px-2 rounded-xl text-[11px] font-bold bg-emerald-950/60 border border-emerald-600/40 text-emerald-300 hover:bg-emerald-900/60 transition-all text-center"
                title="Recuperar PV y PC completos al consumir raciones"
              >
                💤 Descanso
              </button>
            </div>

            <div className="text-[10px] text-stone-400 text-center">
              {travelState.camp?.tent_pitched ? '⛺ Tiendas montadas' : '🍃 Al raso'} · {travelState.camp?.fire_lit ? '🔥 Hoguera encendida' : '❄️ Sin fuego'}
            </div>
          </div>

        </div>
      </div>

      {/* BITÁCORA Y REGISTRO DE EVENTOS */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 space-y-3 shadow-xl">
        <div className="flex items-center justify-between pb-2 border-b border-stone-800">
          <h2 className="text-xs font-black uppercase tracking-wider text-stone-300 flex items-center space-x-2">
            <Footprints className="w-4 h-4 text-emerald-400" />
            <span>Bitácora de la Expedición</span>
          </h2>
          <span className="text-[10px] text-stone-500">Últimos acontecimientos en ruta</span>
        </div>

        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {(!travelState.log || travelState.log.length === 0) ? (
            <div className="text-xs text-stone-500 text-center py-4">No hay eventos anotados todavía.</div>
          ) : (
            travelState.log.map(item => (
              <div 
                key={item.id}
                className={`p-2.5 rounded-xl text-xs flex items-start space-x-2.5 border ${
                  item.type === 'danger' ? 'bg-rose-950/30 border-rose-800/40 text-rose-200' :
                  item.type === 'warning' ? 'bg-amber-950/30 border-amber-800/40 text-amber-200' :
                  item.type === 'success' ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-200' :
                  'bg-stone-950 border-stone-800/80 text-stone-300'
                }`}
              >
                <span className="text-[10px] font-bold text-stone-500 shrink-0 mt-0.5">{item.timestamp}</span>
                <span className="leading-snug">{item.text}</span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
