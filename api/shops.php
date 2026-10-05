<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? intval($_GET['id']) : null;
$location = isset($_GET['location']) ? trim($_GET['location']) : null;

switch ($method) {
    case 'GET':
        if ($id) {
            $stmt = $pdo->prepare("SELECT * FROM `shops` WHERE `id` = ?");
            $stmt->execute([$id]);
            $shop = $stmt->fetch();
            if (!$shop) {
                sendJsonResponse(['success' => false, 'message' => 'Tienda no encontrada'], 404);
            }
            if ($shop['items']) {
                $shop['items'] = json_decode($shop['items'], true) ?: [];
            }
            sendJsonResponse(['success' => true, 'shop' => $shop]);
        } else {
            if ($location) {
                $stmt = $pdo->prepare("SELECT * FROM `shops` WHERE `location` = ? ORDER BY `name` ASC");
                $stmt->execute([$location]);
            } else {
                $stmt = $pdo->query("SELECT * FROM `shops` ORDER BY `location` ASC, `name` ASC");
            }
            $shops = $stmt->fetchAll();
            foreach ($shops as &$s) {
                if ($s['items']) {
                    $s['items'] = json_decode($s['items'], true) ?: [];
                }
            }
            sendJsonResponse(['success' => true, 'shops' => $shops]);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data || empty($data['name']) || empty($data['location'])) {
            sendJsonResponse(['success' => false, 'message' => 'El nombre y la ubicación de la tienda son obligatorios'], 400);
        }

        $stmt = $pdo->prepare("INSERT INTO `shops` (`location`, `name`, `shop_type`, `description`, `items`) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([
            $data['location'],
            $data['name'],
            $data['shop_type'] ?? 'General',
            $data['description'] ?? '',
            json_encode($data['items'] ?? [])
        ]);

        $newId = $pdo->lastInsertId();
        sendJsonResponse(['success' => true, 'id' => (int)$newId, 'message' => 'Tienda creada con éxito'], 201);
        break;

    case 'PUT':
        if (!$id) {
            sendJsonResponse(['success' => false, 'message' => 'ID no especificado'], 400);
        }
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data) {
            sendJsonResponse(['success' => false, 'message' => 'Datos inválidos'], 400);
        }

        $stmt = $pdo->prepare("UPDATE `shops` SET `location` = ?, `name` = ?, `shop_type` = ?, `description` = ?, `items` = ? WHERE `id` = ?");
        $stmt->execute([
            $data['location'] ?? '',
            $data['name'] ?? '',
            $data['shop_type'] ?? 'General',
            $data['description'] ?? '',
            json_encode($data['items'] ?? []),
            $id
        ]);

        sendJsonResponse(['success' => true, 'message' => 'Tienda actualizada']);
        break;

    case 'DELETE':
        if (!$id) {
            sendJsonResponse(['success' => false, 'message' => 'ID no especificado'], 400);
        }
        $stmt = $pdo->prepare("DELETE FROM `shops` WHERE `id` = ?");
        $stmt->execute([$id]);
        sendJsonResponse(['success' => true, 'message' => 'Tienda eliminada']);
        break;

    default:
        sendJsonResponse(['success' => false, 'message' => 'Método no permitido'], 405);
}
