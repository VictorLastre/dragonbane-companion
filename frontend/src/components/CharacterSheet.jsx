import React, { useState } from 'react';
import { 
  Heart, Zap, Shield, Sword, Sparkles, Backpack, 
  Dices, Plus, Minus, Check, Save, Coins, Skull, Flame
} from 'lucide-react';
import { 
  getDamageBonus, getMaxCarryingCapacity, CONDITIONS_MAP, 
  OFFICIAL_GENERAL_SKILLS, OFFICIAL_WEAPON_SKILLS, rollCheck, rollDamageFormula 
} from '../utils/dragonbaneRules';

export default function CharacterSheet({ initialChar, onSave, isSaving }) {
  const [char, setChar] = useState(() => {
    // Si ya tiene skills iniciales, las usamos asegurando la estructura
    const baseChar = initialChar || {
      id: null,
      name: 'Aventurero',
      player_name: '',
      kin: 'Humano',
      profession: 'Guerrero',
      age: 'Adulto',
      weakness: 'Codicioso con los tesoros antiguos',
      appearance: 'Cicatriz en la ceja, capa de lana verde',
      strength: 14,
      constitution: 15,
      agility: 12,
      intelligence: 10,
      willpower: 13,
      charisma: 11,
      hp_current: 15,
      hp_max: 15,
      wp_current: 13,
      wp_max: 13,
      movement: 10,
      damage_bonus_str: '+d4',
      damage_bonus_agi: '-',
      conditions: {
        exhausted: false,
        sickly: false,
        dazed: false,
        angry: false,
        scared: false,
        disheartened: false
      },
      skills: [...OFFICIAL_GENERAL_SKILLS, ...OFFICIAL_WEAPON_SKILLS],
      secondary_skills: [
        { name: 'Magia Animismo', attr: 'INT', level: 10, advance: false }
      ],
      heroic_abilities_and_spells: 'Ataque Poderoso: Gasta 2 PC para sumar +1d6 al daño.\nGolpe Defensivo: Gasta 2 PC para parar un ataque sin gastar acción.',
      weapons: [
        { name: 'Espada ancha', grip: '1M', range: 'Cuerpo a cuerpo', damage: '2d6', resistance: 15, types: 'Cortante/Perforante' },
        { name: 'Daga', grip: '1M', range: 'Cuerpo a cuerpo', damage: '1d8', resistance: 9, types: 'Perforante/Cortante' }
      ],
      armor: {
        name: 'Cuero endurecido',
        rating: 2,
        disadvantage_stealth: false,
        disadvantage_dodge: false,
        disadvantage_athletics: false
      },
      helmet: {
        name: 'Casco de hierro abierto',
        rating: 1,
        disadvantage_awareness: false,
        disadvantage_ranged: false
      },
      inventory: [
        { item: 'Antorchas (4)', slots: 1 },
        { item: 'Raciones de viaje (5 días)', slots: 1 },
        { item: 'Cuerda de cáñamo 10m', slots: 1 },
        { item: 'Pedernal y yesca', slots: 0.5 }
      ],
      gold: 4,
      silver: 18,
      copper: 35,
      memento: 'Un medallón con el escudo de su familia',
      tiny_items: 'Pipa de brezo, cuerda corta, moneda con suerte',
      rests: {
        round_rest: false,
        short_rest: false
      },
      death_saves: {
        successes: 0,
        failures: 0
      }
    };

    return baseChar;
  });

  const [rollModal, setRollModal] = useState(null);
  const [damageModal, setDamageModal] = useState(null);
  const [rollMode, setRollMode] = useState('normal'); // 'normal', 'boon', 'bane'

  // Sincronizar bonificadores de daño y máximos si cambian los atributos
  const handleAttributeChange = (attr, val) => {
    const num = Math.max(1, parseInt(val, 10) || 0);
    const updated = { ...char, [attr]: num };

    if (attr === 'strength') {
      updated.damage_bonus_str = getDamageBonus(num);
    }
    if (attr === 'agility') {
      updated.damage_bonus_agi = getDamageBonus(num);
    }
    if (attr === 'constitution') {
      if (char.hp_current >= char.hp_max) {
        updated.hp_current = num;
      }
      updated.hp_max = num;
    }
    if (attr === 'willpower') {
      if (char.wp_current >= char.wp_max) {
        updated.wp_current = num;
      }
      updated.wp_max = num;
    }
    setChar(updated);
  };

  const toggleCondition = (key) => {
    setChar(prev => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        [key]: !prev.conditions?.[key]
      }
    }));
  };

  // Buscar habilidad en el array de skills
  const findSkill = (name) => {
    return (char.skills || []).find(s => s.name.toLowerCase() === name.toLowerCase()) || {
      name,
      attr: 'INT',
      level: 5,
      advance: false
    };
  };

  const updateSkillInList = (name, field, val) => {
    setChar(prev => {
      const skills = [...(prev.skills || [])];
      const idx = skills.findIndex(s => s.name.toLowerCase() === name.toLowerCase());
      if (idx >= 0) {
        skills[idx] = { ...skills[idx], [field]: val };
      } else {
        skills.push({ name, attr: 'INT', level: 5, advance: false, [field]: val });
      }
      return { ...prev, skills };
    });
  };

  // Habilidades Secundarias
  const addSecondarySkill = () => {
    setChar(prev => ({
      ...prev,
      secondary_skills: [
        ...(prev.secondary_skills || []),
        { name: 'Nueva Habilidad', attr: 'INT', level: 6, advance: false }
      ]
    }));
  };

  const updateSecondarySkill = (idx, field, val) => {
    setChar(prev => {
      const list = [...(prev.secondary_skills || [])];
      list[idx] = { ...list[idx], [field]: val };
      return { ...prev, secondary_skills: list };
    });
  };

  const removeSecondarySkill = (idx) => {
    setChar(prev => ({
      ...prev,
      secondary_skills: prev.secondary_skills.filter((_, i) => i !== idx)
    }));
  };

  // Tirar d20 de habilidad o atributo
  const triggerRoll = (title, targetScore) => {
    const res = rollCheck(targetScore, rollMode);
    setRollModal({
      title,
      targetScore,
      mode: rollMode,
      result: res
    });
  };

  // Tirar Daño de Arma
  const triggerDamageRoll = (weapon, bonusType = 'none') => {
    let bonusStr = '';
    if (bonusType === 'str') bonusStr = char.damage_bonus_str;
    else if (bonusType === 'agi') bonusStr = char.damage_bonus_agi;

    const res = rollDamageFormula(weapon.damage, bonusStr);
    setDamageModal({
      weapon,
      bonusType,
      result: res
    });
  };

  // Inventario
  const addInventorySlot = () => {
    setChar(prev => ({
      ...prev,
      inventory: [...(prev.inventory || []), { item: '', slots: 1 }]
    }));
  };

  const updateInventorySlot = (idx, field, val) => {
    setChar(prev => {
      const list = [...(prev.inventory || [])];
      list[idx] = { ...list[idx], [field]: field === 'slots' ? Number(val) : val };
      return { ...prev, inventory: list };
    });
  };

  const removeInventorySlot = (idx) => {
    setChar(prev => ({
      ...prev,
      inventory: prev.inventory.filter((_, i) => i !== idx)
    }));
  };

  // Armas
  const addWeaponRow = () => {
    setChar(prev => ({
      ...prev,
      weapons: [
        ...(prev.weapons || []),
        { name: 'Nueva Arma', grip: '1M', range: 'Cuerpo a cuerpo', damage: '1d8', resistance: 9, types: 'Cortante' }
      ]
    }));
  };

  const totalSlotsUsed = (char.inventory || []).reduce((acc, item) => acc + (Number(item.slots) || 0), 0);
  const maxCapacity = getMaxCarryingCapacity(char.strength);
  const isOverburdened = totalSlotsUsed > maxCapacity;

  return (
    <div className="w-full max-w-6xl mx-auto p-2 sm:p-4 space-y-4 text-stone-200">
      
      {/* ========================================================================= */}
      {/* BARRA SUPERIOR DE ACCIONES                                               */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-900/90 border border-stone-800 rounded-2xl p-3 shadow-lg">
        <div className="flex items-center space-x-2">
          <span className="text-xl">🐉</span>
          <span className="font-black text-amber-500 tracking-wider text-sm sm:text-base uppercase">Hoja Oficial Dragonbane</span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Selector de Ventaja/Desventaja para tiradas */}
          <div className="flex bg-stone-950 p-1 rounded-xl border border-stone-800 text-xs">
            <button
              onClick={() => setRollMode('boon')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${rollMode === 'boon' ? 'bg-emerald-600 text-white shadow' : 'text-stone-400 hover:text-stone-200'}`}
              title="Ventaja: Tira 2d20 y quédate con el menor número"
            >
              Ventaja
            </button>
            <button
              onClick={() => setRollMode('normal')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${rollMode === 'normal' ? 'bg-amber-600 text-stone-950 shadow' : 'text-stone-400 hover:text-stone-200'}`}
            >
              Normal
            </button>
            <button
              onClick={() => setRollMode('bane')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${rollMode === 'bane' ? 'bg-rose-700 text-white shadow' : 'text-stone-400 hover:text-stone-200'}`}
              title="Desventaja: Tira 2d20 y quédate con el mayor número"
            >
              Desventaja
            </button>
          </div>

          <button
            onClick={() => onSave && onSave(char)}
            disabled={isSaving}
            className="flex items-center space-x-1.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold px-4 py-2 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
            <span className="text-xs sm:text-sm">{isSaving ? 'Guardando...' : 'Guardar'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CABECERA (DRAGONBANE ARRIBA + JUGADOR, RAZA, EDAD, NOMBRE, APARIENCIA)   */}
      {/* ========================================================================= */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden space-y-4">
        
        {/* Título DRAGONBANE arriba centrado sin tapar ningún campo */}
        <div className="text-center pb-2 border-b border-stone-800/80">
          <h1 className="text-3xl sm:text-5xl font-black text-rose-600 tracking-tighter drop-shadow-[0_2px_14px_rgba(225,29,72,0.45)]">
            DRAGONBANE
          </h1>
        </div>

        {/* 3 Columnas principales de información básica */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          
          {/* Columna Izquierda (5 columnas): Jugador, Raza, Edad, Profesión, Debilidad */}
          <div className="md:col-span-5 space-y-2.5 text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-20 font-bold uppercase text-stone-400 tracking-wider">Jugador:</span>
              <input
                type="text"
                value={char.player_name || ''}
                onChange={(e) => setChar({ ...char, player_name: e.target.value })}
                className="flex-1 bg-stone-950 border-b border-stone-700 px-2 py-1 text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-7 flex items-center space-x-2">
                <span className="w-20 font-bold uppercase text-stone-400 tracking-wider">Raza:</span>
                <input
                  type="text"
                  value={char.kin || ''}
                  onChange={(e) => setChar({ ...char, kin: e.target.value })}
                  className="w-full bg-stone-950 border-b border-stone-700 px-2 py-1 text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="col-span-5 flex items-center space-x-2">
                <span className="font-bold uppercase text-stone-400 tracking-wider">Edad:</span>
                <select
                  value={char.age || 'Adulto'}
                  onChange={(e) => setChar({ ...char, age: e.target.value })}
                  className="flex-1 bg-stone-950 border-b border-stone-700 px-1 py-1 text-stone-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="Joven">Joven</option>
                  <option value="Adulto">Adulto</option>
                  <option value="Anciano">Anciano</option>
                  <option value="Viejo">Viejo</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="w-20 font-bold uppercase text-stone-400 tracking-wider">Profesión:</span>
              <input
                type="text"
                value={char.profession || ''}
                onChange={(e) => setChar({ ...char, profession: e.target.value })}
                className="flex-1 bg-stone-950 border-b border-stone-700 px-2 py-1 text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <span className="w-20 font-bold uppercase text-amber-500 tracking-wider">Debilidad:</span>
              <input
                type="text"
                value={char.weakness || ''}
                onChange={(e) => setChar({ ...char, weakness: e.target.value })}
                placeholder="Ej. Codicioso, Susceptible..."
                className="flex-1 bg-stone-950 border-b border-amber-900/60 px-2 py-1 text-amber-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Columna Central (4 columnas): Nombre del Personaje */}
          <div className="md:col-span-4 flex flex-col items-center justify-center p-3 bg-stone-950/70 border border-stone-800 rounded-2xl text-center shadow-inner">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">
              Nombre del Personaje
            </span>
            <input
              type="text"
              value={char.name || ''}
              onChange={(e) => setChar({ ...char, name: e.target.value })}
              className="w-full text-center font-black text-lg sm:text-2xl bg-transparent border-b-2 border-amber-500 py-1 text-amber-200 focus:outline-none"
              placeholder="Nombre del héroe"
            />
          </div>

          {/* Columna Derecha (3 columnas): Apariencia */}
          <div className="md:col-span-3 space-y-1 text-xs">
            <label className="font-bold uppercase text-stone-400 tracking-wider block">Apariencia:</label>
            <textarea
              rows={3}
              value={char.appearance || ''}
              onChange={(e) => setChar({ ...char, appearance: e.target.value })}
              placeholder="Rasgos físicos, vestimenta, ojos..."
              className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2 text-stone-200 focus:outline-none focus:border-amber-500 resize-none text-xs"
            />
          </div>

        </div>

        {/* ========================================================================= */}
        {/* ATRIBUTOS Y CONDICIONES (FUE, CON, AGI, INT, VOL, CAR)                    */}
        {/* ========================================================================= */}
        <div className="mt-4 pt-4 border-t border-stone-800">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { key: 'strength', code: 'FUE', name: 'Fuerza', condKey: 'exhausted', condName: 'Agotado' },
              { key: 'constitution', code: 'CON', name: 'Constitución', condKey: 'sickly', condName: 'Enfermo' },
              { key: 'agility', code: 'AGI', name: 'Agilidad', condKey: 'dazed', condName: 'Aturdido' },
              { key: 'intelligence', code: 'INT', name: 'Inteligencia', condKey: 'angry', condName: 'Enfadado' },
              { key: 'willpower', code: 'VOL', name: 'Voluntad', condKey: 'scared', condName: 'Asustado' },
              { key: 'charisma', code: 'CAR', name: 'Carisma', condKey: 'disheartened', condName: 'Desanimado' }
            ].map(({ key, code, name, condKey, condName }) => {
              const isCondActive = char.conditions?.[condKey];
              return (
                <div key={key} className="bg-stone-950 border border-stone-800 rounded-2xl p-3 flex flex-col items-center justify-between text-center relative group shadow-inner">
                  {/* Círculo de Atributo */}
                  <div className="w-16 h-16 rounded-full border-2 border-amber-600/70 bg-stone-900 flex flex-col items-center justify-center shadow-lg relative my-1">
                    <span className="text-[10px] font-black tracking-widest text-stone-400 leading-none">{code}</span>
                    <input
                      type="number"
                      value={char[key]}
                      onChange={(e) => handleAttributeChange(key, e.target.value)}
                      className="w-12 text-center text-xl font-black bg-transparent text-amber-300 focus:outline-none"
                    />
                  </div>

                  <button
                    onClick={() => triggerRoll(`${name} (${code})`, char[key])}
                    className="w-full mt-1 mb-2 bg-stone-900 hover:bg-amber-600 hover:text-stone-950 text-stone-300 text-[11px] font-bold py-1 rounded-lg border border-stone-800 transition-colors flex items-center justify-center space-x-1"
                  >
                    <Dices className="w-3 h-3" />
                    <span>Tirar</span>
                  </button>

                  {/* Condición Oficial Debajo */}
                  <button
                    onClick={() => toggleCondition(condKey)}
                    className={`w-full py-1 px-1.5 rounded-lg border text-[11px] font-bold transition-all flex items-center justify-between ${
                      isCondActive
                        ? 'bg-rose-950/80 border-rose-600 text-rose-300'
                        : 'bg-stone-900/50 border-stone-800/80 text-stone-500 hover:text-stone-300'
                    }`}
                    title={`Condición: ${condName} da desventaja a tiradas de ${name}`}
                  >
                    <span className="uppercase text-[9px] tracking-wider">{condName}</span>
                    <div className={`w-3 h-3 rounded flex items-center justify-center border ${isCondActive ? 'bg-rose-600 border-rose-500' : 'border-stone-700'}`}>
                      {isCondActive && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BANNERS DE BONIFICADORES Y MOVIMIENTO                                     */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-3 border-t border-stone-800/80 text-center">
          <div className="bg-stone-950 border border-stone-800 rounded-xl p-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Bonif. al Daño FUE</span>
            <span className="text-lg font-black text-amber-400 font-mono">{char.damage_bonus_str || '-'}</span>
          </div>
          <div className="bg-stone-950 border border-stone-800 rounded-xl p-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Bonif. al Daño AGI</span>
            <span className="text-lg font-black text-amber-400 font-mono">{char.damage_bonus_agi || '-'}</span>
          </div>
          <div className="bg-stone-950 border border-stone-800 rounded-xl p-2 flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Movimiento</span>
            <div className="flex items-center space-x-1">
              <input
                type="number"
                value={char.movement || 10}
                onChange={(e) => setChar({ ...char, movement: parseInt(e.target.value, 10) || 10 })}
                className="w-12 text-center text-lg font-black bg-transparent text-amber-400 focus:outline-none"
              />
              <span className="text-xs text-stone-400">m</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CUERPO PRINCIPAL: 3 COLUMNAS IDÉNTICAS A LA HOJA OFICIAL                  */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* ----------------------------------------------------------------------- */}
        {/* COLUMNA 1 (IZQUIERDA): CAPACIDADES, HECHIZOS Y MONEDAS                 */}
        {/* ----------------------------------------------------------------------- */}
        <div className="lg:col-span-3 space-y-4">
          {/* Capacidades y Hechizos */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-lg flex flex-col h-[520px]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2 flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Capacidades y Hechizos</span>
            </h3>
            <textarea
              value={char.heroic_abilities_and_spells || ''}
              onChange={(e) => setChar({ ...char, heroic_abilities_and_spells: e.target.value })}
              placeholder="Capacidades heroicas, trucos, hechizos aprendidos y costes en PC..."
              className="flex-1 w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-stone-200 focus:outline-none focus:border-amber-500 resize-none leading-relaxed"
            />
          </div>

          {/* Monedas: Oro, Plata, Cobre */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-lg space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center space-x-1.5">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>Monedas</span>
            </h3>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between bg-stone-950 px-3 py-1.5 rounded-lg border border-stone-800">
                <span className="font-bold text-amber-400">ORO</span>
                <input
                  type="number"
                  value={char.gold || 0}
                  onChange={(e) => setChar({ ...char, gold: parseInt(e.target.value, 10) || 0 })}
                  className="w-16 bg-stone-900 border border-stone-700 rounded px-2 py-0.5 text-right font-bold text-amber-300 focus:outline-none"
                />
              </div>
              <div className="flex items-center justify-between bg-stone-950 px-3 py-1.5 rounded-lg border border-stone-800">
                <span className="font-bold text-slate-300">PLATA</span>
                <input
                  type="number"
                  value={char.silver || 0}
                  onChange={(e) => setChar({ ...char, silver: parseInt(e.target.value, 10) || 0 })}
                  className="w-16 bg-stone-900 border border-stone-700 rounded px-2 py-0.5 text-right font-bold text-slate-200 focus:outline-none"
                />
              </div>
              <div className="flex items-center justify-between bg-stone-950 px-3 py-1.5 rounded-lg border border-stone-800">
                <span className="font-bold text-amber-600">COBRE</span>
                <input
                  type="number"
                  value={char.copper || 0}
                  onChange={(e) => setChar({ ...char, copper: parseInt(e.target.value, 10) || 0 })}
                  className="w-16 bg-stone-900 border border-stone-700 rounded px-2 py-0.5 text-right font-bold text-amber-600 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* COLUMNA 2 (CENTRAL): HABILIDADES IDÉNTICAS A LA HOJA OFICIAL            */}
        {/* Sub-columna Izquierda: 20 Generales | Sub-columna Derecha: Armas + Sec  */}
        {/* ----------------------------------------------------------------------- */}
        <div className="lg:col-span-6 bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-lg space-y-3">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">Habilidades</h3>
            <span className="text-[11px] text-stone-400">◇ Casilla de avance al sacar Dragón (1)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            
            {/* SUB-COLUMNA IZQUIERDA: 20 HABILIDADES GENERALES EN ORDEN OFICIAL */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                Habilidades Generales
              </span>
              {OFFICIAL_GENERAL_SKILLS.map((defSkill) => {
                const s = findSkill(defSkill.name);
                return (
                  <div
                    key={defSkill.name}
                    className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-stone-800/40 transition-colors group"
                  >
                    <div className="flex items-center space-x-1.5 flex-1 min-w-0">
                      <button
                        onClick={() => updateSkillInList(defSkill.name, 'advance', !s.advance)}
                        className={`w-3.5 h-3.5 rotate-45 border flex items-center justify-center transition-colors ${
                          s.advance ? 'bg-amber-600 border-amber-500' : 'border-stone-700 bg-stone-950 hover:border-amber-600'
                        }`}
                        title="Marca para avance tras descansar"
                      >
                        {s.advance && <Check className="-rotate-45 w-2.5 h-2.5 text-stone-950 stroke-[3]" />}
                      </button>
                      <span className="truncate text-stone-200">{defSkill.name}</span>
                      <span className="text-[10px] text-stone-400 font-mono">({defSkill.attr})</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <input
                        type="number"
                        value={s.level}
                        onChange={(e) => updateSkillInList(defSkill.name, 'level', Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="w-8 text-center font-bold text-xs bg-stone-950 border border-stone-800 rounded py-0.5 text-amber-300 focus:outline-none focus:border-amber-500"
                      />
                      <button
                        onClick={() => triggerRoll(`${defSkill.name} (${defSkill.attr})`, s.level)}
                        className="p-1 rounded bg-stone-800 hover:bg-amber-600 hover:text-stone-950 text-stone-400 transition-colors"
                        title="Tirar d20"
                      >
                        <Dices className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* SUB-COLUMNA DERECHA: HABILIDADES DE ARMAS + HABILIDADES SECUNDARIAS */}
            <div className="space-y-4">
              
              {/* 1. Habilidades de Armas en orden oficial */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                  Habilidades de Armas
                </span>
                {OFFICIAL_WEAPON_SKILLS.map((defSkill) => {
                  const s = findSkill(defSkill.name);
                  return (
                    <div
                      key={defSkill.name}
                      className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-stone-800/40 transition-colors group"
                    >
                      <div className="flex items-center space-x-1.5 flex-1 min-w-0">
                        <button
                          onClick={() => updateSkillInList(defSkill.name, 'advance', !s.advance)}
                          className={`w-3.5 h-3.5 rotate-45 border flex items-center justify-center transition-colors ${
                            s.advance ? 'bg-amber-600 border-amber-500' : 'border-stone-700 bg-stone-950 hover:border-amber-600'
                          }`}
                          title="Marca para avance tras descansar"
                        >
                          {s.advance && <Check className="-rotate-45 w-2.5 h-2.5 text-stone-950 stroke-[3]" />}
                        </button>
                        <span className="truncate text-stone-200">{defSkill.name}</span>
                        <span className="text-[10px] text-stone-400 font-mono">({defSkill.attr})</span>
                      </div>

                      <div className="flex items-center space-x-1">
                        <input
                          type="number"
                          value={s.level}
                          onChange={(e) => updateSkillInList(defSkill.name, 'level', Math.max(1, parseInt(e.target.value, 10) || 1))}
                          className="w-8 text-center font-bold text-xs bg-stone-950 border border-stone-800 rounded py-0.5 text-amber-300 focus:outline-none focus:border-amber-500"
                        />
                        <button
                          onClick={() => triggerRoll(`${defSkill.name} (${defSkill.attr})`, s.level)}
                          className="p-1 rounded bg-stone-800 hover:bg-amber-600 hover:text-stone-950 text-stone-400 transition-colors"
                          title="Tirar d20"
                        >
                          <Dices className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 2. Habilidades Secundarias (Escuelas de magia o personalizadas) */}
              <div className="space-y-1.5 pt-2 border-t border-stone-800/80">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                    Habilidades Secundarias
                  </span>
                  <button
                    onClick={addSecondarySkill}
                    className="text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center space-x-0.5"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Añadir</span>
                  </button>
                </div>

                {(char.secondary_skills || []).map((sec, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-1 px-1.5 rounded bg-stone-950/60 border border-stone-800/80 text-xs"
                  >
                    <div className="flex items-center space-x-1.5 flex-1 min-w-0 pr-1">
                      <button
                        onClick={() => updateSecondarySkill(idx, 'advance', !sec.advance)}
                        className={`w-3.5 h-3.5 rotate-45 border flex items-center justify-center transition-colors ${
                          sec.advance ? 'bg-amber-600 border-amber-500' : 'border-stone-700 bg-stone-950 hover:border-amber-600'
                        }`}
                      >
                        {sec.advance && <Check className="-rotate-45 w-2.5 h-2.5 text-stone-950 stroke-[3]" />}
                      </button>
                      <input
                        type="text"
                        value={sec.name}
                        onChange={(e) => updateSecondarySkill(idx, 'name', e.target.value)}
                        className="flex-1 bg-transparent text-xs text-stone-200 focus:outline-none"
                        placeholder="Nombre secundaria"
                      />
                    </div>

                    <div className="flex items-center space-x-1">
                      <input
                        type="number"
                        value={sec.level}
                        onChange={(e) => updateSecondarySkill(idx, 'level', Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="w-8 text-center font-bold text-xs bg-stone-900 border border-stone-700 rounded py-0.5 text-amber-300 focus:outline-none"
                      />
                      <button
                        onClick={() => triggerRoll(`${sec.name} (${sec.attr || 'SEC'})`, sec.level)}
                        className="p-1 rounded bg-stone-800 hover:bg-amber-600 hover:text-stone-950 text-stone-400 transition-colors"
                      >
                        <Dices className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeSecondarySkill(idx)}
                        className="text-stone-500 hover:text-rose-400 px-0.5"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* COLUMNA 3 (DERECHA): INVENTARIO, RECUERDO, OBJETOS DIMINUTOS             */}
        {/* ----------------------------------------------------------------------- */}
        <div className="lg:col-span-3 space-y-4">
          {/* Inventario con límite de carga */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1">
                <Backpack className="w-3.5 h-3.5" />
                <span>Inventario</span>
              </h3>
              <div className="text-[11px] text-stone-400">
                Límite: <span className={`font-bold ${isOverburdened ? 'text-rose-400' : 'text-amber-300'}`}>{totalSlotsUsed}</span> / {maxCapacity}
              </div>
            </div>

            <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1">
              {(char.inventory || []).map((item, idx) => (
                <div key={idx} className="flex items-center space-x-1 bg-stone-950 p-1.5 rounded-lg border border-stone-800 text-xs">
                  <span className="text-[10px] text-stone-400 font-mono w-4 text-center">{idx + 1}</span>
                  <input
                    type="text"
                    value={item.item}
                    onChange={(e) => updateInventorySlot(idx, 'item', e.target.value)}
                    placeholder="Objeto..."
                    className="flex-1 bg-transparent text-xs text-stone-200 focus:outline-none"
                  />
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={item.slots}
                    onChange={(e) => updateInventorySlot(idx, 'slots', e.target.value)}
                    className="w-10 bg-stone-900 border border-stone-700 rounded text-center text-xs text-stone-200"
                    title="Espacios de carga"
                  />
                  <button
                    onClick={() => removeInventorySlot(idx)}
                    className="text-stone-400 hover:text-rose-400 px-1"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={addInventorySlot}
              className="w-full py-1.5 border border-dashed border-stone-700 hover:border-amber-500 rounded-xl text-stone-400 hover:text-amber-400 text-xs font-bold transition-all flex items-center justify-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir Espacio</span>
            </button>
          </div>

          {/* Recuerdo (No ocupa espacio) */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-lg space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">Recuerdo (Memento)</h3>
            <input
              type="text"
              value={char.memento || ''}
              onChange={(e) => setChar({ ...char, memento: e.target.value })}
              placeholder="Un amuleto, una flor seca..."
              className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-xs text-amber-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Objetos Diminutos */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-lg space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">Objetos Diminutos</h3>
            <textarea
              rows={2}
              value={char.tiny_items || ''}
              onChange={(e) => setChar({ ...char, tiny_items: e.target.value })}
              placeholder="Objetos muy pequeños que no ocupan espacios..."
              className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-xs text-stone-200 focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ZONA INFERIOR: ARMADURA, CASCO, ARMAS CON TIRADA DE DAÑO, DESCANSOS, PV... */}
      {/* ========================================================================= */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-6">
        
        {/* Fila 1: Armadura y Casco */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Armadura */}
          <div className="bg-stone-950 border border-stone-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <span className="font-bold uppercase text-stone-400 tracking-wider block">Armadura</span>
              <input
                type="text"
                value={char.armor?.name || ''}
                onChange={(e) => setChar({ ...char, armor: { ...char.armor, name: e.target.value } })}
                placeholder="Nombre de armadura..."
                className="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-stone-100"
              />
            </div>
            <div>
              <span className="font-bold text-stone-400 block text-[10px] uppercase text-center">Nivel de Armadura</span>
              <input
                type="number"
                value={char.armor?.rating || 0}
                onChange={(e) => setChar({ ...char, armor: { ...char.armor, rating: parseInt(e.target.value, 10) || 0 } })}
                className="w-16 bg-stone-900 border border-stone-700 rounded px-2 py-1 text-center font-black text-sky-400"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-stone-400 uppercase block">Desventaja en:</span>
              <div className="flex items-center space-x-3 text-[11px]">
                <label className="flex items-center space-x-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={char.armor?.disadvantage_stealth || false}
                    onChange={(e) => setChar({ ...char, armor: { ...char.armor, disadvantage_stealth: e.target.checked } })}
                  />
                  <span>Sigilo</span>
                </label>
                <label className="flex items-center space-x-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={char.armor?.disadvantage_dodge || false}
                    onChange={(e) => setChar({ ...char, armor: { ...char.armor, disadvantage_dodge: e.target.checked } })}
                  />
                  <span>Esquivar</span>
                </label>
                <label className="flex items-center space-x-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={char.armor?.disadvantage_athletics || false}
                    onChange={(e) => setChar({ ...char, armor: { ...char.armor, disadvantage_athletics: e.target.checked } })}
                  />
                  <span>Atletismo</span>
                </label>
              </div>
            </div>
          </div>

          {/* Casco */}
          <div className="bg-stone-950 border border-stone-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <span className="font-bold uppercase text-stone-400 tracking-wider block">Casco</span>
              <input
                type="text"
                value={char.helmet?.name || ''}
                onChange={(e) => setChar({ ...char, helmet: { ...char.helmet, name: e.target.value } })}
                placeholder="Nombre de casco..."
                className="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-stone-100"
              />
            </div>
            <div>
              <span className="font-bold text-stone-400 block text-[10px] uppercase text-center">Nivel de Armadura</span>
              <input
                type="number"
                value={char.helmet?.rating || 0}
                onChange={(e) => setChar({ ...char, helmet: { ...char.helmet, rating: parseInt(e.target.value, 10) || 0 } })}
                className="w-16 bg-stone-900 border border-stone-700 rounded px-2 py-1 text-center font-black text-sky-400"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-stone-400 uppercase block">Desventaja en:</span>
              <div className="flex items-center space-x-3 text-[11px]">
                <label className="flex items-center space-x-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={char.helmet?.disadvantage_awareness || false}
                    onChange={(e) => setChar({ ...char, helmet: { ...char.helmet, disadvantage_awareness: e.target.checked } })}
                  />
                  <span>Alerta</span>
                </label>
                <label className="flex items-center space-x-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={char.helmet?.disadvantage_ranged || false}
                    onChange={(e) => setChar({ ...char, helmet: { ...char.helmet, disadvantage_ranged: e.target.checked } })}
                  />
                  <span>Ataques a distancia</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Fila 2: Armas y Escudos CON TIRADA DE DAÑO */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1">
              <Sword className="w-3.5 h-3.5" />
              <span>Armas y Escudos (Haz clic en el dado 🎲 para tirar el daño)</span>
            </h4>
            <button
              onClick={addWeaponRow}
              className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center space-x-1 bg-stone-950 px-2 py-1 rounded-lg border border-stone-800"
            >
              <Plus className="w-3 h-3" />
              <span>Añadir Arma</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs bg-stone-950 rounded-xl border border-stone-800">
              <thead className="bg-stone-900/80 text-stone-400 text-[10px] uppercase tracking-wider border-b border-stone-800">
                <tr>
                  <th className="p-2.5">Arma / Escudo</th>
                  <th className="p-2.5">Agarre</th>
                  <th className="p-2.5">Alcance</th>
                  <th className="p-2.5">Daño (Tirada)</th>
                  <th className="p-2.5">Resistencia</th>
                  <th className="p-2.5">Tipos / Cualidades</th>
                  <th className="p-2.5 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800">
                {(char.weapons || []).map((w, idx) => (
                  <tr key={idx} className="hover:bg-stone-900/40">
                    <td className="p-2">
                      <input
                        type="text"
                        value={w.name}
                        onChange={(e) => {
                          const updated = [...char.weapons];
                          updated[idx].name = e.target.value;
                          setChar({ ...char, weapons: updated });
                        }}
                        className="w-full bg-transparent text-stone-100 font-bold focus:outline-none"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={w.grip}
                        onChange={(e) => {
                          const updated = [...char.weapons];
                          updated[idx].grip = e.target.value;
                          setChar({ ...char, weapons: updated });
                        }}
                        className="w-12 bg-transparent text-stone-300 focus:outline-none"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={w.range}
                        onChange={(e) => {
                          const updated = [...char.weapons];
                          updated[idx].range = e.target.value;
                          setChar({ ...char, weapons: updated });
                        }}
                        className="w-24 bg-transparent text-stone-300 focus:outline-none"
                      />
                    </td>
                    <td className="p-2">
                      <div className="flex items-center space-x-1">
                        <input
                          type="text"
                          value={w.damage}
                          onChange={(e) => {
                            const updated = [...char.weapons];
                            updated[idx].damage = e.target.value;
                            setChar({ ...char, weapons: updated });
                          }}
                          className="w-16 bg-stone-900 border border-stone-700 rounded px-1.5 py-0.5 text-amber-400 font-bold font-mono focus:outline-none"
                        />
                        {/* BOTÓN PARA TIRAR DAÑO */}
                        <button
                          onClick={() => triggerDamageRoll(w, 'none')}
                          className="p-1 rounded bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold transition-all shadow active:scale-95 flex items-center space-x-0.5"
                          title="Tirar Daño base"
                        >
                          <Dices className="w-3.5 h-3.5" />
                        </button>
                        {/* BOTÓN PARA TIRAR DAÑO CON BONIFICADOR DE FUERZA */}
                        {char.damage_bonus_str && char.damage_bonus_str !== '-' && (
                          <button
                            onClick={() => triggerDamageRoll(w, 'str')}
                            className="px-1.5 py-0.5 rounded bg-rose-700 hover:bg-rose-600 text-white font-mono text-[10px] font-bold transition-all"
                            title={`Tirar daño + Bonif. FUE (${char.damage_bonus_str})`}
                          >
                            +FUE
                          </button>
                        )}
                        {/* BOTÓN PARA TIRAR DAÑO CON BONIFICADOR DE AGILIDAD */}
                        {char.damage_bonus_agi && char.damage_bonus_agi !== '-' && (
                          <button
                            onClick={() => triggerDamageRoll(w, 'agi')}
                            className="px-1.5 py-0.5 rounded bg-sky-700 hover:bg-sky-600 text-white font-mono text-[10px] font-bold transition-all"
                            title={`Tirar daño + Bonif. AGI (${char.damage_bonus_agi})`}
                          >
                            +AGI
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        value={w.resistance}
                        onChange={(e) => {
                          const updated = [...char.weapons];
                          updated[idx].resistance = parseInt(e.target.value, 10) || 0;
                          setChar({ ...char, weapons: updated });
                        }}
                        className="w-12 bg-transparent text-stone-300 focus:outline-none"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={w.types}
                        onChange={(e) => {
                          const updated = [...char.weapons];
                          updated[idx].types = e.target.value;
                          setChar({ ...char, weapons: updated });
                        }}
                        className="w-full bg-transparent text-stone-400 text-[11px] focus:outline-none"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <button
                        onClick={() => {
                          const updated = char.weapons.filter((_, i) => i !== idx);
                          setChar({ ...char, weapons: updated });
                        }}
                        className="text-stone-500 hover:text-rose-400 font-bold"
                        title="Eliminar arma"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fila 3: Descansos, Puntos de Voluntad, Puntos de Golpe, Tiradas de Muerte */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          
          {/* Descansos */}
          <div className="bg-stone-950 border border-stone-800 rounded-xl p-3 flex flex-col justify-center space-y-2 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Descansos</span>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={char.rests?.round_rest || false}
                onChange={(e) => setChar({ ...char, rests: { ...char.rests, round_rest: e.target.checked } })}
                className="w-4 h-4 rounded text-amber-600"
              />
              <span className="font-semibold text-stone-300">Descanso de ronda</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={char.rests?.short_rest || false}
                onChange={(e) => setChar({ ...char, rests: { ...char.rests, short_rest: e.target.checked } })}
                className="w-4 h-4 rounded text-amber-600"
              />
              <span className="font-semibold text-stone-300">Descanso corto</span>
            </label>
          </div>

          {/* Puntos de Voluntad (Burbujas táctiles) */}
          <div className="bg-stone-950 border border-sky-900/40 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-sky-400 uppercase tracking-wider flex items-center space-x-1">
                <Zap className="w-3.5 h-3.5" />
                <span>Puntos de Voluntad</span>
              </span>
              <span className="font-bold text-white">{char.wp_current} / {char.wp_max}</span>
            </div>
            {/* Burbujas interactivas */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {Array.from({ length: Math.max(10, char.wp_max || 10) }).map((_, i) => {
                const isSpent = i >= char.wp_current;
                return (
                  <button
                    key={i}
                    onClick={() => setChar({ ...char, wp_current: i + 1 === char.wp_current ? i : i + 1 })}
                    className={`w-5 h-5 rounded-full border transition-all ${
                      !isSpent
                        ? 'bg-sky-500 border-sky-400 shadow-[0_0_8px_rgba(14,165,233,0.5)]'
                        : 'bg-stone-900 border-stone-800'
                    }`}
                    title={`PC ${i + 1}`}
                  />
                );
              })}
            </div>
          </div>

          {/* Puntos de Golpe (Burbujas táctiles) */}
          <div className="bg-stone-950 border border-rose-900/40 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-rose-500 uppercase tracking-wider flex items-center space-x-1">
                <Heart className="w-3.5 h-3.5" />
                <span>Puntos de Golpe</span>
              </span>
              <span className="font-bold text-white">{char.hp_current} / {char.hp_max}</span>
            </div>
            {/* Burbujas interactivas */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {Array.from({ length: Math.max(10, char.hp_max || 10) }).map((_, i) => {
                const isLost = i >= char.hp_current;
                return (
                  <button
                    key={i}
                    onClick={() => setChar({ ...char, hp_current: i + 1 === char.hp_current ? i : i + 1 })}
                    className={`w-5 h-5 rounded-full border transition-all ${
                      !isLost
                        ? 'bg-rose-600 border-rose-500 shadow-[0_0_8px_rgba(225,29,72,0.5)]'
                        : 'bg-stone-900 border-stone-800'
                    }`}
                    title={`PV ${i + 1}`}
                  />
                );
              })}
            </div>
          </div>

          {/* Tiradas de Muerte (Éxitos / Fallos) */}
          <div className="bg-stone-950 border border-stone-800 rounded-xl p-3 space-y-2 text-xs flex flex-col justify-between">
            <span className="font-bold uppercase tracking-wider text-stone-400 flex items-center space-x-1">
              <Skull className="w-3.5 h-3.5 text-stone-500" />
              <span>Tiradas de Muerte</span>
            </span>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-emerald-400 font-bold">Éxitos:</span>
                <div className="flex space-x-1.5">
                  {[1, 2, 3].map((num) => (
                    <button
                      key={num}
                      onClick={() => setChar({
                        ...char,
                        death_saves: {
                          ...char.death_saves,
                          successes: char.death_saves?.successes === num ? num - 1 : num
                        }
                      })}
                      className={`w-4 h-4 rotate-45 border transition-all ${
                        (char.death_saves?.successes || 0) >= num
                          ? 'bg-emerald-500 border-emerald-400'
                          : 'bg-stone-900 border-stone-700'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-rose-500 font-bold">Fallos:</span>
                <div className="flex space-x-1.5">
                  {[1, 2, 3].map((num) => (
                    <button
                      key={num}
                      onClick={() => setChar({
                        ...char,
                        death_saves: {
                          ...char.death_saves,
                          failures: char.death_saves?.failures === num ? num - 1 : num
                        }
                      })}
                      className={`w-4 h-4 rotate-45 border transition-all ${
                        (char.death_saves?.failures || 0) >= num
                          ? 'bg-rose-600 border-rose-500'
                          : 'bg-stone-900 border-stone-700'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL DE TIRADA D20 DE HABILIDAD O ATRIBUTO                               */}
      {/* ========================================================================= */}
      {rollModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-700 rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="text-xs font-bold uppercase tracking-wider text-stone-400">
              {rollModal.title}
            </div>

            <div className="py-2">
              <div className="text-5xl font-black font-mono">
                {rollModal.result.resultType === 'dragon' && <span className="text-amber-400">🐉 1</span>}
                {rollModal.result.resultType === 'demon' && <span className="text-rose-500">👿 20</span>}
                {rollModal.result.resultType === 'success' && <span className="text-emerald-400">{rollModal.result.finalRoll}</span>}
                {rollModal.result.resultType === 'failure' && <span className="text-stone-300">{rollModal.result.finalRoll}</span>}
              </div>

              {rollModal.result.rolls.length > 1 && (
                <div className="text-xs text-stone-400 mt-1">
                  Dados tirados: [{rollModal.result.rolls.join(', ')}] ({rollModal.mode === 'boon' ? 'Ventaja' : 'Desventaja'})
                </div>
              )}
            </div>

            <div className={`py-2 px-3 rounded-lg font-bold text-sm ${
              rollModal.result.resultType === 'dragon' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
              rollModal.result.resultType === 'demon' ? 'bg-rose-950/80 text-rose-300 border border-rose-700' :
              rollModal.result.resultType === 'success' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700' :
              'bg-stone-800 text-stone-300 border border-stone-700'
            }`}>
              {rollModal.result.message}
            </div>

            <div className="text-xs text-stone-400">
              Nivel objetivo: <span className="font-bold text-stone-200">{rollModal.targetScore}</span> o menor
            </div>

            <button
              onClick={() => setRollModal(null)}
              className="w-full bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold py-2 rounded-xl text-sm transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DE TIRADA DE DAÑO DE ARMA                                           */}
      {/* ========================================================================= */}
      {damageModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-amber-500/60 rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-center space-x-2 text-rose-500">
              <Flame className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider text-stone-300">
                Tirada de Daño: {damageModal.weapon.name}
              </span>
            </div>

            <div className="py-2">
              <div className="text-6xl font-black font-mono text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.4)]">
                {damageModal.result.total}
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-stone-400 mt-1 block">
                Daño Infligido
              </span>
            </div>

            <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 text-xs space-y-1.5 text-stone-300">
              <div className="flex justify-between">
                <span className="text-stone-400">Fórmula base:</span>
                <span className="font-bold font-mono text-amber-400">{damageModal.result.formula}</span>
              </div>
              {damageModal.result.bonus && (
                <div className="flex justify-between">
                  <span className="text-stone-400">Bonif. de daño:</span>
                  <span className="font-bold font-mono text-emerald-400">{damageModal.result.bonus}</span>
                </div>
              )}
              <div className="border-t border-stone-800 pt-1.5 flex justify-between text-[11px] text-stone-400">
                <span>Desglose de dados:</span>
                <span className="font-mono text-stone-200">
                  {damageModal.result.breakdown.map(b => `${b.label}: [${b.rolls.join(', ')}]`).join(' ')}
                </span>
              </div>
            </div>

            {/* Opciones rápidas para volver a tirar con/sin bonificador */}
            <div className="flex space-x-2">
              <button
                onClick={() => triggerDamageRoll(damageModal.weapon, 'none')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  damageModal.bonusType === 'none'
                    ? 'bg-amber-600 border-amber-500 text-stone-950 font-bold'
                    : 'bg-stone-950 border-stone-800 text-stone-300 hover:border-stone-700'
                }`}
              >
                Sin Bonif.
              </button>
              {char.damage_bonus_str && char.damage_bonus_str !== '-' && (
                <button
                  onClick={() => triggerDamageRoll(damageModal.weapon, 'str')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    damageModal.bonusType === 'str'
                      ? 'bg-rose-700 border-rose-600 text-white font-bold'
                      : 'bg-stone-950 border-stone-800 text-stone-300 hover:border-stone-700'
                  }`}
                >
                  +FUE ({char.damage_bonus_str})
                </button>
              )}
              {char.damage_bonus_agi && char.damage_bonus_agi !== '-' && (
                <button
                  onClick={() => triggerDamageRoll(damageModal.weapon, 'agi')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    damageModal.bonusType === 'agi'
                      ? 'bg-sky-700 border-sky-600 text-white font-bold'
                      : 'bg-stone-950 border-stone-800 text-stone-300 hover:border-stone-700'
                  }`}
                >
                  +AGI ({char.damage_bonus_agi})
                </button>
              )}
            </div>

            <button
              onClick={() => setDamageModal(null)}
              className="w-full bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold py-2 rounded-xl text-sm transition-colors"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
