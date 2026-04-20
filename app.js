/* ══════════════════════════════════════════
   FINANCEOS — JAVASCRIPT APP LOGIC
   Ported from Java (Cuentas.java)
   ══════════════════════════════════════════ */

// ── GASTOS FIJOS DINÁMICOS ───────────────────────
// Array donde se guardan los gastos fijos del usuario
let gastosFijos = [];

function actualizarTotalFijos() {
  const total = gastosFijos.reduce((sum, g) => sum + g.importe, 0);
  document.getElementById('totalFijos').textContent =
    total.toLocaleString('es-ES', { minimumFractionDigits: 2 }) + ' €';
  return total;
}

function renderizarGastosFijos() {
  const list   = document.getElementById('fixed-list');
  const empty  = document.getElementById('fixed-empty');

  // Limpiar filas anteriores (preservar el empty placeholder)
  list.querySelectorAll('.fixed-dyn-row').forEach(r => r.remove());

  if (gastosFijos.length === 0) {
    empty.style.display = 'block';
  } else {
    empty.style.display = 'none';
    gastosFijos.forEach((g, i) => {
      const row = document.createElement('div');
      row.className = 'fixed-row fixed-dyn-row';
      row.innerHTML = `
        <span class="fixed-row-name">${g.nombre}</span>
        <span class="fixed-row-val">${g.importe.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span>
        <button class="btn-del" onclick="eliminarGastoFijo(${i})" title="Eliminar">✕</button>
      `;
      list.appendChild(row);
    });
  }

  actualizarTotalFijos();
}

function añadirGastoFijo() {
  const nombreInput  = document.getElementById('fixed-nombre');
  const importeInput = document.getElementById('fixed-importe');

  const nombre  = nombreInput.value.trim();
  const importe = parseFloat(importeInput.value);

  if (!nombre) {
    nombreInput.focus();
    nombreInput.style.borderColor = 'var(--red)';
    setTimeout(() => nombreInput.style.borderColor = '', 1000);
    return;
  }
  if (isNaN(importe) || importe <= 0) {
    importeInput.focus();
    importeInput.style.borderColor = 'var(--red)';
    setTimeout(() => importeInput.style.borderColor = '', 1000);
    return;
  }

  gastosFijos.push({ nombre, importe });
  nombreInput.value  = '';
  importeInput.value = '';
  nombreInput.focus();
  renderizarGastosFijos();
}

function eliminarGastoFijo(index) {
  gastosFijos.splice(index, 1);
  renderizarGastosFijos();
}

// Permitir Enter en los inputs de gasto fijo
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('fixed-importe').addEventListener('keydown', e => {
    if (e.key === 'Enter') añadirGastoFijo();
  });
  document.getElementById('fixed-nombre').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('fixed-importe').focus();
  });
  renderizarGastosFijos();
});

// ── ESTADO DE NAVEGACIÓN ──────────────────────────
let currentPeriodInv = 'dias';
let currentPeriodIC  = 'dias';

// ── FORMATEO ─────────────────────────────────────
function fmt(num) {
  return num.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

// ── NAVEGACIÓN ────────────────────────────────────
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    const target = item.dataset.section;

    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelectorAll('.module').forEach(m => m.classList.remove('active'));

    item.classList.add('active');
    const section = document.getElementById(target);
    if (section) section.classList.add('active');
  });
});

// ── TOGGLE INVERSIONES ────────────────────────────
document.querySelectorAll('.toggle-btn[data-period]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.toggle-btn[data-period]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentPeriodInv = btn.dataset.period;

    const diasGroup = document.getElementById('inv-dias-group');
    const diasInput = document.getElementById('inv-dias');

    if (currentPeriodInv === 'dias') {
      diasGroup.style.display = 'block';
      diasInput.labels[0].textContent = 'NÚMERO DE DÍAS';
      diasInput.placeholder = '365';
    } else if (currentPeriodInv === 'meses') {
      diasGroup.style.display = 'none';
    } else {
      diasGroup.style.display = 'none';
    }
  });
});

