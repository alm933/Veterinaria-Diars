/**
 * Lógica de interfaz para el prototipo Huellitas.
 * Mantén aquí el comportamiento del navegador; la persistencia se conectará
 * más adelante con la API del proyecto.
 */

type Patient = { id: string; name: string; record: string; species: string; breed: string };
type DemoClient = { document: string; name: string; patients: Patient[] };

const demoClient: DemoClient = {
  document: '72104568',
  name: 'María Fernanda Salazar',
  patients: [
    { id: 'luna', name: 'Luna', record: 'HC-1004', species: 'Canina', breed: 'Mestiza' },
    { id: 'milo', name: 'Milo', record: 'HC-1005', species: 'Felina', breed: 'Mestizo' }
  ]
};

const demoSlots = ['09:00', '09:30', '10:30', '11:00', '14:00', '15:30'];
const $ = <T extends HTMLElement>(selector: string): T => {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`No se encontró el elemento requerido: ${selector}`);
  return element;
};
const $$ = <T extends HTMLElement>(selector: string): T[] =>
  Array.from(document.querySelectorAll<T>(selector));

const toast = $('#toast');
let toastTimer: number | undefined;

/** Muestra avisos temporales y marca visualmente los errores. */
function showToast(message: string, isError = false): void {
  toast.textContent = message;
  toast.classList.toggle('error', isError);
  toast.classList.add('show');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('show'), 3200);
}

