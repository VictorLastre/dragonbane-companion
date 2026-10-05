import sys, re, json

sys.stdout.reconfigure(encoding='utf-8')
with open('char_creation_extracted.txt', 'r', encoding='utf-8') as f:
    text = f.read()

# Parsear debilidades y recuerdos de pág 27 y 28
debilidades = [
    "Crédulo. Me creo todo lo que me dicen.",
    "Codicioso. Cuando se reparte el tesoro, quiero más que el resto.",
    "Susceptible. No tolero las provocaciones.",
    "Temerario. Siempre soy el primero en avanzar hacia el peligro.",
    "Pusilánime. Siempre me quedo en la retaguardia.",
    "Matamonstruos. Todos los monstruos son malvados y deben ser aniquilados.",
    "Intolerante. Los seres de la oscuridad, como los orcos y goblins, son malvados.",
    "Perezoso. Aprovecho cualquier oportunidad para descansar.",
    "Glotón. No sé resistirme a la comida sabrosa.",
    "Cleptómano. No puedo evitar robar objetos de valor.",
    "Vanidoso. Ayudaré a cualquiera que me elogie o me piropee.",
    "Imprudente. Tomo grandes riesgos sin pensar en las consecuencias.",
    "Miedo a la magia. La magia es una fuerza maligna y los magos no son de fiar.",
    "Ansia de conocimientos. La búsqueda de conocimientos es más importante que mis amigos.",
    "Naturaleza salvaje. Nunca duermo bajo techo.",
    "Fanfarrón. Siempre exagero mis logros.",
    "Violento. Recurro a la violencia para superar cualquier obstáculo.",
    "Autoritario. Siempre les digo a los demás lo que tienen que hacer.",
    "Pesimista. Siempre pienso que las cosas irán a peor.",
    "Altivo. Me creo mejor o más importante que los demás."
]

recuerdos = [
    "Tu viejo par de botas",
    "Un sencillo medallón de plata",
    "Una carta de un familiar o un viejo amigo",
    "Un diario viejo y andrajoso",
    "Un brazalete heredado de tu familia",
    "Una talla de madera que recibiste de niño",
    "Una piedra con forma extraña",
    "Una moneda de cobre de un tesoro buscado por tus padres",
    "Una vieja jarra de peltre",
    "El cuerno de un monstruo, obtenido como trofeo",
    "El colmillo de un monstruo, obtenido como trofeo",
    "Un par de dados hechos de hueso",
    "Un guardapelo que contiene un mechón de cabello",
    "Una llave ornamentada",
    "Un mapa dibujado a mano, herencia familiar",
    "Un anillo con una inscripción",
    "Un silbato hecho con hueso",
    "El sombrero viejo y andrajoso de uno de tus padres",
    "Una pluma de grifo",
    "Una pipa bellamente tallada"
]

races_data = {
    "Humano": {
        "movement": 10,
        "ability_name": "Flexible",
        "ability_cost": "3 PC",
        "ability_desc": "Al tirar una habilidad, puedes elegir usar otra habilidad a tu elección justificando su uso ante el DJ.",
        "names": ["Joruna", "Tym", "Halvelda", "Garmander", "Verolun", "Lothar"]
    },
    "Halfling": {
        "movement": 8,
        "ability_name": "Escurridizo / Vengativo",
        "ability_cost": "3 PC",
        "ability_desc": "Escurridizo: Obtén ventaja en una tirada de Esquivar (3 PC). Vengativo: Obtén ventaja en tirada de ataque contra quien te haya hecho daño antes (3 PC).",
        "names": ["Rauda", "Escabeche", "Pechera", "Abejo", "Sidranto", "Theolino"]
    },
    "Enano": {
        "movement": 8,
        "ability_name": "Inquebrantable",
        "ability_cost": "3 PC",
        "ability_desc": "Puedes activar esta capacidad al empujar una tirada sin sufrir una condición negativa, o ignorar daño.",
        "names": ["Yescadura", "Halwyld", "Tymolana", "Traut", "Urd", "Fermer"]
    },
    "Elfo": {
        "movement": 10,
        "ability_name": "Paz interior",
        "ability_cost": "0 PC (Pasiva)",
        "ability_desc": "Medita durante los descansos cortos para curarte D6 PG y D6 PC extras y recuperarte de un estado adicional.",
        "names": ["Arasin", "Iliriana", "Galvander", "Tirindelia", "Erwilnor", "Andrémona"]
    },
    "Anátida": {
        "movement": 8,
        "ability_name": "Furibundo / Palmípedo",
        "ability_cost": "3 PC",
        "ability_desc": "Furibundo: 3 PC para ventaja en tirada y pasas a estar Enfadado. Palmípedo: ventaja en Nadar y velocidad normal bajo el agua.",
        "names": ["Cuacsam", "Salpique", "Moggee", "Groddy", "Blisandina", "Escapuleto"]
    },
    "Lupino": {
        "movement": 12,
        "ability_name": "Instinto de caza",
        "ability_cost": "3 PC",
        "ability_desc": "Elige a una criatura que puedas oler o ver y márcala como tu presa. Síguela por olor durante 1 día completo y gasta 1 PC para ventaja en ataque.",
        "names": ["Saalvaje", "Lobosombra", "Lunariem", "Obdurian", "Dientefrío", "Wuldenhall"]
    }
}

