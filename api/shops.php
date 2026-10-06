<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? intval($_GET['id']) : null;
$location = isset($_GET['location']) ? trim($_GET['location']) : null;
$campaign_code = isset($_GET['campaign_code']) ? strtoupper(trim($_GET['campaign_code'])) : null;
$is_gm = isset($_GET['is_gm']) && ($_GET['is_gm'] === 'true' || $_GET['is_gm'] === '1');
$action = isset($_GET['action']) ? trim($_GET['action']) : null;

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
            $shop['is_unlocked'] = ((int)$shop['is_unlocked']) === 1;
            sendJsonResponse(['success' => true, 'shop' => $shop]);
        } else {
            $sql = "SELECT * FROM `shops`";
            $where = [];
            $params = [];

            if ($campaign_code) {
                $where[] = "(`campaign_code` = ? OR `campaign_code` IS NULL OR `campaign_code` = '')";
                $params[] = $campaign_code;
            }
            if ($location) {
                $where[] = "`location` = ?";
                $params[] = $location;
            }
            if (!$is_gm) {
                $where[] = "`is_unlocked` = 1";
            }

            if (!empty($where)) {
                $sql .= " WHERE " . implode(" AND ", $where);
            }
            $sql .= " ORDER BY `id` ASC";

            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $shops = $stmt->fetchAll();
            foreach ($shops as &$s) {
                if ($s['items']) {
                    $s['items'] = json_decode($s['items'], true) ?: [];
                }
                $s['is_unlocked'] = ((int)$s['is_unlocked']) === 1;
            }
            sendJsonResponse(['success' => true, 'shops' => $shops]);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data) {
            sendJsonResponse(['success' => false, 'message' => 'Datos inválidos'], 400);
        }

        // Caso BATCH (guardar lote generado)
        if ($action === 'batch' || (isset($data['shops']) && is_array($data['shops']))) {
            $batchLocation = $data['location'] ?? $location;
            $batchCamp = isset($data['campaign_code']) ? strtoupper(trim($data['campaign_code'])) : $campaign_code;
            $shopList = $data['shops'] ?? [];

            if (!$batchLocation) {
                sendJsonResponse(['success' => false, 'message' => 'Ubicación requerida para lote'], 400);
            }

            if ($batchCamp) {
                $del = $pdo->prepare("DELETE FROM `shops` WHERE `location` = ? AND `campaign_code` = ?");
                $del->execute([$batchLocation, $batchCamp]);
            } else {
                $del = $pdo->prepare("DELETE FROM `shops` WHERE `location` = ? AND (`campaign_code` IS NULL OR `campaign_code` = '')");
                $del->execute([$batchLocation]);
            }

            $ins = $pdo->prepare("INSERT INTO `shops` (`campaign_code`, `location`, `name`, `shop_type`, `keeper_name`, `description`, `scale`, `environment`, `is_unlocked`, `items`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            foreach ($shopList as $shop) {
                $ins->execute([
                    $batchCamp,
                    $batchLocation,
                    $shop['name'] ?? 'Puesto Comercial',
                    $shop['shop_type'] ?? 'General',
                    $shop['keeper_name'] ?? '',
                    $shop['description'] ?? '',
                    $shop['scale'] ?? 'lugar_de_paso',
                    $shop['environment'] ?? 'costero',
                    isset($shop['is_unlocked']) && !$shop['is_unlocked'] ? 0 : 1,
                    json_encode($shop['items'] ?? [])
                ]);
            }

            sendJsonResponse(['success' => true, 'message' => 'Lote de tiendas guardado con éxito']);
            break;
        }

        // Caso CLEAR (limpiar ubicación)
        if ($action === 'clear') {
            $clearLocation = $data['location'] ?? $location;
            $clearCamp = isset($data['campaign_code']) ? strtoupper(trim($data['campaign_code'])) : $campaign_code;
            if ($clearCamp) {
                $del = $pdo->prepare("DELETE FROM `shops` WHERE `location` = ? AND `campaign_code` = ?");
                $del->execute([$clearLocation, $clearCamp]);
            } else {
                $del = $pdo->prepare("DELETE FROM `shops` WHERE `location` = ?");
                $del->execute([$clearLocation]);
            }
            sendJsonResponse(['success' => true, 'message' => 'Tiendas eliminadas de la ubicación']);
            break;
        }

        // Caso INSERT individual
        if (empty($data['name']) || empty($data['location'])) {
            sendJsonResponse(['success' => false, 'message' => 'Nombre y ubicación obligatorios'], 400);
        }

        $stmt = $pdo->prepare("INSERT INTO `shops` (`campaign_code`, `location`, `name`, `shop_type`, `keeper_name`, `description`, `scale`, `environment`, `is_unlocked`, `items`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            isset($data['campaign_code']) ? strtoupper(trim($data['campaign_code'])) : null,
            $data['location'],
            $data['name'],
            $data['shop_type'] ?? 'General',
            $data['keeper_name'] ?? '',
            $data['description'] ?? '',
            $data['scale'] ?? 'lugar_de_paso',
            $data['environment'] ?? 'costero',
            isset($data['is_unlocked']) && !$data['is_unlocked'] ? 0 : 1,
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

        // Caso TOGGLE
        if ($action === 'toggle' || (isset($data['toggle']) && $data['toggle'])) {
            if (isset($data['is_unlocked'])) {
                $newVal = $data['is_unlocked'] ? 1 : 0;
                $stmt = $pdo->prepare("UPDATE `shops` SET `is_unlocked` = ? WHERE `id` = ?");
                $stmt->execute([$newVal, $id]);
            } else {
                $stmt = $pdo->prepare("UPDATE `shops` SET `is_unlocked` = NOT `is_unlocked` WHERE `id` = ?");
                $stmt->execute([$id]);
            }
            $chk = $pdo->prepare("SELECT `is_unlocked` FROM `shops` WHERE `id` = ?");
            $chk->execute([$id]);
            $row = $chk->fetch();
            sendJsonResponse(['success' => true, 'is_unlocked' => ((int)$row['is_unlocked']) === 1]);
            break;
        }

        // Caso UPDATE completo
        if (!$data) {
            sendJsonResponse(['success' => false, 'message' => 'Datos inválidos'], 400);
        }

        $stmt = $pdo->prepare("UPDATE `shops` SET `location` = ?, `name` = ?, `shop_type` = ?, `keeper_name` = ?, `description` = ?, `items` = ?, `is_unlocked` = ? WHERE `id` = ?");
        $stmt->execute([
            $data['location'] ?? '',
            $data['name'] ?? '',
            $data['shop_type'] ?? 'General',
            $data['keeper_name'] ?? '',
            $data['description'] ?? '',
            json_encode($data['items'] ?? []),
            isset($data['is_unlocked']) && !$data['is_unlocked'] ? 0 : 1,
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
