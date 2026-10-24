import { $, $$ } from "./utils.js";
import { CONFIG } from "../config.js";
function initReserve() {
  const form = $("#reserva");
  if (!form) return;
  const R = CONFIG.reserve;
  const els = { nome: form.nome, pessoas: form.pessoas, dia: form.dia, hora: form.hora };
  const box = $("#f-lugar"), preview = $("#preview");
  const pad = (n) => String(n).padStart(2, "0");
  for (let n = 1; n <= R.maxGuests; n++) els.pessoas.add(new Option(n === 1 ? "1 pessoa" : n + " pessoas", n));
  els.pessoas.value = "2";
  R.places.forEach((p, i) => {
    const l = document.createElement("label");
    l.className = "place";
    l.innerHTML = `<input type="radio" name="lugar" value="${p.name}" ${i === 0 ? "checked" : ""}><span class="mono">${pad(i + 1)}</span><strong>${p.name}</strong>`;
    box.appendChild(l);
  });
  const parseDay = (v) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || "");
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
  };
  const now0 = new Date();
  els.dia.min = `${now0.getFullYear()}-${pad(now0.getMonth() + 1)}-${pad(now0.getDate())}`;
  const dayInfo = () => {
    const d = parseDay(els.dia.value);
    if (!d) return null;
    const open = !CONFIG.openDays || CONFIG.openDays.includes(d.getDay());
    return { d, open, limit: R.arrivalLimit?.[d.getDay()] ?? null, week: CONFIG.weekdayNames[d.getDay()] };
  };
  const syncHour = () => {
    const info = dayInfo();
    els.hora.min = CONFIG.opensAt || "";
    els.hora.max = info?.limit || "";
  };
  const message = () => {
    const info = dayInfo();
    const dia = info ? `${pad(info.d.getDate())}/${pad(info.d.getMonth() + 1)} (${info.week})` : "[escolha o dia]";
    return [
      `Olá, ${CONFIG.brand}! Quero fazer uma reserva.`,
      `Nome: ${els.nome.value.trim() || "[seu nome e sobrenome]"}`,
      `Pessoas: ${els.pessoas.value}`,
      `Dia: ${dia}`,
      `Horário: ${els.hora.value || "[horário]"}`,
      `Lugar: ${form.lugar.value}`
    ].join("\n");
  };
  const render = () => {
    preview.textContent = message();
  };
  const setErr = (k, msg) => {
    const p = $(`.err[data-for="${k}"]`, form);
    if (p) p.textContent = msg || "";
    if (els[k]) els[k].setAttribute("aria-invalid", msg ? "true" : "false");
  };
  form.addEventListener("input", (e) => {
    render();
    if (e.target.name) setErr(e.target.name, "");
  });
  els.dia.addEventListener("change", () => {
    syncHour();
    setErr("dia", "");
    render();
  });
  $$(".place input", box).forEach((r) => r.addEventListener("change", render));
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let first = null;
    const bad = (k, m) => {
      setErr(k, m);
      first = first || els[k];
    };
    ["nome", "pessoas", "dia", "hora"].forEach((k) => setErr(k, ""));
    const nome = els.nome.value.trim().split(/\s+/);
    if (nome.length < 2 || nome[1].length < 2) bad("nome", "Digite nome e sobrenome.");
    const info = dayInfo();
    if (!info) bad("dia", "Escolha o dia da reserva.");
    else if (info.d < new Date((new Date()).setHours(0, 0, 0, 0))) bad("dia", "Escolha uma data a partir de hoje.");
    else if (!info.open) bad("dia", `A casa não abre de ${info.week}.`);
    if (!els.hora.value) bad("hora", "Escolha o horário.");
    else if (info?.limit && els.hora.value > info.limit) bad("hora", `Neste dia a chegada vai até ${info.limit}.`);
    if (first) {
      first.focus();
      return;
    }
    window.open(`https://wa.me/${R.whatsapp}?text=${encodeURIComponent(message())}`, "_blank", "noopener");
  });
  syncHour();
  render();
}
export {
  initReserve
};
