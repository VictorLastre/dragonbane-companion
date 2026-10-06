// Generador Procedural de Asentamientos, Servicios y Mercados para Dragonbane
// Basado en el Capítulo 6 del Manual Oficial de Reglas (Devir)

import { DRAGONBANE_EQUIPMENT } from '../data/dragonbaneEquipmentData';

export const SETTLEMENT_SCALES = {
  lugar_de_paso: {
    id: 'lugar_de_paso',
    name: 'Lugar de Paso / Puesto Fronterizo',
    desc: 'Un enclave pequeño, fondeadero o muelle de escala (como Puerto Brumoso). Solo almacenes de carga, cantina rústica y bastimentos elementales.',
    shopCount: [2, 3],
    maxAvailability: 'Común',
    allowedTags: ['basico', 'lugar_de_paso', 'maritimo', 'rural', 'raciones', 'almacen', 'puerto']
  },
  aldea: {
    id: 'aldea',
    name: 'Aldea / Pueblo Pequeño',
    desc: 'Comunidad agrícola o pesquera de 100 a 400 habitantes. Posada rústica, forja campesina, curandera local y ganado.',
    shopCount: [3, 4],
    maxAvailability: 'Común',
    allowedTags: ['basico', 'rural', 'caza', 'posada', 'curandero']
  },
  villa: {
    id: 'villa',
    name: 'Villa Comercial / Pueblo Grande',
    desc: 'Núcleo comercial con mercado semanal (500 a 2.500 hab.). Armería marcial, posada de postas, botica y establos.',
    shopCount: [4, 5],
    maxAvailability: 'Infrecuente',
    allowedTags: ['basico', 'rural', 'villa', 'militar', 'urbano', 'posada', 'curandero', 'cruce']
  },
  ciudad: {
    id: 'ciudad',
    name: 'Gran Ciudad / Fortaleza',
    desc: 'Metrópolis o bastión amurallado (3.000+ hab.). Forjas maestras, armaduras de placas, bazares de lujo, gremios y alquimistas.',
    shopCount: [5, 6],
    maxAvailability: 'Raro',
    allowedTags: ['basico', 'rural', 'villa', 'militar', 'urbano', 'ciudad', 'alquimia', 'posada']
  }
};

export const SETTLEMENT_ENVIRONMENTS = {
  costero: {
    id: 'costero',
    name: 'Costero / Marítimo / Fluvial',
    desc: 'Muelles, niebla marina, almacenes de fardos, barcas de pesca y marineros.',
    extraTags: ['maritimo', 'puerto', 'almacen', 'pesca', 'fluvial']
  },
  bosque: {
    id: 'bosque',
    name: 'Bosque / Frontera Salvaje',
    desc: 'Cazadores, pieles de abrigo, madera, leñadores y caminos cubiertos de follaje.',
    extraTags: ['bosque', 'caza', 'rural']
  },
  montana: {
    id: 'montana',
    name: 'Montaña / Minas',
    desc: 'Canteras, picos, forja pesada, cuerdas de escalada y vientos helados.',
    extraTags: ['montana', 'trabajo']
  },
  cruce: {
    id: 'cruce',
    name: 'Cruce de Caminos / Interior',
    desc: 'Caravanas, diligencias, casas de postas, carretas y mercaderes ambulantes.',
    extraTags: ['cruce', 'viaje']
  }
};

// Nombres y encargados temáticos en español
const KEEPER_NAMES = {
  marineros: ['Capataz Viggo', 'Maese Eilif', 'Tabernera Magda', 'Vieja Astrid', 'Jorund el Tuerto', 'Gunnar Breasucia', 'Helga Rompeolas'],
  rurales: ['El Tío Bran', 'Herrero Odrin', 'Curandera Morwenna', 'Viejo Torsten', 'Giselda la Molinera', 'Kari Manosfuertes'],
  urbanos: ['Maestro Forjador Brand', 'Boticario Alistair', 'Mercader Lothar', 'Preboste Vane', 'Dama Elinora', 'Armero Harlen'],
  noble: ['Maese Gremial Cedric', 'Alquimista Valerius', 'Comandante Aldor', 'Monsieur D’Artois', 'Maestra Joyera Solveig']
};

