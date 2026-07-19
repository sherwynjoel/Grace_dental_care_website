<?php
// Prevent direct access
if (!defined('SECURE_ACCESS')) {
    header("HTTP/1.1 403 Forbidden");
    exit("Direct access forbidden");
}

define('ADMIN_USER', 'admin');
// Hashed password for "GraceDental@2026" using sha256
define('ADMIN_PASS_HASH', 'edca225b3479e35b42f34d48e7d2bdfd7c10a19bc2b87915a120ebf843875143');
define('BLOGS_JSON_PATH', dirname(__DIR__) . '/blogs.json');
define('SESSION_TIMEOUT', 3600); // 1 hour
