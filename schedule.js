/**
 * Vitalist Bay 2026 Schedule Component
 * Eudemonia-style Conference Agenda
 */

class VitalistBaySchedule {
  constructor(containerId, dataSource) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`Container #${containerId} not found`);
      return;
    }

    this.data = null;
    this.currentDate = 'all';
    this.currentTrack = 'all';
    this.currentTab = 'all';

    if (typeof dataSource === 'string') {
      this.loadData(dataSource);
    } else if (typeof dataSource === 'object') {
      this.data = dataSource;
      this.init();
    }
  }

  async loadData(url) {
    this.showLoading();
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      this.data = await response.json();
      this.init();
    } catch (error) {
      console.error('Failed to load schedule data:', error);
      this.showError('Failed to load schedule. Please try again.');
    }
  }

  init() {
    this.render();
    this.bindEvents();
  }

  showLoading() {
    this.container.innerHTML = `
      <div class="vb-schedule__loading">
        <div class="vb-schedule__spinner"></div>
        <span>Loading schedule...</span>
      </div>
    `;
  }

  showError(message) {
    this.container.innerHTML = `
      <div class="vb-schedule__empty">
        <div class="vb-schedule__empty-icon">⚠️</div>
        <p>${message}</p>
      </div>
    `;
  }

  // Group sessions by date and time
  groupSessionsByDateAndTime(sessions) {
    const grouped = {};
    sessions.forEach(session => {
      const dateKey = session.date;
      const timeKey = session.startTime;

      if (!grouped[dateKey]) {
        grouped[dateKey] = {};
      }
      if (!grouped[dateKey][timeKey]) {
        grouped[dateKey][timeKey] = [];
      }
      grouped[dateKey][timeKey].push(session);
    });
    return grouped;
  }

  getFilteredSessions() {
    const tabTypeMap = {
      'all': null,
      'talks': ['Talk', 'Keynote', 'Panel', 'Fireside'],
      'workshops': ['Workshop', 'Roundtable', 'Competition'],
      'activities': ['Activity', 'Social', 'Networking']
    };
    const allowedTypes = tabTypeMap[this.currentTab] || null;

    return this.data.sessions.filter(session => {
      const dateMatch = this.currentDate === 'all' || session.date === this.currentDate;
      const trackMatch = this.currentTrack === 'all' || session.trackId === this.currentTrack;
      const tabMatch = !allowedTypes || allowedTypes.includes(session.type);
      return dateMatch && trackMatch && tabMatch;
    });
  }

  formatTime(time24) {
    const [hours, minutes] = time24.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  }

  formatDateShort(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  }

  getWeekday(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  }

  getTrack(trackId) {
    return this.data.tracks.find(t => t.id === trackId) || {
      id: trackId,
      name: trackId,
      color: '#6b7280'
    };
  }

  getTotalSessionCount() {
    return this.getFilteredSessions().length;
  }

  // Icons as SVG strings
  icons = {
    calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    location: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
    search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
    filter: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>`,
    grid: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`,
    list: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
    chevronDown: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>`,
    chevronRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>`,
    chevronLeft: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>`,
    close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    users: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`
  };

  // Render header bar with session count and controls
  renderHeaderBar() {
    const sessionCount = this.getTotalSessionCount();
    const dateOptions = this.data.event.dates.map(date => {
      const weekday = this.getWeekday(date);
      const formatted = this.formatDateShort(date);
      return `<option value="${date}" ${this.currentDate === date ? 'selected' : ''}>${weekday}, ${formatted}</option>`;
    }).join('');

    return `
      <div class="vb-schedule__header-bar">
        <div class="vb-schedule__session-count">
          <span class="vb-schedule__session-count-label">All Sessions</span>
          <span class="vb-schedule__session-count-number">(${sessionCount})</span>
        </div>
        <div class="vb-schedule__header-right">
          <button class="vb-schedule__date-dropdown" data-action="date-dropdown">
            <span>${this.currentDate === 'all' ? 'All Dates' : this.getWeekday(this.currentDate) + ', ' + this.formatDateShort(this.currentDate)}</span>
            ${this.icons.chevronDown}
          </button>
          <div class="vb-schedule__view-icons">
            <button class="vb-schedule__view-icon vb-schedule__view-icon--active" data-view="grid" title="Grid view">
              ${this.icons.grid}
            </button>
            <button class="vb-schedule__view-icon" data-view="list" title="List view">
              ${this.icons.list}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // Render filter bar with tabs and controls
  renderFilterBar() {
    const currentTab = this.currentTab || 'all';
    return `
      <div class="vb-schedule__filter-bar">
        <div class="vb-schedule__tabs">
          <button class="vb-schedule__tab ${currentTab === 'all' ? 'vb-schedule__tab--active' : ''}" data-tab="all">
            ${this.icons.calendar}
            <span>All Sessions</span>
          </button>
          <button class="vb-schedule__tab ${currentTab === 'talks' ? 'vb-schedule__tab--active' : ''}" data-tab="talks">
            <span>Talks</span>
          </button>
          <button class="vb-schedule__tab ${currentTab === 'workshops' ? 'vb-schedule__tab--active' : ''}" data-tab="workshops">
            <span>Workshops</span>
          </button>
          <button class="vb-schedule__tab ${currentTab === 'activities' ? 'vb-schedule__tab--active' : ''}" data-tab="activities">
            <span>Activities</span>
          </button>
        </div>
        <div class="vb-schedule__filter-controls">
          <button class="vb-schedule__topics-btn" data-action="topics">
            ${this.icons.filter}
            <span>Topics & Tracks</span>
          </button>
        </div>
      </div>
    `;
  }

  // Render a single session card - Eudemonia style
  renderSessionCard(session) {
    const track = this.getTrack(session.trackId);

    // Build tags
    const tags = [];
    tags.push(`<span class="vb-session__tag vb-session__tag--type">${session.type}</span>`);
    tags.push(`<span class="vb-session__tag vb-session__tag--duration">${session.duration} Minutes</span>`);
    tags.push(`<span class="vb-session__tag vb-session__tag--track" style="--tag-track-color: ${track.color}">${track.name}</span>`);

    // Speaker section
    let speakersHtml = '';
    if (session.speakers && session.speakers.length > 0) {
      const multipleClass = session.speakers.length > 1 ? 'vb-session__speakers--multiple' : '';
      const speakerItems = session.speakers.slice(0, 3).map(speaker => `
        <div class="vb-session__speaker">
          <img src="${speaker.photo}" alt="${speaker.name}" class="vb-session__speaker-photo" loading="lazy">
          <div class="vb-session__speaker-info">
            <div class="vb-session__speaker-name">${speaker.name}</div>
            <div class="vb-session__speaker-title">${speaker.title}</div>
          </div>
        </div>
      `).join('');

      speakersHtml = `<div class="vb-session__speakers ${multipleClass}">${speakerItems}</div>`;
    }

    return `
      <article class="vb-session" data-session-id="${session.id}">
        <h3 class="vb-session__title">${session.title}</h3>

        <div class="vb-session__time-location">
          <div class="vb-session__time-item">
            ${this.icons.clock}
            <span>${this.formatTime(session.startTime)} - ${this.formatTime(session.endTime)}</span>
          </div>
          <div class="vb-session__location-item">
            ${this.icons.location}
            <span>${session.location}</span>
          </div>
        </div>

        <div class="vb-session__tags">
          ${tags.join('')}
        </div>

        <p class="vb-session__description">${session.description}</p>

        ${speakersHtml}
      </article>
    `;
  }

  // Render time slots
  renderTimeSlots() {
    const sessions = this.getFilteredSessions();
    const grouped = this.groupSessionsByDateAndTime(sessions);

    const sortedDates = Object.keys(grouped).sort();

    if (sortedDates.length === 0) {
      return `
        <div class="vb-schedule__empty">
          <div class="vb-schedule__empty-icon">📅</div>
          <p>No sessions scheduled for this selection.</p>
          <p>Try selecting a different day or track.</p>
        </div>
      `;
    }

    let html = '';

    sortedDates.forEach(date => {
      const timeSlotsForDate = grouped[date];
      const sortedTimes = Object.keys(timeSlotsForDate).sort();

      sortedTimes.forEach(time => {
        const timeSessions = timeSlotsForDate[time];
        const sessionCards = timeSessions.map(s => this.renderSessionCard(s)).join('');
        const isSingle = timeSessions.length === 1;
        const hasMultiple = timeSessions.length > 1;

        const weekday = this.getWeekday(date);
        const dateFormatted = this.formatDateShort(date);

        html += `
          <div class="vb-schedule__time-slot" data-date="${date}" data-time="${time}">
            <div class="vb-schedule__time-sidebar">
              <div class="vb-schedule__day-name">${weekday}</div>
              <div class="vb-schedule__day-date">${dateFormatted}</div>
              <div class="vb-schedule__time-display">${this.formatTime(time)}</div>
              <div class="vb-schedule__timezone">(PST)</div>
            </div>
            <div class="vb-schedule__sessions-wrapper">
              <div class="vb-schedule__sessions ${isSingle ? 'vb-schedule__sessions--single' : ''}" data-count="${timeSessions.length}">
                ${sessionCards}
              </div>
              ${hasMultiple ? `
                <button class="vb-schedule__nav-arrow vb-schedule__nav-arrow--next" data-date="${date}" data-time="${time}" aria-label="Next sessions">
                  ${this.icons.chevronRight}
                </button>
                <button class="vb-schedule__nav-arrow vb-schedule__nav-arrow--prev vb-schedule__nav-arrow--hidden" data-date="${date}" data-time="${time}" aria-label="Previous sessions">
                  ${this.icons.chevronLeft}
                </button>
              ` : ''}
            </div>
          </div>
        `;
      });
    });

    return html;
  }

  render() {
    this.container.innerHTML = `
      <div class="vb-schedule">
        ${this.renderHeaderBar()}
        ${this.renderFilterBar()}
        <div class="vb-schedule__grid">
          ${this.renderTimeSlots()}
        </div>
      </div>
    `;

    this.bindEvents();
    this.updateNavArrows();
  }

  bindEvents() {
    // Date dropdown (simplified - just cycles through dates for now)
    const dateDropdown = this.container.querySelector('[data-action="date-dropdown"]');
    if (dateDropdown) {
      dateDropdown.addEventListener('click', () => {
        const dates = ['all', ...this.data.event.dates];
        const currentIndex = dates.indexOf(this.currentDate);
        const nextIndex = (currentIndex + 1) % dates.length;
        this.currentDate = dates[nextIndex];
        this.render();
      });
    }

    // Tab buttons
    this.container.querySelectorAll('.vb-schedule__tab').forEach(tab => {
      tab.addEventListener('click', () => {
        this.currentTab = tab.dataset.tab;
        this.render();
      });
    });

    // Navigation arrows
    this.container.querySelectorAll('.vb-schedule__nav-arrow').forEach(arrow => {
      arrow.addEventListener('click', (e) => {
        const date = arrow.dataset.date;
        const time = arrow.dataset.time;
        const direction = arrow.classList.contains('vb-schedule__nav-arrow--next') ? 1 : -1;
        this.scrollSessions(date, time, direction);
      });
    });

    // Scroll listeners
    this.container.querySelectorAll('.vb-schedule__sessions').forEach(container => {
      container.addEventListener('scroll', () => {
        this.updateNavArrows();
      });
    });
  }

  scrollSessions(date, time, direction) {
    const slot = this.container.querySelector(`.vb-schedule__time-slot[data-date="${date}"][data-time="${time}"]`);
    if (!slot) return;

    const container = slot.querySelector('.vb-schedule__sessions');
    const card = container.querySelector('.vb-session');
    if (!card) return;

    const gap = parseFloat(getComputedStyle(container).gap) || 16;
    const cardWidth = card.offsetWidth + gap;
    const maxScroll = container.scrollWidth - container.clientWidth;
    let newScroll = container.scrollLeft + (cardWidth * direction);

    // Clamp
    newScroll = Math.max(0, Math.min(newScroll, maxScroll));

    // Smooth scroll via CSS
    container.style.scrollBehavior = 'smooth';
    container.scrollLeft = newScroll;

    // Update arrows after scroll completes
    setTimeout(() => this.updateNavArrows(), 350);
  }

  updateNavArrows() {
    this.container.querySelectorAll('.vb-schedule__time-slot').forEach(slot => {
      const container = slot.querySelector('.vb-schedule__sessions');
      const prevBtn = slot.querySelector('.vb-schedule__nav-arrow--prev');
      const nextBtn = slot.querySelector('.vb-schedule__nav-arrow--next');

      if (!prevBtn || !nextBtn) return;

      const { scrollLeft, scrollWidth, clientWidth } = container;
      const atStart = scrollLeft <= 0;
      const atEnd = scrollLeft + clientWidth >= scrollWidth - 1;

      prevBtn.classList.toggle('vb-schedule__nav-arrow--hidden', atStart);
      nextBtn.classList.toggle('vb-schedule__nav-arrow--hidden', atEnd);
    });
  }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('[data-vb-schedule]');
  if (container && !container.dataset.vbInitialized) {
    container.dataset.vbInitialized = 'true';
    const dataUrl = container.dataset.vbSchedule || 'schedule-data.json';
    new VitalistBaySchedule(container.id, dataUrl);
  }
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = VitalistBaySchedule;
}
