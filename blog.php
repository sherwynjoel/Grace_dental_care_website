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

// Sort blogs by date descending
usort($blogs, function($a, $b) {
    return strcmp($b['date'], $a['date']);
});

// Category filtering
$selected_category = isset($_GET['category']) ? trim($_GET['category']) : '';
$filtered_blogs = $blogs;
if ($selected_category !== '') {
    $filtered_blogs = array_filter($blogs, function($blog) use ($selected_category) {
        return strcasecmp($blog['category'], $selected_category) === 0;
    });
}

// Dynamic categories counts from ALL blogs
$categories_count = [];
foreach ($blogs as $blog) {
    $cat = $blog['category'];
    if (!isset($categories_count[$cat])) {
        $categories_count[$cat] = 0;
    }
    $categories_count[$cat]++;
}

// Identify featured article (either marked featured, or most recent)
$featured_blog = null;
if (empty($selected_category)) {
    // Check if any post is explicitly marked featured
    foreach ($filtered_blogs as $key => $blog) {
        if (isset($blog['featured']) && $blog['featured'] === true) {
            $featured_blog = $blog;
            unset($filtered_blogs[$key]);
            break;
        }
    }
    // Fallback: take the most recent post as featured
    if ($featured_blog === null && !empty($filtered_blogs)) {
        $featured_blog = array_shift($filtered_blogs);
    }
}

// Re-index array after modifications
$filtered_blogs = array_values($filtered_blogs);

// Pagination
$posts_per_page = 6;
$total_posts = count($filtered_blogs);
$total_pages = max(1, ceil($total_posts / $posts_per_page));
$current_page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
if ($current_page < 1) $current_page = 1;
if ($current_page > $total_pages) $current_page = $total_pages;

$start_index = ($current_page - 1) * $posts_per_page;
$paginated_blogs = array_slice($filtered_blogs, $start_index, $posts_per_page);

// Recent articles for sidebar (top 3)
$recent_blogs = array_slice($blogs, 0, 3);

// Helper to format date
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
  <title><?php echo empty($selected_category) ? 'Dental Health Blog | Tips & Guides | Grace Dental Care Coimbatore' : htmlspecialchars($selected_category) . ' Articles | Grace Dental Care Blog'; ?></title>
  <meta name="description" content="Read expert dental health tips, treatment guides, and oral care advice from the dentists at Grace Dental Care, Coimbatore. Stay informed, stay healthy.">
  <meta name="keywords" content="dental blog Coimbatore, oral health tips, dental advice, dentist blog India, dental health guide, Grace Dental Care blog">
  <meta name="author" content="Grace Dental Care">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
  <link rel="canonical" href="https://www.gracedentalcarekovai.com/blog<?php echo empty($selected_category) ? '' : '?category=' . urlencode($selected_category); ?>">
  <!-- Geo Tags -->
  <meta name="geo.region" content="IN-TN">
  <meta name="geo.placename" content="Kovaipudur, Coimbatore, Tamil Nadu">
  <meta name="geo.position" content="10.9390;76.9255">
  <meta name="ICBM" content="10.9390, 76.9255">
  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="Dental Health Blog | Tips & Guides | Grace Dental Care Coimbatore">
  <meta property="og:description" content="Read expert dental health tips, treatment guides, and oral care advice from the dentists at Grace Dental Care, Coimbatore. Stay informed, stay healthy.">
  <meta property="og:url" content="https://www.gracedentalcarekovai.com/blog">
  <meta property="og:site_name" content="Grace Dental Care">
  <meta property="og:image" content="https://www.gracedentalcarekovai.com/assets/og-image.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Grace Dental Care – Premium Dental Clinic in Kovaipudur, Coimbatore">
  <meta property="og:locale" content="en_IN">
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Dental Health Blog | Tips & Guides | Grace Dental Care Coimbatore">
  <meta name="twitter:description" content="Read expert dental health tips, treatment guides, and oral care advice from the dentists at Grace Dental Care, Coimbatore. Stay informed, stay healthy.">
  <meta name="twitter:image" content="https://www.gracedentalcarekovai.com/assets/og-image.jpg">
  <meta name="twitter:site" content="@gracedentalkovai">
  <!-- Theme Color -->
  <meta name="theme-color" content="#C4A35A">
  <!-- Preconnect -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preconnect" href="https://www.googletagmanager.com">
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://www.gracedentalcarekovai.com/"},{"@type":"ListItem","position":2,"name":"Dental Health Blog","item":"https://www.gracedentalcarekovai.com/blog"}]}</script>
  <link rel="icon" href="assets/logo.png" type="image/png">
  <link rel="apple-touch-icon" href="assets/logo.png">
  <link rel="manifest" href="manifest.json">
  <!-- Google Analytics 4 -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
  <script>
    window.dataLayer=window.dataLayer||[];
    function gtag(){dataLayer.push(arguments);}
    gtag('js',new Date());
    gtag('config','G-XXXXXXXXXX',{send_page_view:true});
    function trackEvent(action,category,label){gtag('event',action,{event_category:category,event_label:label});}
    document.addEventListener('DOMContentLoaded',function(){
      document.querySelectorAll('a[href*="tel:"]').forEach(function(el){el.addEventListener('click',function(){trackEvent('call_click','engagement','phone_click');});});
      document.querySelectorAll('a[href*="wa.me"],a[href*="whatsapp"]').forEach(function(el){el.addEventListener('click',function(){trackEvent('whatsapp_click','engagement','whatsapp_fab');});});
      document.querySelectorAll('a[href*="contact"]').forEach(function(el){el.addEventListener('click',function(){trackEvent('book_appointment','engagement','cta_click');});});
      var form=document.querySelector('form');
      if(form){form.addEventListener('submit',function(){trackEvent('form_submit','conversion','contact_form');});}
    });
  </script>
  <link rel="preload" href="css/style.css?v=8" as="style">
  <link rel="stylesheet" href="css/style.css?v=8">
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
      <a href="./">Home</a><span class="page-hero__breadcrumb-sep">›</span>
      <?php if ($selected_category !== ''): ?>
        <a href="blog">Blog</a><span class="page-hero__breadcrumb-sep">›</span>
        <span style="color:var(--gold);"><?php echo htmlspecialchars($selected_category); ?></span>
      <?php else: ?>
        <span style="color:var(--gold);">Blog</span>
      <?php endif; ?>
    </div>
    <h1>Dental Health<br><em style="color:var(--gold);font-style:italic;">Insights &amp; Tips</em></h1>
    <p class="page-hero__sub">Expert advice from our specialists on maintaining a healthy smile — from daily habits to understanding complex treatments.</p>
  </div>