professions_data = {
    "Artesano": {
        "key_attribute": "FUE",
        "skills": ["Artesanía", "Cuchillos", "Dedos ágiles", "Descubrir", "Espadas", "Hachas", "Martillos", "Pelea"],
        "heroic_ability": "Maestro artesano (reparar y forjar equipo de calidad superior)",
        "equipment_packages": [
            "Maza ligera, escudo pequeño, delantal de cuero, herramientas de artesano, antorcha, D6 raciones, D8 monedas de plata",
            "Hacha de mano, martillo ligero, armadura de cuero, herramientas, antorcha, D6 raciones, D8 monedas de plata",
            "Cuchillo largo, fuelles pequeños, herramientas, piedra de afilar, antorcha, D6 raciones, D8 monedas de plata"
        ],
        "nicknames": ["El Herrero", "Dedos de Oro", "Yunque", "Virutas", "Fogonero", "El Cincel"]
    },
    "Bardo": {
        "key_attribute": "CAR",
        "skills": ["Alerta", "Atletismo", "Cuchillos", "Elocuencia", "Engaño", "Interpretar", "Mitos y leyendas", "Persuadir"],
        "heroic_ability": "Músico (anima a sus aliados con música y canciones que otorgan PC o curación)",
        "equipment_packages": [
            "Laúd o flauta, daga, ropa elegante, capa con capucha, yesca y pedernal, D6 raciones, D10 monedas de plata",
            "Arpa pequeña, espada corta, pergamino y tinta, antorcha, D6 raciones, D10 monedas de plata",
            "Tambor de viaje, honda, zurrón con piedras, pipa, yesca, D6 raciones, D10 monedas de plata"
        ],
        "nicknames": ["Voz de Plata", "El Ruiseñor", "Lengua de Oro", "Coplas", "El Bufón", "Serenatero"]
    },
    "Caballero": {
        "key_attribute": "FUE",
        "skills": ["Atletismo", "Cabalgar", "Conocimiento", "Cuchillos", "Espadas", "Lanzas", "Martillos", "Persuadir"],
        "heroic_ability": "Protector (interpón tu escudo o arma para desviar ataques dirigidos a aliados)",
        "equipment_packages": [
            "Espada ancha, escudo grande, cota de malla, caballo de guerra (o montura), raciones D8, D12 monedas de plata",
            "Lanza de caballería, espada corta, escudo mediano, armadura de cuero endurecido, D8 raciones, D10 monedas de plata",
            "Martillo de guerra, escudo, coraza, estandarte familiar, D8 raciones, D12 monedas de plata"
        ],
        "nicknames": ["El Leal", "Brazo de Hierro", "El Valiente", "El Guardián", "Corazón de León", "El Justo"]
    },
    "Cazador": {
        "key_attribute": "AGI",
        "skills": ["Alerta", "Arcos", "Bestias", "Cabalgar", "Caza y pesca", "Cuchillos", "Sigilo", "Supervivencia"],
        "heroic_ability": "Compañero animal (un fiel halcón, sabueso o lobo que te ayuda en exploración y combate)",
        "equipment_packages": [
            "Arco largo, carcaj con flechas, daga, piel para dormir, yesca y pedernal, D8 raciones, D6 monedas de plata",
            "Arco corto, lanza corta, armadura de cuero, trampa de caza, yesca y pedernal, D8 raciones, D6 monedas de plata",
            "Ballesta ligera, virotes, cuchillo de caza, cuerda con arpeo, D8 raciones, D6 monedas de plata"
        ],
        "nicknames": ["Ojo de Halcón", "Rastreador", "Silencioso", "El Trampero", "Pies de Zorro", "Lobo Solitario"]
    },
    "Erudito": {
        "key_attribute": "INT",
        "skills": ["Alerta", "Conocimiento", "Curación", "Descubrir", "Idiomas", "Mitos y leyendas", "Supervivencia", "Varas"],
        "heroic_ability": "Intuición (haz preguntas al DJ o deducciones certeras sobre enigmas y debilidades de monstruos)",
        "equipment_packages": [
            "Bastón de roble, libro de notas, pluma y tintero, lupa, lámpara de aceite, D6 raciones, D10 monedas de plata",
            "Daga, pergaminos antiguos, botiquín de curación (hierbas y vendas), D6 raciones, D10 monedas de plata",
            "Varita de medición, mapa de la región, reloj de arena, antorcha, D6 raciones, D10 monedas de plata"
        ],
        "nicknames": ["El Sabio", "Milhojas", "Ojos Claros", "El Escriba", "Sabelotodo", "El Letrado"]
    },
    "Guerrero": {
        "key_attribute": "FUE",
        "skills": ["Alerta", "Atletismo", "Cuchillos", "Espadas", "Hachas", "Lanzas", "Martillos", "Pelea"],
        "heroic_ability": "Veterano (ignora penalizadores por fatiga o reacciona más rápido en la iniciativa)",
        "equipment_packages": [
            "Espada ancha o hacha de batalla, escudo, armadura de cuero endurecido, piel para dormir, D8 raciones, D8 monedas de plata",
            "Espada a dos manos (o hacha a dos manos), daga, casco de hierro, antorcha, D8 raciones, D8 monedas de plata",
            "Lanza larga, espada corta, escudo, coraza de cuero, D8 raciones, D8 monedas de plata"
        ],
        "nicknames": ["Cicatrices", "El Feroz", "Matahuestes", "El Yunque", "Rompehuesos", "El Imparable"]
    },
    "Ladrón": {
        "key_attribute": "AGI",
        "skills": ["Alerta", "Atletismo", "Cuchillos", "Dedos ágiles", "Engaño", "Esquivar", "Sigilo", "Trucos de manos"],
        "heroic_ability": "Apuñalar por la espalda (ataques sigilosos devastadores con daño crítico extra)",
        "equipment_packages": [
            "Par de dagas, ganzúas, cuerda de cáñamo con arpeo, capa oscura con capucha, D6 raciones, D10 monedas de plata",
            "Espada corta, arco corto, carcaj con flechas, ganzúas, yesca y pedernal, D6 raciones, D10 monedas de plata",
            "Cuchillo arrojadizo (x3), porra, saco de cuero, ganzúas, antifaz, D6 raciones, D10 monedas de plata"
        ],
        "nicknames": ["Sombra", "Dedos Ligeros", "La Comadreja", "Paso Leve", "El Gato", "Ganzúa"]
    },
    "Mago": {
        "key_attribute": "VOL",
        "skills": [],
        "schools": {
            "Animismo": {
                "skills": ["Animismo", "Bestias", "Caza y pesca", "Curación", "Esquivar", "Sigilo", "Supervivencia", "Varas"],
                "desc": "Conexión con los espíritus animales, plantas y fuerzas vivas de la naturaleza."
            },
            "Elementalismo": {
                "skills": ["Elementalismo", "Alerta", "Curación", "Descubrir", "Esquivar", "Idiomas", "Mitos y leyendas", "Varas"],
                "desc": "Control sobre los cuatro elementos: fuego, tierra, aire y agua."
            },
            "Mentalismo": {
                "skills": ["Mentalismo", "Alerta", "Atletismo", "Curación", "Esquivar", "Idiomas", "Mitos y leyendas", "Pelea"],
                "desc": "Poder emanado del autocontrol, mente, fuerza interior y telequinesis."
            }
        },
        "heroic_ability": "Magia (3 trucos y 3 hechizos de rango 1 de su escuela o magia común)",
        "equipment_packages": [
            "Bastón, bola de cristal, grimorio, antorcha, yesca y pedernal, D6 raciones de comida, D8 monedas de plata",
            "Cuchillo, varita, grimorio, antorcha, yesca y pedernal, D6 raciones de comida, D8 monedas de plata",
            "Amuleto, grimorio, piel para dormir, antorcha, yesca y pedernal, D6 raciones de comida, D8 monedas de plata"
        ],
        "nicknames": ["Raízlarga", "Gibaterca", "Capagris", "Manotormenta", "Varacoja", "Portasombras"]
    },
    "Mercader": {
        "key_attribute": "CAR",
        "skills": ["Alerta", "Conocimiento", "Descubrir", "Elocuencia", "Engaño", "Idiomas", "Persuadir", "Regatear"],
        "heroic_ability": "Cazatesoros (habilidad para tasar riquezas, encontrar reliquias ocultas y conseguir los mejores precios)",
        "equipment_packages": [
            "Balanza de mercader, daga, ropa fina, bolsa de cuero, mulo o burro de carga, D6 raciones, D20 monedas de plata",
            "Espada corta, armadura de cuero, catalejo, libro de cuentas, yesca y pedernal, D6 raciones, D15 monedas de plata",
            "Ballesta de mano, virotes, cofre pequeño con cerradura, capa de comerciante, D6 raciones, D20 monedas de plata"
        ],
        "nicknames": ["Bolsas Llenas", "El Regateador", "Plata Pura", "El Zorro", "Cienmonedas", "Ojo de Oro"]
    },
    "Marinero": {
        "key_attribute": "AGI",
        "skills": ["Alerta", "Atletismo", "Caza y pesca", "Cuchillos", "Espadas", "Idiomas", "Marinería", "Nadar"],
        "heroic_ability": "Piernas de mar (equilibrio perfecto en terrenos movedizos o cubiertas de barcos, ventaja en combate sobre agua)",
        "equipment_packages": [
            "Daga, arco corto, cuerda (cáñamo), arpeo, piel para dormir, antorcha, yesca y pedernal, D8 raciones, D10 monedas de plata",
            "Cimitarra, armadura de cuero, cuerda (cáñamo), arpeo, antorcha, yesca y pedernal, D8 raciones, D10 monedas de plata",
            "Tridente, catalejo, cuerda (cáñamo), arpeo, antorcha, yesca y pedernal, D8 raciones, D10 monedas de plata"
        ],
        "nicknames": ["Aguablanca", "Cabalgaolas", "Nacido de la Espuma", "Salmuera", "Lobo de Mar", "Surcatormentas"]
    }
}

