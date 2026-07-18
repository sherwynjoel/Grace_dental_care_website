<?php
// Load blogs JSON
$blogs_file = __DIR__ . '/blogs.json';
$blogs = [];
if (file_exists($blogs_file)) {
    $blogs = json_decode(file_get_contents($blogs_file), true);
}

if (!is_array($blogs)) {
    $blogs = [];
}

// Find post
$id = isset($_GET['id']) ? trim($_GET['id']) : '';
$post = null;
foreach ($blogs as $b) {
    if (strcasecmp($b['id'], $id) === 0) {
        $post = $b;
        break;
    }
}

// If post doesn't exist, show 404
if ($post === null) {
    header("HTTP/1.1 404 Not Found");
    if (file_exists(__DIR__ . '/404.html')) {
        include(__DIR__ . '/404.html');
    } else {
        echo "404 Not Found";
    }
    exit;
}

// Sort all blogs by date for recent list
usort($blogs, function($a, $b) {
    return strcmp($b['date'], $a['date']);
});
$recent_blogs = array_slice($blogs, 0, 3);

// Format date helper
function formatDate($dateStr) {
    try {
        $date = new DateTime($dateStr);
        return $date->format('M d, Y');
    } catch (Exception $e) {
        return $dateStr;
    }
}
?>
<!DOCTYPE html><html lang="en"><head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?php echo htmlspecialchars($post['title']); ?> | Grace Dental Care</title>
  <meta name="description" content="<?php echo htmlspecialchars($post['excerpt']); ?>">
  <meta name="author" content="<?php echo htmlspecialchars($post['author']); ?>">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
  <link rel="canonical" href="https://www.gracedentalcarekovai.com/blog/<?php echo htmlspecialchars($post['id']); ?>">
  
  <!-- Open Graph -->
  <meta property="og:type" content="article">
  <meta property="og:title" content="<?php echo htmlspecialchars($post['title']); ?> | Grace Dental Care">
  <meta property="og:description" content="<?php echo htmlspecialchars($post['excerpt']); ?>">
  <meta property="og:url" content="https://www.gracedentalcarekovai.com/blog/<?php echo htmlspecialchars($post['id']); ?>">
  <meta property="og:site_name" content="Grace Dental Care">
  <meta property="og:image" content="https://www.gracedentalcarekovai.com/<?php echo htmlspecialchars($post['image']); ?>">
  <meta property="og:locale" content="en_IN">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="<?php echo htmlspecialchars($post['title']); ?> | Grace Dental Care">
  <meta name="twitter:description" content="<?php echo htmlspecialchars($post['excerpt']); ?>">
  <meta name="twitter:image" content="https://www.gracedentalcarekovai.com/<?php echo htmlspecialchars($post['image']); ?>">
  
  <meta name="theme-color" content="#C4A35A">
  <!-- Preconnect -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preconnect" href="https://www.googletagmanager.com">
  
  <!-- Schema.org Article Markup -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "<?php echo addslashes($post['title']); ?>",
    "image": "https://www.gracedentalcarekovai.com/<?php echo addslashes($post['image']); ?>",
    "datePublished": "<?php echo $post['date']; ?>",
    "author": {
      "@type": "Person",
      "name": "<?php echo addslashes($post['author']); ?>"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Grace Dental Care",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.gracedentalcarekovai.com/assets/logo.png"
      }
    },
    "description": "<?php echo addslashes($post['excerpt']); ?>"
  }
  </script>
  
  <link rel="icon" href="assets/logo.png" type="image/png">
  <link rel="manifest" href="manifest.json">
  <link rel="preload" href="css/style.css?v=8" as="style">
  <link rel="stylesheet" href="css/style.css?v=8">
  <link rel="stylesheet" href="css/treatment-page.css?v=8">
  <style>
    .blog-post-layout { display: grid; grid-template-columns: 1fr 320px; gap: 48px; align-items: start; }
    .blog-post-content { background: var(--black-3); border: 1px solid var(--gold-border); border-radius: var(--radius-xl); padding: 48px; overflow: hidden; }
    .blog-post-header { margin-bottom: 32px; border-bottom: 1px solid var(--gold-border); padding-bottom: 24px; }
    .blog-post-meta { display: flex; gap: 10px; font-size: 0.8rem; color: var(--gold); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 16px; flex-wrap: wrap; }
    .blog-post-cat { font-weight: 700; color: var(--gold); }
    .blog-post-title { font-size: clamp(1.8rem, 4vw, 2.5rem); line-height: 1.2; color: var(--white); margin-bottom: 20px; }
    .blog-post-author { display: flex; align-items: center; gap: 16px; margin-top: 20px; }
    .blog-post-author__avatar { width: 48px; height: 48px; border-radius: 50%; background: var(--gold); color: var(--black); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.95rem; }
    .blog-post-author__name { font-weight: 600; color: var(--white); font-size: 0.95rem; margin: 0; }
    .blog-post-author__role { font-size: 0.78rem; color: var(--gray); margin: 2px 0 0 0; }
    
    .blog-post-body { color: var(--gray); line-height: 1.8; font-size: 1.05rem; }
    .blog-post-body p { margin-bottom: 24px; line-height: 1.85; font-size: 1.05rem; color: var(--gray); }
    .blog-post-body h2 { font-size: 1.6rem; color: var(--white); margin: 40px 0 20px 0; font-weight: 600; font-family: var(--font-heading); }
    .blog-post-body h3 { font-size: 1.25rem; color: var(--white); margin: 30px 0 15px 0; font-weight: 600; }
    .blog-post-body ul, .blog-post-body ol { margin-bottom: 24px; padding-left: 24px; }
    .blog-post-body li { margin-bottom: 10px; line-height: 1.7; }
    .blog-post-body strong { color: var(--white); }
    .blog-post-body blockquote { border-left: 3px solid var(--gold); padding-left: 20px; margin: 32px 0; font-style: italic; color: var(--white-dim); }
    .blog-post-lead { font-size: 1.2rem !important; line-height: 1.8 !important; color: var(--white-dim) !important; margin-bottom: 32px !important; }
    
    /* Highlight tips in articles */
    .tip-heading { display: flex; align-items: center; gap: 16px; margin: 40px 0 20px 0; }
    .tip-number { width: 36px; height: 36px; border-radius: 50%; background: var(--gold-glass); border: 1px solid var(--gold-border); color: var(--gold); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1rem; flex-shrink: 0; }
    .tip-heading h2 { margin: 0 !important; }
    
    @media (max-width: 900px) {
      .blog-post-layout { grid-template-columns: 1fr; }
      .blog-post-content { padding: 24px; }
    }
  </style>
