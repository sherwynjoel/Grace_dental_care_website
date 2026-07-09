"""
build.py  -  Static site production builder for Grace Dental Care
========================================================================
Steps:
  1. Clean the ./dist folder
  2. Copy everything from project root into dist/
  3. Minify all HTML files (remove comments, collapse whitespace)
  4. Minify all CSS files (remove comments, collapse whitespace)
  5. Minify all JS files (remove comments, collapse whitespace)
  6. Report before/after sizes

Usage:  python build.py
Output: ./dist/
"""
import os, re, shutil, glob
from pathlib import Path

SRC  = Path(r"c:\Users\Sherwyn joel\OneDrive\Desktop\Grace Dental Care")
DIST = SRC / "dist"

# ── Files / dirs to EXCLUDE from dist ────────────────────────────────────────
EXCLUDE_DIRS  = {"dist", ".git", "node_modules", "__pycache__"}
EXCLUDE_FILES = {
    "inspect_final.html", "inspect_rotate_2.html",
    "build.py", "*.log",
}

# ─────────────────────────────────────────────────────────────────────────────
def should_skip(path: Path) -> bool:
    if path.is_dir():
        return path.name in EXCLUDE_DIRS
    if path.name.startswith(".") and path.name != ".htaccess":
        return True
    for pat in EXCLUDE_FILES:
        if path.match(pat):
            return True
    return False


# ── Minifiers ─────────────────────────────────────────────────────────────────
def minify_html(text: str) -> str:
    # Remove HTML comments (except IE conditionals)
    text = re.sub(r'<!--(?!\[if).*?-->', '', text, flags=re.DOTALL)
    # Collapse whitespace between tags
    text = re.sub(r'>\s+<', '><', text)
    # Collapse runs of whitespace
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n\s*\n', '\n', text)
    return text.strip()


def minify_css(text: str) -> str:
    # Remove /* ... */ comments
    text = re.sub(r'/\*.*?\*/', '', text, flags=re.DOTALL)
    # Collapse whitespace
    text = re.sub(r'\s+', ' ', text)
    # Remove spaces around punctuation
    text = re.sub(r'\s*([{}:;,>~+])\s*', r'\1', text)
    # Remove trailing semicolons before }
    text = text.replace(';}', '}')
    return text.strip()


def minify_js(text: str) -> str:
    # Remove // single-line comments (careful not to strip URLs)
    text = re.sub(r'(?<!:)//[^\n]*', '', text)
    # Remove /* ... */ block comments
    text = re.sub(r'/\*.*?\*/', '', text, flags=re.DOTALL)
    # Collapse whitespace
    text = re.sub(r'\s+', ' ', text)
    # Remove spaces around common operators
    text = re.sub(r'\s*([=;,{}()\[\]])\s*', r'\1', text)
    return text.strip()


# ── Build ─────────────────────────────────────────────────────────────────────
def copy_tree(src: Path, dst: Path):
    """Recursively copy src to dst skipping excluded paths."""
    dst.mkdir(parents=True, exist_ok=True)
    for item in src.iterdir():
        if should_skip(item):
            continue
        dest = dst / item.name
        if item.is_dir():
            copy_tree(item, dest)
        else:
            shutil.copy2(item, dest)


total_saved = 0
processed   = {"html": 0, "css": 0, "js": 0}


def minify_file(path: Path):
    global total_saved
    ext = path.suffix.lower()
    if ext not in (".html", ".css", ".js"):
        return

    original = path.read_text(encoding="utf-8", errors="ignore")
    if ext == ".html":
        minified = minify_html(original)
        processed["html"] += 1
    elif ext == ".css":
        minified = minify_css(original)
        processed["css"] += 1
    else:
        minified = minify_js(original)
        processed["js"] += 1

    saved = len(original.encode()) - len(minified.encode())
    total_saved += saved
    path.write_text(minified, encoding="utf-8")


def walk_and_minify(folder: Path):
    for item in folder.iterdir():
        if item.is_dir():
            walk_and_minify(item)
        else:
            minify_file(item)


# ─── Main ────────────────────────────────────────────────────────────────────
print("=== Grace Dental Care - Production Build ===\n")

# 1. Clean dist
if DIST.exists():
    shutil.rmtree(DIST)
    print("  Cleaned existing dist/ folder")

# 2. Copy
print("  Copying files to dist/ ...")
copy_tree(SRC, DIST)

# Count before
before_size = sum(f.stat().st_size for f in DIST.rglob("*") if f.is_file())
before_count = sum(1 for f in DIST.rglob("*") if f.is_file())
print(f"  Copied {before_count} files  ({before_size/1024/1024:.2f} MB)")

# 3. Minify HTML/CSS/JS in dist
print("  Minifying HTML / CSS / JS ...")
walk_and_minify(DIST)

after_size = sum(f.stat().st_size for f in DIST.rglob("*") if f.is_file())

print()
print("=" * 50)
print(f"  HTML files minified : {processed['html']}")
print(f"  CSS  files minified : {processed['css']}")
print(f"  JS   files minified : {processed['js']}")
print(f"  Total files in dist : {before_count}")
print()
print(f"  Before: {before_size/1024/1024:.2f} MB")
print(f"  After : {after_size/1024/1024:.2f} MB")
print(f"  Saved : {(before_size-after_size)/1024:.0f} KB  ({(before_size-after_size)/before_size*100:.1f}%)")
print()
print(f"  Build output -> {DIST}")
print("  Done!")
