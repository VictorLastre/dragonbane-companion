<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Obtener el estado actual que se proyecta en pantalla
        $stmt = $pdo->query("SELECT * FROM `screen_broadcast` WHERE `id` = 1");
        $screen = $stmt->fetch();
        sendJsonResponse(['success' => true, 'screen' => $screen ?: []]);
        break;

    case 'POST':
    case 'PUT':
        // El máster actualiza lo que se muestra en la pantalla compartida / TV
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data) {
            sendJsonResponse(['success' => false, 'message' => 'Datos inválidos'], 400);
        }

        $stmt = $pdo->prepare("INSERT INTO `screen_broadcast` 
            (`id`, `mode`, `title`, `subtitle`, `image_url`, `description`, `is_active`)
            VALUES (1, :mode, :title, :subtitle, :image_url, :description, :is_active)
            ON DUPLICATE KEY UPDATE
            `mode` = :mode,
            `title` = :title,
            `subtitle` = :subtitle,
            `image_url` = :image_url,
            `description` = :description,
            `is_active` = :is_active
        ");

        $stmt->execute([
            ':mode'        => $data['mode'] ?? 'npc',
            ':title'       => $data['title'] ?? '',
            ':subtitle'    => $data['subtitle'] ?? '',
            ':image_url'   => $data['image_url'] ?? '',
            ':description' => $data['description'] ?? '',
            ':is_active'   => isset($data['is_active']) ? ($data['is_active'] ? 1 : 0) : 1
        ]);

        sendJsonResponse(['success' => true, 'message' => 'Pantalla actualizada con éxito']);
        break;

    default:
        sendJsonResponse(['success' => false, 'message' => 'Método no permitido'], 405);
}
