<?php
// Prevent direct access
if (!defined('SECURE_ACCESS')) {
    header("HTTP/1.1 403 Forbidden");
    exit("Direct access forbidden");
}

define('ADMIN_USER', 'admin');
// Hashed password for "GraceDental@2026"
define('ADMIN_PASS_HASH', '$2y$10$VbYg6gLpM/UWhv.uFwO6.ee0qg6h77r05yE6G7Z0qjH4x9N5mNeqG');
define('BLOGS_JSON_PATH', dirname(__DIR__) . '/blogs.json');
define('SESSION_TIMEOUT', 3600); // 1 hour
