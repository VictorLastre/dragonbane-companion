// Reglas Oficiales de Viaje, Marcha, Supervivencia y Acampada de Dragonbane (Capítulos 6 y 8 - Devir)

export const SHIFTS = [
  { id: 'manana', name: 'Mañana', icon: 'SunMedium', desc: 'Amanecer. Primer tramo habitual de marcha.' },
  { id: 'dia', name: 'Día / Mediodía', icon: 'Sun', desc: 'Pleno día. Segundo tramo habitual de marcha.' },
  { id: 'tarde', name: 'Tarde', icon: 'Sunset', desc: 'Ocaso. Momento ideal para montar campamento o marcha forzada.' },
  { id: 'noche', name: 'Noche', icon: 'Moon', desc: 'Oscuridad y frío. Toca dormir para evitar la falta de sueño y organizar guardias.' }
];

export const WEATHER_TYPES = [
  { id: 'despejado', name: 'Cielos Despejados', desc: 'Clima templado. Marcha sin contratiempos climáticos.', icon: 'Sun' },
  { id: 'niebla', name: 'Niebla Densa', desc: 'Visibilidad muy reducida. La distancia recorrida se reduce a la mitad.', icon: 'CloudFog' },
  { id: 'lluvia', name: 'Lluvia y Barro', desc: 'Suelo empapado. Se requiere capa o refugio para evitar calarse.', icon: 'CloudRain' },
  { id: 'frio', name: 'Frío Gélido', desc: 'Temperaturas bajo cero. Tirada de Supervivencia para resistir el frío (manta evita desventaja, pieles dan ventaja).', icon: 'Snowflake' },
  { id: 'tormenta', name: 'Tormenta / Ventisca', desc: 'Vientos huracanados. Obliga a buscar refugio y no permite avanzar.', icon: 'CloudLightning' }
];

export const TERRAIN_TYPES = [
  { id: 'camino', name: 'Camino o Sendero Marcado', difficulty: 'Normal', note: 'No hay riesgo de perderse si se sigue la senda.' },
  { id: 'bosque', name: 'Bosque Espeso / Fraga', difficulty: 'Difícil', note: 'Requiere Supervivencia para no desorientarse entre los árboles.' },
  { id: 'pantano', name: 'Pantano / Ciénaga Inundada', difficulty: 'Muy Difícil', note: 'Terreno cenagoso con riesgo de lodo profundo y arenas movedizas.' },
  { id: 'montana', name: 'Páramo Rocoso / Riscos', difficulty: 'Difícil', note: 'Caminos abruptos con riesgo de desprendimientos y caídas.' }
];

export const TRAVEL_MISHAPS = [
  {
    d12: 1,
    title: 'Niebla espesa',
    desc: 'Los personajes jugadores son sorprendidos por una espesa niebla. La distancia recorrida en este tramo largo se reduce a la mitad.',
    severity: 'leve',
    icon: 'CloudFog'
  },
  {
    d12: 2,
    title: 'Terreno bloqueado',
    desc: 'El camino está bloqueado por rocas, árboles caídos o terreno inundado. Cada personaje debe hacer una tirada de ATLETISMO para avanzar. Quienes fallen no avanzan este tramo.',
    severity: 'media',
    test: 'Atletismo'
  },
  {
    d12: 3,
    title: 'Ropa desgarrada',
    desc: 'El grupo entra en un barranco espinoso o pantano cenagoso. La ropa de un héroe aleatorio resulta dañada y pasa a considerarse harapos (desventaja en Carisma).',
    severity: 'leve',
    target: 'random_player'
  },
  {
    d12: 4,
    title: 'Perdidos en círculos',
    desc: 'Los personajes caminan en círculos y no hacen ningún progreso este tramo. El explorador debe hacer una tirada de SUPERVIVENCIA para reencontrar la senda correcta.',
    severity: 'media',
    test: 'Supervivencia'
  },
  {
    d12: 5,
    title: 'Objeto caído o roto',
    desc: 'Un personaje jugador aleatorio tropieza y rompe o deja caer un objeto de su inventario.',
    severity: 'leve',
    target: 'random_player'
  },
  {
    d12: 6,
    title: 'Nube de mosquitos',
    desc: 'Una enorme plaga de mosquitos ataca con zumbidos y picaduras. ¡Todos los personajes sin capa quedan con el estado ENFADADO!',
    severity: 'media',
    condition: 'angry'
  },
  {
    d12: 7,
    title: 'Esguince de tobillo',
    desc: 'Un personaje tropieza en una hendidura y sufre 1D6 de daño. La armadura no protege, pero llevar botas puestas reduce el daño en 2.',
    severity: 'media',
    damage: '1D6-boots'
  },
  {
    d12: 8,
    title: 'Aguacero o ventisca repentina',
    desc: 'Una tormenta azota al grupo. Todos los personajes sin capa deben tirar contra el frío. Deben buscar refugio de inmediato y no avanzan este tramo.',
    severity: 'grave',
    test: 'Supervivencia (Frío)'
  },
  {
    d12: 9,
    title: 'Enjambre de avispas',
    desc: '¡El grupo pisa un avispero furioso! Cada aventurero debe hacer una tirada de ESQUIVAR. Quien falle sufre 1D6 de daño y un estado a su elección.',
    severity: 'grave',
    test: 'Esquivar'
  },
  {
    d12: 10,
    title: 'Deslizamiento de tierra',
    desc: 'El suelo cede bajo sus pies en un precipicio. Todos deben hacer una tirada de ESQUIVAR. Quien falle sufre 1D10 de daño por la caída.',
    severity: 'grave',
    test: 'Esquivar'
  },
  {
    d12: 11,
    title: 'Ataque de animal salvaje',
    desc: 'Un lobo solitario, un oso enfurecido o un jabalí agresivo se siente amenazado y embiste al grupo.',
    severity: 'combate',
    encounter: 'Animal Salvaje'
  },
  {
    d12: 12,
    title: 'Arenas movedizas',
    desc: '¡El suelo se traga al grupo! Cada personaje debe hacer una tirada de SUPERVIVENCIA. Quien falle sufre un estado y vuelve a tirar. Si acumula todos los estados, queda sepultado.',
    severity: 'critica',
    test: 'Supervivencia'
  }
];