</head>
<body>
<!-- Skip to main content (accessibility) -->
<a href="#main-content" class="skip-to-main">Skip to main content</a>

<header class="navbar" id="navbar">
  <div class="container navbar__inner">
    <a href="./" class="navbar__logo">
      <img src="assets/logo.png" alt="Grace Dental Care" class="navbar__logo-img" width="500" height="500">
      <div class="navbar__logo-text">
        <span class="navbar__logo-name"><span>Grace</span> Dental Care</span>
        <span class="navbar__logo-sub">Kovaipudur · Coimbatore</span>
      </div>
    </a>
    <nav class="navbar__links" aria-label="Main navigation"><a href="./" class="navbar__link">Home</a>
    <div class="navbar__item-dropdown">
      <a href="treatments" class="navbar__link">Treatments <svg class="dropdown-arrow" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg></a>
      <div class="navbar__dropdown-menu"><a href="treatments/dental-implants">Dental Implants</a><a href="treatments/smile-makeover">Smile Makeover</a><a href="treatments/root-canal">Root Canal</a><a href="treatments/braces-aligners">Braces &amp; Aligners</a><a href="treatments/laser-gum-therapy">Laser Gum Therapy</a><a href="treatments/teeth-whitening">Teeth Whitening</a><a href="treatments/pediatric-dentistry">Pediatric Dentistry</a><a href="treatments/wisdom-tooth-removal">Wisdom Tooth Removal</a></div>
    </div>
    <div class="navbar__item-dropdown">
      <a href="doctors" class="navbar__link">Doctors <svg class="dropdown-arrow" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg></a>
      <div class="navbar__dropdown-menu">
        <a href="dr-sherin">Dr. Sherin Grace Babu</a>
        <a href="dr-indu">Dr. Indu S.</a>
        <a href="dr-nandana">Dr. Nandana Jayachandran</a>
    </div>
    </div>
    <a href="technologies" class="navbar__link">Technology</a>
    <a href="results" class="navbar__link">Results</a>
    <a href="blog" class="navbar__link active">Blog</a>
    <a href="contact" class="navbar__link">Contact</a></nav>
    <a href="contact" class="btn btn--gold btn--sm navbar__cta">Book Appointment</a>
    <button class="navbar__hamburger" aria-label="Toggle menu" aria-expanded="false"><span></span><span></span><span></span></button>
  </div>
