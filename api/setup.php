<?php
// Script de instalación automática de tablas para Dragonbane Companion
// Permite inicializar o verificar la base de datos tanto en XAMPP como en Hostinger

require_once __DIR__ . '/config.php';

$schemaFile = __DIR__ . '/schema.sql';
if (!file_exists($schemaFile)) {
    sendJsonResponse(['success' => false, 'message' => 'No se encontró schema.sql'], 404);
}

try {
    $sql = file_get_contents($schemaFile);
    // Ejecutar las sentencias SQL
    $pdo->exec($sql);

    // Insertar datos de prueba para Dragonbane si la tabla está vacía
    $check = $pdo->query("SELECT COUNT(*) as cnt FROM `characters`")->fetch();
    if ($check && $check['cnt'] == 0) {
        $sampleChar = [
            'player_name' => 'Jugador Demo',
            'name' => 'Grimm Sombrío',
            'kin' => 'Enano',
            'profession' => 'Guerrero',
            'age' => 'Adulto',
            'appearance' => 'Barba trenzada, armadura de placas gastada y hacha a dos manos.',
            'strength' => 14,
            'constitution' => 15,
            'agility' => 11,
            'intelligence' => 9,
            'willpower' => 13,
            'charisma' => 10,
            'hp_current' => 15,
            'hp_max' => 15,
            'wp_current' => 13,
            'wp_max' => 13,
            'movement' => 8,
            'damage_bonus_str' => '+d4',
            'damage_bonus_agi' => '',
            'conditions' => [
                'exhausted' => false,
                'sickly' => false,
                'dazed' => false,
                'angry' => false,
                'scared' => false,
                'disheartened' => false
            ],
            'skills' => [
                ['name' => 'Hachas', 'level' => 14, 'advancement' => false],
                ['name' => 'Aguante', 'level' => 12, 'advancement' => false],
                ['name' => 'Fuerza bruta', 'level' => 13, 'advancement' => false],
                ['name' => 'Alerta', 'level' => 10, 'advancement' => false],
                ['name' => 'Esquivar', 'level' => 11, 'advancement' => false],
                ['name' => 'Supervivencia', 'level' => 8, 'advancement' => false]
            ],
            'heroic_abilities' => [
                ['name' => 'Veterano de Hierro', 'description' => 'Gasta 3 PC para ignorar el daño de un ataque.']
            ],
            'weapons' => [
                ['name' => 'Hacha de Guerra', 'damage' => '2d8', 'range' => 'Cuerpo a cuerpo', 'grip' => '2H', 'durability' => 15]
            ],
            'armor' => [
                ['name' => 'Cota de Malla', 'rating' => 4, 'bane' => 'Esquivar']
            ],
            'inventory' => [
                ['item' => 'Antorchas (3)', 'slots' => 1],
                ['item' => 'Raciones de viaje (5)', 'slots' => 1],
                ['item' => 'Cuerda de cáñamo 10m', 'slots' => 1]
            ],
            'gold' => 12,
            'silver' => 35,
            'copper' => 40,
            'memento' => 'Un anillo de piedra grabado con la runa de su clan caído',
            'tiny_items' => 'Piedra de afilar, pipa de brezo',
            'backstory' => 'Último superviviente del Clan del Pico Nevado, busca restaurar el honor de sus ancestros.',
            'notes' => 'Le debe 5 monedas de plata al herrero de la aldea.'
        ];

        $ins = $pdo->prepare("INSERT INTO `characters` (
            `player_name`, `name`, `kin`, `profession`, `age`, `appearance`,
            `strength`, `constitution`, `agility`, `intelligence`, `willpower`, `charisma`,
            `hp_current`, `hp_max`, `wp_current`, `wp_max`,
            `movement`, `damage_bonus_str`, `damage_bonus_agi`,
            `conditions`, `skills`, `heroic_abilities`, `weapons`, `armor`, `inventory`,
            `gold`, `silver`, `copper`, `memento`, `tiny_items`, `backstory`, `notes`
        ) VALUES (
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?, ?,
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?, ?
        )");

        $ins->execute([
            $sampleChar['player_name'], $sampleChar['name'], $sampleChar['kin'], $sampleChar['profession'], $sampleChar['age'], $sampleChar['appearance'],
            $sampleChar['strength'], $sampleChar['constitution'], $sampleChar['agility'], $sampleChar['intelligence'], $sampleChar['willpower'], $sampleChar['charisma'],
            $sampleChar['hp_current'], $sampleChar['hp_max'], $sampleChar['wp_current'], $sampleChar['wp_max'],
            $sampleChar['movement'], $sampleChar['damage_bonus_str'], $sampleChar['damage_bonus_agi'],
            json_encode($sampleChar['conditions']), json_encode($sampleChar['skills']), json_encode($sampleChar['heroic_abilities']),
            json_encode($sampleChar['weapons']), json_encode($sampleChar['armor']), json_encode($sampleChar['inventory']),
            $sampleChar['gold'], $sampleChar['silver'], $sampleChar['copper'],
            $sampleChar['memento'], $sampleChar['tiny_items'], $sampleChar['backstory'], $sampleChar['notes']
        ]);
    }

    sendJsonResponse([
        'success' => true,
        'message' => '¡Base de datos y tablas inicializadas correctamente!'
    ]);
} catch (Exception $e) {
    sendJsonResponse([
        'success' => false,
        'message' => 'Error al inicializar la base de datos: ' . $e->getMessage()
    ], 500);
}
