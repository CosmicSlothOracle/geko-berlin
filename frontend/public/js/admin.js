// Admin Authentication
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'kosge2024!';

// API URL Configuration
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:10000/api'
    : 'https://kosge-backend.onrender.com/api';

// DOM Elements
const adminLoginModal = document.getElementById('admin-login-modal');
const adminModal = document.getElementById('adminModal');
const adminLoginForm = document.getElementById('admin-login-form');
const eventForm = document.getElementById('eventForm');
const logoutBtn = document.getElementById('logout-btn');
const addEventBtn = document.getElementById('add-event-btn');
const closeButtons = document.querySelectorAll('.close');

// Zusätzliche DOM-Elemente für das Bild-Edit-Modal
const eventEditModal = document.getElementById('event-edit-modal');
const eventEditForm = document.getElementById('event-edit-form');
const eventEditUrlInput = document.getElementById('event-edit-url');
const eventEditPreview = document.getElementById('event-edit-preview');
const eventEditMessage = document.getElementById('event-edit-message');
const eventEditCurrentUrl = document.getElementById('current-url');

// State
let isAdminLoggedIn = false;
let editingImageEventId = null;

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    initializeEventsStorage();
    checkAdminStatus();
    loadEvents();
    setupShowParticipantsButtons();
    // Entferne Floating-Button-Logik
});

function setupEventListeners() {
    // Close buttons
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal').style.display = 'none';
        });
    });

    // Admin Login Form
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', handleAdminLogin);
    }

    // Event Form
    if (eventForm) {
        eventForm.addEventListener('submit', handleEventSubmit);
    }

    // Logout Button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Event delegation für edit-event-btn
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('edit-event-btn')) {
            const eventSection = e.target.dataset.id;
            openEditEventModal(eventSection);
        }
        if (e.target.classList.contains('modal-close') || e.target.classList.contains('modal-cancel')) {
            closeModal('event-edit-modal');
            document.getElementById('event-edit-message').textContent = '';
        }
    });

    // Window click to close modals
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });

    // Modal-Formular-Submit
    if (eventEditForm) {
        eventEditForm.addEventListener('submit', handleEventEditSubmit);
    }

    // Bild-URL Vorschau
    const eventEditImageUrl = document.getElementById('event-edit-image-url');
    if (eventEditImageUrl && eventEditPreview) {
        eventEditImageUrl.addEventListener('input', () => {
            if (eventEditImageUrl.value) {
                eventEditPreview.src = eventEditImageUrl.value;
                eventEditPreview.style.display = 'block';
            } else {
                eventEditPreview.style.display = 'none';
            }
        });
    }
}

function checkAdminStatus() {
    isAdminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    updateUIForAdminStatus();
}

function updateUIForAdminStatus() {
    if (logoutBtn) {
        logoutBtn.style.display = isAdminLoggedIn ? 'block' : 'none';
    }
    if (addEventBtn) {
        addEventBtn.style.display = isAdminLoggedIn ? 'block' : 'none';
    }
    // Show/hide show-participants buttons
    for (let i = 1; i <= 4; i++) {
        const btn = document.getElementById(`show-participants-btn-${i}`);
        if (btn) btn.style.display = isAdminLoggedIn ? 'block' : 'none';
    }
}

function handleAdminLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        isAdminLoggedIn = true;
        localStorage.setItem('adminLoggedIn', 'true');
        adminLoginModal.style.display = 'none';
        updateUIForAdminStatus();
        alert('Successfully logged in!');
        loadEvents(); // Reload events to show edit buttons
    } else {
        alert('Invalid credentials');
    }
}

function handleLogout() {
    isAdminLoggedIn = false;
    localStorage.removeItem('adminLoggedIn');
    updateUIForAdminStatus();
    loadEvents(); // Reload events to hide edit buttons
}

