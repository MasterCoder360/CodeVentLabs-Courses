/* ============================================================
   CodeVent Labs — inline icon set

   Paths are taken from Lucide (lucide-static v1.80.0, ISC licence,
   https://lucide.dev). They are inlined instead of loaded from a CDN
   so the site stays dependency-free and works offline.

   Line icons are drawn two-tone: the outline is stroked in the
   current text colour and the interior is filled with a tint of the
   same colour (see the .icon rules in style.css). Brand marks keep
   their own official colours and are handled separately below.
   ============================================================ */

const ICONS = {
    'hand':
        '<path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2" /> <path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2" /> <path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8" /> <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />',
    'megaphone':
        '<path d="M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" /> <path d="M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14" /> <path d="M8 6v8" />',
    'message-circle':
        '<path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719" />',
    'package':
        '<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" /> <path d="M12 22V12" /> <polyline points="3.29 7 12 12 20.71 7" /> <path d="m7.5 4.27 9 5.15" />',
    'pencil':
        '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" /> <path d="m15 5 4 4" />',
    'refresh-cw':
        '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /> <path d="M21 3v5h-5" /> <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /> <path d="M8 16H3v5" />',
    'ruler':
        '<path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z" /> <path d="m14.5 12.5 2-2" /> <path d="m11.5 9.5 2-2" /> <path d="m8.5 6.5 2-2" /> <path d="m17.5 15.5 2-2" />',
    'globe':
        '<circle cx="12" cy="12" r="10" /> <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /> <path d="M2 12h20" />',
    'bot':
        '<path d="M12 8V4H8" /> <rect width="16" height="12" x="4" y="8" rx="2" /> <path d="M2 14h2" /> <path d="M20 14h2" /> <path d="M15 13v2" /> <path d="M9 13v2" />',
    'cat':
        '<path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7-.42 7 .57 1.07 1 2.24 1 3.44C21 17.9 16.97 21 12 21s-9-3-9-7.56c0-1.25.5-2.4 1-3.44 0 0-1.89-6.42-.5-7 1.39-.58 4.72.23 6.5 2.23A9.04 9.04 0 0 1 12 5Z" /> <path d="M8 14v.5" /> <path d="M16 14v.5" /> <path d="M11.25 16.25h1.5L12 17l-.75-.75Z" />',
    'brain':
        '<path d="M12 18V5" /> <path d="M15 13a4.17 4.17 0 01-3-4 4.17 4.17 0 01-3 4" /> <path d="M17.707 6.294A3 3 0 1012 5a3 3 0 10-5.707 1.294" /> <path d="M17.996 5.125a4 4 0 012.526 5.77" /> <path d="M18 18a4 4 0 002-7.465" /> <path d="M19.967 17.482a4 4 0 11-7.967.517 4 4 0 11-7.967-.517" /> <path d="M6 18a4 4 0 01-2-7.465" /> <path d="M6.004 5.125a4 4 0 00-2.526 5.77" />',
    'bird':
        '<path d="M16 7h.01" /> <path d="M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20" /> <path d="m20 7 2 .5-2 .5" /> <path d="M10 18v3" /> <path d="M14 17.75V21" /> <path d="M7 18a6 6 0 0 0 3.84-10.61" />',
    'sliders-horizontal':
        '<path d="M10 5H3" /> <path d="M12 19H3" /> <path d="M14 3v4" /> <path d="M16 17v4" /> <path d="M21 12h-9" /> <path d="M21 19h-5" /> <path d="M21 5h-7" /> <path d="M8 10v4" /> <path d="M8 12H3" />',
    'zap':
        '<path d="M15.914 4a1.5 1.5 0 00-2.474-1.561l-9 9A1.5 1.5 0 005.5 14h4.002a.5.5 0 01.471.666L8.086 20a1.5 1.5 0 002.475 1.56l9-9A1.5 1.5 0 0018.5 10h-3.997a.5.5 0 01-.472-.667z" />',
    'lock':
        '<rect width="18" height="11" x="3" y="11" rx="2" ry="2" /> <path d="M7 11V7a5 5 0 0 1 10 0v4" />',
    'gift':
        '<path d="M12 7v14" /> <path d="M20 11v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8" /> <path d="M7.5 7a1 1 0 0 1 0-5A4.8 8 0 0 1 12 7a4.8 8 0 0 1 4.5-5 1 1 0 0 1 0 5" /> <rect x="3" y="7" width="18" height="4" rx="1" />',
    'trophy':
        '<path d="M10 14.66V17a1 1 0 0 1-1 1 2 2 0 0 0-2 2v2" /> <path d="M14 14.66V17a1 1 0 0 0 1 1 2 2 0 0 1 2 2v2" /> <path d="M17.916 10H19.5A2.5 2.5 0 0 0 22 7.5V5a1 1 0 0 0-1-1h-3" /> <path d="M4 22h16" /> <path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z" /> <path d="M6.084 10H4.5A2.5 2.5 0 0 1 2 7.5V5a1 1 0 0 1 1-1h3" />',
    'heart':
        '<path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />',
    'party-popper':
        '<path d="M5.8 11.3 2 22l10.7-3.79" /> <path d="M4 3h.01" /> <path d="M22 8h.01" /> <path d="M15 2h.01" /> <path d="M22 20h.01" /> <path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10" /> <path d="m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11c-.11.7-.72 1.22-1.43 1.22H17" /> <path d="m11 2 .33.82c.34.86-.2 1.82-1.11 1.98C9.52 4.9 9 5.52 9 6.23V7" /> <path d="M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z" />',
    'heart-crack':
        '<path d="M12.409 5.824c-.702.792-1.15 1.496-1.415 2.166l2.153 2.156a.5.5 0 0 1 0 .707l-2.293 2.293a.5.5 0 0 0 0 .707L12 15" /> <path d="M13.508 20.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5a5.5 5.5 0 0 1 9.591-3.677.6.6 0 0 0 .818.001A5.5 5.5 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5z" />',
    'sparkles':
        '<path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" /> <path d="M20 2v4" /> <path d="M22 4h-4" /> <circle cx="4" cy="20" r="2" />',
    'book':
        '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />',
    'shapes':
        '<path d="M8.3 10a.7.7 0 0 1-.626-1.079L11.4 3a.7.7 0 0 1 1.198-.043L16.3 8.9a.7.7 0 0 1-.572 1.1Z" /> <rect x="3" y="14" width="7" height="7" rx="1" /> <circle cx="17.5" cy="17.5" r="3.5" />',
    'toggle-right':
        '<circle cx="15" cy="12" r="3" /> <rect width="20" height="14" x="2" y="5" rx="7" />',
    'calculator':
        '<rect width="16" height="20" x="4" y="2" rx="2" /> <path d="M8 6h8" /> <path d="M16 14v4" /> <path d="M16 10h.01" /> <path d="M12 10h.01" /> <path d="M8 10h.01" /> <path d="M12 14h.01" /> <path d="M8 14h.01" /> <path d="M12 18h.01" /> <path d="M8 18h.01" />',
    'user':
        '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /> <circle cx="12" cy="7" r="4" />',
    'user-plus':
        '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /> <circle cx="9" cy="7" r="4" /> <line x1="19" x2="19" y1="8" y2="14" /> <line x1="22" x2="16" y1="11" y2="11" />',
    'users':
        '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /> <path d="M16 3.128a4 4 0 0 1 0 7.744" /> <path d="M22 21v-2a4 4 0 0 0-3-3.87" /> <circle cx="9" cy="7" r="4" />',
    'log-in':
        '<path d="m10 17 5-5-5-5" /> <path d="M15 12H3" /> <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />',
    'log-out':
        '<path d="m16 17 5-5-5-5" /> <path d="M21 12H9" /> <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />',
    'mail':
        '<path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" /> <rect x="2" y="4" width="20" height="16" rx="2" />',
    'eye':
        '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /> <circle cx="12" cy="12" r="3" />',
    'eye-off':
        '<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" /> <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" /> <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" /> <path d="m2 2 20 20" />',
    'cloud-check':
        '<path d="m17 15-5.5 5.5L9 18" /> <path d="M5.516 16.07A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 3.501 7.327" />',
    'shield-check':
        '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /> <path d="m9 12 2 2 4-4" />',
    'circle-alert':
        '<circle cx="12" cy="12" r="10" /> <line x1="12" x2="12" y1="8" y2="12" /> <line x1="12" x2="12.01" y1="16" y2="16" />',
    'check':
        '<path d="M20 6 9 17l-5-5" />',
    'loader-circle':
        '<path d="M21 12a9 9 0 1 1-6.219-8.56" />',
    'flame':
        '<path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4" />',
    'gem':
        '<path d="M10.5 3 8 9l4 13 4-13-2.5-6" /> <path d="M17 3a2 2 0 0 1 1.6.8l3 4a2 2 0 0 1 .013 2.382l-7.99 10.986a2 2 0 0 1-3.247 0l-7.99-10.986A2 2 0 0 1 2.4 7.8l2.998-3.997A2 2 0 0 1 7 3z" /> <path d="M2 9h20" />',
};

