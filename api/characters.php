<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? intval($_GET['id']) : null;

// Funciones auxiliares para decodificar y codificar campos JSON
function decodeJsonFields($row) {
    if (!$row) return null;
    $jsonFields = ['conditions', 'skills', 'heroic_abilities', 'spells', 'weapons', 'armor', 'inventory'];
    foreach ($jsonFields as $field) {
        if (isset($row[$field]) && is_string($row[$field])) {
            $row[$field] = json_decode($row[$field], true) ?: [];
        } elseif (!isset($row[$field])) {
            $row[$field] = [];
        }
    }
    return $row;
}

switch ($method) {
    case 'GET':
        if ($id) {
            $stmt = $pdo->prepare("SELECT * FROM `characters` WHERE `id` = ?");
            $stmt->execute([$id]);
            $char = $stmt->fetch();
            if (!$char) {
                sendJsonResponse(['success' => false, 'message' => 'Personaje no encontrado'], 404);
            }
            sendJsonResponse(['success' => true, 'character' => decodeJsonFields($char)]);
        } else {
            // Listado de todos los personajes
            $stmt = $pdo->query("SELECT `id`, `name`, `player_name`, `kin`, `profession`, `hp_current`, `hp_max`, `wp_current`, `wp_max`, `updated_at` FROM `characters` ORDER BY `updated_at` DESC");
            $characters = $stmt->fetchAll();
            sendJsonResponse(['success' => true, 'characters' => $characters]);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data || empty($data['name'])) {
            sendJsonResponse(['success' => false, 'message' => 'El nombre del personaje es obligatorio'], 400);
        }

        $sql = "INSERT INTO `characters` (
            `player_name`, `name`, `kin`, `profession`, `age`, `appearance`,
            `strength`, `constitution`, `agility`, `intelligence`, `willpower`, `charisma`,
            `hp_current`, `hp_max`, `wp_current`, `wp_max`,
            `movement`, `damage_bonus_str`, `damage_bonus_agi`,
            `conditions`, `skills`, `heroic_abilities`, `spells`,
            `weapons`, `armor`, `inventory`,
            `gold`, `silver`, `copper`,
            `memento`, `tiny_items`, `backstory`, `notes`
        ) VALUES (
            :player_name, :name, :kin, :profession, :age, :appearance,
            :strength, :constitution, :agility, :intelligence, :willpower, :charisma,
            :hp_current, :hp_max, :wp_current, :wp_max,
            :movement, :damage_bonus_str, :damage_bonus_agi,
            :conditions, :skills, :heroic_abilities, :spells,
            :weapons, :armor, :inventory,
            :gold, :silver, :copper,
            :memento, :tiny_items, :backstory, :notes
        )";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':player_name'      => $data['player_name'] ?? '',
            ':name'             => $data['name'],
            ':kin'              => $data['kin'] ?? '',
            ':profession'       => $data['profession'] ?? '',
            ':age'              => $data['age'] ?? 'Adulto',
            ':appearance'       => $data['appearance'] ?? '',
            ':strength'         => intval($data['strength'] ?? 10),
            ':constitution'     => intval($data['constitution'] ?? 10),
            ':agility'          => intval($data['agility'] ?? 10),
            ':intelligence'     => intval($data['intelligence'] ?? 10),
            ':willpower'        => intval($data['willpower'] ?? 10),
            ':charisma'         => intval($data['charisma'] ?? 10),
            ':hp_current'       => intval($data['hp_current'] ?? ($data['constitution'] ?? 10)),
            ':hp_max'           => intval($data['hp_max'] ?? ($data['constitution'] ?? 10)),
            ':wp_current'       => intval($data['wp_current'] ?? ($data['willpower'] ?? 10)),
            ':wp_max'           => intval($data['wp_max'] ?? ($data['willpower'] ?? 10)),
            ':movement'         => intval($data['movement'] ?? 10),
            ':damage_bonus_str' => $data['damage_bonus_str'] ?? '',
            ':damage_bonus_agi' => $data['damage_bonus_agi'] ?? '',
            ':conditions'       => json_encode($data['conditions'] ?? new stdClass()),
            ':skills'           => json_encode($data['skills'] ?? []),
            ':heroic_abilities' => json_encode($data['heroic_abilities'] ?? []),
            ':spells'           => json_encode($data['spells'] ?? []),
            ':weapons'          => json_encode($data['weapons'] ?? []),
            ':armor'            => json_encode($data['armor'] ?? []),
            ':inventory'        => json_encode($data['inventory'] ?? []),
            ':gold'             => intval($data['gold'] ?? 0),
            ':silver'           => intval($data['silver'] ?? 0),
            ':copper'           => intval($data['copper'] ?? 0),
            ':memento'          => $data['memento'] ?? '',
            ':tiny_items'       => $data['tiny_items'] ?? '',
            ':backstory'        => $data['backstory'] ?? '',
            ':notes'            => $data['notes'] ?? ''
        ]);

        $newId = $pdo->lastInsertId();
        sendJsonResponse(['success' => true, 'id' => (int)$newId, 'message' => 'Personaje creado con éxito'], 201);
        break;

    case 'PUT':
        if (!$id) {
            sendJsonResponse(['success' => false, 'message' => 'ID de personaje no especificado'], 400);
        }
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data) {
            sendJsonResponse(['success' => false, 'message' => 'Datos inválidos'], 400);
        }

        $sql = "UPDATE `characters` SET
            `player_name` = :player_name,
            `name` = :name,
            `kin` = :kin,
            `profession` = :profession,
            `age` = :age,
            `appearance` = :appearance,
            `strength` = :strength,
            `constitution` = :constitution,
            `agility` = :agility,
            `intelligence` = :intelligence,
            `willpower` = :willpower,
            `charisma` = :charisma,
            `hp_current` = :hp_current,
            `hp_max` = :hp_max,
            `wp_current` = :wp_current,
            `wp_max` = :wp_max,
            `movement` = :movement,
            `damage_bonus_str` = :damage_bonus_str,
            `damage_bonus_agi` = :damage_bonus_agi,
            `conditions` = :conditions,
            `skills` = :skills,
            `heroic_abilities` = :heroic_abilities,
            `spells` = :spells,
            `weapons` = :weapons,
            `armor` = :armor,
            `inventory` = :inventory,
            `gold` = :gold,
            `silver` = :silver,
            `copper` = :copper,
            `memento` = :memento,
            `tiny_items` = :tiny_items,
            `backstory` = :backstory,
            `notes` = :notes
        WHERE `id` = :id";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':id'               => $id,
            ':player_name'      => $data['player_name'] ?? '',
            ':name'             => $data['name'] ?? 'Sin nombre',
            ':kin'              => $data['kin'] ?? '',
            ':profession'       => $data['profession'] ?? '',
            ':age'              => $data['age'] ?? 'Adulto',
            ':appearance'       => $data['appearance'] ?? '',
            ':strength'         => intval($data['strength'] ?? 10),
            ':constitution'     => intval($data['constitution'] ?? 10),
            ':agility'          => intval($data['agility'] ?? 10),
            ':intelligence'     => intval($data['intelligence'] ?? 10),
            ':willpower'        => intval($data['willpower'] ?? 10),
            ':charisma'         => intval($data['charisma'] ?? 10),
            ':hp_current'       => intval($data['hp_current'] ?? 10),
            ':hp_max'           => intval($data['hp_max'] ?? 10),
            ':wp_current'       => intval($data['wp_current'] ?? 10),
            ':wp_max'           => intval($data['wp_max'] ?? 10),
            ':movement'         => intval($data['movement'] ?? 10),
            ':damage_bonus_str' => $data['damage_bonus_str'] ?? '',
            ':damage_bonus_agi' => $data['damage_bonus_agi'] ?? '',
            ':conditions'       => json_encode($data['conditions'] ?? new stdClass()),
            ':skills'           => json_encode($data['skills'] ?? []),
            ':heroic_abilities' => json_encode($data['heroic_abilities'] ?? []),
            ':spells'           => json_encode($data['spells'] ?? []),
            ':weapons'          => json_encode($data['weapons'] ?? []),
            ':armor'            => json_encode($data['armor'] ?? []),
            ':inventory'        => json_encode($data['inventory'] ?? []),
            ':gold'             => intval($data['gold'] ?? 0),
            ':silver'           => intval($data['silver'] ?? 0),
            ':copper'           => intval($data['copper'] ?? 0),
            ':memento'          => $data['memento'] ?? '',
            ':tiny_items'       => $data['tiny_items'] ?? '',
            ':backstory'        => $data['backstory'] ?? '',
            ':notes'            => $data['notes'] ?? ''
        ]);

        sendJsonResponse(['success' => true, 'message' => 'Personaje actualizado correctamente']);
        break;

    case 'DELETE':
        if (!$id) {
            sendJsonResponse(['success' => false, 'message' => 'ID no especificado'], 400);
        }
        $stmt = $pdo->prepare("DELETE FROM `characters` WHERE `id` = ?");
        $stmt->execute([$id]);
        sendJsonResponse(['success' => true, 'message' => 'Personaje eliminado']);
        break;

    default:
        sendJsonResponse(['success' => false, 'message' => 'Método no permitido'], 405);
}