// ── TOGGLE INTERÉS COMPUESTO ──────────────────────
document.querySelectorAll('.toggle-btn[data-ic]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.toggle-btn[data-ic]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentPeriodIC = btn.dataset.ic;

    const label = document.getElementById('ic-tiempo-label');
    const input = document.getElementById('ic-tiempo');

    if (currentPeriodIC === 'dias') {
      label.textContent = 'NÚMERO DE DÍAS';
      input.placeholder = '365';
    } else if (currentPeriodIC === 'meses') {
      label.textContent = 'NÚMERO DE MESES';
      input.placeholder = '12';
    } else {
      label.textContent = 'NÚMERO DE AÑOS';
      input.placeholder = '10';
    }
  });
});

// ══════════════════════════════════════════
// MOD_01 — CÁLCULO DE GASTOS
// Equivalente a resumen() en Java
// ══════════════════════════════════════════
function calcularGastos() {
  const sueldo     = parseFloat(document.getElementById('sueldo').value)      || 0;
  const variables  = parseFloat(document.getElementById('variables').value)   || 0;
  const compras    = parseFloat(document.getElementById('compras').value)     || 0;
  const imprevistos= parseFloat(document.getElementById('imprevistos').value) || 0;
  const ocio       = parseFloat(document.getElementById('ocio').value)        || 0;

  const FIJOS_TOTAL = actualizarTotalFijos();
  const totalGastos = FIJOS_TOTAL + variables + compras + imprevistos + ocio;
  const ahorro = sueldo - totalGastos;

  // Mostrar card
  const card = document.getElementById('resumenCard');
  card.classList.remove('hidden');

  // Valores
  document.getElementById('r-sueldo').textContent     = fmt(sueldo);
  document.getElementById('r-fijos').textContent      = fmt(FIJOS_TOTAL);
  document.getElementById('r-variables').textContent  = fmt(variables);
  document.getElementById('r-compras').textContent    = fmt(compras);
  document.getElementById('r-imprevistos').textContent= fmt(imprevistos);
  document.getElementById('r-ocio').textContent       = fmt(ocio);

  const ahorroEl = document.getElementById('r-ahorro');
  ahorroEl.textContent = fmt(ahorro);

  if (ahorro >= 0) {
    ahorroEl.style.color = 'var(--green)';
    ahorroEl.style.textShadow = '0 0 20px rgba(0, 255, 136, 0.4)';
  } else {
    ahorroEl.style.color = 'var(--red)';
    ahorroEl.style.textShadow = '0 0 20px rgba(255, 68, 102, 0.4)';
  }

  // Barra de ahorro
  const bar = document.getElementById('ahorroBar');
  const pct = sueldo > 0 ? Math.max(0, Math.min(100, (ahorro / sueldo) * 100)) : 0;
  bar.style.width = pct + '%';
  bar.style.background = ahorro >= 0
    ? 'linear-gradient(90deg, var(--green), #00cc66)'
    : 'linear-gradient(90deg, var(--red), #cc2244)';

  // Scroll suave
  card.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ══════════════════════════════════════════
// MOD_02 — RENTABILIDAD INVERSIONES
// Equivalente al bloque semaforo==2 en Java
// ══════════════════════════════════════════
function calcularInversion() {
  const capital    = parseFloat(document.getElementById('inv-capital').value)    || 0;
  const porcentaje = parseFloat(document.getElementById('inv-porcentaje').value) || 0;
  const diasVal    = parseInt(document.getElementById('inv-dias').value)          || 0;

  if (capital <= 0 || porcentaje <= 0) {
    alert('Introduce un capital y porcentaje válidos.');
    return;
  }

  const rentabilidadAnual = capital * (porcentaje / 100);
  const card = document.getElementById('inv-result');

  document.getElementById('inv-r-capital').textContent = fmt(capital);
  document.getElementById('inv-r-anual').textContent   = fmt(rentabilidadAnual);

  let periodoVal = 0;
  let periodoLabel = '';

  if (currentPeriodInv === 'dias') {
    if (diasVal <= 0) { alert('Introduce un número de días válido.'); return; }
    const calculoinvdia  = rentabilidadAnual / 365;
    periodoVal   = calculoinvdia * diasVal;
    periodoLabel = `RENTABILIDAD EN ${diasVal} DÍAS`;
  } else if (currentPeriodInv === 'meses') {
    periodoVal   = rentabilidadAnual / 12;
    periodoLabel = 'RENTABILIDAD MENSUAL';
  } else {
    periodoVal   = rentabilidadAnual;
    periodoLabel = 'RENTABILIDAD ANUAL';
  }

  document.getElementById('inv-r-period-label').textContent = periodoLabel;
  document.getElementById('inv-r-periodo').textContent = fmt(periodoVal);
}

// ══════════════════════════════════════════
// MOD_03 — INTERÉS COMPUESTO
// Equivalente a interescompuestoDiario/Mensual/Anual en Java
// ══════════════════════════════════════════
function calcularInteresCompuesto() {
  const capital    = parseFloat(document.getElementById('ic-capital').value)    || 0;
  const porcentaje = parseFloat(document.getElementById('ic-porcentaje').value) || 0;
  const aportacion = parseFloat(document.getElementById('ic-aportacion').value) || 0;
  const tiempo     = parseInt(document.getElementById('ic-tiempo').value)        || 0;

  if (capital <= 0 || porcentaje <= 0 || tiempo <= 0) {
    alert('Por favor, completa todos los campos con valores válidos.');
    return;
  }

  const calporcentaje = porcentaje / 100;
  const tbody = document.getElementById('ic-tbody');
  tbody.innerHTML = '';

  let rows = [];

  // ── Lógica igual a Java: bucle descendente ──
  if (currentPeriodIC === 'dias') {
    // interescompuestodiario()
    for (let d = tiempo; d >= 1; d--) {
      const val = capital * Math.pow(1 + calporcentaje / 365, d)
                + aportacion * (Math.pow(1 + calporcentaje / 365, d) - 1) / (calporcentaje / 365);
      rows.push({ periodo: `Día ${d}`, valor: val });
    }
  } else if (currentPeriodIC === 'meses') {
    // interescompuestomensual()
    for (let m = tiempo; m >= 1; m--) {
      const val = capital * Math.pow(1 + calporcentaje / 12, m)
                + aportacion * (Math.pow(1 + calporcentaje / 12, m) - 1) / (calporcentaje / 12);
      rows.push({ periodo: `Mes ${m}`, valor: val });
    }
  } else {
    // interescompuestoanual()
    for (let a = tiempo; a >= 1; a--) {
      const val = capital * Math.pow(1 + calporcentaje, a)
                + aportacion * (Math.pow(1 + calporcentaje, a) - 1) / calporcentaje;
      rows.push({ periodo: `Año ${a}`, valor: val });
    }
  }

  // El capital final es el período más largo (primer elemento del bucle descendente = tiempo total)
  const capitalFinal = rows[0].valor;
  const totalAportado = aportacion * tiempo;
  const interesesGenerados = capitalFinal - capital - totalAportado;

  // Resumen
  document.getElementById('ic-final').textContent     = fmt(capitalFinal);
  document.getElementById('ic-ini').textContent       = fmt(capital);
  document.getElementById('ic-aportado').textContent  = fmt(totalAportado);
  document.getElementById('ic-intereses').textContent = fmt(Math.max(0, interesesGenerados));

  document.getElementById('ic-summary').classList.remove('hidden');

  // Tabla (invertimos para mostrar de menor a mayor período — más natural visualmente)
  const rowsAsc = [...rows].reverse();
  const maxVal = Math.max(...rows.map(r => r.valor));

  // Limitar a 100 filas para rendimiento
  const displayRows = rowsAsc.length > 100 ? rowsAsc.filter((_, i) => i % Math.ceil(rowsAsc.length / 100) === 0) : rowsAsc;

  displayRows.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${r.periodo}</td><td>${fmt(r.valor)}</td>`;
    tbody.appendChild(tr);
  });

  document.getElementById('ic-table').classList.remove('hidden');
}

// ── FIN ───────────────────────────────────────────
