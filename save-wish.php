<?php
// api/save-wish.php
// 6-7 Wish — Save wish to database
// Milkox Group LLC

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://www.sixsevenwish.com');
header('Access-Control-Allow-Methods: POST');

// ── CONFIG ──
define('DB_HOST', 'localhost');
define('DB_NAME', 'sixsevenwish');
define('DB_USER', 'db_user_here');
define('DB_PASS', 'db_password_here');

// ── CSRF / METHOD CHECK ──
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// ── SANITIZE INPUT ──
function sanitize(string $val): string {
    return htmlspecialchars(strip_tags(trim($val)), ENT_QUOTES, 'UTF-8');
}

$first_name             = sanitize($_POST['first_name'] ?? '');
$last_name              = sanitize($_POST['last_name'] ?? '');
$wish_text              = sanitize($_POST['wish_text'] ?? '');
$wish_level             = sanitize($_POST['wish_level'] ?? '');
$amount                 = (float)($_POST['amount'] ?? 0);
$paypal_transaction_id  = sanitize($_POST['paypal_transaction_id'] ?? '');
$status                 = sanitize($_POST['status'] ?? 'PENDING');

// ── VALIDATE ──
$allowed_levels = ['hope', 'dream', 'destiny'];
$allowed_amounts = [3.0, 5.0, 12.0];

if (empty($first_name) || empty($last_name) || empty($wish_text)) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

if (!in_array($wish_level, $allowed_levels)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid wish level']);
    exit;
}

if (!in_array($amount, $allowed_amounts)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid amount']);
    exit;
}

if (strlen($wish_text) > 300) {
    http_response_code(400);
    echo json_encode(['error' => 'Wish too long']);
    exit;
}

// ── COLLECT META ──
$ip_address = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '';
$ip_address = sanitize(explode(',', $ip_address)[0]);
$country    = 'US'; // Can use IP geolocation API here

// ── DATABASE ──
try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );

    $stmt = $pdo->prepare("
        INSERT INTO wishes
            (first_name, last_name, wish_text, wish_level, amount, paypal_transaction_id, country, ip_address, status)
        VALUES
            (:first_name, :last_name, :wish_text, :wish_level, :amount, :paypal_transaction_id, :country, :ip_address, :status)
    ");

    $stmt->execute([
        ':first_name'            => $first_name,
        ':last_name'             => $last_name,
        ':wish_text'             => $wish_text,
        ':wish_level'            => $wish_level,
        ':amount'                => $amount,
        ':paypal_transaction_id' => $paypal_transaction_id,
        ':country'               => $country,
        ':ip_address'            => $ip_address,
        ':status'                => $status,
    ]);

    $id = $pdo->lastInsertId();
    echo json_encode(['success' => true, 'id' => $id]);

} catch (PDOException $e) {
    // Log error, don't expose to client
    error_log('DB Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database error']);
}
