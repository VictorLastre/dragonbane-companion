// Reglas y Listado Oficial de Dragonbane (Drakar och Demoner - Edición en Español)

export function getDamageBonus(val) {
  const score = parseInt(val, 10) || 0;
  if (score >= 17) return '+d6';
  if (score >= 13) return '+d4';
  return '-';
}

export function getMaxCarryingCapacity(strength) {
  const str = parseInt(strength, 10) || 10;
  return Math.ceil(str / 2);
}

// Condiciones oficiales asociadas directamente a cada atributo
export const CONDITIONS_MAP = {
  exhausted: { key: 'exhausted', name: 'Agotado', attr: 'FUE', desc: 'Desventaja en pruebas de Fuerza' },
  sickly: { key: 'sickly', name: 'Enfermo', attr: 'CON', desc: 'Desventaja en pruebas de Constitución' },
  dazed: { key: 'dazed', name: 'Aturdido', attr: 'AGI', desc: 'Desventaja en pruebas de Agilidad' },
  angry: { key: 'angry', name: 'Enfadado', attr: 'INT', desc: 'Desventaja en pruebas de Inteligencia' },
  scared: { key: 'scared', name: 'Asustado', attr: 'VOL', desc: 'Desventaja en pruebas de Voluntad' },
  disheartened: { key: 'disheartened', name: 'Desanimado', attr: 'CAR', desc: 'Desventaja en pruebas de Carisma' }
};

// Habilidades Generales en el orden EXACTO de la hoja oficial (Columna Izquierda)
export const OFFICIAL_GENERAL_SKILLS = [
  { name: 'Alerta', attr: 'INT', category: 'general', level: 8, advance: false },
  { name: 'Artesanía', attr: 'FUE', category: 'general', level: 6, advance: false },
  { name: 'Atletismo', attr: 'AGI', category: 'general', level: 8, advance: false },
  { name: 'Bestias', attr: 'INT', category: 'general', level: 6, advance: false },
  { name: 'Cabalgar', attr: 'AGI', category: 'general', level: 6, advance: false },
  { name: 'Caza y pesca', attr: 'AGI', category: 'general', level: 7, advance: false },
  { name: 'Curación', attr: 'INT', category: 'general', level: 7, advance: false },
  { name: 'Dedos ágiles', attr: 'AGI', category: 'general', level: 6, advance: false },
  { name: 'Descubrir', attr: 'INT', category: 'general', level: 8, advance: false },
  { name: 'Engañar', attr: 'CAR', category: 'general', level: 7, advance: false },
  { name: 'Esquivar', attr: 'AGI', category: 'general', level: 9, advance: false },
  { name: 'Idiomas', attr: 'INT', category: 'general', level: 7, advance: false },
  { name: 'Interpretar', attr: 'CAR', category: 'general', level: 6, advance: false },
  { name: 'Marinería', attr: 'INT', category: 'general', level: 6, advance: false },
  { name: 'Mitos y leyendas', attr: 'INT', category: 'general', level: 6, advance: false },
  { name: 'Nadar', attr: 'AGI', category: 'general', level: 6, advance: false },
  { name: 'Persuadir', attr: 'CAR', category: 'general', level: 8, advance: false },
  { name: 'Regatear', attr: 'CAR', category: 'general', level: 7, advance: false },
  { name: 'Sigilo', attr: 'AGI', category: 'general', level: 8, advance: false },
  { name: 'Supervivencia', attr: 'INT', category: 'general', level: 8, advance: false }
];

// Habilidades de Armas en el orden EXACTO de la hoja oficial (Columna Derecha)
export const OFFICIAL_WEAPON_SKILLS = [
  { name: 'Arcos', attr: 'AGI', category: 'weapon', level: 7, advance: false },
  { name: 'Ballestas', attr: 'AGI', category: 'weapon', level: 7, advance: false },
  { name: 'Cuchillos', attr: 'AGI', category: 'weapon', level: 8, advance: false },
  { name: 'Espadas', attr: 'FUE', category: 'weapon', level: 9, advance: false },
  { name: 'Hachas', attr: 'FUE', category: 'weapon', level: 9, advance: false },
  { name: 'Hondas', attr: 'AGI', category: 'weapon', level: 6, advance: false },
  { name: 'Lanzas', attr: 'FUE', category: 'weapon', level: 8, advance: false },
  { name: 'Martillos', attr: 'FUE', category: 'weapon', level: 8, advance: false },
  { name: 'Pelea', attr: 'FUE', category: 'weapon', level: 8, advance: false },
  { name: 'Varas', attr: 'AGI', category: 'weapon', level: 7, advance: false }
];