async function handleEventSubmit(e) {
    e.preventDefault();
    if (!isAdminLoggedIn) {
        adminLoginModal.style.display = 'block';
        return;
    }

    const eventData = {
        title: document.getElementById('eventTitle').value,
        date: document.getElementById('eventDate').value,
        time: document.getElementById('eventTime').value,
        location: document.getElementById('eventLocation').value,
        description: document.getElementById('eventDescription').value,
        imageUrl: document.getElementById('eventImageUrl') ? document.getElementById('eventImageUrl').value : '',
        section: eventForm.dataset.eventSection || ''
    };

    let events = [];
    try {
        const eventsData = localStorage.getItem('events');
        events = eventsData ? JSON.parse(eventsData) : [];
        if (!Array.isArray(events)) {
            console.error('Events data is not an array, resetting to empty array');
            events = [];
            localStorage.setItem('events', '[]');
        }
    } catch (error) {
        console.error('Error parsing events:', error);
        events = [];
        localStorage.setItem('events', '[]');
    }

    // Prüfe, ob ein bestehendes Event bearbeitet wird
    const editingEventId = eventForm.dataset.editingEventId;
    if (editingEventId) {
        const eventIndex = events.findIndex(e => e.id && e.id.toString() === editingEventId);
        if (eventIndex !== -1) {
            // Überschreibe nur die Werte, ID bleibt erhalten
            events[eventIndex] = { ...events[eventIndex], ...eventData };
        }
        // Nach dem Speichern zurücksetzen
        delete eventForm.dataset.editingEventId;
    } else {
        // Neues Event anlegen (nur wenn kein Bearbeiten)
        const newId = Date.now().toString();
        events.push({ id: newId, ...eventData });
    }

    localStorage.setItem('events', JSON.stringify(events));
    adminModal.style.display = 'none';
    loadEvents();
}

