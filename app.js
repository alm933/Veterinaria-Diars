// JavaScript ejecutable en el navegador. La fuente comentada está en app.ts.
const demoClient = {
  document: '72104568',
  name: 'María Fernanda Salazar',
  patients: [
    { id: 'luna', name: 'Luna', record: 'HC-1004', species: 'Canina', breed: 'Mestiza' },
    { id: 'milo', name: 'Milo', record: 'HC-1005', species: 'Felina', breed: 'Mestizo' }
  ]
};
const demoSlots = ['09:00', '09:30', '10:30', '11:00', '14:00', '15:30'];
const $ = selector => {
  const element = document.querySelector(selector);
  if (!element) throw new Error(`No se encontró el elemento requerido: ${selector}`);
  return element;
};
const $$ = selector => Array.from(document.querySelectorAll(selector));
const toast = $('#toast');
let toastTimer;
function showToast(message, isError = false) {
  toast.textContent = message;
  toast.classList.toggle('error', isError);
  toast.classList.add('show');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('show'), 3200);
}
function showView(viewName) {
  const viewTitles = { dashboard: 'Menú principal', emergency: 'Ingreso por emergencia', appointment: 'Registrar cita médica' };
  const viewIds = { dashboard: 'dashboardView', emergency: 'emergencyView', appointment: 'appointmentView' };
  const targetId = viewIds[viewName] ?? viewIds.dashboard;
  $$('.view').forEach(view => view.classList.toggle('active', view.id === targetId));
  $$('.nav-link[data-view]').forEach(link => link.classList.toggle('active', link.getAttribute('data-view') === viewName));
  $('#pageCrumb').textContent = viewTitles[viewName] ?? viewTitles.dashboard;
  $('#sidebar').classList.remove('open');
  $('#mobileMenu').setAttribute('aria-expanded', 'false');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function localDateValue(date = new Date()) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}
function searchClient(documentInput, nameInput, patientSelect, note) {
  if (documentInput.value.trim() !== demoClient.document) {
    nameInput.value = '';
    patientSelect.innerHTML = '<option value="">Primero busca un cliente</option>';
    patientSelect.disabled = true;
    note.textContent = 'Cliente no encontrado. Verifica el documento e inténtalo nuevamente.';
    note.classList.add('error');
    showToast('Cliente no encontrado', true);
    return false;
  }
  nameInput.value = demoClient.name;
  patientSelect.innerHTML = '<option value="">Selecciona una mascota</option>' +
    demoClient.patients.map(patient => `<option value="${patient.id}">${patient.name} · ${patient.record}</option>`).join('');
  patientSelect.disabled = false;
  note.textContent = 'Cliente encontrado. Selecciona una de sus mascotas registradas.';
  note.classList.remove('error');
  showToast('Cliente encontrado');
  return true;
}
function bindPatientDetails(select, prefix) {
  select.addEventListener('change', () => {
    const patient = demoClient.patients.find(item => item.id === select.value);
    $(`#${prefix}Record`).value = patient?.record ?? '';
    $(`#${prefix}Species`).value = patient?.species ?? '';
    $(`#${prefix}Breed`).value = patient?.breed ?? '';
  });
}
function bindClientSearch(prefix) {
  const buttonId = prefix === 'emergency' ? 'searchEmergencyClient' : 'searchAppointmentClient';
  const noteId = prefix === 'emergency' ? 'emergencyClientNote' : 'appointmentClientNote';
  $(`#${buttonId}`).addEventListener('click', () => {
    searchClient($(`#${prefix}Document`), $(`#${prefix}ClientName`),
      $(`#${prefix}Patient`), $(`#${noteId}`));
  });
}
$$('[data-view]').forEach(control => control.addEventListener('click', event => {
  event.preventDefault();
  if (control.dataset.view) showView(control.dataset.view);
}));
$('#mobileMenu').addEventListener('click', () => {
  const sidebar = $('#sidebar');
  const open = sidebar.classList.toggle('open');
  $('#mobileMenu').setAttribute('aria-expanded', String(open));
});
bindClientSearch('emergency');
bindClientSearch('appointment');
bindPatientDetails($('#emergencyPatient'), 'emergency');
bindPatientDetails($('#appointmentPatient'), 'appointment');
function updateEmergencyTimestamp() {
  const now = new Date();
  $('#emergencyDate').value = localDateValue(now);
  $('#emergencyTime').value = now.toTimeString().slice(0, 5);
}
updateEmergencyTimestamp();
window.setInterval(updateEmergencyTimestamp, 60000);
const today = new Date();
$('#todayLabel').textContent = new Intl.DateTimeFormat('es-PE', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
}).format(today);
const appointmentDate = $('#appointmentDate');
appointmentDate.min = localDateValue(today);
let selectedSlot = '';
const slotRow = $('#slotRow');
const slotInput = $('#appointmentSlot');
function clearSlots(message) {
  selectedSlot = '';
  slotInput.value = '';
  slotRow.innerHTML = `<span class="slot-placeholder">${message}</span>`;
}
$('#checkAvailability').addEventListener('click', () => {
  const vet = $('#appointmentVet').value;
  const date = appointmentDate.value;
  if (!vet || !date) {
    clearSlots('Completa veterinario y fecha para consultar.');
    showToast('Selecciona un veterinario y una fecha', true);
    return;
  }
  slotRow.innerHTML = demoSlots.map((slot, index) => {
    const unavailable = (date.endsWith('2') && index === 1) || (date.endsWith('5') && index === 4);
    return unavailable
      ? `<span class="slot-button unavailable" aria-disabled="true">${slot} · Ocupado</span>`
      : `<button type="button" class="slot-button" data-slot="${slot}">${slot}</button>`;
  }).join('');
  $('#availabilityMessage').textContent = `Horarios de demostración para ${vet} · ${date}`;
  slotRow.querySelectorAll('[data-slot]').forEach(button => button.addEventListener('click', () => {
    selectedSlot = button.dataset.slot ?? '';
    slotInput.value = selectedSlot;
    slotRow.querySelectorAll('.slot-button').forEach(slot => slot.classList.toggle('selected', slot === button));
  }));
});
appointmentDate.addEventListener('change', () => clearSlots('Fecha cambiada. Consulta de nuevo la disponibilidad.'));
$('#appointmentVet').addEventListener('change', () => clearSlots('Veterinario cambiado. Consulta de nuevo la disponibilidad.'));
$('#emergencyForm').addEventListener('submit', event => {
  event.preventDefault();
  if (!$('#emergencyClientName').value || !$('#emergencyPatient').value || !$('#emergencyReason').value.trim()) {
    showToast('Completa cliente, paciente y motivo de emergencia', true);
    return;
  }
  showToast(`Ingreso registrado · código EM-${Date.now().toString().slice(-6)} (solo demostración)`);
});
$('#appointmentForm').addEventListener('submit', event => {
  event.preventDefault();
  const valid = $('#appointmentClientName').value && $('#appointmentPatient').value &&
    $('#appointmentVet').value && appointmentDate.value && selectedSlot &&
    $('#appointmentReason').value.trim();
  if (!valid) {
    showToast('Completa los campos y selecciona un horario disponible', true);
    return;
  }
  showToast(`Cita registrada · código CIT-${Date.now().toString().slice(-6)} (solo demostración)`);
});