// Todas las habilidades unificadas
export const OFFICIAL_SKILLS = [...OFFICIAL_GENERAL_SKILLS, ...OFFICIAL_WEAPON_SKILLS];

/**
 * Tirada d20 para Dragonbane:
 * Normal, Ventaja (Boon) o Desventaja (Bane)
 * 1 = Dragón, 20 = Demonio
 */
export function rollCheck(targetScore, rollMode = 'normal') {
  const d1 = Math.floor(Math.random() * 20) + 1;
  const d2 = Math.floor(Math.random() * 20) + 1;

  let finalRoll = d1;
  let rolls = [d1];

  if (rollMode === 'boon') {
    rolls = [d1, d2];
    finalRoll = Math.min(d1, d2);
  } else if (rollMode === 'bane') {
    rolls = [d1, d2];
    finalRoll = Math.max(d1, d2);
  }

  let resultType = 'failure';
  let message = 'Fallo';

  if (finalRoll === 1) {
    resultType = 'dragon';
    message = '¡DRAGÓN! (Éxito Crítico)';
  } else if (finalRoll === 20) {
    resultType = 'demon';
    message = '¡DEMONIO! (Pifia)';
  } else if (finalRoll <= targetScore) {
    resultType = 'success';
    message = 'Éxito';
  }

  return {
    finalRoll,
    rolls,
    targetScore,
    rollMode,
    resultType,
    message
  };
}

/**
 * Tirador de daño para armas:
 * Parsea fórmulas como "1d8", "2d6", "1d10", "2d8", etc.
 * y añade el bonificador de daño opcional (+d4 o +d6)
 */
export function rollDamageFormula(formulaStr, bonusStr = '') {
  const cleanFormula = (formulaStr || '1d6').trim();
  const cleanBonus = (bonusStr && bonusStr !== '-' ? bonusStr : '').trim();
  
  const combined = `${cleanFormula} ${cleanBonus ? (cleanBonus.startsWith('+') || cleanBonus.startsWith('-') ? cleanBonus : '+' + cleanBonus) : ''}`.trim();
  const tokens = combined.match(/([+-]?\s*\d*d\d+|[+-]?\s*\d+)/gi) || [];

  let total = 0;
  const breakdown = [];

  for (let part of tokens) {
    part = part.replace(/\s+/g, '');
    if (!part) continue;
    let sign = 1;
    if (part.startsWith('-')) {
      sign = -1;
      part = part.slice(1);
    } else if (part.startsWith('+')) {
      part = part.slice(1);
    }

    if (part.toLowerCase().includes('d')) {
      const [countStr, sidesStr] = part.toLowerCase().split('d');
      const count = parseInt(countStr, 10) || 1;
      const sides = parseInt(sidesStr, 10) || 6;
      const rolls = [];
      let subtotal = 0;
      for (let i = 0; i < count; i++) {
        const r = Math.floor(Math.random() * sides) + 1;
        rolls.push(r);
        subtotal += r;
      }
      total += sign * subtotal;
      breakdown.push({
        label: `${sign < 0 ? '-' : (breakdown.length > 0 ? '+' : '')}${count}d${sides}`,
        rolls,
        subtotal: sign * subtotal
      });
    } else {
      const num = parseInt(part, 10) || 0;
      total += sign * num;
      breakdown.push({
        label: `${sign < 0 ? '-' : '+'}${num}`,
        rolls: [num],
        subtotal: sign * num
      });
    }
  }

  return {
    formula: cleanFormula,
    bonus: cleanBonus || null,
    total: Math.max(0, total),
    breakdown
  };
}