async function loadEvents() {
    let events = [];
    try {
        const eventsData = localStorage.getItem('events');
        events = eventsData ? JSON.parse(eventsData) : [];
        if (!Array.isArray(events)) {
            console.error('Events data is not an array, resetting to empty array');
            events = [];
            localStorage.setItem('events', '[]');
        }
    } catch (error) {
        console.error('Error parsing events:', error);
        events = [];
        localStorage.setItem('events', '[]');
    }

    // Events in die jeweiligen Sektionen einfügen
    for (let i = 1; i <= 4; i++) {
        const section = document.getElementById(`event${i}`);
        if (section) {
            const event = events.find(ev => ev.section === String(i));
            if (event) {
                const imgUrl = event.imageUrl && event.imageUrl.trim() !== '' ? event.imageUrl : 'https://i.postimg.cc/L5fgbxQJ/image.png';
                section.querySelector('.event-image').src = imgUrl;
                section.querySelector('h2').textContent = event.title || `Event ${i}`;
                section.querySelector('.event-participation').insertAdjacentHTML('beforebegin', `
                    <div class="event-details">
                        <p><strong>Date:</strong> ${formatDate(event.date)}</p>
                        <p><strong>Time:</strong> ${event.time}</p>
                        <p><strong>Location:</strong> ${event.location}</p>
                        <p>${event.description}</p>
                        ${isAdminLoggedIn ? `<button class=\"edit-image-btn\" data-id=\"${event.id}\">Bild bearbeiten</button>` : ''}
                    </div>
                `);
            }
        }
    }

    // Events-Container für Übersicht (optional)
    const eventsContainer = document.getElementById('events-container');
    if (eventsContainer) {
        eventsContainer.innerHTML = events.map(event => `
            <div class="event-card">
                <h3>${event.title}</h3>
                <img src="${event.imageUrl && event.imageUrl.trim() !== '' ? event.imageUrl : 'https://i.postimg.cc/L5fgbxQJ/image.png'}" alt="Event Bild" class="event-image" style="max-width:100%;height:auto;" />
                <p><strong>Date:</strong> ${formatDate(event.date)}</p>
                <p><strong>Time:</strong> ${event.time}</p>
                <p><strong>Location:</strong> ${event.location}</p>
                <p>${event.description}</p>
                ${isAdminLoggedIn ? `<button class=\"edit-image-btn\" data-id=\"${event.id}\">Bild bearbeiten</button>` : ''}
            </div>
        `).join('');
    }
}

function openEditEventModal(eventSection) {
    let events = [];
    try {
        const eventsData = localStorage.getItem('events');
        events = eventsData ? JSON.parse(eventsData) : [];
    } catch (error) { events = []; }
    const event = events.find(e => e.section === String(eventSection));
    // Felder vorausfüllen
    document.getElementById('event-edit-title').value = event ? event.title : '';
    document.getElementById('event-edit-date').value = event ? event.date : '';
    document.getElementById('event-edit-time').value = event ? event.time : '';
    document.getElementById('event-edit-location').value = event ? event.location : '';
    document.getElementById('event-edit-description').value = event ? event.description : '';
    document.getElementById('event-edit-image-url').value = event ? event.imageUrl : '';
    const preview = document.getElementById('event-edit-preview');
    if (event && event.imageUrl) {
        preview.src = event.imageUrl;
        preview.style.display = 'block';
    } else {
        preview.style.display = 'none';
    }
    // Speichere die aktuelle Section im Modal
    document.getElementById('event-edit-form').dataset.eventSection = eventSection;
    openModal('event-edit-modal');
}

function handleEventEditSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const eventSection = form.dataset.eventSection;
    let events = [];
    try {
        const eventsData = localStorage.getItem('events');
        events = eventsData ? JSON.parse(eventsData) : [];
    } catch (error) { events = []; }
    const eventIndex = events.findIndex(ev => ev.section === String(eventSection));
    // Pflichtfeld-Validierung
    const title = document.getElementById('event-edit-title').value.trim();
    const date = document.getElementById('event-edit-date').value;
    const time = document.getElementById('event-edit-time').value;
    const location = document.getElementById('event-edit-location').value.trim();
    const description = document.getElementById('event-edit-description').value.trim();
    const imageUrl = document.getElementById('event-edit-image-url').value.trim();
    if (!title || !date || !time || !location || !description) {
        document.getElementById('event-edit-message').textContent = 'Bitte alle Felder ausfüllen!';
        return;
    }
    // Event überschreiben
    const updatedEvent = {
        section: String(eventSection),
        title,
        date,
        time,
        location,
        description,
        imageUrl
    };
    if (eventIndex !== -1) {
        events[eventIndex] = { ...events[eventIndex], ...updatedEvent };
    } else {
        // Falls noch kein Event existiert, neu anlegen (optional)
        events.push(updatedEvent);
    }
    localStorage.setItem('events', JSON.stringify(events));
    closeModal('event-edit-modal');
    loadEvents();
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

// Helper functions for modal management
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'block';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
}

function resetForm(formId) {
    const form = document.getElementById(formId);
    if (form) form.reset();
}

// Debug helper
function debugLog(...args) {
    if (process.env.NODE_ENV === 'development') {
        console.log(...args);
    }
}

function initializeEventsStorage() {
    try {
        const eventsData = localStorage.getItem('events');
        if (!eventsData) {
            localStorage.setItem('events', '[]');
            return;
        }

        const events = JSON.parse(eventsData);
        if (!Array.isArray(events)) {
            console.warn('Events data was corrupted, resetting to empty array');
            localStorage.setItem('events', '[]');
        }
    } catch (error) {
        console.error('Error initializing events storage:', error);
        localStorage.setItem('events', '[]');
    }
}

// Bild-Edit-Modal öffnen
function openImageEditModal(eventId) {
    let events = [];
    try {
        const eventsData = localStorage.getItem('events');
        events = eventsData ? JSON.parse(eventsData) : [];
    } catch (error) { events = []; }
    const event = events.find(e => e.id.toString() === eventId);
    if (event) {
        editingImageEventId = eventId;
        eventEditModal.style.display = 'block';
        eventEditCurrentUrl.textContent = event.imageUrl || '';
        eventEditUrlInput.value = event.imageUrl || '';
        eventEditPreview.src = event.imageUrl || '';
        eventEditMessage.textContent = '';
    }
}

// Vorschau aktualisieren
if (eventEditUrlInput) {
    eventEditUrlInput.addEventListener('input', () => {
        eventEditPreview.src = eventEditUrlInput.value;
    });
}

// Bild-URL speichern
if (eventEditForm) {
    eventEditForm.addEventListener('submit', function(e) {
        e.preventDefault();
        if (!editingImageEventId) return;
        let events = [];
        try {
            const eventsData = localStorage.getItem('events');
            events = eventsData ? JSON.parse(eventsData) : [];
        } catch (error) { events = []; }
        const eventIndex = events.findIndex(e => e.id.toString() === editingImageEventId);
        if (eventIndex !== -1) {
            events[eventIndex].imageUrl = eventEditUrlInput.value;
            localStorage.setItem('events', JSON.stringify(events));
            eventEditMessage.textContent = 'Bild-URL gespeichert!';
            eventEditPreview.src = eventEditUrlInput.value;
            eventEditCurrentUrl.textContent = eventEditUrlInput.value;
            loadEvents();
            setTimeout(() => { eventEditModal.style.display = 'none'; }, 1000);
        } else {
            eventEditMessage.textContent = 'Fehler beim Speichern.';
        }
    });
}

// --- Show Participants Modal Logic ---
function setupShowParticipantsButtons() {
    for (let i = 1; i <= 4; i++) {
        const btn = document.getElementById(`show-participants-btn-${i}`);
        const modal = document.getElementById(`participants-modal-${i}`);
        const closeBtn = modal ? modal.querySelector('.participants-modal-close') : null;
        if (btn && modal && closeBtn) {
            btn.addEventListener('click', () => {
                fetchAndShowParticipants(i);
            });
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }
    }
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        for (let i = 1; i <= 4; i++) {
            const modal = document.getElementById(`participants-modal-${i}`);
            if (modal && e.target === modal) {
                modal.style.display = 'none';
            }
        }
    });
}

async function fetchAndShowParticipants(eventNumber) {
    const modal = document.getElementById(`participants-modal-${eventNumber}`);
    const listDiv = document.getElementById(`participants-list-${eventNumber}`);
    if (!modal || !listDiv) return;
    listDiv.innerHTML = '<p>Lade Teilnehmer...</p>';
    modal.style.display = 'block';
    try {
        const res = await fetch(`${API_BASE_URL}/participants`);
        const data = await res.json();
        if (!data.participants) throw new Error('Keine Teilnehmer gefunden');
        // Filter by banner/section
        const filtered = data.participants.filter(p => (p.banner || '1') === String(eventNumber));
        if (filtered.length === 0) {
            listDiv.innerHTML = '<p>Keine Teilnehmer für dieses Event.</p>';
        } else {
            listDiv.innerHTML = filtered.map(p => `
                <div class="participant-item${p.message ? ' has-message' : ''}${p.email ? ' has-email' : ''}">
                    <strong>${p.name}</strong>
                    ${p.email ? `<div><span class='detail-label'>E-Mail:</span> ${p.email}</div>` : ''}
                    ${p.message ? `<div><span class='detail-label'>Nachricht:</span> ${p.message}</div>` : ''}
                    ${p.timestamp ? `<div><small>${new Date(p.timestamp).toLocaleString('de-DE')}</small></div>` : ''}
                </div>
            `).join('');
        }
    } catch (e) {
        listDiv.innerHTML = `<p>Fehler beim Laden: ${e.message}</p>`;
    }
}