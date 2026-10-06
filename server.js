const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Configuración de conexión MySQL
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS !== undefined ? process.env.DB_PASS : (process.env.DB_PASSWORD || ''),
  database: process.env.DB_NAME || 'dragonbane_db',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool = null;

async function getPool() {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

// Inicializar tablas automáticamente si no existen
async function initDatabase() {
  try {
    const p = await getPool();
    await p.query(`
      CREATE TABLE IF NOT EXISTS \`characters\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`player_name\` VARCHAR(100) DEFAULT '',
        \`name\` VARCHAR(100) NOT NULL,
        \`kin\` VARCHAR(50) DEFAULT '',
        \`profession\` VARCHAR(50) DEFAULT '',
        \`age\` VARCHAR(20) DEFAULT 'Adulto',
        \`weakness\` VARCHAR(255) DEFAULT '',
        \`appearance\` TEXT,
        \`strength\` INT DEFAULT 10,
        \`constitution\` INT DEFAULT 10,
        \`agility\` INT DEFAULT 10,
        \`intelligence\` INT DEFAULT 10,
        \`willpower\` INT DEFAULT 10,
        \`charisma\` INT DEFAULT 10,
        \`hp_current\` INT DEFAULT 10,
        \`hp_max\` INT DEFAULT 10,
        \`wp_current\` INT DEFAULT 10,
        \`wp_max\` INT DEFAULT 10,
        \`movement\` INT DEFAULT 10,
        \`damage_bonus_str\` VARCHAR(20) DEFAULT '',
        \`damage_bonus_agi\` VARCHAR(20) DEFAULT '',
        \`conditions\` JSON,
        \`skills\` JSON,
        \`secondary_skills\` JSON,
        \`heroic_abilities_and_spells\` TEXT,
        \`weapons\` JSON,
        \`armor\` JSON,
        \`helmet\` JSON,
        \`inventory\` JSON,
        \`gold\` INT DEFAULT 0,
        \`silver\` INT DEFAULT 0,
        \`copper\` INT DEFAULT 0,
        \`memento\` VARCHAR(255) DEFAULT '',
        \`tiny_items\` TEXT,
        \`rests\` JSON,
        \`death_saves\` JSON,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await p.query(`
      CREATE TABLE IF NOT EXISTS \`shops\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`location\` VARCHAR(100) NOT NULL,
        \`name\` VARCHAR(100) NOT NULL,
        \`shop_type\` VARCHAR(50) DEFAULT 'General',
        \`description\` TEXT,
        \`items\` JSON,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await p.query(`
      CREATE TABLE IF NOT EXISTS \`screen_broadcast\` (
        \`id\` INT PRIMARY KEY DEFAULT 1,
        \`mode\` ENUM('hidden', 'npc', 'map', 'lore') DEFAULT 'hidden',
        \`title\` VARCHAR(150) DEFAULT '',
        \`subtitle\` VARCHAR(150) DEFAULT '',
        \`image_url\` TEXT,
        \`description\` TEXT,
        \`is_active\` BOOLEAN DEFAULT FALSE,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await p.query(`
      INSERT INTO \`screen_broadcast\` (\`id\`, \`mode\`, \`title\`, \`is_active\`)
      VALUES (1, 'hidden', 'Pantalla de Espera', FALSE)
      ON DUPLICATE KEY UPDATE \`id\` = 1;
    `);

    await p.query(`
      CREATE TABLE IF NOT EXISTS \`campaigns\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`code\` VARCHAR(32) UNIQUE NOT NULL,
        \`name\` VARCHAR(150) NOT NULL,
        \`description\` TEXT,
        \`gm_name\` VARCHAR(100) DEFAULT 'Director de Juego',
        \`gm_pass\` VARCHAR(100) NOT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Helper seguro para añadir columnas si no existen
    const checkAndAddColumn = async (table, col, colDef) => {
      try {
        const [cols] = await p.query(
          `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
          [dbConfig.database, table, col]
        );
        if (cols.length === 0) {
          await p.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${col}\` ${colDef}`);
          console.log(`✓ Columna ${col} añadida a ${table}`);
        }
      } catch (e) {
        console.warn(`Aviso migración columna ${col}:`, e.message);
      }
    };

    await checkAndAddColumn('campaigns', 'active_location', "VARCHAR(100) DEFAULT 'Puerto Brumoso'");
    await checkAndAddColumn('campaigns', 'unlocked_features', 'JSON NULL');
    await checkAndAddColumn('characters', 'weakness', 'VARCHAR(255) DEFAULT ""');
    await checkAndAddColumn('characters', 'secondary_skills', 'JSON');
    await checkAndAddColumn('characters', 'heroic_abilities_and_spells', 'TEXT');
    await checkAndAddColumn('characters', 'helmet', 'JSON');
    await checkAndAddColumn('characters', 'rests', 'JSON');
    await checkAndAddColumn('characters', 'death_saves', 'JSON');
    await checkAndAddColumn('characters', 'campaign_code', 'VARCHAR(32) NULL');
    await checkAndAddColumn('characters', 'player_token', 'VARCHAR(64) NULL');
    await checkAndAddColumn('characters', 'is_npc', 'TINYINT(1) DEFAULT 0');
    await checkAndAddColumn('screen_broadcast', 'campaign_code', 'VARCHAR(32) NULL');
    await checkAndAddColumn('shops', 'campaign_code', 'VARCHAR(32) NULL');
    await checkAndAddColumn('shops', 'is_unlocked', 'TINYINT(1) DEFAULT 1');
    await checkAndAddColumn('shops', 'scale', "VARCHAR(50) DEFAULT 'lugar_de_paso'");
    await checkAndAddColumn('shops', 'environment', "VARCHAR(50) DEFAULT 'costero'");
    await checkAndAddColumn('shops', 'keeper_name', "VARCHAR(100) DEFAULT ''");

    console.log('✓ Base de datos, campañas, tiendas y tablas de Dragonbane listas');
  } catch (err) {
    console.error('Aviso de conexión MySQL:', err.message);
  }
}