content = f"""// Base de Datos Oficial de Dragonbane (Edición Devir España)
// Extraída directamente del Manual de Reglas Oficial

export const DEBILIDADES = {json.dumps(debilidades, ensure_ascii=False, indent=2)};

export const RECUERDOS = {json.dumps(recuerdos, ensure_ascii=False, indent=2)};

export const RAZAS = {json.dumps(races_data, ensure_ascii=False, indent=2)};

export const PROFESIONES = {json.dumps(professions_data, ensure_ascii=False, indent=2)};

export const REGLAS_EDAD = {{
  "Joven": {{
    "mod_attr": {{ "agility": 1, "constitution": 1 }},
    "trained_profession": 6,
    "trained_free": 2,
    "total_trained": 8,
    "desc": "+1 AGI y +1 CON (máx 18). 6 habilidades de profesión + 2 habilidades libres entrenadas."
  }},
  "Adulto": {{
    "mod_attr": {{}},
    "trained_profession": 6,
    "trained_free": 4,
    "total_trained": 10,
    "desc": "Sin modificación a atributos. 6 habilidades de profesión + 4 habilidades libres entrenadas."
  }},
  "Viejo": {{
    "mod_attr": {{ "strength": -2, "agility": -2, "constitution": -2, "intelligence": 1, "willpower": 1 }},
    "trained_profession": 6,
    "trained_free": 6,
    "total_trained": 12,
    "desc": "-2 FUE, -2 AGI, -2 CON, +1 INT, +1 VOL. 6 habilidades de profesión + 6 habilidades libres entrenadas."
  }}
}};

export function getBaseSkillLevel(attrValue) {
  const val = parseInt(attrValue, 10) || 0;
  if (val <= 5) return 3;
  if (val <= 8) return 4;
  if (val <= 12) return 5;
  if (val <= 15) return 6;
  return 7;
}

export function getMovement(raceName, agility) {
  const baseMove = RAZAS[raceName]?.movement || 10;
  const agi = parseInt(agility, 10) || 10;
  let agiMod = 0;
  if (agi <= 6) agiMod = -4;
  else if (agi <= 9) agiMod = -2;
  else if (agi >= 16) agiMod = 4;
  else if (agi >= 13) agiMod = 2;
  return Math.max(2, baseMove + agiMod);
}
"""

with open(r'frontend\src\data\dragonbaneOfficialData.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("¡Archivo frontend/src/data/dragonbaneOfficialData.js generado con éxito!")
