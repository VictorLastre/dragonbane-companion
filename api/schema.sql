-- Base de datos para Dragonbane Companion
-- Compatible con MySQL 5.7+ / 8.0+ / MariaDB (XAMPP y Hostinger)

CREATE DATABASE IF NOT EXISTS `dragonbane_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `dragonbane_db`;

-- Tabla de Personajes
CREATE TABLE IF NOT EXISTS `characters` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `player_name` VARCHAR(100) DEFAULT '',
    `name` VARCHAR(100) NOT NULL,
    `kin` VARCHAR(50) DEFAULT '',         -- Raza (Humano, Elfo, Enano, Halfling, Mallard, etc.)
    `profession` VARCHAR(50) DEFAULT '',  -- Profesión (Guerrero, Cazador, Mago, Pícaro, etc.)
    `age` VARCHAR(20) DEFAULT 'Adulto',   -- Joven, Adulto, Anciano
    `appearance` TEXT,
    
    -- Atributos Básicos
    `strength` INT DEFAULT 10,
    `constitution` INT DEFAULT 10,
    `agility` INT DEFAULT 10,
    `intelligence` INT DEFAULT 10,
    `willpower` INT DEFAULT 10,
    `charisma` INT DEFAULT 10,

    -- Recursos y Estado
    `hp_current` INT DEFAULT 10,
    `hp_max` INT DEFAULT 10,
    `wp_current` INT DEFAULT 10,          -- Puntos de Voluntad (PC / Willpower Points)
    `wp_max` INT DEFAULT 10,
    
    -- Daño Adicional / Movimiento
    `movement` INT DEFAULT 10,
    `damage_bonus_str` VARCHAR(20) DEFAULT '',
    `damage_bonus_agi` VARCHAR(20) DEFAULT '',

    -- Condiciones (JSON con flags booleanos: exhausted, sickly, dazed, angry, scared, disheartened)
    `conditions` JSON,

    -- Habilidades (JSON con nombres, nivel de habilidad, dado base, marcado para avance)
    `skills` JSON,

    -- Habilidades Heroicas y Magia
    `heroic_abilities` JSON,
    `spells` JSON,

    -- Armas, Armaduras y Equipo
    `weapons` JSON,
    `armor` JSON,
    `inventory` JSON,
    
    -- Monedas
    `gold` INT DEFAULT 0,
    `silver` INT DEFAULT 0,
    `copper` INT DEFAULT 0,

    -- Trasfondo y Roleo
    `memento` VARCHAR(255) DEFAULT '',    -- Recuerdo
    `tiny_items` TEXT,                   -- Objetos diminutos
    `backstory` TEXT,                     -- Historia del personaje
    `notes` TEXT,                         -- Notas del jugador / máster

    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Tiendas y Mercaderes
CREATE TABLE IF NOT EXISTS `shops` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `location` VARCHAR(100) NOT NULL,     -- Aldea de los Sauces, Fuerte Fronterizo, etc.
    `name` VARCHAR(100) NOT NULL,         -- La Fragua Humeante, Botica de Elend, etc.
    `shop_type` VARCHAR(50) DEFAULT 'General', -- Herrería, Alquimia, Armas, Taberna, etc.
    `description` TEXT,
    `items` JSON,                         -- Listado de productos: nombre, precio, stock, descripción
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla para Visor en Vivo / Pantalla Compartida (Proyector / TV)
CREATE TABLE IF NOT EXISTS `screen_broadcast` (
    `id` INT PRIMARY KEY DEFAULT 1,
    `mode` ENUM('hidden', 'npc', 'map', 'lore') DEFAULT 'hidden',
    `title` VARCHAR(150) DEFAULT '',
    `subtitle` VARCHAR(150) DEFAULT '',
    `image_url` TEXT,
    `description` TEXT,
    `is_active` BOOLEAN DEFAULT FALSE,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Fila inicial para el visor
INSERT INTO `screen_broadcast` (`id`, `mode`, `title`, `is_active`)
VALUES (1, 'hidden', 'Pantalla de Espera', FALSE)
ON DUPLICATE KEY UPDATE `id` = 1;