function parseJsonFields(char) {
  if (!char) return null;
  const jsonFields = ['conditions', 'skills', 'secondary_skills', 'weapons', 'armor', 'helmet', 'inventory', 'rests', 'death_saves'];
  for (const f of jsonFields) {
    if (typeof char[f] === 'string') {
      try {
        char[f] = JSON.parse(char[f]);
      } catch (e) {
        char[f] = null;
      }
    }
  }
  return char;
}

// -------------------------------------------------------------
// ENDPOINTS API REST (Soporta formato REST y alias .php)
// -------------------------------------------------------------

app.get('/api/health', async (req, res) => {
  try {
    const p = await getPool();
    await p.query('SELECT 1');
    res.json({ success: true, status: 'ok', mysql: 'connected' });
  } catch (err) {
    res.json({ success: false, status: 'degraded', mysql_error: err.message });
  }
});

// Helper generar código de campaña limpio y amigable
function generateCampaignCode(name) {
  const clean = (name || 'DRAGON')
    .toUpperCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 6) || 'DRAGON';
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${clean}-${rand}`;
}

// -------------------------------------------------------------
// CAMPAÑAS Y ROLES (DIRECTOR DE JUEGO / JUGADORES)
// -------------------------------------------------------------

// POST Crear Campaña
app.post(['/api/campaigns', '/api/campaigns.php'], async (req, res) => {
  try {
    const { name, description, gm_name, gm_pass } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'El nombre de la campaña es obligatorio' });
    }
    const code = generateCampaignCode(name);
    const pass = gm_pass && gm_pass.trim() ? gm_pass.trim() : 'master123';
    const gm = gm_name && gm_name.trim() ? gm_name.trim() : 'Director de Juego';

    const p = await getPool();
    const [result] = await p.query(
      'INSERT INTO campaigns (code, name, description, gm_name, gm_pass) VALUES (?, ?, ?, ?, ?)',
      [code, name.trim(), description || '', gm, pass]
    );

    res.status(201).json({
      success: true,
      campaign: {
        id: result.insertId,
        code,
        name: name.trim(),
        description: description || '',
        gm_name: gm
      },
      is_gm: true,
      message: 'Campaña creada con éxito'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET Consultar Campaña y Resumen de Héroes del Grupo (Party HUD)
app.get(['/api/campaigns/:code', '/api/campaigns.php'], async (req, res) => {
  try {
    const code = (req.params.code || req.query.code || '').toUpperCase();
    if (!code) return res.status(400).json({ success: false, message: 'Código de campaña requerido' });

    const p = await getPool();
    const [rows] = await p.query(
      'SELECT id, code, name, description, gm_name, active_location, unlocked_features, created_at FROM campaigns WHERE code = ? OR UPPER(name) = ? OR UPPER(REPLACE(name, " ", "")) = ?',
      [code, code, code]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Campaña no encontrada' });
    }

    const campaign = rows[0];
    if (typeof campaign.unlocked_features === 'string') {
      try { campaign.unlocked_features = JSON.parse(campaign.unlocked_features); } catch(e) { campaign.unlocked_features = {}; }
    } else if (!campaign.unlocked_features) {
      campaign.unlocked_features = { shops: false, map: true, tv: false };
    }

    // Obtener SOLO los héroes vinculados a esta campaña
    const [party] = await p.query(
      'SELECT id, name, player_name, kin, profession, hp_current, hp_max, wp_current, wp_max, conditions, is_npc, updated_at FROM characters WHERE campaign_code = ? ORDER BY is_npc ASC, updated_at DESC',
      [campaign.code]
    );

    const formattedParty = party.map(c => {
      let cond = {};
      if (typeof c.conditions === 'string') {
        try { cond = JSON.parse(c.conditions); } catch (e) { cond = {}; }
      } else if (typeof c.conditions === 'object' && c.conditions !== null) {
        cond = c.conditions;
      }
      return { ...c, conditions: cond };
    });

    res.json({
      success: true,
      campaign,
      party: formattedParty
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST Modificar Ajustes de Campaña (Ubicación activa y Secciones habilitadas por el Master)
app.post(['/api/campaigns/:code/settings', '/api/campaigns-settings.php'], async (req, res) => {
  try {
    const code = (req.params.code || req.body.code || '').toUpperCase();
    const { active_location, unlocked_features, gm_pass } = req.body;
    const p = await getPool();

    const [rows] = await p.query(
      'SELECT code, gm_pass FROM campaigns WHERE code = ? OR UPPER(name) = ?',
      [code, code]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Campaña no encontrada' });
    }

    const campaignCode = rows[0].code;

    const updates = [];
    const params = [];

    if (active_location !== undefined) {
      updates.push('active_location = ?');
      params.push(active_location);
    }
    if (unlocked_features !== undefined) {
      updates.push('unlocked_features = ?');
      params.push(typeof unlocked_features === 'object' ? JSON.stringify(unlocked_features) : unlocked_features);
    }

    if (updates.length > 0) {
      params.push(campaignCode);
      await p.query(`UPDATE campaigns SET ${updates.join(', ')} WHERE code = ?`, params);
    }

    res.json({ success: true, message: 'Ajustes de campaña actualizados correctamente' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST Validar contraseña de Master para una campaña
app.post(['/api/campaigns/:code/login-gm', '/api/campaigns-login.php'], async (req, res) => {
  try {
    const code = (req.params.code || req.body.code || '').toUpperCase();
    const { gm_pass } = req.body;
    if (!code || !gm_pass) {
      return res.status(400).json({ success: false, message: 'Código y clave de master requeridos' });
    }

    const p = await getPool();
    const [rows] = await p.query(
      'SELECT code, gm_pass FROM campaigns WHERE code = ? OR UPPER(name) = ? OR UPPER(REPLACE(name, " ", "")) = ?',
      [code, code, code]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Campaña no encontrada' });
    }

    if (rows[0].gm_pass === gm_pass.trim()) {
      res.json({ success: true, is_gm: true, code: rows[0].code, message: 'Acceso concedido como Director de Juego' });
    } else {
      res.status(401).json({ success: false, message: 'Clave de Director de Juego incorrecta' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// ENDPOINTS PERSONAJES
// -------------------------------------------------------------

// GET Personajes (filtrado estricto por campaña o personajes locales sin campaña)
const getCharactersHandler = async (req, res) => {
  try {
    const p = await getPool();
    const id = req.params.id || req.query.id;
    const campaign_code = req.query.campaign_code ? req.query.campaign_code.toUpperCase() : null;

    if (id) {
      const [rows] = await p.query('SELECT * FROM characters WHERE id = ?', [id]);
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Personaje no encontrado' });
      }
      return res.json({ success: true, character: parseJsonFields(rows[0]) });
    }

    let sql = 'SELECT id, name, player_name, kin, profession, hp_current, hp_max, wp_current, wp_max, conditions, is_npc, campaign_code, player_token, updated_at FROM characters';
    const params = [];

    if (campaign_code) {
      sql += ' WHERE campaign_code = ?';
      params.push(campaign_code);
    } else {
      // Si no se especifica campaña, SOLO devolver personajes que no pertenezcan a ninguna campaña
      sql += ' WHERE campaign_code IS NULL OR campaign_code = ""';
    }
    sql += ' ORDER BY is_npc ASC, updated_at DESC';

    const [rows] = await p.query(sql, params);
    res.json({ success: true, characters: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

app.get('/api/characters', getCharactersHandler);
app.get('/api/characters.php', getCharactersHandler);
app.get('/api/characters/:id', getCharactersHandler);

// POST Crear Personaje
const createCharacterHandler = async (req, res) => {
  try {
    const data = req.body;
    const p = await getPool();
    const sql = `
      INSERT INTO characters (
        player_name, name, kin, profession, age, weakness, appearance,
        strength, constitution, agility, intelligence, willpower, charisma,
        hp_current, hp_max, wp_current, wp_max,
        movement, damage_bonus_str, damage_bonus_agi,
        conditions, skills, secondary_skills, heroic_abilities_and_spells,
        weapons, armor, helmet, inventory,
        gold, silver, copper,
        memento, tiny_items, rests, death_saves,
        campaign_code, player_token, is_npc
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      data.player_name || '',
      data.name || 'Sin nombre',
      data.kin || '',
      data.profession || '',
      data.age || 'Adulto',
      data.weakness || '',
      data.appearance || '',
      parseInt(data.strength, 10) || 10,
      parseInt(data.constitution, 10) || 10,
      parseInt(data.agility, 10) || 10,
      parseInt(data.intelligence, 10) || 10,
      parseInt(data.willpower, 10) || 10,
      parseInt(data.charisma, 10) || 10,
      parseInt(data.hp_current, 10) || 10,
      parseInt(data.hp_max, 10) || 10,
      parseInt(data.wp_current, 10) || 10,
      parseInt(data.wp_max, 10) || 10,
      parseInt(data.movement, 10) || 10,
      data.damage_bonus_str || '',
      data.damage_bonus_agi || '',
      JSON.stringify(data.conditions || {}),
      JSON.stringify(data.skills || []),
      JSON.stringify(data.secondary_skills || []),
      data.heroic_abilities_and_spells || '',
      JSON.stringify(data.weapons || []),
      JSON.stringify(data.armor || {}),
      JSON.stringify(data.helmet || {}),
      JSON.stringify(data.inventory || []),
      parseInt(data.gold, 10) || 0,
      parseInt(data.silver, 10) || 0,
      parseInt(data.copper, 10) || 0,
      data.memento || '',
      data.tiny_items || '',
      JSON.stringify(data.rests || {}),
      JSON.stringify(data.death_saves || {}),
      data.campaign_code ? data.campaign_code.toUpperCase() : null,
      data.player_token || null,
      data.is_npc ? 1 : 0
    ];

    const [result] = await p.query(sql, values);
    res.status(201).json({ success: true, id: result.insertId, message: 'Personaje creado con éxito' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

app.post('/api/characters', createCharacterHandler);
app.post('/api/characters.php', createCharacterHandler);

// PUT Actualizar Personaje
const updateCharacterHandler = async (req, res) => {
  try {
    const data = req.body;
    const id = req.params.id || req.query.id || data.id;
    if (!id) return res.status(400).json({ success: false, message: 'ID no especificado' });

    const p = await getPool();
    const sql = `
      UPDATE characters SET
        player_name = ?, name = ?, kin = ?, profession = ?, age = ?, weakness = ?, appearance = ?,
        strength = ?, constitution = ?, agility = ?, intelligence = ?, willpower = ?, charisma = ?,
        hp_current = ?, hp_max = ?, wp_current = ?, wp_max = ?,
        movement = ?, damage_bonus_str = ?, damage_bonus_agi = ?,
        conditions = ?, skills = ?, secondary_skills = ?, heroic_abilities_and_spells = ?,
        weapons = ?, armor = ?, helmet = ?, inventory = ?,
        gold = ?, silver = ?, copper = ?,
        memento = ?, tiny_items = ?, rests = ?, death_saves = ?,
        campaign_code = COALESCE(?, campaign_code),
        is_npc = COALESCE(?, is_npc)
      WHERE id = ?
    `;

    const values = [
      data.player_name || '',
      data.name || 'Sin nombre',
      data.kin || '',
      data.profession || '',
      data.age || 'Adulto',
      data.weakness || '',
      data.appearance || '',
      parseInt(data.strength, 10) || 10,
      parseInt(data.constitution, 10) || 10,
      parseInt(data.agility, 10) || 10,
      parseInt(data.intelligence, 10) || 10,
      parseInt(data.willpower, 10) || 10,
      parseInt(data.charisma, 10) || 10,
      parseInt(data.hp_current, 10) || 10,
      parseInt(data.hp_max, 10) || 10,
      parseInt(data.wp_current, 10) || 10,
      parseInt(data.wp_max, 10) || 10,
      parseInt(data.movement, 10) || 10,
      data.damage_bonus_str || '',
      data.damage_bonus_agi || '',
      JSON.stringify(data.conditions || {}),
      JSON.stringify(data.skills || []),
      JSON.stringify(data.secondary_skills || []),
      data.heroic_abilities_and_spells || '',
      JSON.stringify(data.weapons || []),
      JSON.stringify(data.armor || {}),
      JSON.stringify(data.helmet || {}),
      JSON.stringify(data.inventory || []),
      parseInt(data.gold, 10) || 0,
      parseInt(data.silver, 10) || 0,
      parseInt(data.copper, 10) || 0,
      data.memento || '',
      data.tiny_items || '',
      JSON.stringify(data.rests || {}),
      JSON.stringify(data.death_saves || {}),
      data.campaign_code ? data.campaign_code.toUpperCase() : null,
      data.is_npc !== undefined ? (data.is_npc ? 1 : 0) : null,
      id
    ];

    await p.query(sql, values);
    res.json({ success: true, message: 'Personaje actualizado correctamente' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

app.put('/api/characters/:id', updateCharacterHandler);
app.put('/api/characters.php', updateCharacterHandler);

// DELETE Personaje
const deleteCharacterHandler = async (req, res) => {
  try {
    const id = req.params.id || req.query.id;
    if (!id) return res.status(400).json({ success: false, message: 'ID no especificado' });

    const p = await getPool();
    await p.query('DELETE FROM characters WHERE id = ?', [id]);
    res.json({ success: true, message: 'Personaje eliminado' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

app.delete('/api/characters/:id', deleteCharacterHandler);
app.delete('/api/characters.php', deleteCharacterHandler);

// -------------------------------------------------------------
// TIENDAS, MERCADOS Y GENERADOR DE ASENTAMIENTOS
// -------------------------------------------------------------

// GET Tiendas de la campaña y ubicación actual
app.get(['/api/shops', '/api/shops.php'], async (req, res) => {
  try {
    const p = await getPool();
    const location = req.query.location ? req.query.location.trim() : null;
    const campaign_code = req.query.campaign_code ? req.query.campaign_code.toUpperCase().trim() : null;
    const is_gm = req.query.is_gm === 'true' || req.query.is_gm === '1';

    let sql = 'SELECT * FROM shops';
    const conditions = [];
    const params = [];

    if (campaign_code) {
      conditions.push('(campaign_code = ? OR campaign_code IS NULL OR campaign_code = "")');
      params.push(campaign_code);
    }
    if (location) {
      conditions.push('location = ?');
      params.push(location);
    }
    if (!is_gm) {
      conditions.push('is_unlocked = 1');
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY id ASC';

    const [rows] = await p.query(sql, params);
    const shops = rows.map(s => ({
      ...s,
      is_unlocked: s.is_unlocked !== 0,
      items: typeof s.items === 'string' ? JSON.parse(s.items) : (s.items || [])
    }));
    res.json({ success: true, shops });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST Guardar lote de tiendas generadas para un asentamiento (Generador Procedural)
app.post(['/api/shops/batch', '/api/shops-batch.php'], async (req, res) => {
  try {
    const { campaign_code, location, shops } = req.body;
    if (!location || !Array.isArray(shops)) {
      return res.status(400).json({ success: false, message: 'Ubicación y lista de tiendas requeridas' });
    }

    const p = await getPool();
    const campCode = campaign_code ? campaign_code.toUpperCase().trim() : null;

    // Eliminar tiendas previas de esta ubicación para esta campaña
    if (campCode) {
      await p.query('DELETE FROM shops WHERE location = ? AND campaign_code = ?', [location.trim(), campCode]);
    } else {
      await p.query('DELETE FROM shops WHERE location = ? AND (campaign_code IS NULL OR campaign_code = "")', [location.trim()]);
    }

    // Insertar nuevas tiendas
    for (const shop of shops) {
      await p.query(
        'INSERT INTO shops (campaign_code, location, name, shop_type, keeper_name, description, scale, environment, is_unlocked, items) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          campCode,
          location.trim(),
          shop.name || 'Puesto Comercial',
          shop.shop_type || 'General',
          shop.keeper_name || '',
          shop.description || '',
          shop.scale || 'lugar_de_paso',
          shop.environment || 'costero',
          shop.is_unlocked !== false ? 1 : 0,
          JSON.stringify(shop.items || [])
        ]
      );
    }

    res.json({ success: true, message: `Asentamiento "${location}" generado con ${shops.length} tiendas.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST Crear o actualizar tienda individual
app.post(['/api/shops', '/api/shops.php'], async (req, res) => {
  try {
    const data = req.body;
    if (!data.name || !data.location) {
      return res.status(400).json({ success: false, message: 'Nombre y ubicación obligatorios' });
    }

    const p = await getPool();
    const campCode = data.campaign_code ? data.campaign_code.toUpperCase().trim() : null;

    const [result] = await p.query(
      'INSERT INTO shops (campaign_code, location, name, shop_type, keeper_name, description, scale, environment, is_unlocked, items) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        campCode,
        data.location.trim(),
        data.name.trim(),
        data.shop_type || 'General',
        data.keeper_name || '',
        data.description || '',
        data.scale || 'lugar_de_paso',
        data.environment || 'costero',
        data.is_unlocked !== false ? 1 : 0,
        JSON.stringify(data.items || [])
      ]
    );

    res.status(201).json({ success: true, id: result.insertId, message: 'Tienda creada con éxito' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT Alternar visibilidad de una tienda para los jugadores
app.put(['/api/shops/:id/toggle', '/api/shops-toggle.php'], async (req, res) => {
  try {
    const id = req.params.id || req.body.id;
    if (!id) return res.status(400).json({ success: false, message: 'ID de tienda requerido' });

    const p = await getPool();
    let newUnlocked;

    if (req.body.is_unlocked !== undefined) {
      newUnlocked = req.body.is_unlocked ? 1 : 0;
      await p.query('UPDATE shops SET is_unlocked = ? WHERE id = ?', [newUnlocked, id]);
    } else {
      await p.query('UPDATE shops SET is_unlocked = NOT is_unlocked WHERE id = ?', [id]);
      const [rows] = await p.query('SELECT is_unlocked FROM shops WHERE id = ?', [id]);
      newUnlocked = rows[0]?.is_unlocked;
    }

    res.json({ success: true, is_unlocked: newUnlocked === 1, message: 'Visibilidad de la tienda actualizada' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE Borrar todas las tiendas de una ubicación
app.post(['/api/shops/clear', '/api/shops-clear.php'], async (req, res) => {
  try {
    const { location, campaign_code } = req.body;
    if (!location) return res.status(400).json({ success: false, message: 'Ubicación requerida' });

    const p = await getPool();
    const campCode = campaign_code ? campaign_code.toUpperCase().trim() : null;

    if (campCode) {
      await p.query('DELETE FROM shops WHERE location = ? AND campaign_code = ?', [location.trim(), campCode]);
    } else {
      await p.query('DELETE FROM shops WHERE location = ?', [location.trim()]);
    }

    res.json({ success: true, message: `Tiendas de "${location}" eliminadas` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE Borrar tienda individual
app.delete(['/api/shops/:id', '/api/shops.php'], async (req, res) => {
  try {
    const id = req.params.id || req.query.id;
    if (!id) return res.status(400).json({ success: false, message: 'ID de tienda requerido' });

    const p = await getPool();
    await p.query('DELETE FROM shops WHERE id = ?', [id]);
    res.json({ success: true, message: 'Tienda eliminada' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Pantalla Compartida / Visor TV
const getScreenHandler = async (req, res) => {
  try {
    const p = await getPool();
    const [rows] = await p.query('SELECT * FROM screen_broadcast WHERE id = 1');
    res.json({ success: true, screen: rows[0] || {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const updateScreenHandler = async (req, res) => {
  try {
    const p = await getPool();
    const data = req.body;
    const sql = `
      INSERT INTO screen_broadcast (id, mode, title, subtitle, image_url, description, is_active)
      VALUES (1, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        mode = VALUES(mode),
        title = VALUES(title),
        subtitle = VALUES(subtitle),
        image_url = VALUES(image_url),
        description = VALUES(description),
        is_active = VALUES(is_active)
    `;
    await p.query(sql, [
      data.mode || 'npc',
      data.title || '',
      data.subtitle || '',
      data.image_url || '',
      data.description || '',
      data.is_active ? 1 : 0
    ]);
    res.json({ success: true, message: 'Pantalla actualizada' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

app.get('/api/screen', getScreenHandler);
app.get('/api/screen.php', getScreenHandler);
app.post('/api/screen', updateScreenHandler);
app.post('/api/screen.php', updateScreenHandler);

// Servir frontend estático en producción
const distPath = path.join(__dirname, 'frontend/dist');
app.use(express.static(distPath));

// Fallback para SPA en cualquier ruta no API
app.use((req, res) => {
  const indexFile = path.join(distPath, 'index.html');
  res.sendFile(indexFile);
});

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`🚀 Dragonbane Companion activo en el puerto ${PORT}`);
  await initDatabase();
});
