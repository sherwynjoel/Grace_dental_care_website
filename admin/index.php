<?php
define('SECURE_ACCESS', true);
require_once __DIR__ . '/config.php';

session_start();

// Enforce authentication
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('Location: /admin/login.php');
    exit;
}

// Session timeout check
if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > SESSION_TIMEOUT)) {
    session_unset();
    session_destroy();
    header('Location: /admin/login.php');
    exit;
}
$_SESSION['last_activity'] = time();

// Helper to load blogs
function loadBlogs() {
    if (file_exists(BLOGS_JSON_PATH)) {
        $data = json_decode(file_get_contents(BLOGS_JSON_PATH), true);
        return is_array($data) ? $data : [];
    }
    return [];
}

// Helper to save blogs
function saveBlogs($blogs) {
    // Sort before saving so list page stays clean, but keeping manual date order
    usort($blogs, function($a, $b) {
        return strcmp($b['date'], $a['date']);
    });
    return file_put_contents(BLOGS_JSON_PATH, json_encode($blogs, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES), LOCK_EX) !== false;
}

// Helper to generate a clean URL slug
function generateSlug($string) {
    $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $string)));
    return trim($slug, '-');
}

// Helper to format date
function formatDate($dateStr) {
    try {
        $date = new DateTime($dateStr);
        return $date->format('M d, Y');
    } catch (Exception $e) {
        return $dateStr;
    }
}

$blogs = loadBlogs();
$message = '';
$action = isset($_GET['action']) ? $_GET['action'] : 'list';
$edit_post = null;

// Handle delete action
if ($action === 'delete' && isset($_GET['id'])) {
    $id_to_delete = trim($_GET['id']);
    $original_count = count($blogs);
    $blogs = array_filter($blogs, function($b) use ($id_to_delete) {
        return strcasecmp($b['id'], $id_to_delete) !== 0;
    });
    
    if (count($blogs) < $original_count) {
        saveBlogs(array_values($blogs));
        header('Location: /admin/index.php?msg=deleted');
        exit;
    }
}

// Handle save post (Create or Update)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['save_post'])) {
    $original_id = isset($_POST['original_id']) ? trim($_POST['original_id']) : '';
    $title = isset($_POST['title']) ? trim($_POST['title']) : '';
    $category = isset($_POST['category']) ? trim($_POST['category']) : '';
    $date = isset($_POST['date']) ? trim($_POST['date']) : date('Y-m-d');
    $read_time = isset($_POST['read_time']) ? trim($_POST['read_time']) : '5 min read';
    $image = isset($_POST['image']) ? trim($_POST['image']) : 'assets/og-image.jpg';
    
    // Author selection
    $author_preset = isset($_POST['author_preset']) ? $_POST['author_preset'] : 'custom';
    $author = '';
    $author_role = '';
    $author_avatar = '';

    if ($author_preset === 'sherin') {
        $author = 'Dr. Sherin Grace Babu';
        $author_role = 'Prosthodontist & Founder, Grace Dental Care';
        $author_avatar = 'SG';
    } elseif ($author_preset === 'indu') {
        $author = 'Dr. Indumathiy R';
        $author_role = 'Dental Surgeon, Grace Dental Care';
        $author_avatar = 'IR';
    } elseif ($author_preset === 'nandana') {
        $author = 'Dr. Nandana Jayachandran';
        $author_role = 'General Dentist & Consultant, Grace Dental Care';
        $author_avatar = 'NJ';
    } else {
        $author = isset($_POST['author']) ? trim($_POST['author']) : '';
        $author_role = isset($_POST['author_role']) ? trim($_POST['author_role']) : '';
        $author_avatar = isset($_POST['author_avatar']) ? trim($_POST['author_avatar']) : '';
    }

    $excerpt = isset($_POST['excerpt']) ? trim($_POST['excerpt']) : '';
    $content = isset($_POST['content']) ? $_POST['content'] : '';
    $featured = isset($_POST['featured']) && $_POST['featured'] == '1';

    if ($title !== '') {
        $id = $original_id !== '' ? $original_id : generateSlug($title);
        
        // Ensure unique ID on creation
        if ($original_id === '') {
            $base_id = $id;
            $counter = 1;
            while (true) {
                $exists = false;
                foreach ($blogs as $b) {
                    if ($b['id'] === $id) {
                        $exists = true;
                        break;
                    }
                }
                if (!$exists) break;
                $id = $base_id . '-' . $counter;
                $counter++;
            }
        }

        $new_post = [
            'id' => $id,
            'title' => $title,
            'category' => $category,
            'date' => $date,
            'read_time' => $read_time,
            'image' => $image,
            'author' => $author,
            'author_role' => $author_role,
            'author_avatar' => $author_avatar,
            'excerpt' => $excerpt,
            'content' => $content
        ];
        
        if ($featured) {
            $new_post['featured'] = true;
            // Clear featured status of all other posts
            foreach ($blogs as $k => $b) {
                unset($blogs[$k]['featured']);
            }
        }

        if ($original_id !== '') {
            // Update existing
            foreach ($blogs as $k => $b) {
                if (strcasecmp($b['id'], $original_id) === 0) {
                    $blogs[$k] = $new_post;
                    break;
                }
            }
        } else {
            // Add new
            $blogs[] = $new_post;
        }

        saveBlogs($blogs);
        header('Location: /admin/index.php?msg=saved');
        exit;
    }
}