</section>

<!-- BLOG CONTENT -->
<section class="section section--light">
  <div class="container">
    <div style="display:grid;grid-template-columns:1fr 320px;gap:48px;align-items:start;" class="blog-layout">

      <!-- Blog Posts -->
      <div>

        <!-- Featured Post -->
        <?php if ($featured_blog !== null): ?>
        <div style="background:var(--black-3);border:1px solid var(--gold-border);border-radius:var(--radius-xl);overflow:hidden;margin-bottom:32px;" data-reveal="">
          <div style="aspect-ratio:16/7;position:relative;overflow:hidden;">
            <img src="<?php echo htmlspecialchars($featured_blog['image']); ?>" alt="<?php echo htmlspecialchars($featured_blog['title']); ?>" style="width:100%;height:100%;object-fit:cover;display:block;" width="1024" height="1024" decoding="async">
            <div style="position:absolute;top:20px;left:20px;z-index:2;">
              <span style="padding:5px 14px;background:var(--gold);border-radius:var(--radius-pill);font-size:0.7rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--black);">Featured</span>
            </div>
            <div style="position:absolute;bottom:20px;left:20px;z-index:2;">
              <span style="padding:4px 12px;background:rgba(0,0,0,0.6);border:1px solid var(--gold-border);border-radius:var(--radius-pill);font-size:0.7rem;color:var(--gold);font-weight:600;letter-spacing:0.08em;text-transform:uppercase;"><?php echo htmlspecialchars($featured_blog['category']); ?></span>
            </div>
          </div>
          <div style="padding:32px;">
            <div style="display:flex;gap:12px;margin-bottom:14px;font-size:0.78rem;color:var(--gray);flex-wrap:wrap;">
              <span><?php echo formatDate($featured_blog['date']); ?></span>
              <span>—</span>
              <span><?php echo htmlspecialchars($featured_blog['author']); ?></span>
              <span>—</span>
              <span><?php echo htmlspecialchars($featured_blog['read_time']); ?></span>
            </div>
            <h2 style="font-size:1.6rem;margin-bottom:14px;line-height:1.3;"><a href="blog/<?php echo htmlspecialchars($featured_blog['id']); ?>" style="color:var(--white);"><?php echo htmlspecialchars($featured_blog['title']); ?></a></h2>
            <p style="margin-bottom:24px;color:var(--gray);"><?php echo htmlspecialchars($featured_blog['excerpt']); ?></p>
            <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:center;">
              <a href="blog/<?php echo htmlspecialchars($featured_blog['id']); ?>" class="btn btn--gold">Read Full Article</a>
            </div>
          </div>
        </div>
        <?php elseif ($total_posts === 0): ?>
          <div style="padding:48px;background:var(--black-3);border:1px solid var(--gold-border);border-radius:var(--radius-xl);text-align:center;">
            <h4 style="margin-bottom:8px;font-size:1.2rem;">No Articles Found</h4>
            <p style="color:var(--gray);margin-bottom:24px;">There are no articles posted in this category yet.</p>
            <a href="blog" class="btn btn--gold">View All Articles</a>
          </div>
        <?php endif; ?>

        <!-- Blog Grid -->
        <?php if (!empty($paginated_blogs)): ?>
        <div class="grid-2" style="gap:24px;">
          <?php $delay = 1; foreach ($paginated_blogs as $blog): ?>
          <div class="blog-card" data-reveal="" data-delay="<?php echo $delay; ?>">
            <div class="blog-card__thumb">
              <img src="<?php echo htmlspecialchars($blog['image']); ?>" alt="<?php echo htmlspecialchars($blog['title']); ?>" style="width:100%;height:100%;object-fit:cover;display:block;" width="1024" height="1024" loading="lazy" decoding="async">
              <span class="blog-card__cat"><?php echo htmlspecialchars($blog['category']); ?></span>
            </div>
            <div class="blog-card__body">
              <div class="blog-card__meta">
                <span><?php echo formatDate($blog['date']); ?></span>
                <span class="blog-card__meta-dot"></span>
                <span><?php echo htmlspecialchars($blog['read_time']); ?></span>
              </div>
              <h3><a href="blog/<?php echo htmlspecialchars($blog['id']); ?>"><?php echo htmlspecialchars($blog['title']); ?></a></h3>
              <p><?php echo htmlspecialchars($blog['excerpt']); ?></p>
              <a href="blog/<?php echo htmlspecialchars($blog['id']); ?>" class="blog-card__link">Read More <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"></path></svg></a>
            </div>
          </div>
          <?php $delay = ($delay % 4) + 1; endforeach; ?>
        </div>

        <!-- Pagination -->
        <?php if ($total_pages > 1): ?>
        <div style="display:flex;gap:8px;margin-top:40px;flex-wrap:wrap;" data-reveal="">
          <?php for ($i = 1; $i <= $total_pages; $i++): 
            $page_url = 'blog?page=' . $i . (empty($selected_category) ? '' : '&category=' . urlencode($selected_category));
            $is_current = ($i === $current_page);
          ?>
            <?php if ($is_current): ?>
              <span style="width:40px;height:40px;border-radius:var(--radius-sm);background:var(--gold);color:var(--black);display:flex;align-items:center;justify-content:center;font-size:0.875rem;font-weight:700;"><?php echo $i; ?></span>
            <?php else: ?>
              <a href="<?php echo $page_url; ?>" style="width:40px;height:40px;border-radius:var(--radius-sm);background:var(--gold-glass);border:1px solid var(--gold-border);color:var(--gray);display:flex;align-items:center;justify-content:center;font-size:0.875rem;transition:all 0.2s;" onmouseover="this.style.borderColor='var(--gold)';this.style.color='var(--gold)';" onmouseout="this.style.borderColor='var(--gold-border)';this.style.color='var(--gray)';"><?php echo $i; ?></a>
            <?php endif; ?>
          <?php endfor; ?>
          
          <?php if ($current_page < $total_pages): 
            $next_url = 'blog?page=' . ($current_page + 1) . (empty($selected_category) ? '' : '&category=' . urlencode($selected_category));
          ?>
            <a href="<?php echo $next_url; ?>" style="padding:0 16px;height:40px;border-radius:var(--radius-sm);background:var(--gold-glass);border:1px solid var(--gold-border);color:var(--gray);display:flex;align-items:center;gap:4px;font-size:0.875rem;">Next <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M5 12h14M12 5l7 7-7 7"></path></svg></a>
          <?php endif; ?>
        </div>
        <?php endif; ?>
        <?php endif; ?>
      </div>

      <!-- Sidebar -->
      <aside style="position:sticky;top:100px;">
        <div class="blog-sidebar" style="margin-bottom:24px;" data-reveal="">
          <h4>Categories</h4>
          <a href="blog" class="blog-category-link <?php echo empty($selected_category) ? 'active' : ''; ?>">All Articles <span class="blog-category-count"><?php echo count($blogs); ?></span></a>
          <?php foreach ($categories_count as $cat => $count): 
            $cat_url = 'blog?category=' . urlencode($cat);
            $is_active = (strcasecmp($selected_category, $cat) === 0);
          ?>
            <a href="<?php echo $cat_url; ?>" class="blog-category-link <?php echo $is_active ? 'active' : ''; ?>"><?php echo htmlspecialchars($cat); ?> <span class="blog-category-count"><?php echo $count; ?></span></a>
          <?php endforeach; ?>
        </div>

        <div class="blog-sidebar" style="margin-bottom:24px;" data-reveal="">
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

        <div class="blog-sidebar" style="margin-bottom:24px;" data-reveal="">
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
        <div style="background:linear-gradient(135deg,var(--black-3),var(--black-4));border:1px solid var(--gold-border);border-radius:var(--radius-xl);padding:28px;text-align:center;" data-reveal="">
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
        <a href="privacy" class="footer__bottom-link">Terms of Service</a>
      </div>
    </div>
  </div>
</footer>

<a href="https://wa.me/918015329529" target="_blank" rel="noopener noreferrer" class="fab-wa" aria-label="WhatsApp">
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"></path></svg>
</a>
<button class="scroll-top" aria-label="Scroll to top"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 15l-6-6-6 6"></path></svg></button>

<style>
  @media (max-width:860px) {
    .blog-layout { grid-template-columns: 1fr !important; }
    .blog-layout aside { position:static !important; }
  }
</style>

<script src="js/main.js?v=8"></script>
</body></html>