/**
 * Detecta automáticamente el mejor ambiente para nombres conocidos
 */
export function detectEnvironmentFromName(name = '') {
  const lower = name.toLowerCase();
  if (lower.includes('puerto') || lower.includes('costa') || lower.includes('mar') || lower.includes('bahia') || lower.includes('rio') || lower.includes('brumoso')) {
    return 'costero';
  }
  if (lower.includes('bosque') || lower.includes('selva') || lower.includes('arboleda') || lower.includes('valle')) {
    return 'bosque';
  }
  if (lower.includes('fortaleza') || lower.includes('montaña') || lower.includes('mina') || lower.includes('pico') || lower.includes('enano')) {
    return 'montana';
  }
  return 'cruce';
}

/**
 * Genera el paquete completo de tiendas y servicios para un asentamiento
 */
export function generateSettlementShops(settlementName, scaleKey = 'lugar_de_paso', envKey = null) {
  const cleanName = settlementName?.trim() || 'Asentamiento Desconocido';
  const scale = SETTLEMENT_SCALES[scaleKey] || SETTLEMENT_SCALES.lugar_de_paso;
  const env = SETTLEMENT_ENVIRONMENTS[envKey] || SETTLEMENT_ENVIRONMENTS[detectEnvironmentFromName(cleanName)];

  const shops = [];

  // 1. ESCALA: LUGAR DE PASO (Especial para Puerto Brumoso)
  if (scaleKey === 'lugar_de_paso') {
    // Tienda 1: Almacenes de Carga y Muelle
    const cargoItems = DRAGONBANE_EQUIPMENT.filter(item => 
      ['deposito_almacen', 'porteador_muelle', 'barril', 'cofre', 'cuerda_canamo', 'cubo', 'arancel_atraque', 'bote_remos', 'canoa'].includes(item.id)
    );
    shops.push({
      id: `shop_cargo_${Date.now()}_1`,
      location: cleanName,
      name: `Almacenes y Muelles de ${cleanName}`,
      shop_type: 'Almacén de Cargas y Muelle',
      keeper_name: 'Capataz Viggo Barlovento',
      description: 'Grandes tinglados de madera curtida por la salmuera. Aquí los barqueros y mercaderes depositan fardos bajo vigilancia, contratan peones de carga y pagan derechos de amarre.',
      scale: scaleKey,
      environment: env.id,
      is_unlocked: true,
      items: cargoItems
    });

    // Tienda 2: Cantina o Taberna de Marineros
    const tavernItems = DRAGONBANE_EQUIPMENT.filter(item => 
      ['tazon_guiso', 'jarra_hidromiel', 'pescado_ahumado', 'alojamiento_sala_comun', 'bano_posada', 'racion_viaje'].includes(item.id)
    );
    shops.push({
      id: `shop_tavern_${Date.now()}_2`,
      location: cleanName,
      name: `Cantina "El Ancla Oxidada"`,
      shop_type: 'Cantina y Raciones',
      keeper_name: 'Tabernera Magda Ojosclaros',
      description: 'Una taberna baja con chimenea de turba humeante. Se sirve cerveza agria, jarras de hidromiel y cazuelas de pescado ahumado. En el piso superior hay un desván común con esteras de paja.',
      scale: scaleKey,
      environment: env.id,
      is_unlocked: true,
      items: tavernItems
    });

    // Tienda 3: Bastimentos del Barquero y Útiles Rústicos
    const gearItems = DRAGONBANE_EQUIPMENT.filter(item => 
      ['cuchillo', 'baston', 'clava_madera_pequena', 'honda', 'hacha_mano', 'antorcha', 'yesca_pedernal', 'cana_pescar', 'red_pesca', 'vendas', 'manta', 'calafateo_remaches'].includes(item.id)
    );
    shops.push({
      id: `shop_gear_${Date.now()}_3`,
      location: cleanName,
      name: `Pertrechos del Práctico y Calafate`,
      shop_type: 'Provisiones Básicas y Reparaciones',
      keeper_name: 'Maese Eilif Manosnegras',
      description: 'Un tinglado repleto de anzuelos, redes en reparación, brea caliente, antorchas y cuchillos de trabajo. Vende lo indispensable para no morir de hambre o frío en el viaje.',
      scale: scaleKey,
      environment: env.id,
      is_unlocked: false, // Oculto por defecto para que el Master decida cuándo habilitarlo
      items: gearItems
    });
  } 
  
  // 2. ESCALA: ALDEA RURAL
  else if (scaleKey === 'aldea') {
    // Posada del Pueblo
    const innItems = DRAGONBANE_EQUIPMENT.filter(item => 
      ['tazon_guiso', 'jarra_hidromiel', 'comida_posada', 'alojamiento_sala_comun', 'alojamiento_privada', 'bano_posada', 'racion_viaje'].includes(item.id)
    );
    shops.push({
      id: `shop_inn_${Date.now()}_1`,
      location: cleanName,
      name: `Posada "El Jabalí Verde"`,
      shop_type: 'Posada Rural',
      keeper_name: 'Gunnar el Posadero',
      description: 'El corazón de la aldea. Un fuego reconfortante arde día y noche, sirviendo carne de caza, cerveza casera y lechos calientes para viajeros.',
      scale: scaleKey,
      environment: env.id,
      is_unlocked: true,
      items: innItems
    });

    // Herrería Rural
    const forgeItems = DRAGONBANE_EQUIPMENT.filter(item => 
      ['cuchillo', 'daga', 'hacha_mano', 'clava_madera_pequena', 'lanza_corta', 'pala', 'pico', 'armadura_cuero', 'remiendo_ropa'].includes(item.id)
    );
    shops.push({
      id: `shop_forge_${Date.now()}_2`,
      location: cleanName,
      name: `Forja del Roble`,
      shop_type: 'Herrería Rural',
      keeper_name: 'Herrero Odrin',
      description: 'El yunque resuena templando herraduras, hachas de tala, azadones y lanzas de caza para defender el ganado de las alimañas.',
      scale: scaleKey,
      environment: env.id,
      is_unlocked: true,
      items: forgeItems
    });

    // Herbolaria / Curandera
    const herbItems = DRAGONBANE_EQUIPMENT.filter(item => 
      ['vendas', 'hierbas_curativas', 'curacion_sanador'].includes(item.id)
    );
    shops.push({
      id: `shop_herb_${Date.now()}_3`,
      location: cleanName,
      name: `Choza de la Sanadora`,
      shop_type: 'Herbolaria y Curación',
      keeper_name: 'Anciana Morwenna',
      description: 'Huele a lavanda seca, corteza de sauce y raíces cocidas. La anciana prepara ungüentos contra infecciones y atiende heridas graves.',
      scale: scaleKey,
      environment: env.id,
      is_unlocked: false,
      items: herbItems
    });

    // Aperos y Ganado
    const farmItems = DRAGONBANE_EQUIPMENT.filter(item => 
      ['burro', 'carreta', 'cuerda_canamo', 'antorcha', 'yesca_pedernal', 'pieles_dormir', 'manta'].includes(item.id)
    );
    shops.push({
      id: `shop_farm_${Date.now()}_4`,
      location: cleanName,
      name: `Corral y Aperos Campesinos`,
      shop_type: 'Bestias y Transporte',
      keeper_name: 'Tío Bran',
      description: 'Venta de burros de carga de buen lomo, carretas campesinas de madera maciza y pieles de abrigo para el camino.',
      scale: scaleKey,
      environment: env.id,
      is_unlocked: false,
      items: farmItems
    });
  } 

  // 3. ESCALA: VILLA COMERCIAL
  else if (scaleKey === 'villa') {
    // Mercado General
    const marketItems = DRAGONBANE_EQUIPMENT.filter(item => 
      ['racion_viaje', 'mochila', 'antorcha', 'lampara', 'aceite_lampara', 'cuerda_canamo', 'arpeo', 'tienda_pequena', 'manta', 'cofre'].includes(item.id)
    );
    shops.push({
      id: `shop_market_${Date.now()}_1`,
      location: cleanName,
      name: `Mercado Central y Puestos de Buhoneros`,
      shop_type: 'Mercado General',
      keeper_name: 'Mercader Lothar Cienmonedas',
      description: 'Un concurrido entramado de toldos de lona y carromatos comerciales que venden equipo de expedición de calidad probada.',
      scale: scaleKey,
      environment: env.id,
      is_unlocked: true,
      items: marketItems
    });

    // Armería Marcial
    const armoryItems = DRAGONBANE_EQUIPMENT.filter(item => 
      ['espada_corta', 'espada_ancha', 'cimitarra', 'hacha_batalla', 'maza', 'lanza_larga', 'arco_corto', 'carcaj_hierro', 'escudo_pequeno', 'armadura_cuero', 'cuero_tachonado', 'casco'].includes(item.id)
    );
    shops.push({
      id: `shop_armory_${Date.now()}_2`,
      location: cleanName,
      name: `Armería "El Acero Templado"`,
      shop_type: 'Armería y Forja Marcial',
      keeper_name: 'Maestro Brand Filorrojo',
      description: 'Forja especializada en armamento militar para guardias, caballeros y exploradores de renombre.',
      scale: scaleKey,
      environment: env.id,
      is_unlocked: true,
      items: armoryItems
    });

    // Posada de Postas y Establo
    const postInnItems = DRAGONBANE_EQUIPMENT.filter(item => 
      ['comida_posada', 'copa_vino', 'alojamiento_privada', 'alojamiento_lujo', 'bano_posada', 'caballo_monta', 'carreta', 'guardaespaldas'].includes(item.id)
    );
    shops.push({
      id: `shop_postinn_${Date.now()}_3`,
      location: cleanName,
      name: `Casa de Postas "El Ciervo Plateado"`,
      shop_type: 'Posada y Posta de Caballos',
      keeper_name: 'Dama Elinora',
      description: 'Alojamiento selecto con habitaciones privadas, comidas elaboradas con buen vino y recambio de monturas para viajes rápidos.',
      scale: scaleKey,
      environment: env.id,
      is_unlocked: false,
      items: postInnItems
    });

    // Botica y Cirujano
    const apothecaryItems = DRAGONBANE_EQUIPMENT.filter(item => 
      ['vendas', 'hierbas_curativas', 'instrumental_quirurgico', 'curacion_sanador'].includes(item.id)
    );
    shops.push({
      id: `shop_apothecary_${Date.now()}_4`,
      location: cleanName,
      name: `Botica del Fénix`,
      shop_type: 'Botica y Cirugía',
      keeper_name: 'Boticario Alistair',
      description: 'Frascos de tinturas, instrumental de plata esterilizado al fuego y extractos curativos de primera calidad.',
      scale: scaleKey,
      environment: env.id,
      is_unlocked: false,
      items: apothecaryItems
    });
  } 

  // 4. ESCALA: GRAN CIUDAD / FORTALEZA
  else {
    // Maestro Armero de la Corona
    const highArmoryItems = DRAGONBANE_EQUIPMENT.filter(item => 
      ['espada_ancha', 'espada_larga', 'mandoble', 'hacha_dos_manos', 'maza_armas', 'martillo_guerra_pesado', 'alabarda', 'arco_largo', 'ballesta_ligera', 'ballesta_pesada', 'carcaj_hierro', 'escudo_grande', 'cota_malla', 'armadura_completa', 'yelmo', 'herramientas_forja'].includes(item.id)
    );
    shops.push({
      id: `shop_higharmory_${Date.now()}_1`,
      location: cleanName,
      name: `Gran Armería del Gremio de Forjadores`,
      shop_type: 'Armería de Grado Maestro',
      keeper_name: 'Maese Gremial Cedric Yunqueveloz',
      description: 'El taller supremo de los artesanos de la ciudad. Filos de acero damasquino, cotas de malla remachadas y armaduras de placas relucientes.',
      scale: scaleKey,
      environment: env.id,
      is_unlocked: true,
      items: highArmoryItems
    });

    // Gran Bazar y Emporio de Ultramar
    const bazaarItems = DRAGONBANE_EQUIPMENT.filter(item => 
      ['catalejo', 'mochila', 'cuerda_seda', 'tienda_grande', 'catalejo', 'arpeo', 'ganzuas_normales', 'ganzuas_calidad', 'cofre', 'lampara', 'aceite_lampara'].includes(item.id)
    );
    shops.push({
      id: `shop_bazaar_${Date.now()}_2`,
      location: cleanName,
      name: `Emporio Comercial de Ultramar`,
      shop_type: 'Bazar Exótico',
      keeper_name: 'Monsieur D’Artois',
      description: 'Objetos raros importados desde puertos lejanos, finas cuerdas de seda, catalejos de bronce pulido y equipo de alta gama.',
      scale: scaleKey,
      environment: env.id,
      is_unlocked: true,
      items: bazaarItems
    });

    // Alquimia y Botica del Gremio
    const alchemyItems = DRAGONBANE_EQUIPMENT.filter(item => 
      ['pocion_curativa', 'vendas', 'hierbas_curativas', 'instrumental_quirurgico', 'curacion_sanador'].includes(item.id)
    );
    shops.push({
      id: `shop_alchemy_${Date.now()}_3`,
      location: cleanName,
      name: `Sanatorio y Laboratorio Alquímico`,
      shop_type: 'Alquimia y Cirugía Mayor',
      keeper_name: 'Alquimista Valerius',
      description: 'Alambiques de cobre burbujeantes, pociones curativas concentradas de color carmesí y cirujanos de la corte.',
      scale: scaleKey,
      environment: env.id,
      is_unlocked: false,
      items: alchemyItems
    });

    // Hostal de la Corona
    const royalInnItems = DRAGONBANE_EQUIPMENT.filter(item => 
      ['festin', 'copa_vino', 'alojamiento_lujo', 'alojamiento_privada', 'bano_posada', 'guardaespaldas'].includes(item.id)
    );
    shops.push({
      id: `shop_royalinn_${Date.now()}_4`,
      location: cleanName,
      name: `Hostal Señorial "La Corona y el León"`,
      shop_type: 'Hostal de Gran Lujo',
      keeper_name: 'Dama Aurelia de Valdemar',
      description: 'Suites con camas de plumas, chimeneas de mármol, banquetes con música de bardos cortesanos y baños de esencias.',
      scale: scaleKey,
      environment: env.id,
      is_unlocked: false,
      items: royalInnItems
    });

    // Caballerizas Reales y Astillero
    const mountItems = DRAGONBANE_EQUIPMENT.filter(item => 
      ['caballo_guerra', 'caballo_monta', 'embarcacion_vela', 'carro', 'carreta'].includes(item.id)
    );
    shops.push({
      id: `shop_mounts_${Date.now()}_5`,
      location: cleanName,
      name: `Caballerizas del Rey y Capitanía`,
      shop_type: 'Monturas de Guerra y Flota',
      keeper_name: 'Comandante Aldor',
      description: 'Caballos de guerra entrenados para embestir sin vacilar ante el fuego o los monstruos, carros de combate y embarcaciones a vela.',
      scale: scaleKey,
      environment: env.id,
      is_unlocked: false,
      items: mountItems
    });
  }

  return shops;
}
