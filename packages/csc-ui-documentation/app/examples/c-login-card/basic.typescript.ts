// Stand-in artwork; use your service's own image url as `src` instead.
const artwork = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#006778"/><stop offset="1" stop-color="#1c3d5a"/></linearGradient></defs><rect width="600" height="800" fill="url(#g)"/><circle cx="470" cy="170" r="170" fill="#fff" fill-opacity=".14"/><circle cx="120" cy="660" r="230" fill="#fff" fill-opacity=".08"/></svg>',
)}`;

document.querySelector('c-login-card')!.src = artwork;