/* Brand marks keep their official artwork and colours, so they are
   stored as complete SVGs rather than as two-tone path data. */
const BRAND_ICONS = {
    /* Python logo — trademark of the Python Software Foundation.
       https://www.python.org/community/logos/ */
    'python':
        `<svg viewBox='0.21 -0.077 110 110' class='brand-icon' aria-hidden='true' focusable='false'>
            <linearGradient id='py-blue' gradientUnits='userSpaceOnUse' x1='63.8159' y1='56.6829' x2='118.4934' y2='1.8225' gradientTransform='matrix(1 0 0 -1 -53.2974 66.4321)'>
                <stop offset='0' stop-color='#387EB8'/><stop offset='1' stop-color='#366994'/>
            </linearGradient>
            <linearGradient id='py-yellow' gradientUnits='userSpaceOnUse' x1='97.0444' y1='21.6321' x2='155.6665' y2='-34.5308' gradientTransform='matrix(1 0 0 -1 -53.2974 66.4321)'>
                <stop offset='0' stop-color='#FFE052'/><stop offset='1' stop-color='#FFC331'/>
            </linearGradient>
            <path fill='url(#py-blue)' d='M55.023-0.077c-25.971,0-26.25,10.081-26.25,12.156c0,3.148,0,12.594,0,12.594h26.75v3.781 c0,0-27.852,0-37.375,0c-7.949,0-17.938,4.833-17.938,26.25c0,19.673,7.792,27.281,15.656,27.281c2.335,0,9.344,0,9.344,0 s0-9.765,0-13.125c0-5.491,2.721-15.656,15.406-15.656c15.91,0,19.971,0,26.531,0c3.902,0,14.906-1.696,14.906-14.406 c0-13.452,0-17.89,0-24.219C82.054,11.426,81.515-0.077,55.023-0.077z M40.273,8.392c2.662,0,4.813,2.15,4.813,4.813 c0,2.661-2.151,4.813-4.813,4.813s-4.813-2.151-4.813-4.813C35.46,10.542,37.611,8.392,40.273,8.392z'/>
            <path fill='url(#py-yellow)' d='M55.397,109.923c25.959,0,26.282-10.271,26.282-12.156c0-3.148,0-12.594,0-12.594H54.897v-3.781 c0,0,28.032,0,37.375,0c8.009,0,17.938-4.954,17.938-26.25c0-23.322-10.538-27.281-15.656-27.281c-2.336,0-9.344,0-9.344,0 s0,10.216,0,13.125c0,5.491-2.631,15.656-15.406,15.656c-15.91,0-19.476,0-26.532,0c-3.892,0-14.906,1.896-14.906,14.406 c0,14.475,0,18.265,0,24.219C28.366,100.497,31.562,109.923,55.397,109.923z M70.148,101.454c-2.662,0-4.813-2.151-4.813-4.813 s2.15-4.813,4.813-4.813c2.661,0,4.813,2.151,4.813,4.813S72.809,101.454,70.148,101.454z'/>
        </svg>`,
};

