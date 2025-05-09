// Sample data structure for events and participants
const eventsData = {
    events: [
        {
            id: 1,
            title: "Event 1",
            banner: "path/to/banner1.jpg",
            participants: [
                {
                    id: 1,
                    name: "Max Mustermann",
                    email: "max@example.com",
                    message: "Ich freue mich auf das Event!",
                    hasMessage: true,
                    hasEmail: true
                },
                {
                    id: 2,
                    name: "Anna Schmidt",
                    email: "",
                    message: "",
                    hasMessage: false,
                    hasEmail: false
                }
            ]
        }
        // Add more events as needed
    ]
};

// DOM Elements
const eventsGrid = document.querySelector('.events-grid');
const participantModal = document.getElementById('participant-modal');
const participantDetails = document.getElementById('participant-details');
const closeModal = document.querySelector('.close');
const logoutButton = document.getElementById('logout-button');

// Check authentication
function checkAuth() {
    // Add your authentication check logic here
    const isAuthenticated = sessionStorage.getItem('adminAuthenticated');
    if (!isAuthenticated) {
        window.location.href = '../index.html';
    }
}

// Render events
function renderEvents() {
    eventsGrid.innerHTML = '';

    eventsData.events.forEach(event => {
        const eventCard = document.createElement('div');
        eventCard.className = 'event-card';

        eventCard.innerHTML = `
            <img src="${ event.banner }" alt="${ event.title }" class="event-banner">
            <div class="event-details">
                <h3>${ event.title }</h3>
                <ul class="participants-list">
                    ${ event.participants.map((participant, index) => `
                        <li class="participant-item ${ participant.hasMessage ? 'has-message' : '' } ${ participant.hasEmail ? 'has-email' : '' }"
                            data-participant-id="${ participant.id }"
                            data-event-id="${ event.id }">
                            ${ index + 1 }. ${ participant.name }
                        </li>
                    `).join('') }
                </ul>
            </div>
        `;

        eventsGrid.appendChild(eventCard);
    });
}

// Show participant details
function showParticipantDetails(eventId, participantId) {
    const event = eventsData.events.find(e => e.id === eventId);
    const participant = event.participants.find(p => p.id === participantId);

    participantDetails.innerHTML = `
        <div class="detail-row">
            <span class="detail-label">Name:</span>
            <span>${ participant.name }</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Email:</span>
            <span>${ participant.email || 'Keine Email angegeben' }</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Nachricht:</span>
            <span>${ participant.message || 'Keine Nachricht vorhanden' }</span>
        </div>
    `;

    participantModal.style.display = 'block';
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    renderEvents();

    // Participant click handler
    eventsGrid.addEventListener('click', (e) => {
        const participantItem = e.target.closest('.participant-item');
        if (participantItem) {
            const eventId = parseInt(participantItem.dataset.eventId);
            const participantId = parseInt(participantItem.dataset.participantId);
            showParticipantDetails(eventId, participantId);
        }
    });

    // Close modal
    closeModal.addEventListener('click', () => {
        participantModal.style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === participantModal) {
            participantModal.style.display = 'none';
        }
    });

    // Logout handler
    logoutButton.addEventListener('click', () => {
        sessionStorage.removeItem('adminAuthenticated');
        window.location.href = '../index.html';
    });
});