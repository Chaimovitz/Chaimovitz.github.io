import { $, $$, clamp } from "./utils.js";
import { TAPS } from "../data/taps.js";
function initTaps() {
  const board = $("#tapBoard");
  if (!board) return;
  const fmt = (n) => String(n).replace(".", ",");
  const or = (v, ph) => v ?? `<span class="tbc">${ph}</span>`;
  TAPS.forEach((t, i) => {
    const li = document.createElement("li");
    li.className = "tap" + (t.pending ? " is-pending" : "");
    li.innerHTML = `
      <button class="tap-btn" type="button" aria-expanded="false" aria-controls="tap-p${i}">
        <span class="tap-num mono">${String(i + 1).padStart(2, "0")}</span>
        <span class="tap-title"><span class="tap-name">${t.name ?? "Torneira " + String(i + 1).padStart(2, "0")}</span><span class="tap-style serif">${t.style ?? "estilo a confirmar"}</span></span>
        <span class="tap-data mono"><span><b>ABV</b>${t.abv != null ? fmt(t.abv) + "%" : "—"}</span><span><b>IBU</b>${t.ibu ?? "—"}</span></span>
        <span class="tap-plus" aria-hidden="true"></span>
      </button>
      <div class="tap-panel" id="tap-p${i}" role="region" aria-label="Detalhes do chopp ${i + 1}"><div>
        <p class="tap-notes serif">${t.notes ?? "Notas de degustação entram com a carta oficial da casa."}</p>
        <dl class="tap-facts mono"><div><dt>Combina com</dt><dd>${or(t.pairs, "a confirmar")}</dd></div>${t.ibu != null ? `<div><dt>Amargor</dt><dd><span class="meter" role="img" aria-label="Amargor ${t.ibu} de 100"><i style="--w:${clamp(t.ibu, 4, 100)}%"></i></span></dd></div>` : ""}</dl>
      </div></div>`;
    board.appendChild(li);
  });
  new IntersectionObserver((es, io) => {
    if (es[0].isIntersecting) {
      $$(".tap", board).forEach((el, k) => setTimeout(() => el.classList.add("show"), k * 90));
      io.disconnect();
    }
  }, { threshold: 0.08 }).observe(board);
  board.addEventListener("click", (e) => {
    const btn = e.target.closest(".tap-btn");
    if (!btn) return;
    const li = btn.parentElement, open = !li.classList.contains("open");
    $$(".tap.open", board).forEach((o) => {
      if (o !== li) {
        o.classList.remove("open");
        $(".tap-btn", o).setAttribute("aria-expanded", "false");
      }
    });
    li.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", String(open));
  });
}
export {
  initTaps
};