</header>
<nav class="navbar__mobile" aria-label="Mobile navigation"><div class="navbar__mobile-links"><a href="./" class="navbar__mobile-link">Home</a>
    <div class="navbar__mobile-dropdown">
      <button class="navbar__mobile-dropdown-toggle" type="button">Treatments <svg class="dropdown-arrow" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg></button>
      <div class="navbar__mobile-dropdown-menu"><a href="treatments/dental-implants" class="navbar__mobile-dropdown-link">Dental Implants</a><a href="treatments/smile-makeover" class="navbar__mobile-dropdown-link">Smile Makeover</a><a href="treatments/root-canal" class="navbar__mobile-dropdown-link">Root Canal</a><a href="treatments/braces-aligners" class="navbar__mobile-dropdown-link">Braces &amp; Aligners</a><a href="treatments/laser-gum-therapy" class="navbar__mobile-dropdown-link">Laser Gum Therapy</a><a href="treatments/teeth-whitening" class="navbar__mobile-dropdown-link">Teeth Whitening</a><a href="treatments/pediatric-dentistry" class="navbar__mobile-dropdown-link">Pediatric Dentistry</a><a href="treatments/wisdom-tooth-removal" class="navbar__mobile-dropdown-link">Wisdom Tooth Removal</a></div>
    </div>
    <div class="navbar__mobile-dropdown">
      <button class="navbar__mobile-dropdown-toggle" type="button">Doctors <svg class="dropdown-arrow" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg></button>
      <div class="navbar__mobile-dropdown-menu">
        <a href="dr-sherin" class="navbar__mobile-dropdown-link">Dr. Sherin Grace Babu</a>
        <a href="dr-indu" class="navbar__mobile-dropdown-link">Dr. Indu S.</a>
        <a href="dr-nandana" class="navbar__mobile-dropdown-link">Dr. Nandana Jayachandran</a>
    </div>
    </div>
    <a href="technologies" class="navbar__mobile-link">Technology</a>
    <a href="results" class="navbar__mobile-link">Results</a>
    <a href="blog" class="navbar__mobile-link">Blog</a>
    <a href="contact" class="navbar__mobile-link">Contact</a>
    </div><a href="contact" class="navbar__mobile-cta-btn">Book Appointment</a>
    <div class="navbar__mobile-footer">
      <a href="tel:+918015329529" class="navbar__mobile-phone">+91 80153 29529</a>
      <a href="mailto:gracedentalcarekovai@gmail.com" class="navbar__mobile-email">gracedentalcarekovai@gmail.com</a>
    </div></nav>

<!-- PAGE HERO -->
<section class="page-hero">
  <div class="container page-hero__inner">
    <div class="page-hero__breadcrumb">
      <a href="./">Home</a>
      <span class="page-hero__breadcrumb-sep">›</span>
      <a href="blog">Blog</a>
      <span class="page-hero__breadcrumb-sep">›</span>
      <span style="color:var(--gold);"><?php echo htmlspecialchars($post['category']); ?></span>
    </div>
    <h1><?php echo htmlspecialchars($post['title']); ?></h1>
    <p class="page-hero__sub"><?php echo htmlspecialchars($post['excerpt']); ?></p>
  </div>
</section>