export const HUNTING_TABLE = [
  { d6: 1, animal: 'Ardilla de bosque', req: 'Arma a distancia o trampa', rations: 1, hostile: false },
  { d6: 2, animal: 'Cuervo negro', req: 'Arma a distancia', rations: 1, hostile: false },
  { d6: 3, animal: 'Conejo montaraz', req: 'Arma a distancia o trampa', rationsFormula: '1D3', hostile: false },
  { d6: 4, animal: 'Zorro rojo', req: 'Arma a distancia o trampa', rationsFormula: '1D4', hostile: false },
  { d6: 5, animal: 'Jabalí colmilludo', req: 'Arma a distancia o lanza', rationsFormula: '2D6', hostile: true, note: '¡Ataca al grupo si la tirada de caza falla!' },
  { d6: 6, animal: 'Ciervo noble', req: 'Arco o ballesta', rationsFormula: '2D8', hostile: false }
];

/**
 * Tira en la tabla oficial de percances (D12)
 */
export function rollRandomMishap() {
  const roll = Math.floor(Math.random() * 12) + 1;
  const mishap = TRAVEL_MISHAPS.find(m => m.d12 === roll) || TRAVEL_MISHAPS[0];
  return {
    roll,
    ...mishap
  };
}

/**
 * Resuelve una partida de caza con tirada de presa
 */
export function rollHuntingPrey() {
  const roll = Math.floor(Math.random() * 6) + 1;
  const prey = HUNTING_TABLE.find(p => p.d6 === roll) || HUNTING_TABLE[0];
  
  let rationsWon = 1;
  if (prey.rationsFormula === '1D3') {
    rationsWon = Math.floor(Math.random() * 3) + 1;
  } else if (prey.rationsFormula === '1D4') {
    rationsWon = Math.floor(Math.random() * 4) + 1;
  } else if (prey.rationsFormula === '2D6') {
    rationsWon = Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;
  } else if (prey.rationsFormula === '2D8') {
    rationsWon = Math.floor(Math.random() * 8) + 1 + Math.floor(Math.random() * 8) + 1;
  }

  return {
    roll,
    animal: prey.animal,
    rations: rationsWon,
    hostile: prey.hostile,
    note: prey.note || ''
  };
}

/**
 * Calcula el avance en km según modo de marcha
 */
export function calculateMarchProgress(isMounted = false, hasShortcut = false, hasFog = false) {
  let baseKm = isMounted ? 30 : 15;
  if (hasShortcut) baseKm *= 2; // Dragón en Supervivencia duplica distancia
  if (hasFog) baseKm = Math.floor(baseKm / 2); // Niebla reduce a la mitad
  return baseKm;
}
