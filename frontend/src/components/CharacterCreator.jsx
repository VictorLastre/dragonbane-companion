import React, { useState } from 'react';
import { 
  Sparkles, Check, ChevronRight, ChevronLeft, Dices, Shield, Sword, Heart, Zap, RefreshCw, Backpack, Coins, ArrowRightLeft
} from 'lucide-react';
import { 
  RAZAS, PROFESIONES, REGLAS_EDAD, DEBILIDADES, RECUERDOS, 
  getBaseSkillLevel, calculateMovement 
} from '../data/dragonbaneOfficialData';
import { OFFICIAL_SKILLS, getDamageBonus, getMaxCarryingCapacity } from '../utils/dragonbaneRules';

export default function CharacterCreator({ onComplete, onCancel }) {
  const [step, setStep] = useState(1);

  // Estado del creador
  const [kin, setKin] = useState('Humano');
  const [profession, setProfession] = useState('Guerrero');
  const [magicSchool, setMagicSchool] = useState('Elementalismo');
  const [age, setAge] = useState('Adulto');
  
  // Atributos base (antes de modificadores por edad)
  const [rawAttributes, setRawAttributes] = useState({
    strength: 13,
    constitution: 14,
    agility: 12,
    intelligence: 10,
    willpower: 12,
    charisma: 11
  });

  const [rolledDiceHistory, setRolledDiceHistory] = useState(null);

  // Selección de habilidades entrenadas
  const [trainedProfessionSkills, setTrainedProfessionSkills] = useState([]);
  const [trainedFreeSkills, setTrainedFreeSkills] = useState([]);

  // Detalles finales
  const [name, setName] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [nickname, setNickname] = useState('');
  const [weakness, setWeakness] = useState('');
  const [memento, setMemento] = useState('');
  const [selectedGearPackage, setSelectedGearPackage] = useState(0);
  const [appearance, setAppearance] = useState('');

  // Atributos finales con modificadores de edad
  const ageRule = REGLAS_EDAD[age] || REGLAS_EDAD['Adulto'];
  const finalAttributes = {
    strength: Math.min(18, Math.max(3, rawAttributes.strength + (ageRule.mod_attr.strength || 0))),
    constitution: Math.min(18, Math.max(3, rawAttributes.constitution + (ageRule.mod_attr.constitution || 0))),
    agility: Math.min(18, Math.max(3, rawAttributes.agility + (ageRule.mod_attr.agility || 0))),
    intelligence: Math.min(18, Math.max(3, rawAttributes.intelligence + (ageRule.mod_attr.intelligence || 0))),
    willpower: Math.min(18, Math.max(3, rawAttributes.willpower + (ageRule.mod_attr.willpower || 0))),
    charisma: Math.min(18, Math.max(3, rawAttributes.charisma + (ageRule.mod_attr.charisma || 0)))
  };

  // Tirar 4d6 descartando el menor para los 6 atributos
  const roll4d6DropLowest = () => {
    const rolls = [
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1
    ];
    rolls.sort((a, b) => a - b);
    return rolls[1] + rolls[2] + rolls[3];
  };

  const rollAllAttributes = () => {
    setRawAttributes({
      strength: roll4d6DropLowest(),
      constitution: roll4d6DropLowest(),
      agility: roll4d6DropLowest(),
      intelligence: roll4d6DropLowest(),
      willpower: roll4d6DropLowest(),
      charisma: roll4d6DropLowest()
    });
    setRolledDiceHistory('Tirados con 4D6 descartando el dado menor.');
  };

  // Lista de habilidades de la profesión elegida
  const activeProfData = PROFESIONES[profession];
  const profSkillList = profession === 'Mago' 
    ? (activeProfData.schools[magicSchool]?.skills || [])
    : (activeProfData.skills || []);

  // Control de selección de habilidades entrenadas
  const toggleProfessionSkill = (skillName) => {
    if (trainedProfessionSkills.includes(skillName)) {
      setTrainedProfessionSkills(trainedProfessionSkills.filter(s => s !== skillName));
    } else {
      if (trainedProfessionSkills.length < ageRule.trained_profession) {
        setTrainedProfessionSkills([...trainedProfessionSkills, skillName]);
      }
    }
  };

  const toggleFreeSkill = (skillName) => {
    if (trainedFreeSkills.includes(skillName)) {
      setTrainedFreeSkills(trainedFreeSkills.filter(s => s !== skillName));
    } else {
      if (trainedFreeSkills.length < ageRule.trained_free) {
        setTrainedFreeSkills([...trainedFreeSkills, skillName]);
      }
    }
  };

  // Tirar debilidad y recuerdo al azar
  const rollRandomWeakness = () => {
    const idx = Math.floor(Math.random() * DEBILIDADES.length);
    setWeakness(DEBILIDADES[idx]);
  };

  const rollRandomMemento = () => {
    const idx = Math.floor(Math.random() * RECUERDOS.length);
    setMemento(RECUERDOS[idx]);
  };

  const rollRandomName = () => {
    const names = RAZAS[kin]?.names || [];
    if (names.length > 0) {
      const idx = Math.floor(Math.random() * names.length);
      setName(names[idx]);
    }
  };

  // Construir personaje final listo para la hoja
  const buildFinalCharacter = () => {
    const movement = calculateMovement(kin, finalAttributes.agility);
    const damage_bonus_str = getDamageBonus(finalAttributes.strength);
    const damage_bonus_agi = getDamageBonus(finalAttributes.agility);

    // Mapear habilidades con sus niveles calculados
    const fullSkills = OFFICIAL_SKILLS.map(sk => {
      // Determinar el valor del atributo que rige la habilidad
      let attrScore = 10;
      if (sk.attr === 'FUE') attrScore = finalAttributes.strength;
      else if (sk.attr === 'CON') attrScore = finalAttributes.constitution;
      else if (sk.attr === 'AGI') attrScore = finalAttributes.agility;
      else if (sk.attr === 'INT') attrScore = finalAttributes.intelligence;
      else if (sk.attr === 'VOL') attrScore = finalAttributes.willpower;
      else if (sk.attr === 'CAR') attrScore = finalAttributes.charisma;

      const baseLevel = getBaseSkillLevel(attrScore);
      const isTrained = trainedProfessionSkills.includes(sk.name) || trainedFreeSkills.includes(sk.name);
      
      return {
        ...sk,
        level: isTrained ? baseLevel * 2 : baseLevel,
        advance: false
      };
    });

    // Si es mago, añadir su escuela de magia a habilidades secundarias
    let secondarySkills = [];
    if (profession === 'Mago') {
      const volBase = getBaseSkillLevel(finalAttributes.willpower);
      secondarySkills.push({
        name: `Escuela: ${magicSchool}`,
        attr: 'VOL',
        level: volBase * 2, // Viene entrenada
        advance: false
      });
    }

    const selectedRaceData = RAZAS[kin];
    const gearText = activeProfData.equipment_packages?.[selectedGearPackage] || '';

    // Parsear objetos iniciales
    const initialInventory = [
      { item: 'Raciones de viaje (D6)', slots: 1 },
      { item: 'Antorcha y pedernal', slots: 1 },
      { item: 'Mochila de aventurero (+2 carga)', slots: 0 }
    ];

    const newChar = {
      id: null,
      name: nickname ? `${name} "${nickname}"` : (name || 'Nuevo Aventurero'),
      player_name: playerName,
      kin,
      profession: profession === 'Mago' ? `Mago (${magicSchool})` : profession,
      age,
      weakness: weakness || 'Curiosidad insaciable',
      appearance: appearance || 'Mirada alerta y paso firme.',
      strength: finalAttributes.strength,
      constitution: finalAttributes.constitution,
      agility: finalAttributes.agility,
      intelligence: finalAttributes.intelligence,
      willpower: finalAttributes.willpower,
      charisma: finalAttributes.charisma,
      hp_current: finalAttributes.constitution,
      hp_max: finalAttributes.constitution,
      wp_current: finalAttributes.willpower,
      wp_max: finalAttributes.willpower,
      movement,
      damage_bonus_str,
      damage_bonus_agi,
      conditions: {
        exhausted: false,
        sickly: false,
        dazed: false,
        angry: false,
        scared: false,
        disheartened: false
      },
      skills: fullSkills,
      secondary_skills: secondarySkills,
      heroic_abilities_and_spells: `✦ CAPACIDAD INNATA (${selectedRaceData.ability_name}): ${selectedRaceData.ability_desc}\n\n✦ CAPACIDAD HEROICA (${activeProfData.heroic_ability})`,
      weapons: [
        { name: 'Daga', grip: '1M', range: 'Cuerpo a cuerpo', damage: '1d8', resistance: 9, types: 'Perforante/Cortante' }
      ],
      armor: {
        name: 'Ropa gruesa / Cuero',
        rating: 1,
        disadvantage_stealth: false,
        disadvantage_dodge: false,
        disadvantage_athletics: false
      },
      helmet: {
        name: '',
        rating: 0,
        disadvantage_awareness: false,
        disadvantage_ranged: false
      },
      inventory: initialInventory,
      gold: 0,
      silver: 10,
      copper: 25,
      memento: memento || 'Una moneda antigua de la suerte',
      tiny_items: 'Bolsa de cuero pequeña, cuerda corta',
      rests: { round_rest: false, short_rest: false },
      death_saves: { successes: 0, failures: 0 }
    };

    onComplete(newChar);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl space-y-6 text-stone-200">
      
      {/* Encabezado del Asistente */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-xl text-amber-500 font-bold">
            ⚔️
          </div>
          <div>
            <h2 className="text-xl font-black text-amber-100 uppercase tracking-wider">Creador Oficial de Personajes</h2>
            <p className="text-xs text-stone-400">Reglamento Dragonbane (Devir) · Paso {step} de 5</p>
          </div>
        </div>

        <button
          onClick={onCancel}
          className="text-xs text-stone-400 hover:text-stone-200 font-semibold px-3 py-1.5 rounded-lg border border-stone-800 hover:bg-stone-800 transition-colors"
        >
          Cancelar
        </button>
      </div>

      {/* Indicador de Pasos */}
      <div className="grid grid-cols-5 gap-2 text-center text-xs">
        {[
          { num: 1, title: 'Estirpe' },
          { num: 2, title: 'Profesión' },
          { num: 3, title: 'Atributos' },
          { num: 4, title: 'Habilidades' },
          { num: 5, title: 'Detalles' }
        ].map((s) => (
          <div
            key={s.num}
            className={`py-2 rounded-xl border transition-all ${
              step === s.num
                ? 'bg-amber-600/20 border-amber-500 text-amber-300 font-bold'
                : step > s.num
                ? 'bg-stone-950 border-emerald-600/50 text-emerald-400'
                : 'bg-stone-950 border-stone-800 text-stone-500'
            }`}
          >
            <span>{s.num}. {s.title}</span>
          </div>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* PASO 1: ESTIRPE / RAZA                                                    */}
      {/* ========================================================================= */}
      {step === 1 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div>
            <h3 className="text-base font-bold text-amber-200">Elige la Estirpe (Raza) de tu Personaje</h3>
            <p className="text-xs text-stone-400">Cada raza posee una velocidad de movimiento base y una capacidad innata exclusiva.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(RAZAS).map(([key, r]) => (
              <button
                key={key}
                onClick={() => setKin(key)}
                className={`p-4 rounded-2xl border text-left transition-all relative ${
                  kin === key
                    ? 'bg-amber-950/40 border-amber-500 text-amber-100 shadow-lg ring-1 ring-amber-500'
                    : 'bg-stone-950 border-stone-800 text-stone-300 hover:border-stone-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-base text-stone-100">{r.name}</span>
                  <span className="text-[11px] font-mono bg-stone-900 border border-stone-800 px-2 py-0.5 rounded text-amber-400">
                    Mov: {r.movement}m
                  </span>
                </div>
                <div className="text-xs font-semibold text-amber-400 mb-1">
                  {r.ability_name} <span className="text-[10px] text-stone-400">({r.ability_cost})</span>
                </div>
                <p className="text-[11px] text-stone-400 leading-snug">{r.ability_desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PASO 2: PROFESIÓN Y EDAD                                                  */}
      {/* ========================================================================= */}
      {step === 2 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div>
            <h3 className="text-base font-bold text-amber-200">Elige la Profesión y Edad</h3>
            <p className="text-xs text-stone-400">La profesión determina tu atributo clave, capacidad heroica y habilidades de oficio.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {Object.entries(PROFESIONES).map(([key, p]) => (
              <button
                key={key}
                onClick={() => setProfession(key)}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  profession === key
                    ? 'bg-amber-950/40 border-amber-500 text-amber-100 shadow-md ring-1 ring-amber-500'
                    : 'bg-stone-950 border-stone-800 text-stone-300 hover:border-stone-700'
                }`}
              >
                <span className="font-bold text-sm block">{p.name}</span>
                <span className="text-[10px] font-mono text-amber-400 uppercase mt-0.5 block">Atributo: {p.key_attribute}</span>
              </button>
            ))}
          </div>

          {/* Opciones especiales de Mago */}
          {profession === 'Mago' && (
            <div className="bg-stone-950 border border-amber-500/40 rounded-2xl p-4 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block">Escuela de Magia Inicial</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {Object.entries(activeProfData.schools).map(([schoolKey, s]) => (
                  <button
                    key={schoolKey}
                    onClick={() => setMagicSchool(schoolKey)}
                    className={`p-3 rounded-xl border text-left text-xs transition-all ${
                      magicSchool === schoolKey
                        ? 'bg-amber-900/30 border-amber-500 text-amber-200'
                        : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700'
                    }`}
                  >
                    <div className="font-bold text-sm text-stone-100">{s.name}</div>
                    <div className="text-[11px] text-stone-400 mt-1">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selección de Edad */}
          <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400 block">Edad del Personaje</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {['Joven', 'Adulto', 'Viejo'].map((ageOption) => {
                const info = REGLAS_EDAD[ageOption];
                return (
                  <button
                    key={ageOption}
                    onClick={() => setAge(ageOption)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      age === ageOption
                        ? 'bg-amber-950/40 border-amber-500 text-amber-200 ring-1 ring-amber-500'
                        : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700'
                    }`}
                  >
                    <div className="font-bold text-sm text-stone-100">{ageOption}</div>
                    <div className="text-[11px] text-amber-400 mt-1">{info.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PASO 3: ATRIBUTOS (FUE, CON, AGI, INT, VOL, CAR)                          */}
      {/* ========================================================================= */}
      {step === 3 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-amber-200">Puntuaciones de Atributos</h3>
              <p className="text-xs text-stone-400">Regla oficial: 4D6 descartando el dado menor por cada atributo.</p>
            </div>

            <button
              onClick={rollAllAttributes}
              className="flex items-center space-x-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-lg active:scale-95"
            >
              <Dices className="w-4 h-4" />
              <span>Tirar 4D6 para todos</span>
            </button>
          </div>

          {rolledDiceHistory && (
            <div className="text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800 px-3 py-1.5 rounded-xl">
              ✓ {rolledDiceHistory}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { key: 'strength', name: 'Fuerza (FUE)', desc: 'Músculo y daño' },
              { key: 'constitution', name: 'Constitución (CON)', desc: 'Puntos de Golpe' },
              { key: 'agility', name: 'Agilidad (AGI)', desc: 'Esquivar y velocidad' },
              { key: 'intelligence', name: 'Inteligencia (INT)', desc: 'Ingenio y alerta' },
              { key: 'willpower', name: 'Voluntad (VOL)', desc: 'Puntos de Voluntad' },
              { key: 'charisma', name: 'Carisma (CAR)', desc: 'Trato y presencia' }
            ].map(({ key, name, desc }) => (
              <div key={key} className="bg-stone-950 border border-stone-800 rounded-2xl p-3 text-center space-y-2">
                <span className="text-xs font-bold text-stone-300 block leading-tight">{name}</span>
                <input
                  type="number"
                  min="3"
                  max="18"
                  value={rawAttributes[key]}
                  onChange={(e) => setRawAttributes({ ...rawAttributes, [key]: parseInt(e.target.value, 10) || 10 })}
                  className="w-16 text-center text-2xl font-black bg-stone-900 border border-stone-700 rounded-lg py-1 text-amber-300 focus:outline-none focus:border-amber-500"
                />
                <div className="text-[10px] text-stone-400">
                  Final: <span className="font-bold text-stone-200">{finalAttributes[key]}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Valores derivados automáticos */}
          <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
            <div>
              <span className="text-stone-400 block text-[10px] uppercase">Puntos de Golpe (PG)</span>
              <span className="text-xl font-bold text-rose-500">{finalAttributes.constitution}</span>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px] uppercase">Puntos de Voluntad (PV)</span>
              <span className="text-xl font-bold text-sky-400">{finalAttributes.willpower}</span>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px] uppercase">Movimiento</span>
              <span className="text-xl font-bold text-amber-400">{calculateMovement(kin, finalAttributes.agility)} m</span>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px] uppercase">Límite de Carga</span>
              <span className="text-xl font-bold text-amber-400">{getMaxCarryingCapacity(finalAttributes.strength)}</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PASO 4: HABILIDADES ENTRENADAS                                            */}
      {/* ========================================================================= */}
      {step === 4 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div>
            <h3 className="text-base font-bold text-amber-200">Selección de Habilidades Entrenadas</h3>
            <p className="text-xs text-stone-400">
              El nivel inicial base se calcula de tus atributos. Al entrenar una habilidad, ¡comienza con el <strong className="text-amber-400">DOBLE</strong> de su valor base!
            </p>
          </div>

          {/* Habilidades de Profesión */}
          <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold uppercase tracking-wider text-amber-400">
                1. Habilidades de Profesión ({profession})
              </span>
              <span className="text-stone-300 font-bold">
                Seleccionadas: <span className={trainedProfessionSkills.length === ageRule.trained_profession ? 'text-emerald-400' : 'text-amber-400'}>{trainedProfessionSkills.length}</span> / {ageRule.trained_profession}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {profSkillList.map((skillName) => {
                const isSelected = trainedProfessionSkills.includes(skillName);
                return (
                  <button
                    key={skillName}
                    onClick={() => toggleProfessionSkill(skillName)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-950/60 border-amber-500 text-amber-200 shadow'
                        : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
                    }`}
                  >
                    <span className="font-medium truncate">{skillName}</span>
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-amber-600 border-amber-500' : 'border-stone-700'}`}>
                      {isSelected && <Check className="w-3 h-3 text-stone-950 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Habilidades Libres */}
          <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold uppercase tracking-wider text-sky-400">
                2. Habilidades Libres (Por tu edad: {age})
              </span>
              <span className="text-stone-300 font-bold">
                Seleccionadas: <span className={trainedFreeSkills.length === ageRule.trained_free ? 'text-emerald-400' : 'text-sky-400'}>{trainedFreeSkills.length}</span> / {ageRule.trained_free}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs max-h-56 overflow-y-auto pr-1">
              {OFFICIAL_SKILLS.filter(sk => !trainedProfessionSkills.includes(sk.name)).map((sk) => {
                const isSelected = trainedFreeSkills.includes(sk.name);
                return (
                  <button
                    key={sk.name}
                    onClick={() => toggleFreeSkill(sk.name)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-sky-950/60 border-sky-500 text-sky-200 shadow'
                        : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700'
                    }`}
                  >
                    <span className="truncate">{sk.name} ({sk.attr})</span>
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-sky-600 border-sky-500' : 'border-stone-700'}`}>
                      {isSelected && <Check className="w-3 h-3 text-stone-950 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PASO 5: DETALLES FINALES (NOMBRE, DEBILIDAD, RECUERDO, EQUIPO)             */}
      {/* ========================================================================= */}
      {step === 5 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div>
            <h3 className="text-base font-bold text-amber-200">Nombre, Debilidad y Recuerdos</h3>
            <p className="text-xs text-stone-400">Personaliza la identidad de tu héroe con las tablas oficiales de Dragonbane.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold uppercase text-stone-300">Nombre</label>
                <button onClick={rollRandomName} className="text-[10px] text-amber-400 hover:underline">🎲 Nombre azar</button>
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Joruna, Escapuleto..."
                className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2.5 text-sm text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-stone-300 block mb-1">Apodo / Sobrenombre</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Ej. Ojo de Halcón, Brazo de Hierro..."
                className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2.5 text-sm text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-stone-300 block mb-1">Nombre del Jugador</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Tu nombre"
                className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2.5 text-sm text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Debilidad Oficial */}
          <div className="bg-stone-950 border border-amber-900/40 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase text-amber-400">Debilidad (Talón de Aquiles)</label>
              <button
                onClick={rollRandomWeakness}
                className="flex items-center space-x-1 text-xs text-amber-400 hover:text-amber-300 font-bold bg-stone-900 border border-stone-700 px-2 py-1 rounded-lg"
              >
                <Dices className="w-3.5 h-3.5" />
                <span>Tirar 1D20 oficial</span>
              </button>
            </div>
            <textarea
              rows={2}
              value={weakness}
              onChange={(e) => setWeakness(e.target.value)}
              placeholder="Elige o tira en la tabla de debilidades de Dragonbane..."
              className="w-full bg-stone-900 border border-stone-700 rounded-xl p-2 text-xs text-amber-200 focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          {/* Recuerdo Oficial */}
          <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase text-stone-300">Recuerdo (Memento - Cura 1 estado extra en descanso)</label>
              <button
                onClick={rollRandomMemento}
                className="flex items-center space-x-1 text-xs text-stone-300 hover:text-white font-bold bg-stone-900 border border-stone-700 px-2 py-1 rounded-lg"
              >
                <Dices className="w-3.5 h-3.5" />
                <span>Tirar 1D20 oficial</span>
              </button>
            </div>
            <input
              type="text"
              value={memento}
              onChange={(e) => setMemento(e.target.value)}
              placeholder="Un artículo de gran valor sentimental..."
              className="w-full bg-stone-900 border border-stone-700 rounded-xl p-2 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Paquetes de Equipo Inicial */}
          <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4 space-y-3">
            <label className="text-xs font-bold uppercase text-stone-300 block">
              Paquete de Equipo Inicial ({profession})
            </label>
            <div className="space-y-2">
              {(activeProfData.equipment_packages || []).map((pack, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedGearPackage(idx)}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${
                    selectedGearPackage === idx
                      ? 'bg-amber-950/50 border-amber-500 text-amber-200'
                      : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700'
                  }`}
                >
                  <span className="flex-1">{pack}</span>
                  <div className={`w-4 h-4 rounded-full border ml-2 flex items-center justify-center ${selectedGearPackage === idx ? 'bg-amber-600 border-amber-500' : 'border-stone-700'}`}>
                    {selectedGearPackage === idx && <div className="w-2 h-2 rounded-full bg-stone-950" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BOTONES DE NAVEGACIÓN ANTERIOR / SIGUIENTE                                 */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between border-t border-stone-800 pt-4">
        {step > 1 ? (
          <button
            onClick={() => setStep(step - 1)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl border border-stone-800 bg-stone-950 hover:bg-stone-800 text-xs font-semibold transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>
        ) : <div />}

        {step < 5 ? (
          <button
            onClick={() => setStep(step + 1)}
            className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <span>Siguiente</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={buildFinalCharacter}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all shadow-xl active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>¡Crear Personaje y Comenzar Aventura!</span>
          </button>
        )}
      </div>

    </div>
  );
}
