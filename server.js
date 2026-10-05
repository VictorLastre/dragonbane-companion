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

    console.log('✓ Base de datos y tablas de Dragonbane listas');
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

// GET Personajes (todos o por ID)
const getCharactersHandler = async (req, res) => {
  try {
    const p = await getPool();
    const id = req.params.id || req.query.id;
    if (id) {
      const [rows] = await p.query('SELECT * FROM characters WHERE id = ?', [id]);
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Personaje no encontrado' });
      }
      return res.json({ success: true, character: parseJsonFields(rows[0]) });
    }
    const [rows] = await p.query(
      'SELECT id, name, player_name, kin, profession, hp_current, hp_max, wp_current, wp_max, updated_at FROM characters ORDER BY updated_at DESC'
    );
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
        memento, tiny_items, rests, death_saves
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      JSON.stringify(data.death_saves || {})
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
        memento = ?, tiny_items = ?, rests = ?, death_saves = ?
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

// Tiendas y Mercados
app.get(['/api/shops', '/api/shops.php'], async (req, res) => {
  try {
    const p = await getPool();
    const [rows] = await p.query('SELECT * FROM shops ORDER BY location ASC, name ASC');
    const shops = rows.map(s => ({
      ...s,
      items: typeof s.items === 'string' ? JSON.parse(s.items) : (s.items || [])
    }));
    res.json({ success: true, shops });
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
