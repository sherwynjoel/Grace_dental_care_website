<?php
define('SECURE_ACCESS', true);
require_once __DIR__ . '/config.php';

session_start();

// Redirect if already logged in
if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
    header('Location: /admin/index.php');
    exit;
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = isset($_POST['username']) ? trim($_POST['username']) : '';
    $password = isset($_POST['password']) ? trim($_POST['password']) : '';

    if ($username === ADMIN_USER && hash('sha256', $password) === ADMIN_PASS_HASH) {
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['last_activity'] = time();
        header('Location: /admin/index.php');
        exit;
    } else {
        $error = 'Invalid username or password.';
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Login | Grace Dental Care</title>
  <link rel="icon" href="../assets/logo.png" type="image/png">
  <style>
    :root {
      --black: #090909;
      --black-2: #111111;
      --black-3: #1a1a1a;
      --gold: #C4A35A;
      --gold-light: #D9BF7F;
      --gold-border: rgba(196, 163, 90, 0.22);
      --white: #FAFAFA;
      --gray: #9A9490;
      --radius-md: 14px;
      --radius-sm: 8px;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: var(--black);
      color: var(--white);
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
    }
    .login-card {
      background: var(--black-2);
      border: 1px solid var(--gold-border);
      border-radius: var(--radius-md);
      width: 100%;
      max-width: 400px;
      padding: 40px 30px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.5);
    }
    .logo-area {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo-img {
      width: 60px;
      height: 60px;
      margin-bottom: 12px;
      border-radius: 50%;
    }
    .logo-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--white);
    }
    .logo-title span {
      color: var(--gold);
    }
    .form-group {
      margin-bottom: 20px;
    }
    .form-label {
      display: block;
      font-size: 0.85rem;
      font-weight: 600;
      margin-bottom: 8px;
      color: var(--gray);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .form-control {
      width: 100%;
      padding: 12px 16px;
      background: var(--black-3);
      border: 1px solid var(--gold-border);
      border-radius: var(--radius-sm);
      color: var(--white);
      font-size: 0.95rem;
      transition: border-color 0.25s;
    }
    .form-control:focus {
      outline: none;
      border-color: var(--gold);
    }
    .error-msg {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #ef4444;
      padding: 12px;
      border-radius: var(--radius-sm);
      font-size: 0.88rem;
      margin-bottom: 20px;
      text-align: center;
    }
    .btn-submit {
      width: 100%;
      padding: 14px;
      background: var(--gold);
      color: var(--black);
      border: none;
      border-radius: var(--radius-sm);
      font-size: 0.95rem;
      font-weight: 700;
      cursor: pointer;
      transition: background-color 0.2s, transform 0.1s;
    }
    .btn-submit:hover {
      background: var(--gold-light);
    }
    .btn-submit:active {
      transform: scale(0.98);
    }
    .back-link {
      display: block;
      text-align: center;
      margin-top: 24px;
      color: var(--gray);
      font-size: 0.85rem;
      text-decoration: none;
      transition: color 0.2s;
    }
    .back-link:hover {
      color: var(--gold);
    }
  </style>
</head>
<body>

<div class="login-card">
  <div class="logo-area">
    <img src="../assets/logo.png" alt="Grace Dental Care" class="logo-img">
    <h1 class="logo-title">Grace <span>Dental Care</span></h1>
    <p style="font-size:0.8rem;color:var(--gray);margin-top:4px;">Administration Portal</p>
  </div>

  <?php if ($error !== ''): ?>
    <div class="error-msg"><?php echo htmlspecialchars($error); ?></div>
  <?php endif; ?>

  <form method="POST" action="/admin/login.php">
    <div class="form-group">
      <label class="form-label" for="username">Username</label>
      <input class="form-control" type="text" id="username" name="username" required autofocus>
    </div>
    <div class="form-group">
      <label class="form-label" for="password">Password</label>
      <input class="form-control" type="password" id="password" name="password" required>
    </div>
    <button class="btn-submit" type="submit">Log In</button>
  </form>

  <a class="back-link" href="../blog">← Back to Blog</a>
</div>

</body>
</html>