/** Cambia la vista activa y actualiza la navegación y el encabezado. */
function showView(viewName: string): void {
  const viewTitles: Record<string, string> = {
    dashboard: 'Menú principal',
    emergency: 'Ingreso por emergencia',
    appointment: 'Registrar cita médica'
  };
  const viewIds: Record<string, string> = {
    dashboard: 'dashboardView',
    emergency: 'emergencyView',
    appointment: 'appointmentView'
  };
  const targetId = viewIds[viewName] ?? viewIds.dashboard;
  $$('.view').forEach(view => view.classList.toggle('active', view.id === targetId));
  $$('.nav-link[data-view]').forEach(link =>
    link.classList.toggle('active', link.getAttribute('data-view') === viewName)
  );
  $('#pageCrumb').textContent = viewTitles[viewName] ?? viewTitles.dashboard;
  $('#sidebar').classList.remove('open');
  $('#mobileMenu').setAttribute('aria-expanded', 'false');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/** Fecha local en formato YYYY-MM-DD, útil para los inputs date. */
function localDateValue(date = new Date()): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

/** Completa los datos demostrativos del cliente y sus mascotas. */
function searchClient(documentInput: HTMLInputElement, nameInput: HTMLInputElement,
  patientSelect: HTMLSelectElement, note: HTMLElement): boolean {
  const documentNumber = documentInput.value.trim();
  if (documentNumber !== demoClient.document) {
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
    demoClient.patients.map(patient =>
      `<option value="${patient.id}">${patient.name} · ${patient.record}</option>`
    ).join('');
  patientSelect.disabled = false;
  note.textContent = 'Cliente encontrado. Selecciona una de sus mascotas registradas.';
  note.classList.remove('error');
  showToast('Cliente encontrado');
  return true;
}

/** Copia los datos de la mascota seleccionada a los campos informativos. */
function bindPatientDetails(select: HTMLSelectElement, prefix: string): void {
  select.addEventListener('change', () => {
    const patient = demoClient.patients.find(item => item.id === select.value);
    $<HTMLInputElement>(`#${prefix}Record`).value = patient?.record ?? '';
    $<HTMLInputElement>(`#${prefix}Species`).value = patient?.species ?? '';
    $<HTMLInputElement>(`#${prefix}Breed`).value = patient?.breed ?? '';
  });
}

/** Conecta el mismo buscador de cliente a cada formulario de recepción. */
function bindClientSearch(prefix: 'emergency' | 'appointment'): void {
  const buttonId = prefix === 'emergency' ? 'searchEmergencyClient' : 'searchAppointmentClient';
  const noteId = prefix === 'emergency' ? 'emergencyClientNote' : 'appointmentClientNote';
  $<HTMLButtonElement>(`#${buttonId}`).addEventListener('click', () => {
    searchClient(
      $<HTMLInputElement>(`#${prefix}Document`),
      $<HTMLInputElement>(`#${prefix}ClientName`),
      $<HTMLSelectElement>(`#${prefix}Patient`),
      $(`#${noteId}`)
    );
  });
}

/** Permite navegar desde el menú lateral, las tarjetas y los botones de regreso. */
$$<HTMLElement>('[data-view]').forEach(control => {
  control.addEventListener('click', event => {
    event.preventDefault();
    const viewName = control.dataset.view;
    if (viewName) showView(viewName);
  });
});

/** Botón para abrir/cerrar la navegación en pantallas pequeñas. */
$('#mobileMenu').addEventListener('click', () => {
  const sidebar = $('#sidebar');
  const open = sidebar.classList.toggle('open');
  $('#mobileMenu').setAttribute('aria-expanded', String(open));
});

bindClientSearch('emergency');
bindClientSearch('appointment');
bindPatientDetails($<HTMLSelectElement>('#emergencyPatient'), 'emergency');
bindPatientDetails($<HTMLSelectElement>('#appointmentPatient'), 'appointment');

/** Mantiene la fecha y hora de emergencia como valores automáticos de solo lectura. */
function updateEmergencyTimestamp(): void {
  const now = new Date();
  $<HTMLInputElement>('#emergencyDate').value = localDateValue(now);
  $<HTMLInputElement>('#emergencyTime').value = now.toTimeString().slice(0, 5);
}
updateEmergencyTimestamp();
window.setInterval(updateEmergencyTimestamp, 60_000);

/** Inicializa la fecha visible y evita programar citas en días pasados. */
const today = new Date();
$('#todayLabel').textContent = new Intl.DateTimeFormat('es-PE', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
}).format(today);
const appointmentDate = $<HTMLInputElement>('#appointmentDate');
appointmentDate.min = localDateValue(today);

/** Guarda en memoria qué horarios de demostración eligió la persona. */
let selectedSlot = '';
const slotRow = $('#slotRow');
const slotInput = $<HTMLInputElement>('#appointmentSlot');
function clearSlots(message: string): void {
  selectedSlot = '';
  slotInput.value = '';
  slotRow.innerHTML = `<span class="slot-placeholder">${message}</span>`;
}

/** Renderiza opciones ficticias para demostrar la selección de horario. */
$('#checkAvailability').addEventListener('click', () => {
  const vet = $<HTMLSelectElement>('#appointmentVet').value;
  const date = appointmentDate.value;
  if (!vet || !date) {
    clearSlots('Completa veterinario y fecha para consultar.');
    showToast('Selecciona un veterinario y una fecha', true);
    return;
  }

  slotRow.innerHTML = demoSlots.map((slot, index) => {
    // Un par de opciones cambian según la combinación como ejemplo de agenda.
    const unavailable = (date.endsWith('2') && index === 1) || (date.endsWith('5') && index === 4);
    return unavailable
      ? `<span class="slot-button unavailable" aria-disabled="true">${slot} · Ocupado</span>`
      : `<button type="button" class="slot-button" data-slot="${slot}">${slot}</button>`;
  }).join('');
  $<HTMLElement>('#availabilityMessage').textContent =
    `Horarios de demostración para ${vet} · ${date}`;
  slotRow.querySelectorAll<HTMLButtonElement>('[data-slot]').forEach(button => {
    button.addEventListener('click', () => {
      selectedSlot = button.dataset.slot ?? '';
      slotInput.value = selectedSlot;
      slotRow.querySelectorAll('.slot-button').forEach(slot =>
        slot.classList.toggle('selected', slot === button)
      );
    });
  });
});

appointmentDate.addEventListener('change', () => clearSlots('Fecha cambiada. Consulta de nuevo la disponibilidad.'));
$<HTMLSelectElement>('#appointmentVet').addEventListener('change', () =>
  clearSlots('Veterinario cambiado. Consulta de nuevo la disponibilidad.')
);

/** Revisa campos obligatorios sin enviar información a un servidor. */
$('#emergencyForm').addEventListener('submit', event => {
  event.preventDefault();
  const patient = $<HTMLSelectElement>('#emergencyPatient').value;
  const reason = $<HTMLTextAreaElement>('#emergencyReason').value.trim();
  if (!$<HTMLInputElement>('#emergencyClientName').value || !patient || !reason) {
    showToast('Completa cliente, paciente y motivo de emergencia', true);
    return;
  }
  const code = `EM-${Date.now().toString().slice(-6)}`;
  showToast(`Ingreso registrado · código ${code} (solo demostración)`);
});

/** Valida los datos básicos y muestra la confirmación ficticia de la cita. */
$('#appointmentForm').addEventListener('submit', event => {
  event.preventDefault();
  const hasClient = Boolean($<HTMLInputElement>('#appointmentClientName').value);
  const hasPatient = Boolean($<HTMLSelectElement>('#appointmentPatient').value);
  const hasVet = Boolean($<HTMLSelectElement>('#appointmentVet').value);
  const hasDate = Boolean(appointmentDate.value);
  const reason = $<HTMLTextAreaElement>('#appointmentReason').value.trim();

  if (!hasClient || !hasPatient || !hasVet || !hasDate || !selectedSlot || !reason) {
    showToast('Completa los campos y selecciona un horario disponible', true);
    return;
  }
  const code = `CIT-${Date.now().toString().slice(-6)}`;
  showToast(`Cita registrada · código ${code} (solo demostración)`);
});
