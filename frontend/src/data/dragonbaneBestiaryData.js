// ============================================================================
// DRAGONBANE - BESTIARIO OFICIAL Y ADVERSARIOS DE CAMPAÑA (CAPÍTULOS 7 Y 8)
// Datos 100% fieles a las reglas oficiales en español de Fria Ligan
// ============================================================================

export const BESTIARY_CATEGORIES = [
  { id: 'all', name: 'Todos los Seres', icon: 'Sparkles' },
  { id: 'monstruo', name: 'Monstruos (Ataques 1d6)', icon: 'Flame' },
  { id: 'no_muerto', name: 'No-Muertos y Espectros', icon: 'Skull' },
  { id: 'humanoide', name: 'Humanoides y Adversarios', icon: 'Sword' },
  { id: 'bestia', name: 'Bestias y Animales', icon: 'Compass' }
];

export const OFFICIAL_BESTIARY = [
  // ==========================================================================
  // MONSTRUOS LEGENDARIOS CON TABLA DE ATAQUES 1D6
  // ==========================================================================
  {
    id: 'dragon',
    name: 'Dragón Ancestral',
    category: 'monstruo',
    size: 'enorme',
    ferocity: 3,
    movement: 24,
    armor: 6,
    hp_max: 84,
    hp_current: 84,
    wp_max: 20,
    wp_current: 20,
    icon: '🐉',
    description: 'Crueles bestias reptilianas que viven en montañas escarpadas, donde construyen sus guaridas en cuevas profundas o minas enanas abandonadas. Son seres ancestrales, mágicos y astutos que se consideran los verdaderos amos del mundo.',
    special_rules: 'Monstruo Legendario: Tiene Ferocidad 3 (recibe 3 cartas de iniciativa por ronda). Sus ataques de monstruo nunca fallan y no pueden pararse normalmente salvo con habilidades heroicas.',
    attacks: [
      {
        dice: 1,
        title: '¡Rugido de dragón!',
        type: 'miedo',
        damage: '-',
        description: 'El dragón abre sus fauces y lanza un rugido escalofriante. Todos los aventureros en un radio de 20 metros sufren un ataque de miedo, con DESVENTAJA en la tirada de Voluntad.'
      },
      {
        dice: 2,
        title: '¡Zarpazo!',
        type: 'cortante',
        damage: '2d10',
        description: 'El dragón barre con sus garras a dos aventureros simultáneamente. Ambos sufren 2D10 de daño cortante cada uno.'
      },
      {
        dice: 3,
        title: '¡Viento de dragón!',
        type: 'contundente',
        damage: '2d6',
        description: 'El dragón agita sus grandes alas y crea un poderoso vendaval que golpea a todos los aventureros en un radio de 10 metros. Salen volando 2D6 metros, reciben la misma cantidad de daño y caen derribados.'
      },
      {
        dice: 4,
        title: '¡Coletazo!',
        type: 'contundente',
        damage: '2d8',
        description: 'El dragón barre el campo de batalla con su cola llena de púas de hierro. Todos los personajes en un radio de 6 metros sufren 2D8 de daño contundente y caen derribados.'
      },
      {
        dice: 5,
        title: '¡Mordedura de dragón!',
        type: 'cortante',
        damage: '4d10',
        description: 'La bestia abre sus enormes mandíbulas y devora a una víctima con velocidad aterradora. El ataque inflige 4D10 de daño cortante.'
      },
      {
        dice: 6,
        title: '¡Aliento de fuego!',
        type: 'fuego',
        damage: '3d10',
        description: 'El dragón se eleva en todo su esplendor y vomita una devastadora tormenta de fuego en un cono de 10 metros. Cualquier aventurero en el área sufre 3D10 de daño de fuego. ¡La armadura normal no tiene efecto!'
      }
    ]
  },
  {
    id: 'manticora',
    name: 'Mantícora de la Estepa',
    category: 'monstruo',
    size: 'grande',
    ferocity: 2,
    movement: 16,
    armor: 0,
    hp_max: 44,
    hp_current: 44,
    wp_max: 14,
    wp_current: 14,
    icon: '🦂',
    description: 'Peculiar bestia sedienta de sangre con rostro similar al humano, cuerpo de león, alas coriáceas y una cola de escorpión cargada de púas venenosas. Cazadora implacable que despierta el terror.',
    special_rules: 'Ferocidad 2 (roba 2 cartas de iniciativa por ronda). Dispara púas a distancia con su cola.',
    attacks: [
      {
        dice: 1,
        title: '¡Coletazo a distancia!',
        type: 'perforante',
        damage: '1d12',
        description: 'Lanza un ataque a distancia con las púas de su cola contra un héroe a menos de 20m. Inflige 1D12 de daño perforante e inyecta veneno paralizante de potencia 12 (parable con escudo).'
      },
      {
        dice: 2,
        title: '¡Mordisco afilado!',
        type: 'cortante',
        damage: '3d8',
        description: 'Muerde a una víctima con su triple hilera de colmillos e inflige 3D8 de daño cortante.'
      },
      {
        dice: 3,
        title: '¡Zarpazo desgarrador!',
        type: 'cortante',
        damage: '2d8+1d6',
        description: 'Corre hacia un aventurero, lo derriba y lo destroza con garras delanteras. Inflige 2D8 cortante más 1D6 por estar derribado.'
      },
      {
        dice: 4,
        title: '¡Ataque de barrido!',
        type: 'cortante',
        damage: '2d6',
        description: 'Da un potente coletazo a dos aventureros a la vez. Ambas víctimas sufren 2D6 de daño y caen derribadas.'
      },
      {
        dice: 5,
        title: '¡Carga contundente!',
        type: 'contundente',
        damage: '3d6',
        description: 'Embiste con todas sus fuerzas contra el héroe con mayor Fuerza en un radio de 10m. Sufre 3D6 de daño contundente y cae derribado.'
      },
      {
        dice: 6,
        title: '¡Lluvia de púas venenosas!',
        type: 'veneno',
        damage: '1d10',
        description: 'Dispara una lluvia de púas mortales desde su cola. Todos los aventureros en 10 metros sufren 1D10 de daño perforante más el veneno paralizante de potencia 12.'
      }
    ]
  },
  {
    id: 'trol',
    name: 'Trol de las Cavernas',
    category: 'monstruo',
    size: 'grande',
    ferocity: 2,
    movement: 10,
    armor: 0,
    hp_max: 38,
    hp_current: 38,
    wp_max: 12,
    wp_current: 12,
    icon: '🧌',
    description: 'Bestias aterradoras tan grandes y fuertes como rocas andantes, con colmillos enormes y ojos de reluciente color amarillo. Tienen un hambre insaciable y una resistencia sobrenatural.',
    special_rules: 'Regeneración: Recupera automáticamente 1D6 PG tras cada uno de sus turnos. No puede regenerar el daño infligido por fuego o ácido.',
    attacks: [
      {
        dice: 1,
        title: '¡Vómito de trol!',
        type: 'condicion',
        damage: '-',
        description: 'Tose desde el fondo de sus pulmones vomitando una cascada de bilis y fétida agua estancada. Todos los aventureros a 6 metros sufren una condición a su elección (Enfermo, Aturdido o Desanimado).'
      },
      {
        dice: 2,
        title: '¡Ataque desgarrador!',
        type: 'cortante',
        damage: '1d10',
        description: 'Raja a un aventurero con sus sucias garras verdinegras. Inflige 1D10 cortante. Si causa daño, la víctima contrae una enfermedad de virulencia 10.'
      },
      {
        dice: 3,
        title: '¡Mordisco repulsivo!',
        type: 'perforante',
        damage: '2d8',
        description: 'Muerde con su boca llena de colmillos y huesos viejos infligiendo 2D8 perforante. La víctima queda atrapada en sus fauces y debe superar tirada de FUE para liberarse, sufriendo 2D8 extra por cada intento fallido.'
      },
      {
        dice: 4,
        title: '¡Lanzamiento de aventurero!',
        type: 'contundente',
        damage: '2d6',
        description: 'Levanta a un héroe sobre su cabeza y lo arroja como un muñeco de trapo 2D6 metros en dirección aleatoria, sufriendo la misma cantidad de daño y cayendo derribado.'
      },
      {
        dice: 5,
        title: '¡Barrido de brazos nudosos!',
        type: 'contundente',
        damage: '2d6',
        description: 'Barre a todos los personajes en un radio de 2 metros con sus brazos nudosos. Inflige 2D6 contundente a cada uno.'
      },
      {
        dice: 6,
        title: '¡Estampados!',
        type: 'contundente',
        damage: '2d8',
        description: 'Agarra al aventurero más cercano y lo usa como arma para golpear a otro compañero. ¡Ambos sufren 2D8 de daño contundente y caen derribados!'
      }
    ]
  },
  {
    id: 'minotauro',
    name: 'Minotauro Laberíntico',
    category: 'monstruo',
    size: 'grande',
    ferocity: 2,
    movement: 16,
    armor: 0,
    hp_max: 32,
    hp_current: 32,
    wp_max: 12,
    wp_current: 12,
    icon: '🐂',
    description: 'Poderosa bestia seminteligente con cabeza de toro y cuerpo humanoide musculoso. Temible en combate cerrado, poseído por una rabia interior incontenible.',
    special_rules: 'Ferocidad 2. Bárbaro instintivo: es inmune a ser Aturdido o Desanimado.',
    attacks: [
      {
        dice: 1,
        title: '¡Puño de toro!',
        type: 'contundente',
        damage: '2d6',
        description: 'Un puño peludo golpea a un héroe con toda su fuerza. Inflige 2D6 de daño contundente y deja a la víctima Aturdida aunque la armadura absorba el daño.'
      },
      {
        dice: 2,
        title: '¡Coz de pezuña!',
        type: 'contundente',
        damage: '2d6',
        description: 'Patea a la víctima con sus cascos hendidos. La lanza 2D6 metros de distancia, donde cae derribada y sufre la misma cantidad de daño contundente.'
      },
      {
        dice: 3,
        title: '¡Doble cornada!',
        type: 'perforante',
        damage: '2d8',
        description: 'Baja la cabeza y embiste a dos aventureros a menos de 2 metros, ensartándolos con sus cuernos. Ambos sufren 2D8 de daño perforante y caen derribados.'
      },
      {
        dice: 4,
        title: '¡Golpe demoledor de hacha!',
        type: 'cortante',
        damage: '2d10+1d10',
        description: 'Gira su gran hacha a dos manos y golpea con furia colosal. Inflige el daño de su arma más 1D10 extra (3D10 total).'
      },
      {
        dice: 5,
        title: '¡Ataque arrollador!',
        type: 'cortante',
        damage: '2d10',
        description: 'Ruge y barre un arco completo de 360 grados con su arma, golpeando a todos en un radio de 2 metros por 2D10 de daño.'
      },
      {
        dice: 6,
        title: '¡Ataque en picado!',
        type: 'contundente',
        damage: '2d10',
        description: 'Da un salto gigantesco y aterriza sobre un aventurero con todo su peso. Sufre 2D10 contundente y queda derribado y aplastado.'
      }
    ]
  },
  {
    id: 'demonio',
    name: 'Demonio del Abismo',
    category: 'monstruo',
    size: 'grande',
    ferocity: 2,
    movement: 16,
    armor: 4,
    hp_max: 64,
    hp_current: 64,
    wp_max: 18,
    wp_current: 18,
    icon: '👿',
    description: 'Criaturas misteriosas del sombrío más allá, nacidas de magia primordial como los dragones. Impulsadas por un hambre insaciable de dominación y desprecio por la vida mortal.',
    special_rules: 'Ferocidad 2. Resistencia al fuego (inmune al daño común de llamas). Las maldiciones sólo se retiran con Disipar magia.',
    attacks: [
      {
        dice: 1,
        title: '¡Terror demoníaco!',
        type: 'miedo',
        damage: '-',
        description: 'Sisea amenazas en una lengua arcana y temible. Todos los aventureros en un radio de 10 metros sufren un ataque de miedo.'
      },
      {
        dice: 2,
        title: '¡Zarpazo abisal!',
        type: 'cortante',
        damage: '2d10',
        description: 'Sonríe con crueldad y acuchilla a un aventurero con sus garras ardientes. Inflige 2D10 de daño cortante.'
      },
      {
        dice: 3,
        title: '¡Maldición antigua!',
        type: 'magia',
        damage: '-',
        description: 'Señala a una víctima y entona una antigua maldición abisal: Tira 1D4: 1=Vomita ranas al mentir; 2=El oro que toca se vuelve polvo; 3=Ceguera temporal; 4=Amnesia total.'
      },
      {
        dice: 4,
        title: '¡Furia invisible!',
        type: 'fuerza',
        damage: '2d8',
        description: 'Apunta su mano a un aventurero a menos de 10 metros y este sale despedido 2D8 metros hacia atrás, sufriendo ese mismo daño contundente y cayendo al suelo.'
      },
      {
        dice: 5,
        title: '¡Picadura de aguijón escorpión!',
        type: 'veneno',
        damage: '1d12',
        description: 'Clava su aguijón dorsal en la víctima infligiendo 1D12 perforante y administrando veneno paralizante de potencia 16.'
      },
      {
        dice: 6,
        title: '¡Posesión mental!',
        type: 'control',
        damage: '-',
        description: 'Toma el control del cuerpo del aventurero. Debe superar tirada de VOL con Desventaja o el demonio le obliga a moverse y atacar a un compañero de inmediato.'
      }
    ]
  },
  {
    id: 'grifo',
    name: 'Grifo Real',
    category: 'monstruo',
    size: 'grande',
    ferocity: 2,
    movement: 30,
    armor: 0,
    hp_max: 38,
    hp_current: 38,
    wp_max: 12,
    wp_current: 12,
    icon: '🦅',
    description: 'Depredador de los bosques con cuerpo de león y cabeza y alas de águila gigante. Cazador rápido y rapaz con nidos situados en riscos inalcanzables.',
    special_rules: 'Vuelo supersónico (Movimiento 30). Ferocidad 2.',
    attacks: [
      {
        dice: 1,
        title: '¡Picotazo brutal!',
        type: 'perforante',
        damage: '2d8',
        description: 'Usa su pico duro como pedernal para ensartar a un aventurero, causándole 2D8 de daño perforante.'
      },
      {
        dice: 2,
        title: '¡Golpe encabritado!',
        type: 'cortante',
        damage: '1d6x1d8',
        description: 'Se alza e intenta destrozar al héroe con 1D6 zarpazos rápidos sucesivos de 1D8 de daño cortante cada uno (se pueden esquivar uno a uno).'
      },
      {
        dice: 3,
        title: '¡Barrido de garras aladas!',
        type: 'cortante',
        damage: '1d8',
        description: 'Barre un arco con sus garras delanteras hacia todos los personajes en 2 metros. Cada víctima sufre 1D8 y cae derribada.'
      },
      {
        dice: 4,
        title: '¡Lanzamiento por los aires!',
        type: 'perforante',
        damage: '2d6',
        description: 'Agarra al aventurero con su pico y lo proyecta por los aires 2D6 metros. Sufre la misma cantidad de daño y cae derribado.'
      },
      {
        dice: 5,
        title: '¡Torbellino alado!',
        type: 'viento',
        damage: '1d6',
        description: 'Bate sus alas creando un vendaval que empuja a todos en 10 metros. Aterrizan a 1D6 metros de distancia y sufren esa cantidad de daño contundente.'
      },
      {
        dice: 6,
        title: '¡Vuelo de raptor y caída!',
        type: 'caida',
        damage: '2d6+6',
        description: 'Agarra al héroe y lo eleva a gran altura (2D6+6 metros). En su siguiente turno lo deja caer al vacío para sufrir el daño por impacto.'
      }
    ]
  },
  {
    id: 'gigante',
    name: 'Gigante de las Colinas',
    category: 'monstruo',
    size: 'enorme',
    ferocity: 1,
    movement: 18,
    armor: 0,
    hp_max: 74,
    hp_current: 74,
    wp_max: 10,
    wp_current: 10,
    icon: '🗿',
    description: 'Colosales seres humanoides que habitan en cavernas de montaña. Empuñan troncos enteros como mazas y causan temblores de tierra a cada paso.',
    special_rules: 'Punto débil: La cabeza del gigante es su punto débil (golpe crítico inflige triple daño).',
    attacks: [
      {
        dice: 1,
        title: '¡Golpe contundente de garrote!',
        type: 'contundente',
        damage: '3d10',
        description: 'Gira su garrote titánico sobre su cabeza y aplasta a un aventurero. Inflige 3D10 de daño contundente.'
      },
      {
        dice: 2,
        title: '¡Rugido atronador!',
        type: 'miedo',
        damage: '-',
        description: 'Suelta un bramido ensordecedor que hace vibrar las piedras. Todos los personajes a 20 metros sufren un ataque de miedo.'
      },
      {
        dice: 3,
        title: '¡Pisotón colosal!',
        type: 'contundente',
        damage: '4d6',
        description: 'Pisa con su inmenso pie descalzo a dos aventureros juntos. Sufren 4D6 de daño contundente y quedan derribados.'
      },
      {
        dice: 4,
        title: '¡Barrido de tronco!',
        type: 'contundente',
        damage: '2d10',
        description: 'Barre con su arma en un radio de 10 metros. Cualquiera alcanzado sufre 2D10 contundente y sale volando derribado.'
      },
      {
        dice: 5,
        title: '¡A volar!',
        type: 'lanzamiento',
        damage: '4d8',
        description: 'Agarra a un héroe y lo lanza por los aires como un proyectil. Inflige 4D8 de daño contundente y el personaje vuela esa distancia en metros.'
      },
      {
        dice: 6,
        title: '¡Ráfaga de pisotones!',
        type: 'contundente',
        damage: '3d6',
        description: 'Enloquece de ira y machaca el suelo con puños y pisotones. Todos los aventureros a 10 metros sufren 3D6 contundente y caen derribados.'
      }
    ]
  },
  {
    id: 'arana_gigante',
    name: 'Araña Gigante',
    category: 'monstruo',
    size: 'normal',
    ferocity: 2,
    movement: 24,
    armor: 0,
    hp_max: 36,
    hp_current: 36,
    wp_max: 10,
    wp_current: 10,
    icon: '🕷️',
    description: 'Horrores de ocho patas y mandíbulas de cimitarra que tejen emboscadas en ruinas subterráneas, bosques sombríos y sótanos olvidados.',
    special_rules: 'Trepa-muros: se mueve por techos y paredes con velocidad completa. Ferocidad 2.',
    attacks: [
      {
        dice: 1,
        title: '¡Mandíbulas de cimitarra!',
        type: 'cortante',
        damage: '2d8',
        description: 'Las mandíbulas dentadas cortan el aire con ferocidad. Inflige 2D8 de daño cortante.'
      },
      {
        dice: 2,
        title: '¡Ataque desgarrador múltiple!',
        type: 'perforante',
        damage: '1d8',
        description: 'Ataca con una multitud de patas puntiagudas. Todos los personajes en 2 metros sufren 1D8 de daño perforante.'
      },
      {
        dice: 3,
        title: '¡Mirada hipnótica!',
        type: 'miedo',
        damage: '-',
        description: 'Fija su miríada de ojos glaucos en el grupo. Todos los personajes a 10 metros deben superar tirada de VOL contra el miedo.'
      },
      {
        dice: 4,
        title: '¡Picadura venenosa!',
        type: 'veneno',
        damage: '1d10',
        description: 'Dispara un aguijón que inflige 1D10 perforante y, si causa al menos 1 PG de daño, inocula veneno paralizante de potencia 16.'
      },
      {
        dice: 5,
        title: '¡Telaraña pegajosa!',
        type: 'red',
        damage: '-',
        description: 'Escupe una red adhesiva sobre el héroe con mayor Fuerza. Debe esquivar o queda completamente atrapado e inmovilizado.'
      },
      {
        dice: 6,
        title: '¡Embestida pesada!',
        type: 'contundente',
        damage: '2d6',
        description: 'Salta y deja caer su cuerpo bulboso sobre un aventurero. Inflige 2D6 de daño contundente y lo derriba.'
      }
    ]
  },
  {
    id: 'arpias',
    name: 'Bandada de Arpías',
    category: 'monstruo',
    size: 'enjambre',
    ferocity: 2,
    movement: 24,
    armor: 0,
    hp_max: 24,
    hp_current: 24,
    wp_max: 8,
    wp_current: 8,
    icon: '🦅',
    description: 'Aves rapaces con rostros humanoides desgarrados y fauces llenas de colmillos serrados. Cazadoras cobardes que chillan insultos y atacan en enjambre.',
    special_rules: 'Aladas: atacan desde el aire; solo reciben daño de armas a distancia o armas de asta cuerpo a cuerpo.',
    attacks: [
      {
        dice: 1,
        title: '¡Cacareo amenazante!',
        type: 'miedo',
        damage: '-',
        description: 'Gritan descripciones aterradoras de cómo devorarán sus restos. Todos a 10 metros hacen tirada de VOL o quedan Asustados.'
      },
      {
        dice: 2,
        title: '¡Ataque coordinado!',
        type: 'cortante',
        damage: '2d6',
        description: 'Atacan en picado al personaje con más piezas metálicas. Infligen 2D6 cortante y lo elevan dejándolo caer desde 1D3+3 metros.'
      },
      {
        dice: 3,
        title: '¡Muerte desde el cielo!',
        type: 'contundente',
        damage: '1d6',
        description: 'Arrojan piedras y cascotes afilados desde las alturas. Todos los personajes a 10 metros sufren 1D6 contundente.'
      },
      {
        dice: 4,
        title: '¡Arrancaojos!',
        type: 'ceguera',
        damage: '2d6',
        description: 'Atacan a los ojos de un aventurero con garras afiladas. Inflige 2D6 perforante y la víctima queda ciega durante un tramo corto.'
      },
      {
        dice: 5,
        title: '¡Ataque en masa!',
        type: 'cortante',
        damage: '1d8',
        description: 'Se dividen y caen sobre cada miembro de la party a 10 metros. Cada aventurero sufre 1D8 de daño cortante.'
      },
      {
        dice: 6,
        title: '¡Ataque de inmundicia!',
        type: 'condicion',
        damage: '-',
        description: 'Sueltan una lluvia de vómito ácido y excrementos sobre el grupo. Todos a 10 metros adquieren la condición Enfermo o Desanimado.'
      }
    ]
  },
  {
    id: 'murcielagos',
    name: 'Murciélagos Vampiro',
    category: 'monstruo',
    size: 'enjambre',
    ferocity: 2,
    movement: 24,
    armor: 0,
    hp_max: 18,
    hp_current: 18,
    wp_max: 6,
    wp_current: 6,
    icon: '🦇',
    description: 'Enjambre voraz de murciélagos sedientos de sangre con envergadura de un metro que habitan criptas y catacumbas.',
    special_rules: 'Enjambre: Las armas físicas sólo hacen 1 de daño; las antorchas, fuego y magia zonal hacen daño completo.',
    attacks: [
      {
        dice: 1,
        title: '¡Remolino de alas aterrador!',
        type: 'miedo',
        damage: '-',
        description: 'Vuelan en torbellino envolvente alrededor de sus cabezas. Todos los aventureros en 10 metros sufren un ataque de miedo.'
      },
      {
        dice: 2,
        title: '¡Ataque colectivo a la yugular!',
        type: 'drenaje',
        damage: '2d6',
        description: 'Ataque coordinado contra el héroe de mayor Constitución. Inflige 2D6 cortante y el enjambre se cura esa misma cantidad de PG.'
      },
      {
        dice: 3,
        title: '¡Festín masivo de sangre!',
        type: 'drenaje',
        damage: '1d8',
        description: 'Se dispersan mordiendo a todos los personajes a 10 metros. Cada uno sufre 1D8 y los murciélagos recuperan vida equivalente.'
      },
      {
        dice: 4,
        title: '¡Remolino de alas aterrador!',
        type: 'miedo',
        damage: '-',
        description: 'Ciegan y aturden a los aventureros agitando sus alas ante sus ojos. Ataque de miedo general.'
      },
      {
        dice: 5,
        title: '¡Ataque colectivo!',
        type: 'drenaje',
        damage: '2d6',
        description: 'Muerden y drenan sangre vorazmente infligiendo 2D6 de daño y curándose la misma cantidad de PG.'
      },
      {
        dice: 6,
        title: '¡Festín masivo de sangre!',
        type: 'drenaje',
        damage: '1d8',
        description: 'Ráfaga de mordiscos a toda la party (1D8 a cada héroe en 10m).'
      }
    ]
  },

  // ==========================================================================
  // NO-MUERTOS Y ESPECTROS
  // ==========================================================================
  {
    id: 'espectro',
    name: 'Espectro de la Cripta',
    category: 'no_muerto',
    size: 'normal',
    ferocity: 2,
    movement: 10,
    armor: 4,
    hp_max: 38,
    hp_current: 38,
    wp_max: 16,
    wp_current: 16,
    icon: '👑',
    description: 'Espíritus muertos vivientes corpóreos de antiguos reyes, príncipes y señores de la guerra. Empuñan armas arcanas y armaduras oxidadas alimentados por un rencor milenario.',
    special_rules: 'Ferocidad 2. El frío que desprenden impide la curación normal hasta calentarse junto a una hoguera.',
    attacks: [
      {
        dice: 1,
        title: '¡Aullido impío!',
        type: 'miedo',
        damage: '-',
        description: 'Su cráneo se contorsiona soltando un alarido que atraviesa el alma. Todos en un radio de 10 metros sufren un ataque de miedo.'
      },
      {
        dice: 2,
        title: '¡Mirada de ultratumba!',
        type: 'miedo',
        damage: '-',
        description: 'Un susurro helado atrae la mirada de un héroe. Queda Asustado automáticamente y sufre ataque de miedo con desventaja.'
      },
      {
        dice: 3,
        title: '¡La mano del muerto!',
        type: 'magia',
        damage: '2d4',
        description: 'Levanta su guantelete hacia un héroe a 10 metros y lo proyecta 2D4 metros por los aires. Sufre 2D4 de daño y cae derribado.'
      },
      {
        dice: 4,
        title: '¡Barrido de espada antigua!',
        type: 'cortante',
        damage: '2d8',
        description: 'Barre con su espada a velocidad fantasmal. Todos los aventureros a 2 metros sufren 2D8 cortante.'
      },
      {
        dice: 5,
        title: '¡Frío paralizante!',
        type: 'frio',
        damage: '1d6',
        description: 'Agarra al héroe y el frío mortífero se extiende por su sangre. Sufre 1D6 (ignora armadura) y no puede actuar hasta superar tirada de Esquivar.'
      },
      {
        dice: 6,
        title: '¡Tajo aniquilador!',
        type: 'cortante',
        damage: '4d8',
        description: 'Golpea a dos manos con el doble de dados de su arma. Inflige 4D8 de daño cortante y derriba al objetivo.'
      }
    ]
  },
  {
    id: 'fantasma',
    name: 'Fantasma Atormentado',
    category: 'no_muerto',
    size: 'normal',
    ferocity: 2,
    movement: 12,
    armor: 0,
    hp_max: 27,
    hp_current: 27,
    wp_max: 18,
    wp_current: 18,
    icon: '👻',
    description: 'Espíritu incorpóreo de color azul translúcido atado al lugar de su trágica muerte. Incapaz de hallar paz en el más allá.',
    special_rules: 'Incorpóreo: Completamente inmune a las armas físicas no mágicas. Sólo la magia, fuego sagrado o armas encantadas le dañan.',
    attacks: [
      {
        dice: 1,
        title: '¡Golpe fantasmal telequinético!',
        type: 'contundente',
        damage: '2d6',
        description: 'Se abalanza a través de un héroe con violencia espectral. Cae derribado a 2D6 metros y sufre esa misma cantidad de daño.'
      },
      {
        dice: 2,
        title: '¡Toque mortífero al corazón!',
        type: 'necrosis',
        damage: '2d10',
        description: 'Hunde su mano espectral en el pecho de la víctima y le estruja el corazón. Inflige 2D10 (ignora armadura) y la deja Asustada.'
      },
      {
        dice: 3,
        title: '¡Aullido que hiela el alma!',
        type: 'miedo',
        damage: '-',
        description: 'Grito desgarrador en un radio de 10 metros. Todos los aventureros sufren ataque de miedo inmediato.'
      },
      {
        dice: 4,
        title: '¡Pesadilla del más allá!',
        type: 'miedo',
        damage: '-',
        description: 'Muestra a la víctima visiones de todos los muertos que ha conocido. Queda Asustada con desventaja en Voluntad.'
      },
      {
        dice: 5,
        title: '¡Abrazo mortal de ultratumba!',
        type: 'contundente',
        damage: '3d6',
        description: 'Envuelve al héroe apagando su calor vital. Sufre 3D6 de daño contundente y queda Aturdido.'
      },
      {
        dice: 6,
        title: '¡Toque helado de la tumba!',
        type: 'frio',
        damage: '2d8',
        description: 'El frío absoluto de la muerte fluye hacia su cuerpo: 2D8 de daño (ignora armadura) e incapacidad de curarse durante un tramo largo.'
      }
    ]
  },
  {
    id: 'esqueleto_guerrero',
    name: 'Guerrero Esqueleto',
    category: 'no_muerto',
    size: 'normal',
    ferocity: 1,
    movement: 8,
    armor: 2,
    hp_max: 8,
    hp_current: 8,
    wp_max: 0,
    wp_current: 0,
    icon: '💀',
    description: 'Huesos reanimados por brujería que protegen túmulos antiguos. No conocen la piedad ni la duda.',
    special_rules: 'Resistencia: Todo el daño perforante recibido se reduce a la mitad. Inmune al miedo y a la persuasión.',
    weapon: 'Espada corta (Daño 1D10, Habilidad 12)',
    skills: 'Alerta 8, Esquivar 6'
  },
  {
    id: 'esqueleto_arquero',
    name: 'Arquero Esqueleto',
    category: 'no_muerto',
    size: 'normal',
    ferocity: 1,
    movement: 8,
    armor: 1,
    hp_max: 8,
    hp_current: 8,
    wp_max: 0,
    wp_current: 0,
    icon: '🏹',
    description: 'Arquero cadavérico apostado en aspilleras y muros que dispara flechas en silencio sepulcral.',
    special_rules: 'Resistencia a perforante (daño a la mitad). Inmune a miedo.',
    weapon: 'Ballesta ligera (Daño 2D6, Habilidad 12), Daga (1D8)',
    skills: 'Alerta 8, Esquivar 6'
  },
  {
    id: 'esqueleto_campeon',
    name: 'Campeón Esqueleto de Élite',
    category: 'no_muerto',
    size: 'normal',
    ferocity: 1,
    movement: 10,
    armor: 4,
    hp_max: 24,
    hp_current: 24,
    wp_max: 15,
    wp_current: 15,
    icon: '⚔️',
    description: 'Antiguo guardia de honor de un rey hechicero. Viste cota de mallas completa y empuña espada larga con mortífera maestría.',
    special_rules: 'Resistencia a perforante. Capacidades heroicas: Parada refleja, Tajo veterano (+1d6 daño).',
    weapon: 'Espada ancha (Daño 2D6+1D6, Habilidad 14)',
    skills: 'Alerta 12, Esquivar 8'
  },

  // ==========================================================================
  // HUMANOIDES Y ADVERSARIOS
  // ==========================================================================
  {
    id: 'orco_guerrero',
    name: 'Guerrero Orco',
    category: 'humanoide',
    size: 'normal',
    ferocity: 1,
    movement: 10,
    armor: 2,
    hp_max: 12,
    hp_current: 12,
    wp_max: 10,
    wp_current: 10,
    icon: '👺',
    description: 'Humanoides corpulentos de colmillos de fiera y piel verde endurecida. Guerreros honorables y fieros con alta resistencia al dolor.',
    special_rules: 'Nocturno: Sufre desventaja bajo la luz solar directa salvo que el cielo esté nublado o cubra su cuerpo.',
    weapon: 'Hacha de batalla (Daño 2D8+1D4, Habilidad 13)',
    skills: 'Fuerza salvaje, Esquivar 8'
  },
  {
    id: 'orco_jefe',
    name: 'Jefe Orco de Batalla',
    category: 'humanoide',
    size: 'normal',
    ferocity: 1,
    movement: 10,
    armor: 4,
    hp_max: 24,
    hp_current: 24,
    wp_max: 15,
    wp_current: 15,
    icon: '🪓',
    description: 'Líder imponente con cicatrices de mil batallas, cota de mallas bruñida y un hacha a dos manos capaz de partir un escudo en dos.',
    special_rules: 'Jefe de Combate: Roba iniciativa con ventaja. Golpe Defensivo y Furia de Clan.',
    weapon: 'Gran Hacha a dos manos (Daño 2D10+1D6, Habilidad 15)',
    skills: 'Alerta 12, Parada 14'
  },
  {
    id: 'orco_chaman',
    name: 'Chamán Orco Espiritual',
    category: 'humanoide',
    size: 'normal',
    ferocity: 1,
    movement: 10,
    armor: 0,
    hp_max: 10,
    hp_current: 10,
    wp_max: 16,
    wp_current: 16,
    icon: '🔮',
    description: 'Canalizador de los espíritus de la naturaleza y ancestros. Viste pieles de oso y collares de huesos.',
    special_rules: 'Lanza hechizos de Animismo (Rayo espiritual, Enredadera, Curación de heridas).',
    weapon: 'Báculo de roble (Daño 1D8, Habilidad 10)',
    skills: 'Magia Animismo 14, Alerta 11'
  },
  {
    id: 'goblin_explorador',
    name: 'Explorador Goblin',
    category: 'humanoide',
    size: 'pequeño',
    ferocity: 1,
    movement: 12,
    armor: 1,
    hp_max: 9,
    hp_current: 9,
    wp_max: 8,
    wp_current: 8,
    icon: '👺',
    description: 'Criatura astuta y ágil de brazos largos y ojos saltones que ataca con emboscadas, flechas y trampas envenenadas.',
    special_rules: 'Nocturno. Especialista en sigilo: tiene ventaja en emboscadas desde las sombras.',
    weapon: 'Arco corto (Daño 1D10, Habilidad 12), Daga (1D8)',
    skills: 'Sigilo 14, Alerta 10, Esquivar 10'
  },
  {
    id: 'goblin_guerrero',
    name: 'Guerrero Goblin',
    category: 'humanoide',
    size: 'pequeño',
    ferocity: 1,
    movement: 10,
    armor: 2,
    hp_max: 10,
    hp_current: 10,
    wp_max: 8,
    wp_current: 8,
    icon: '🗡️',
    description: 'Armado con lanza corta y escudo improvisado con tapas de barriles reforzados con hierro.',
    special_rules: 'Tácticas de jauría: suma +1 al daño por cada compañero goblin adyacente.',
    weapon: 'Lanza corta (Daño 1D10, Habilidad 11), Escudo pequeño (PARAR 11)',
    skills: 'Esquivar 9, Alerta 8'
  },
  {
    id: 'bandido_salteador',
    name: 'Salteador de Caminos',
    category: 'humanoide',
    size: 'normal',
    ferocity: 1,
    movement: 10,
    armor: 1,
    hp_max: 11,
    hp_current: 11,
    wp_max: 9,
    wp_current: 9,
    icon: '🗡️',
    description: 'Forajido que asalta caravanas en los senderos hacia Puerto Brumoso. Rápido para huir si las cosas salen mal.',
    special_rules: 'Cobarde: si el líder muere, debe hacer tirada de Voluntad o huir del combate.',
    weapon: 'Espada ancha (Daño 2D6, Habilidad 11), Honda (1D8)',
    skills: 'Alerta 9, Esquivar 8'
  },
  {
    id: 'bandido_capitan',
    name: 'Capitán de Bandidos',
    category: 'humanoide',
    size: 'normal',
    ferocity: 1,
    movement: 10,
    armor: 2,
    hp_max: 16,
    hp_current: 16,
    wp_max: 13,
    wp_current: 13,
    icon: '🏴‍☠️',
    description: 'Líder despiadado con armadura de cuero endurecido y capa desgarrada. Hábil duelista.',
    special_rules: 'Parada refleja (puede parar una vez por ronda sin gastar acción gastando 2 PC).',
    weapon: 'Espada larga (Daño 2D8, Habilidad 13), Daga arrojadiza (1D8)',
    skills: 'Alerta 12, Esquivar 10, Intimidar 12'
  },
  {
    id: 'guardia_puerto',
    name: 'Guardia de Puerto Brumoso',
    category: 'humanoide',
    size: 'normal',
    ferocity: 1,
    movement: 10,
    armor: 3,
    hp_max: 13,
    hp_current: 13,
    wp_max: 10,
    wp_current: 10,
    icon: '🛡️',
    description: 'Soldado de la guarnición local con cota de escamas, alabarda y el blasón de la ciudad.',
    special_rules: 'Formación de escudos: otorga +1 de armadura a aliados adyacentes.',
    weapon: 'Alabarda (Daño 2D8, Habilidad 12), Escudo grande',
    skills: 'Alerta 10, Parar 12'
  },
  {
    id: 'cultista_oscuro',
    name: 'Cultista de la Sombra',
    category: 'humanoide',
    size: 'normal',
    ferocity: 1,
    movement: 10,
    armor: 0,
    hp_max: 9,
    hp_current: 9,
    wp_max: 14,
    wp_current: 14,
    icon: '🕯️',
    description: 'Fanático encapuchado que rinde culto a los demonios y dragones del pasado.',
    special_rules: 'Fanatismo: inmune a tiradas de miedo causadas por demonios o magia oscura.',
    weapon: 'Daga de sacrificio (Daño 1D8, Habilidad 10)',
    skills: 'Magia Mentalismo 12, Sigilo 11'
  },

  // ==========================================================================
  // BESTIAS Y ANIMALES
  // ==========================================================================
  {
    id: 'lobo',
    name: 'Lobo del Bosque',
    category: 'bestia',
    size: 'normal',
    ferocity: 1,
    movement: 16,
    armor: 0,
    hp_max: 12,
    hp_current: 12,
    wp_max: 8,
    wp_current: 8,
    icon: '🐺',
    description: 'Depredador veloz que caza en manadas en los bosques y valles brumosos.',
    special_rules: 'Manada: +2 al daño por cada lobo aliado a menos de 2 metros del objetivo.',
    weapon: 'Mordisco desgarrador (Daño 1D10, Habilidad 12)',
    skills: 'Alerta 14, Rastrear 14'
  },
  {
    id: 'oso',
    name: 'Oso Pardo Feroz',
    category: 'bestia',
    size: 'grande',
    ferocity: 1,
    movement: 12,
    armor: 1,
    hp_max: 26,
    hp_current: 26,
    wp_max: 10,
    wp_current: 10,
    icon: '🐻',
    description: 'Bestia enorme y territorial capaz de partir árboles con sus zarpas.',
    special_rules: 'Abrazo de oso: Si acierta con garras por segunda vez, agarra y estruja a la víctima por 2D6 contundente automático.',
    weapon: 'Garras demoledoras (Daño 2D8+1D4, Habilidad 13)',
    skills: 'Alerta 12'
  },
  {
    id: 'jabali',
    name: 'Jabalí Salvaje',
    category: 'bestia',
    size: 'normal',
    ferocity: 1,
    movement: 14,
    armor: 1,
    hp_max: 14,
    hp_current: 14,
    wp_max: 8,
    wp_current: 8,
    icon: '🐗',
    description: 'Animal agresivo con colmillos filosos como navajas. Embiste a ciegas si se siente acorralado.',
    special_rules: 'Carga feroz: Si se mueve al menos 6 metros antes de atacar, su mordedura inflige +1D6 extra y derriba al objetivo.',
    weapon: 'Colmillazos (Daño 1D10, Habilidad 11)',
    skills: 'Alerta 10'
  }
];