// Load post for editing
if ($action === 'edit' && isset($_GET['id'])) {
    $id_to_edit = trim($_GET['id']);
    foreach ($blogs as $b) {
        if (strcasecmp($b['id'], $id_to_edit) === 0) {
            $edit_post = $b;
            break;
        }
    }
}

// Success message checks
$msg_type = isset($_GET['msg']) ? $_GET['msg'] : '';
if ($msg_type === 'saved') {
    $message = 'Post saved successfully!';
} elseif ($msg_type === 'deleted') {
    $message = 'Post deleted successfully!';
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Dashboard | Grace Dental Care CMS</title>
  <link rel="icon" href="../assets/logo.png" type="image/png">
  <style>
    :root {
      --black: #090909;
      --black-2: #111111;
      --black-3: #1a1a1a;
      --black-4: #222222;
      --gold: #C4A35A;
      --gold-light: #D9BF7F;
      --gold-border: rgba(196, 163, 90, 0.22);
      --white: #FAFAFA;
      --gray: #9A9490;
      --radius-lg: 20px;
      --radius-sm: 8px;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: var(--black);
      color: var(--white);
      line-height: 1.6;
      padding-bottom: 60px;
    }
    header {
      background: var(--black-2);
      border-bottom: 1px solid var(--gold-border);
      padding: 15px 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .header-logo {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: var(--white);
    }
    .header-logo img {
      width: 40px;
      height: 40px;
      border-radius: 50%;
    }
    .header-logo span {
      font-weight: 700;
      font-size: 1.2rem;
    }
    .header-logo em {
      color: var(--gold);
      font-style: normal;
    }
    .nav-actions {
      display: flex;
      gap: 15px;
      align-items: center;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 20px;
      border-radius: var(--radius-sm);
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s;
    }
    .btn--gold { background: var(--gold); color: var(--black); border: none; }
    .btn--gold:hover { background: var(--gold-light); }
    .btn--outline { border: 1px solid var(--gold-border); color: var(--white); background: transparent; }
    .btn--outline:hover { border-color: var(--gold); color: var(--gold); }
    .btn--danger { background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; }
    .btn--danger:hover { background: #ef4444; color: var(--white); }
    
    .container {
      max-width: 1000px;
      margin: 40px auto 0;
      padding: 0 20px;
    }
    .alert {
      background: rgba(34, 197, 94, 0.15);
      border: 1px solid rgba(34, 197, 94, 0.3);
      color: #22c55e;
      padding: 16px;
      border-radius: var(--radius-sm);
      margin-bottom: 30px;
      font-weight: 600;
      text-align: center;
    }
    .panel {
      background: var(--black-2);
      border: 1px solid var(--gold-border);
      border-radius: var(--radius-lg);
      padding: 30px;
    }
    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      border-bottom: 1px solid var(--gold-border);
      padding-bottom: 16px;
    }
    .panel-title {
      font-size: 1.4rem;
      font-weight: 600;
    }
    
    /* Table styling */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }
    th {
      text-align: left;
      color: var(--gray);
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 12px 16px;
      border-bottom: 1px solid var(--gold-border);
    }
    td {
      padding: 16px;
      border-bottom: 1px solid rgba(196,163,90,0.08);
      font-size: 0.95rem;
    }
    tr:last-child td {
      border-bottom: none;
    }
    .col-title { font-weight: 600; color: var(--white); }
    .col-meta { font-size: 0.8rem; color: var(--gray); margin-top: 4px; }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .badge--cat { background: var(--gold-glass); color: var(--gold); border: 1px solid var(--gold-border); }
    .badge--featured { background: rgba(34,197,94,0.15); color: #22c55e; border: 1px solid rgba(34,197,94,0.3); }

    /* Form styling */
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
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
      padding: 12px;
      background: var(--black-3);
      border: 1px solid var(--gold-border);
      border-radius: var(--radius-sm);
      color: var(--white);
      font-size: 0.95rem;
    }
    .form-control:focus {
      outline: none;
      border-color: var(--gold);
    }
    .radio-group {
      display: flex;
      gap: 20px;
      align-items: center;
      margin-top: 8px;
    }
    .radio-option {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-size: 0.9rem;
    }
    
    @media (max-width: 768px) {
      .form-row { grid-template-columns: 1fr; gap: 0; }
      header { padding: 15px; }
      .nav-actions span { display: none; }
      .panel { padding: 20px; }
      td, th { padding: 10px; }
    }
  </style>
</head>
<body>

<header>
  <a class="header-logo" href="../blog" target="_blank">
    <img src="../assets/logo.png" alt="Grace Dental Care">
    <span>Grace <em>Dental Care</em></span>
  </a>
  <div class="nav-actions">
    <span style="font-size:0.85rem;color:var(--gray);">Logged in as <strong><?php echo htmlspecialchars(ADMIN_USER); ?></strong></span>
    <a class="btn btn--outline btn--sm" href="logout.php">Log Out</a>
  </div>
</header>

<div class="container">
  <?php if ($message !== ''): ?>
    <div class="alert"><?php echo htmlspecialchars($message); ?></div>
  <?php endif; ?>

  <?php if ($action === 'list'): ?>
    <!-- LIST POSTS -->
    <div class="panel">
      <div class="panel-header">
        <h2 class="panel-title">Manage Articles</h2>
        <a class="btn btn--gold" href="/admin/index.php?action=add">+ Write Article</a>
      </div>

      <?php if (empty($blogs)): ?>
        <p style="text-align:center;color:var(--gray);padding:40px 0;">No blog posts found. Write your first one!</p>
      <?php else: ?>
        <div style="overflow-x:auto;">
          <table>
            <thead>
              <tr>
                <th>Article</th>
                <th>Category</th>
                <th>Author</th>
                <th style="text-align:right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <?php foreach ($blogs as $b): ?>
                <tr>
                  <td>
                    <div class="col-title"><?php echo htmlspecialchars($b['title']); ?></div>
                    <div class="col-meta">
                      <?php if (isset($b['featured']) && $b['featured'] === true): ?>
                        <span class="badge badge--featured" style="margin-right:8px;">Featured</span>
                      <?php endif; ?>
                      <span><?php echo formatDate($b['date']); ?></span> · <span><?php echo htmlspecialchars($b['read_time']); ?></span>
                    </div>
                  </td>
                  <td><span class="badge badge--cat"><?php echo htmlspecialchars($b['category']); ?></span></td>
                  <td><?php echo htmlspecialchars($b['author']); ?></td>
                  <td style="text-align:right;white-space:nowrap;">
                    <a class="btn btn--outline" href="/admin/index.php?action=edit&id=<?php echo urlencode($b['id']); ?>" style="padding:6px 12px;font-size:0.8rem;margin-right:6px;">Edit</a>
                    <a class="btn btn--danger" href="/admin/index.php?action=delete&id=<?php echo urlencode($b['id']); ?>" onclick="return confirm('Are you sure you want to delete this article?');" style="padding:6px 12px;font-size:0.8rem;">Delete</a>
                  </td>
                </tr>
              <?php endforeach; ?>
            </tbody>
          </table>
        </div>
      <?php endif; ?>
    </div>

  <?php elseif ($action === 'add' || $action === 'edit'): 
    $is_edit = ($action === 'edit' && $edit_post !== null);
    $form_title = $is_edit ? 'Edit Article' : 'Write New Article';
  ?>
    <!-- WRITE/EDIT POST -->
    <div class="panel">
      <div class="panel-header">
        <h2 class="panel-title"><?php echo $form_title; ?></h2>
        <a class="btn btn--outline" href="/admin/index.php">← Back to List</a>
      </div>

      <form id="post-form" method="POST" action="/admin/index.php?action=<?php echo $action; ?>">
        <input type="hidden" name="original_id" value="<?php echo $is_edit ? htmlspecialchars($edit_post['id']) : ''; ?>">
        <input type="hidden" name="save_post" value="1">

        <div class="form-group">
          <label class="form-label" for="title">Title</label>
          <input class="form-control" type="text" id="title" name="title" required value="<?php echo $is_edit ? htmlspecialchars($edit_post['title']) : ''; ?>" placeholder="e.g. 5 Warning Signs You Need a Root Canal">
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="category">Category</label>
            <select class="form-control" id="category" name="category" required>
              <option value="Oral Health" <?php echo ($is_edit && $edit_post['category'] === 'Oral Health') ? 'selected' : ''; ?>>Oral Health</option>
              <option value="Dental Implants" <?php echo ($is_edit && $edit_post['category'] === 'Dental Implants') ? 'selected' : ''; ?>>Dental Implants</option>
              <option value="Orthodontics" <?php echo ($is_edit && $edit_post['category'] === 'Orthodontics') ? 'selected' : ''; ?>>Orthodontics</option>
              <option value="Cosmetic" <?php echo ($is_edit && $edit_post['category'] === 'Cosmetic') ? 'selected' : ''; ?>>Cosmetic</option>
              <option value="Pediatric" <?php echo ($is_edit && $edit_post['category'] === 'Pediatric') ? 'selected' : ''; ?>>Pediatric</option>
              <option value="Technology" <?php echo ($is_edit && $edit_post['category'] === 'Technology') ? 'selected' : ''; ?>>Technology</option>
              <option value="Root Canal" <?php echo ($is_edit && $edit_post['category'] === 'Root Canal') ? 'selected' : ''; ?>>Root Canal</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="read_time">Read Time</label>
            <input class="form-control" type="text" id="read_time" name="read_time" required value="<?php echo $is_edit ? htmlspecialchars($edit_post['read_time']) : '5 min read'; ?>" placeholder="e.g. 5 min read">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="date">Publish Date</label>
            <input class="form-control" type="date" id="date" name="date" required value="<?php echo $is_edit ? htmlspecialchars($edit_post['date']) : date('Y-m-d'); ?>">
          </div>
          <div class="form-group">
            <label class="form-label" for="image">Featured Image URL</label>
            <input class="form-control" type="text" id="image" name="image" required value="<?php echo $is_edit ? htmlspecialchars($edit_post['image']) : 'assets/og-image.jpg'; ?>" placeholder="e.g. assets/blog-image.webp">
          </div>
        </div>

        <div class="form-group" style="border:1px solid var(--gold-border);padding:15px;border-radius:var(--radius-sm);background:var(--black-3);margin-bottom:24px;">
          <label class="form-label">Author Profile</label>
          <div class="radio-group" style="margin-bottom:15px;">
            <?php 
              $current_author = $is_edit ? $edit_post['author'] : '';
              $is_sherin = ($current_author === 'Dr. Sherin Grace Babu' || !$is_edit);
              $is_indu = ($current_author === 'Dr. Indumathiy R');
              $is_nandana = ($current_author === 'Dr. Nandana Jayachandran');
              $is_custom = ($is_edit && !$is_sherin && !$is_indu && !$is_nandana);
            ?>
            <label class="radio-option">
              <input type="radio" name="author_preset" value="sherin" <?php echo $is_sherin ? 'checked' : ''; ?> onclick="toggleAuthorFields(false)">
              Dr. Sherin
            </label>
            <label class="radio-option">
              <input type="radio" name="author_preset" value="indu" <?php echo $is_indu ? 'checked' : ''; ?> onclick="toggleAuthorFields(false)">
              Dr. Indu
            </label>
            <label class="radio-option">
              <input type="radio" name="author_preset" value="nandana" <?php echo $is_nandana ? 'checked' : ''; ?> onclick="toggleAuthorFields(false)">
              Dr. Nandana
            </label>
            <label class="radio-option">
              <input type="radio" name="author_preset" value="custom" <?php echo $is_custom ? 'checked' : ''; ?> onclick="toggleAuthorFields(true)">
              Custom Author...
            </label>
          </div>

          <div id="custom-author-fields" style="display: <?php echo $is_custom ? 'block' : 'none'; ?>; border-top:1px solid rgba(196,163,90,0.1);padding-top:15px;">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="author">Author Name</label>
                <input class="form-control" type="text" id="author" name="author" value="<?php echo $is_edit ? htmlspecialchars($edit_post['author']) : ''; ?>">
              </div>
              <div class="form-group">
                <label class="form-label" for="author_avatar">Author Avatar (Initials)</label>
                <input class="form-control" type="text" id="author_avatar" name="author_avatar" value="<?php echo $is_edit ? htmlspecialchars($edit_post['author_avatar']) : ''; ?>" placeholder="e.g. SG">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label" for="author_role">Author Role</label>
              <input class="form-control" type="text" id="author_role" name="author_role" value="<?php echo $is_edit ? htmlspecialchars($edit_post['author_role']) : ''; ?>" placeholder="e.g. Dental Surgeon, Grace Dental Care">
            </div>
          </div>
        </div>

        <div class="form-group" style="display:flex;align-items:center;gap:10px;">
          <input type="checkbox" id="featured" name="featured" value="1" <?php echo ($is_edit && isset($edit_post['featured']) && $edit_post['featured'] === true) ? 'checked' : ''; ?> style="width:18px;height:18px;cursor:pointer;">
          <label for="featured" style="cursor:pointer;font-weight:600;font-size:0.9rem;">Mark this article as the Featured Post (will be shown at the top of the blog page)</label>
        </div>

        <div class="form-group">
          <label class="form-label" for="excerpt">Brief Excerpt</label>
          <textarea class="form-control" id="excerpt" name="excerpt" rows="3" required placeholder="A short 2-3 sentence description of the article to show in lists..."><?php echo $is_edit ? htmlspecialchars($edit_post['excerpt']) : ''; ?></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Article Content</label>
          <textarea id="editor" name="content"><?php echo $is_edit ? htmlspecialchars($edit_post['content']) : ''; ?></textarea>
        </div>

        <div style="margin-top:30px;display:flex;gap:15px;">
          <button class="btn btn--gold" type="submit" style="padding:12px 30px;">Save Article</button>
          <a class="btn btn--outline" href="/admin/index.php">Cancel</a>
        </div>
      </form>
    </div>
  <?php endif; ?>
</div>

<script>
  function toggleAuthorFields(show) {
    var fields = document.getElementById('custom-author-fields');
    fields.style.display = show ? 'block' : 'none';
  }
</script>

<?php if ($action === 'add' || $action === 'edit'): ?>
<!-- TinyMCE Rich Text Editor library (Open Source via CDNJS) -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.8.3/tinymce.min.js"></script>
<script>
  tinymce.init({
    selector: '#editor',
    plugins: 'lists link image table code help wordcount',
    toolbar: 'undo redo | blocks | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist | link image | table | removeformat | code | help',
    menubar: false,
    height: 500,
    branding: false,
    content_style: "body { font-family: 'Inter', sans-serif; font-size: 16px; }"
  });
</script>
<?php endif; ?>

</body>
</html>
