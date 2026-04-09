const SECTION_HEIGHTS: Record<string, string> = {
  pars: '60px',
  presets: '30px',
  colors: '80px',
  fade: '50px',
};

export function toggleSection(name: string): void {
  const el = document.getElementById('section-' + name);
  const btn = document.getElementById('btn-' + name);
  if (!el) return;
  const isHidden = el.classList.contains('hidden');
  if (isHidden) {
    el.classList.remove('hidden');
    el.style.maxHeight = SECTION_HEIGHTS[name] ?? '60px';
    btn?.classList.add('active');
  } else {
    el.classList.add('hidden');
    btn?.classList.remove('active');
  }
}
