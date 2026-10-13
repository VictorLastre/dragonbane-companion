import React, { useState, useEffect } from 'react';
import { 
  Flame, Skull, Sword, Shield, Sparkles, Tv, Dices, Plus, Minus, 
  Trash2, Search, Heart, Zap, Footprints, AlertTriangle, ChevronRight, 
  Eye, RefreshCw, Send, Check, ShieldAlert, Award, UserPlus, Info
} from 'lucide-react';
import { 
  OFFICIAL_BESTIARY, 
  BESTIARY_CATEGORIES 
} from '../data/dragonbaneBestiaryData';
import { rollDamageFormula } from '../utils/dragonbaneRules';

export default function BestiaryView({
  campaign,
  isGm,
  party = [],
  apiBase,
  showNotification,
  onUpdateCampaign
}) {
  // Pestaña principal: 'catalog' (Bestiario completo) o 'encounter' (Escena / Combate activo)
  const [activeTab, setActiveTab] = useState('encounter');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectedMonster, setInspectedMonster] = useState(OFFICIAL_BESTIARY[0]);
  
  // Lista de monstruos y enemigos actualmente en la escena/combate
  const [activeEncounter, setActiveEncounter] = useState(() => {
    return Array.isArray(campaign?.encounter_state) ? campaign.encounter_state : [];
  });

  // Modal o resultado de tirada de ataque de monstruo
  const [monsterRollResult, setMonsterRollResult] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [transmittingId, setTransmittingId] = useState(null);

  // Sincronizar si cambia encounter_state desde el polling del servidor
  useEffect(() => {
    if (Array.isArray(campaign?.encounter_state)) {
      setActiveEncounter(campaign.encounter_state);
    }
  }, [JSON.stringify(campaign?.encounter_state)]);

  // Persistir la escena activa en el servidor MySQL
  const persistEncounter = async (newEncounter) => {
    setActiveEncounter(newEncounter);
    if (!campaign) return;
    try {
      await fetch(`${apiBase}/campaigns-settings.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: campaign.code,
          encounter_state: newEncounter
        })
      });
      if (onUpdateCampaign) {
        onUpdateCampaign({ ...campaign, encounter_state: newEncounter });
      }
    } catch (e) {
      console.error('Error guardando encuentro:', e);
    }
  };

  // Añadir una criatura del bestiario al encuentro activo
  const handleAddToEncounter = (monster) => {
    const existingCount = activeEncounter.filter(m => m.base_id === monster.id).length;
    const instanceName = existingCount > 0 ? `${monster.name} #${existingCount + 1}` : monster.name;

    const newInstance = {
      instance_id: `${monster.id}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      base_id: monster.id,
      name: instanceName,
      original_name: monster.name,
      category: monster.category,
      ferocity: monster.ferocity || 1,
      size: monster.size || 'normal',
      movement: monster.movement || 10,
      armor: monster.armor || 0,
      hp_max: monster.hp_max || 10,
      hp_current: monster.hp_max || 10,
      wp_max: monster.wp_max || 0,
      wp_current: monster.wp_max || 0,
      icon: monster.icon || '👾',
      description: monster.description,
      special_rules: monster.special_rules,
      attacks: monster.attacks || [],
      weapon: monster.weapon || '',
      skills: monster.skills || '',
      last_attack: null
    };

    const updated = [...activeEncounter, newInstance];
    persistEncounter(updated);
    showNotification?.(`¡${instanceName} añadido al encuentro!`);
    setActiveTab('encounter');
  };

  // Modificar puntos de golpe de un enemigo activo
  const handleUpdateHp = (instanceId, delta) => {
    const updated = activeEncounter.map(m => {
      if (m.instance_id === instanceId) {
        const nextHp = Math.max(0, Math.min(m.hp_max, m.hp_current + delta));
        return { ...m, hp_current: nextHp };
      }
      return m;
    });
    persistEncounter(updated);
  };

  // Eliminar un enemigo de la escena
  const handleRemoveFromEncounter = (instanceId) => {
    const updated = activeEncounter.filter(m => m.instance_id !== instanceId);
    persistEncounter(updated);
    showNotification?.('Criatura eliminada de la escena.');
  };

  // Vaciar toda la escena
  const handleClearEncounter = () => {
    if (activeEncounter.length === 0) return;
    if (confirm('¿Vaciar todos los monstruos de la escena actual?')) {
      persistEncounter([]);
      showNotification?.('Escena de combate reiniciada.');
    }
  };

  // Tirar ataque de monstruo oficial (1D6)
  const handleRollMonsterAttack = (monster) => {
    if (!monster.attacks || monster.attacks.length === 0) {
      showNotification?.('Esta criatura no tiene tabla de ataques especiales 1D6.');
      return;
    }

    setIsRolling(true);
    setMonsterRollResult(null);

    setTimeout(() => {
      const dice = Math.floor(Math.random() * 6) + 1;
      const attack = monster.attacks.find(a => a.dice === dice) || monster.attacks[0];

      // Tirar daño automático si tiene fórmula
      let rolledDamage = null;
      if (attack.damage && attack.damage !== '-') {
        try {
          rolledDamage = rollDamageFormula(attack.damage);
        } catch {
          rolledDamage = null;
        }
      }

      const result = {
        monsterName: monster.name,
        dice,
        attack,
        rolledDamage
      };

      setMonsterRollResult(result);
      setIsRolling(false);

      // Guardar el último ataque en el estado de la criatura
      const updated = activeEncounter.map(m => {
        if (m.instance_id === monster.instance_id) {
          return { ...m, last_attack: `${attack.title} (Dado ${dice})` };
        }
        return m;
      });
      persistEncounter(updated);

      showNotification?.(`¡${monster.name} lanzó ${attack.title}!`);
    }, 450);
  };

  // Transmitir criatura al Visor TV / Pantalla Compartida
  const handleBroadcastToScreen = async (monster) => {
    setTransmittingId(monster.instance_id || monster.id);
    try {
      await fetch(`${apiBase}/screen.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_code: campaign?.code,
          mode: 'npc',
          title: monster.original_name || monster.name,
          subtitle: `${monster.category.toUpperCase()} · ${monster.size.toUpperCase()} · FEROCIDAD ${monster.ferocity || 1}`,
          image_url: monster.icon || '🐉',
          description: monster.description || 'Una aterradora criatura se cierne sobre los aventureros.',
          is_active: true
        })
      });
      showNotification?.(`¡"${monster.name}" transmitido a la Smart TV / Pantalla! 📺`);
    } catch (e) {
      console.error('Error al transmitir a la TV:', e);
      showNotification?.('No se pudo transmitir a la pantalla.');
    } finally {
      setTimeout(() => setTransmittingId(null), 1000);
    }
  };

  // Filtrar catálogo
  const filteredBestiary = OFFICIAL_BESTIARY.filter(m => {
    const matchesCat = selectedCategory === 'all' || m.category === selectedCategory;
    const matchesQuery = !searchQuery || 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.special_rules.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-6">
      
      {/* CABECERA PRINCIPAL DEL BESTIARIO */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase font-extrabold tracking-widest text-rose-400 flex items-center space-x-1">
                <Flame className="w-4 h-4 text-rose-500" />
                <span>Capítulo 7 y 8 · Reglas Oficiales de Dragonbane</span>
              </span>
              <span className="bg-rose-950/80 border border-rose-700/60 text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {activeEncounter.length} en combate activo
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-100 tracking-tight flex items-center space-x-2">
              <span>Bestiario y Encuentros de Combate</span>
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 max-w-2xl">
              Monstruos con ataques automáticos 1d6, ferocidad, adversarios y panel de control de combate con transmisión a TV.
            </p>
          </div>

          {/* Selector de Pestaña Principal: Escena Activa vs Catálogo */}
          <div className="flex items-center space-x-2 bg-stone-950 p-1.5 rounded-2xl border border-stone-800 shrink-0">
            <button
              onClick={() => setActiveTab('encounter')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'encounter'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/40 ring-1 ring-rose-400/30'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Sword className="w-4 h-4" />
              <span>Escena Activa ({activeEncounter.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'catalog'
                  ? 'bg-amber-600 text-stone-950 shadow-lg shadow-amber-900/40 font-black'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Skull className="w-4 h-4" />
              <span>Catálogo del Bestiario</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* PESTAÑA 1: ESCENA Y COMBATE ACTIVO EN MESA                            */}
      {/* ===================================================================== */}
      {activeTab === 'encounter' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-black text-stone-200 flex items-center space-x-2">
                <span>Criaturas en la Escena</span>
              </h2>
              <span className="text-xs text-stone-400">
                (Controla los PG, tira el dado de monstruo y transmite a la Smart TV)
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveTab('catalog')}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition-colors flex items-center space-x-1.5 shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Añadir Monstruo</span>
              </button>
              {activeEncounter.length > 0 && (
                <button
                  onClick={handleClearEncounter}
                  className="bg-stone-900 hover:bg-rose-950/60 border border-stone-800 hover:border-rose-700/60 text-stone-400 hover:text-rose-300 font-bold px-3 py-1.5 rounded-xl text-xs transition-colors flex items-center space-x-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Vaciar Escena</span>
                </button>
              )}
            </div>
          </div>

          {activeEncounter.length === 0 ? (
            <div className="bg-stone-900/60 border border-dashed border-stone-800 rounded-3xl p-10 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-stone-950 border border-stone-800 flex items-center justify-center text-3xl shadow-inner">
                🐉
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-stone-200">No hay criaturas activas en la escena</h3>
                <p className="text-xs text-stone-400 max-w-md mx-auto">
                  Abre el catálogo del bestiario y pulsa en "Añadir a la Escena" para colocar trolls, dragones, orcos o esqueletos en combate.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('catalog')}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-lg transition-all"
              >
                Explorar Catálogo de Monstruos
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeEncounter.map((creature) => {
                const hpPercent = Math.min(100, Math.max(0, (creature.hp_current / creature.hp_max) * 100));
                const isDead = creature.hp_current <= 0;

                return (
                  <div
                    key={creature.instance_id}
                    className={`bg-stone-900 border rounded-2xl p-4 shadow-xl flex flex-col justify-between transition-all relative overflow-hidden ${
                      isDead
                        ? 'border-stone-800/80 opacity-60 bg-stone-950/60'
                        : 'border-stone-800 hover:border-stone-700 bg-stone-900'
                    }`}
                  >
                    {/* Barra superior con icono, nombre y eliminación */}
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2.5">
                          <span className="text-3xl">{creature.icon}</span>
                          <div>
                            <h3 className={`font-bold text-sm leading-tight ${isDead ? 'line-through text-stone-500' : 'text-stone-100'}`}>
                              {creature.name}
                            </h3>
                            <div className="text-[10px] text-stone-400 flex items-center space-x-1.5 mt-0.5">
                              <span className="uppercase font-bold text-rose-400">{creature.category}</span>
                              <span>·</span>
                              <span>Mov {creature.movement}m</span>
                              <span>·</span>
                              <span>Armadura {creature.armor || 0}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleRemoveFromEncounter(creature.instance_id)}
                          className="text-stone-500 hover:text-rose-400 p-1 rounded-lg transition-colors"
                          title="Eliminar de la escena"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Ferocidad y Acciones */}
                      <div className="bg-stone-950 p-2 rounded-xl border border-stone-800/80 my-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-1.5 text-stone-300">
                          <Award className="w-3.5 h-3.5 text-amber-500" />
                          <span className="font-semibold text-[11px]">Ferocidad:</span>
                        </div>
                        <span className="font-black text-amber-300 font-mono">
                          {creature.ferocity || 1} {creature.ferocity === 1 ? 'carta / turno' : 'cartas / ronda'}
                        </span>
                      </div>

                      {/* Barra interactiva de Puntos de Golpe */}
                      <div className="space-y-1 mb-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-rose-400 flex items-center space-x-1 text-[11px]">
                            <Heart className="w-3 h-3 text-rose-500" />
                            <span>Puntos de Golpe</span>
                          </span>
                          <span className="font-black font-mono text-white text-xs">
                            {creature.hp_current} / {creature.hp_max} PG
                          </span>
                        </div>

                        {/* Barra de progreso */}
                        <div className="w-full h-2.5 bg-stone-950 rounded-full overflow-hidden border border-stone-800">
                          <div
                            className={`h-full transition-all duration-300 ${
                              hpPercent <= 25 ? 'bg-rose-600 animate-pulse' : hpPercent <= 50 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${hpPercent}%` }}
                          />
                        </div>

                        {/* Botones rápidos de daño y curación */}
                        <div className="flex items-center justify-between pt-1 gap-1">
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleUpdateHp(creature.instance_id, -5)}
                              className="bg-stone-950 hover:bg-rose-950 text-rose-400 font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-stone-800 transition-colors"
                            >
                              -5
                            </button>
                            <button
                              onClick={() => handleUpdateHp(creature.instance_id, -1)}
                              className="bg-stone-950 hover:bg-rose-950 text-rose-400 font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-stone-800 transition-colors"
                            >
                              -1
                            </button>
                          </div>

                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleUpdateHp(creature.instance_id, 1)}
                              className="bg-stone-950 hover:bg-emerald-950 text-emerald-400 font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-stone-800 transition-colors"
                            >
                              +1
                            </button>
                            <button
                              onClick={() => handleUpdateHp(creature.instance_id, 5)}
                              className="bg-stone-950 hover:bg-emerald-950 text-emerald-400 font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-stone-800 transition-colors"
                            >
                              +5
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Regla especial o arma */}
                      {creature.weapon && (
                        <div className="text-[11px] text-stone-300 bg-stone-950/70 p-2 rounded-xl border border-stone-800/60 mb-2">
                          <span className="font-bold text-amber-400">Arma: </span>
                          <span>{creature.weapon}</span>
                        </div>
                      )}

                      {creature.last_attack && (
                        <div className="text-[10px] text-stone-400 bg-rose-950/30 border border-rose-900/40 p-1.5 rounded-lg mb-2">
                          <span className="font-bold text-rose-300">Último ataque: </span>
                          <span>{creature.last_attack}</span>
                        </div>
                      )}
                    </div>

                    {/* Acciones principales: Tirar 1D6 y Transmitir a TV */}
                    <div className="space-y-2 pt-2 border-t border-stone-800">
                      {creature.attacks && creature.attacks.length > 0 ? (
                        <button
                          onClick={() => handleRollMonsterAttack(creature)}
                          className="w-full bg-gradient-to-r from-rose-700 to-amber-600 hover:from-rose-600 hover:to-amber-500 text-white font-bold py-2 rounded-xl text-xs transition-all flex items-center justify-center space-x-1.5 shadow-md active:scale-95"
                        >
                          <Dices className="w-3.5 h-3.5" />
                          <span>Tirar Ataque 1D6 Oficial</span>
                        </button>
                      ) : (
                        <div className="text-center text-[10px] text-stone-400 py-1">
                          (Criatura estándar: usa tirada de habilidad normal)
                        </div>
                      )}

                      <button
                        onClick={() => handleBroadcastToScreen(creature)}
                        disabled={transmittingId === creature.instance_id}
                        className="w-full bg-stone-950 hover:bg-stone-800 border border-stone-800 hover:border-sky-500/50 text-stone-300 hover:text-sky-300 font-bold py-1.5 rounded-xl text-xs transition-all flex items-center justify-center space-x-1.5"
                      >
                        <Tv className="w-3.5 h-3.5 text-sky-400" />
                        <span>{transmittingId === creature.instance_id ? 'Transmitiendo...' : 'Transmitir a la TV'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* PESTAÑA 2: CATÁLOGO COMPLETO DEL BESTIARIO                           */}
      {/* ===================================================================== */}
      {activeTab === 'catalog' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Columna Izquierda: Buscador, Filtros y Lista */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Buscador */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-stone-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar monstruo, ataque o regla..."
                className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Filtros de Categoría */}
            <div className="flex flex-wrap gap-1.5">
              {BESTIARY_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-amber-600 text-stone-950 shadow-md'
                      : 'bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Listado de Criaturas */}
            <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
              {filteredBestiary.map((m) => (
                <div
                  key={m.id}
                  onClick={() => setInspectedMonster(m)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    inspectedMonster?.id === m.id
                      ? 'bg-amber-950/40 border-amber-500/80 shadow-md ring-1 ring-amber-500/40'
                      : 'bg-stone-900/70 border-stone-800/80 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center space-x-3 truncate pr-2">
                    <span className="text-2xl shrink-0">{m.icon}</span>
                    <div className="truncate">
                      <div className="font-bold text-xs text-stone-100 truncate">{m.name}</div>
                      <div className="text-[10px] text-stone-400">
                        {m.size} · Ferocidad {m.ferocity || 1} · {m.hp_max} PG
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToEncounter(m);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold p-1.5 rounded-lg text-xs transition-colors shadow"
                      title="Añadir a la Escena Activa"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-stone-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Columna Derecha: Ficha Detallada del Monstruo Seleccionado */}
          <div className="lg:col-span-7">
            {inspectedMonster ? (
              <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl space-y-5">
                
                {/* Cabecera de la criatura */}
                <div className="flex items-start justify-between border-b border-stone-800 pb-4">
                  <div className="flex items-center space-x-3.5">
                    <span className="text-4xl">{inspectedMonster.icon}</span>
                    <div>
                      <div className="text-xs uppercase font-extrabold tracking-widest text-amber-500">
                        {inspectedMonster.category} · Tamaño {inspectedMonster.size}
                      </div>
                      <h2 className="text-2xl font-black text-stone-100">{inspectedMonster.name}</h2>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleBroadcastToScreen(inspectedMonster)}
                      className="bg-stone-950 hover:bg-stone-800 border border-stone-700 text-stone-300 hover:text-sky-300 font-bold px-3 py-1.5 rounded-xl text-xs transition-all flex items-center space-x-1.5"
                      title="Mostrar en Smart TV"
                    >
                      <Tv className="w-3.5 h-3.5 text-sky-400" />
                      <span>Transmitir TV</span>
                    </button>

                    <button
                      onClick={() => handleAddToEncounter(inspectedMonster)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-1.5 rounded-xl text-xs transition-all flex items-center space-x-1.5 shadow-lg shadow-emerald-950/50"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Añadir a la Escena</span>
                    </button>
                  </div>
                </div>

                {/* Estadísticas clave */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                  <div className="bg-stone-950 p-2.5 rounded-xl border border-stone-800">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">Ferocidad</span>
                    <span className="text-base font-black text-amber-400 font-mono">
                      {inspectedMonster.ferocity || 1}
                    </span>
                  </div>
                  <div className="bg-stone-950 p-2.5 rounded-xl border border-stone-800">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">Movimiento</span>
                    <span className="text-base font-black text-stone-200 font-mono">
                      {inspectedMonster.movement}m
                    </span>
                  </div>
                  <div className="bg-stone-950 p-2.5 rounded-xl border border-stone-800">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">Armadura</span>
                    <span className="text-base font-black text-sky-400 font-mono">
                      {inspectedMonster.armor || 0}
                    </span>
                  </div>
                  <div className="bg-stone-950 p-2.5 rounded-xl border border-stone-800">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">Puntos de Golpe</span>
                    <span className="text-base font-black text-rose-400 font-mono">
                      {inspectedMonster.hp_max} PG
                    </span>
                  </div>
                </div>

                {/* Descripción oficial de ambientación */}
                <div className="bg-stone-950/60 p-3.5 rounded-2xl border border-stone-800 text-xs text-stone-300 leading-relaxed italic">
                  "{inspectedMonster.description}"
                </div>

                {/* Reglas especiales */}
                {inspectedMonster.special_rules && (
                  <div className="bg-amber-950/20 border border-amber-900/40 p-3 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-amber-400 block flex items-center space-x-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Reglas Especiales de Combate:</span>
                    </span>
                    <p className="text-stone-300">{inspectedMonster.special_rules}</p>
                  </div>
                )}

                {/* Tabla de Ataques de Monstruo (1D6) */}
                {inspectedMonster.attacks && inspectedMonster.attacks.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                      <h3 className="font-bold text-xs uppercase tracking-wider text-rose-400 flex items-center space-x-1.5">
                        <Dices className="w-4 h-4 text-rose-500" />
                        <span>Tabla de Ataques de Monstruo (Tirada 1D6 Oficial)</span>
                      </h3>
                      <button
                        onClick={() => handleRollMonsterAttack(inspectedMonster)}
                        className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-1 rounded-lg text-xs transition-colors flex items-center space-x-1 shadow"
                      >
                        <Dices className="w-3 h-3" />
                        <span>Probar Tirada</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {inspectedMonster.attacks.map((att) => (
                        <div
                          key={att.dice}
                          className="bg-stone-950 p-3 rounded-xl border border-stone-800/80 text-xs space-y-1 hover:border-stone-700 transition-colors"
                        >
                          <div className="flex items-center justify-between font-bold">
                            <div className="flex items-center space-x-2">
                              <span className="w-5 h-5 rounded-md bg-rose-950 border border-rose-700/60 text-rose-300 font-mono text-[11px] flex items-center justify-center font-black">
                                {att.dice}
                              </span>
                              <span className="text-stone-100">{att.title}</span>
                            </div>
                            {att.damage && att.damage !== '-' && (
                              <span className="bg-stone-900 border border-stone-700 text-amber-300 px-2 py-0.5 rounded text-[11px] font-mono font-bold">
                                Daño: {att.damage}
                              </span>
                            )}
                          </div>
                          <p className="text-stone-400 text-[11px] leading-relaxed pl-7">
                            {att.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Armas para adversarios humanoides */}
                {inspectedMonster.weapon && (
                  <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800 text-xs space-y-1">
                    <span className="font-bold text-amber-400 block">Armamento y Habilidades de Combate:</span>
                    <div className="text-stone-300">{inspectedMonster.weapon}</div>
                    {inspectedMonster.skills && (
                      <div className="text-stone-400 text-[11px] pt-1">Habilidades: {inspectedMonster.skills}</div>
                    )}
                  </div>
                )}

              </div>
            ) : (
              <div className="bg-stone-900/50 border border-stone-800 rounded-3xl p-12 text-center text-stone-500 text-xs">
                Selecciona una criatura del listado para ver su ficha completa.
              </div>
            )}
          </div>

        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL DE RESULTADO DE ATAQUE DE MONSTRUO 1D6                         */}
      {/* ===================================================================== */}
      {monsterRollResult && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-rose-600/70 rounded-3xl max-w-md w-full p-6 text-center shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-rose-400">
                Ataque de Monstruo · {monsterRollResult.monsterName}
              </span>
              <span className="w-7 h-7 rounded-lg bg-rose-600 text-white font-mono text-sm font-black flex items-center justify-center shadow">
                {monsterRollResult.dice}
              </span>
            </div>

            <div className="py-2 space-y-2">
              <div className="text-xl font-black text-amber-300">
                {monsterRollResult.attack.title}
              </div>
              <p className="text-xs text-stone-300 leading-relaxed bg-stone-950 p-3.5 rounded-xl border border-stone-800 text-left">
                {monsterRollResult.attack.description}
              </p>
            </div>

            {/* Daño Automático si aplica */}
            {monsterRollResult.rolledDamage && (
              <div className="bg-rose-950/60 border border-rose-700/60 p-3 rounded-xl flex items-center justify-between">
                <div className="text-left">
                  <span className="text-[10px] uppercase font-bold text-rose-300 block">Tirada de Daño ({monsterRollResult.attack.damage})</span>
                  <span className="text-xs text-stone-400">Dados: [{monsterRollResult.rolledDamage.rolls.join(' + ')}]</span>
                </div>
                <div className="text-2xl font-black text-rose-400 font-mono">
                  {monsterRollResult.rolledDamage.total} de daño
                </div>
              </div>
            )}

            <button
              onClick={() => setMonsterRollResult(null)}
              className="w-full bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold py-2.5 rounded-xl text-xs transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