<!-- BLOG CONTENT -->
<section class="section section--light">
  <div class="container">
    <div class="blog-post-layout">

      <!-- Main Article -->
      <article class="blog-post-content">
        <div class="blog-post-header">
          <div class="blog-post-meta">
            <span class="blog-post-cat"><?php echo htmlspecialchars($post['category']); ?></span>
            <span>—</span>
            <span><?php echo formatDate($post['date']); ?></span>
            <span>—</span>
            <span><?php echo htmlspecialchars($post['read_time']); ?></span>
          </div>
          <h2 class="blog-post-title"><?php echo htmlspecialchars($post['title']); ?></h2>
          <div class="blog-post-author">
            <div class="blog-post-author__avatar"><?php echo htmlspecialchars($post['author_avatar']); ?></div>
            <div>
              <p class="blog-post-author__name"><?php echo htmlspecialchars($post['author']); ?></p>
              <p class="blog-post-author__role"><?php echo htmlspecialchars($post['author_role']); ?></p>
            </div>
          </div>
        </div>

        <!-- Featured Image -->
        <div class="blog-post-thumb" style="padding:0;overflow:hidden;max-height:450px;margin-bottom:30px;">
          <img src="<?php echo htmlspecialchars($post['image']); ?>" alt="<?php echo htmlspecialchars($post['title']); ?>" style="width:100%;height:100%;object-fit:cover;border-radius:20px;display:block;" width="1024" height="1024" decoding="async">
        </div>

        <!-- Article Body -->
        <div class="blog-post-body">
          <?php echo $post['content']; ?>
        </div>
      </article>

      <!-- Sidebar -->
      <aside style="position:sticky;top:100px;">
        <div class="blog-sidebar" style="margin-bottom:24px;">
          <h4>Recent Articles</h4>
          <?php foreach ($recent_blogs as $recent): ?>
          <a href="blog/<?php echo htmlspecialchars($recent['id']); ?>" class="blog-recent-item">
            <div class="blog-recent-thumb">
              <img src="<?php echo htmlspecialchars($recent['image']); ?>" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:4px;">
            </div>
            <div>
              <p class="blog-recent-title"><?php echo htmlspecialchars($recent['title']); ?></p>
              <p class="blog-recent-date"><?php echo formatDate($recent['date']); ?></p>
            </div>
          </a>
          <?php endforeach; ?>
        </div>

        <div class="blog-sidebar" style="margin-bottom:24px;">
          <h4>Tags</h4>
          <div class="blog-tag-cloud">
            <span class="blog-tag">Implants</span>
            <span class="blog-tag">Whitening</span>
            <span class="blog-tag">Braces</span>
            <span class="blog-tag">Veneers</span>
            <span class="blog-tag">Laser</span>
            <span class="blog-tag">Kids</span>
            <span class="blog-tag">Root Canal</span>
            <span class="blog-tag">Gum</span>
            <span class="blog-tag">Smile</span>
            <span class="blog-tag">Hygiene</span>
            <span class="blog-tag">Aligners</span>
            <span class="blog-tag">Crowns</span>
          </div>
        </div>

        <!-- Sidebar CTA -->
        <div style="background:linear-gradient(135deg,var(--black-3),var(--black-4));border:1px solid var(--gold-border);border-radius:var(--radius-xl);padding:28px;text-align:center;">
          <svg width="48" height="54" viewBox="0 0 32 36" fill="var(--gold)" opacity="0.3" style="margin:0 auto 16px;" aria-hidden="true">
            <path d="M16 2C11.8 2 8 5.2 8 9.5C8 12 8.8 13.8 9.5 15.5C10.6 18.6 11 23 11.8 27C12.2 28.8 13.5 30 15 28.8C15.6 27.8 15.8 24 16 21.5C16.2 24 16.4 27.8 17 28.8C18.5 30 19.8 28.8 20.2 27C21 23 21.4 18.6 22.5 15.5C23.2 13.8 24 12 24 9.5C24 5.2 20.2 2 16 2Z"></path>
          </svg>
          <h4 style="margin-bottom:8px;font-size:1.1rem;">Have a dental concern?</h4>
          <p style="font-size:0.85rem;margin-bottom:20px;">Don't Google it — ask our specialists directly. Book a consultation today.</p>
          <a href="contact" class="btn btn--gold" style="width:100%;justify-content:center;">Book Appointment</a>
        </div>
      </aside>

    </div>
  </div>
</section>

<footer class="footer">
  <div class="container">
    <div class="footer__bottom">
      <p class="footer__copy">© 2026 Grace Dental Care. All rights reserved. | Kovaipudur, Coimbatore | Powered by <a href="https://thearktech.in/" target="_blank" rel="noopener noreferrer" style="color:var(--gold);text-decoration:underline;">ArkTech</a></p>
      <div class="footer__bottom-links">
        <a href="privacy" class="footer__bottom-link">Privacy Policy</a>
      </div>
    </div>
  </div>
</footer>

<a href="https://wa.me/918015329529" class="fab-wa" target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp">
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"></path></svg>
</a>
<button class="scroll-top" aria-label="Scroll to top"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 15l-6-6-6 6"></path></svg></button>

<script src="js/main.js?v=8"></script>
</body></html>