let brandSeq = 0;

/* Build an <svg> node for an icon name, e.g. iconEl('package', 'big').
   Brand marks are returned as their own coloured SVG; anything unknown
   falls back to the sparkles icon so a typo never leaves a blank box. */
function iconEl(name, cls) {
    if (BRAND_ICONS[name]) {
        // A unique id suffix per copy keeps each copy's gradients working
        // even after an earlier copy has been removed from the page.
        const n = ++brandSeq;
        const markup = BRAND_ICONS[name].replace(/(id='|url\(#)([A-Za-z0-9_-]+)/g,
            (match, prefix, id) => prefix + id + '-' + n);
        const template = document.createElement('template');
        template.innerHTML = markup.trim();
        const svg = template.content.firstElementChild;
        svg.setAttribute('class', ('brand-icon ' + (cls || '')).trim());
        return svg;
    }

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('class', 'icon' + (cls ? ' ' + cls : ''));
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.innerHTML = ICONS[name] || ICONS.sparkles;
    return svg;
}

/* Turn any element carrying data-icon="name" into that icon. */
function hydrateIcons(root) {
    (root || document).querySelectorAll('[data-icon]').forEach(node => {
        if (node.dataset.iconReady) return;
        node.appendChild(iconEl(node.dataset.icon));
        node.dataset.iconReady = '1';
    });
}
