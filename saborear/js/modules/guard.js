// Proteção da prévia. Não impede quem sabe copiar um site, mas desencoraja o uso sem autorização:
// 1) selo fixo "Prévia · Thomas Chaimovitz"; 2) fora do domínio da prévia, a página vira um aviso;
// 3) sem clique direito e sem arrastar nas imagens.
const HOSTS = ['chaimovitz.github.io', 'localhost', '127.0.0.1'];

export function initGuard() {
  if (!HOSTS.includes(location.hostname)) {
    document.documentElement.innerHTML = '<body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#121A30;color:#FBF6EE;font:16px/1.6 system-ui,sans-serif;text-align:center;padding:2rem">'
      + '<div><p style="font-size:1.6rem;margin:0 0 .6rem">Prévia de site · uso não autorizado</p>'
      + '<p style="opacity:.75;margin:0">Este layout é de Thomas Chaimovitz. A versão original está em <a style="color:#E9A23B" href="https://chaimovitz.github.io/saborear/">chaimovitz.github.io/saborear</a>.</p></div></body>';
    return;
  }
  const seal = document.createElement('div');
  seal.className = 'seal';
  seal.textContent = 'Prévia · Thomas Chaimovitz';
  seal.setAttribute('aria-hidden', 'true');
  document.body.appendChild(seal);

  const isImg = e => e.target instanceof HTMLImageElement;
  addEventListener('contextmenu', e => { if (isImg(e)) e.preventDefault(); });
  addEventListener('dragstart', e => { if (isImg(e)) e.preventDefault(); });
}
