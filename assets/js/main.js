/**
 * SupplyPro | Supply Chain & Procurement Consulting
 * Core Site Functions (Theme Manager, Forms, Booking Calendar)
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeManager();
  initRtlManager();
  initStickyNavbar();
  initCalendarBooking();
  initFormValidation();
});

/**
 * Dark/Light Mode Theme Manager
 */
function initThemeManager() {
  const themeToggles = document.querySelectorAll('#themeToggle, #themeToggleMobile');
  if (themeToggles.length === 0) return;

  const currentTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);
  updateThemeIcons(currentTheme);

  themeToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      let theme = document.documentElement.getAttribute('data-theme');
      let targetTheme = theme === 'dark' ? 'light' : 'dark';

      document.documentElement.setAttribute('data-theme', targetTheme);
      localStorage.setItem('theme', targetTheme);
      updateThemeIcons(targetTheme);

      // Redraw canvas if it exists by triggering window resize event
      window.dispatchEvent(new Event('resize'));
    });
  });

  function updateThemeIcons(theme) {
    themeToggles.forEach(toggle => {
      const icon = toggle.querySelector('i');
      if (!icon) return;
      if (theme === 'dark') {
        icon.className = 'fas fa-sun';
      } else {
        icon.className = 'fas fa-moon';
      }
    });
  }
}

/**
 * Right-To-Left (RTL) Layout Manager
 */
function initRtlManager() {
  const rtlToggles = document.querySelectorAll('#rtlToggle, #rtlToggleMobile');
  if (rtlToggles.length === 0) return;

  const bootstrapLink = document.getElementById('bootstrapLink');

  const currentRtl = localStorage.getItem('rtl') === 'true';
  setRtlState(currentRtl);

  rtlToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const isRtl = document.documentElement.getAttribute('dir') === 'rtl';
      setRtlState(!isRtl);
    });
  });

  function setRtlState(isRtl) {
    if (isRtl) {
      document.documentElement.setAttribute('dir', 'rtl');
      localStorage.setItem('rtl', 'true');
      if (bootstrapLink) {
        bootstrapLink.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.rtl.min.css';
      }
      updateRtlIcons(true);
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
      localStorage.setItem('rtl', 'false');
      if (bootstrapLink) {
        bootstrapLink.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css';
      }
      updateRtlIcons(false);
    }
    // Redraw canvas if it exists by triggering window resize event
    window.dispatchEvent(new Event('resize'));
  }

  function updateRtlIcons(isRtl) {
    rtlToggles.forEach(toggle => {
      const icon = toggle.querySelector('i');
      if (!icon) return;
      icon.className = 'fas fa-right-left';
    });
  }
}

/**
 * Sticky Header Scroll State
 */
function initStickyNavbar() {
  const navbar = document.querySelector('.navbar-custom');
  if (!navbar) return;

  const checkScroll = () => {
    if (window.scrollY > 50) {
      navbar.classList.add('navbar-scrolled');
    } else {
      navbar.classList.remove('navbar-scrolled');
    }
  };

  window.addEventListener('scroll', checkScroll);
  checkScroll(); // check initially
}

/**
 * Premium Booking Calendar Logic
 */
function initCalendarBooking() {
  const calendarGrid = document.querySelector('.calendar-grid');
  const selectedDateInput = document.getElementById('selectedDate');
  const monthYearLabel = document.getElementById('calendarMonthYear');
  if (!calendarGrid) return;

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const now = new Date();
  let currentYear = now.getFullYear();
  let currentMonth = now.getMonth();

  function renderCalendar(month, year) {
    if (monthYearLabel) {
      monthYearLabel.innerText = `${months[month]} ${year}`;
    }

    // Clear calendar grid, keeping label row
    const labels = Array.from(calendarGrid.querySelectorAll('.calendar-day-label'));
    calendarGrid.innerHTML = '';
    labels.forEach(lbl => calendarGrid.appendChild(lbl));

    // Determine starting day of month
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Fill preceding empty slots
    for (let i = 0; i < firstDay; i++) {
      const emptyCell = document.createElement('div');
      emptyCell.className = 'calendar-cell muted';
      emptyCell.innerText = '';
      calendarGrid.appendChild(emptyCell);
    }

    // Populate calendar days
    for (let day = 1; day <= daysInMonth; day++) {
      const cell = document.createElement('div');
      cell.className = 'calendar-cell';
      cell.innerText = day;

      const dateObj = new Date(year, month, day);
      const isPast = dateObj < new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const dayOfWeek = dateObj.getDay();

      // Consultant only works weekdays (Mon-Fri) and avoids past dates
      if (isPast || dayOfWeek === 0 || dayOfWeek === 6) {
        cell.classList.add('muted');
      } else {
        cell.classList.add('available');
        cell.addEventListener('click', () => {
          // Deselect previous selection
          calendarGrid.querySelectorAll('.calendar-cell.selected').forEach(c => {
            c.classList.remove('selected');
          });
          cell.classList.add('selected');

          // Update booking input
          const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          if (selectedDateInput) {
            selectedDateInput.value = formattedDate;
            // Dispatch change event for floats
            selectedDateInput.dispatchEvent(new Event('change'));
          }

          // Dynamic time selector populate
          populateTimeSlots(formattedDate);
        });
      }

      calendarGrid.appendChild(cell);
    }
  }

  // Populate time slots dynamically after choosing date
  function populateTimeSlots(dateString) {
    const slotsContainer = document.getElementById('timeSlotsWrapper');
    const selectedTimeInput = document.getElementById('selectedTime');
    if (!slotsContainer) return;

    slotsContainer.innerHTML = '';
    
    // Core consulting slots (Eastern/Central appropriate slots)
    const times = ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'];

    times.forEach(time => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-outline-secondary btn-sm me-2 mb-2 px-3 py-2';
      btn.style.borderRadius = '4px';
      btn.innerText = time;

      btn.addEventListener('click', () => {
        slotsContainer.querySelectorAll('button').forEach(b => {
          b.classList.remove('active', 'btn-primary');
          b.classList.add('btn-outline-secondary');
        });
        btn.classList.add('active', 'btn-primary');
        btn.classList.remove('btn-outline-secondary');

        if (selectedTimeInput) {
          selectedTimeInput.value = time;
        }
      });
      slotsContainer.appendChild(btn);
    });
  }

  // Prev/Next Month selectors
  const prevBtn = document.getElementById('calendarPrevMonth');
  const nextBtn = document.getElementById('calendarNextMonth');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      currentMonth--;
      if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
      }
      renderCalendar(currentMonth, currentYear);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
      renderCalendar(currentMonth, currentYear);
    });
  }

  renderCalendar(currentMonth, currentYear);
}

/**
 * Professional Consulting Intake Forms Validation
 */
function initFormValidation() {
  const forms = document.querySelectorAll('.needs-validation-custom');
  
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      let isValid = true;
      const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');

      inputs.forEach(input => {
        if (!input.value.trim()) {
          isValid = false;
          input.style.borderColor = 'red';
        } else {
          input.style.borderColor = 'var(--border-color)';
        }

        // Email regex check
        if (input.type === 'email' && input.value.trim()) {
          const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailPattern.test(input.value.trim())) {
            isValid = false;
            input.style.borderColor = 'red';
          }
        }
      });

      if (isValid) {
        showSuccessModal(form);
      }
    });
  });

  function showSuccessModal(form) {
    // Generate simple premium success dialog
    const modalDiv = document.createElement('div');
    modalDiv.style.position = 'fixed';
    modalDiv.style.top = '0';
    modalDiv.style.left = '0';
    modalDiv.style.width = '100%';
    modalDiv.style.height = '100%';
    modalDiv.style.backgroundColor = 'rgba(7, 20, 38, 0.85)';
    modalDiv.style.backdropFilter = 'blur(10px)';
    modalDiv.style.zIndex = '99999';
    modalDiv.style.display = 'flex';
    modalDiv.style.alignItems = 'center';
    modalDiv.style.justifyContent = 'center';
    modalDiv.style.opacity = '0';
    modalDiv.style.transition = 'opacity 0.4s ease';

    modalDiv.innerHTML = `
      <div class="card-premium text-center" style="max-width: 500px; width: 90%; transform: scale(0.9); transition: transform 0.4s ease; padding: 50px 30px;">
        <div class="card-icon mx-auto mb-4" style="width: 70px; height: 70px; border-radius: 50%; font-size: 2rem;">
          <i class="fas fa-check"></i>
        </div>
        <h3 class="mb-3" style="font-family: var(--font-heading);">Consultation Request Received</h3>
        <p class="text-secondary-custom mb-4">Thank you for submitting your supply chain profile. SupplyPro will review your operational challenges and contact you within 24 hours with diagnostic notes.</p>
        <button type="button" class="btn btn-premium btn-premium-primary" id="closeSuccessModalBtn">Return to Advisor Profile</button>
      </div>
    `;

    document.body.appendChild(modalDiv);
    
    // Trigger animation frame for transition
    setTimeout(() => {
      modalDiv.style.opacity = '1';
      modalDiv.querySelector('.card-premium').style.transform = 'scale(1)';
    }, 10);

    const closeBtn = modalDiv.querySelector('#closeSuccessModalBtn');
    closeBtn.addEventListener('click', () => {
      modalDiv.style.opacity = '0';
      modalDiv.querySelector('.card-premium').style.transform = 'scale(0.9)';
      setTimeout(() => {
        document.body.removeChild(modalDiv);
        form.reset();
        // Reset label layouts
        form.querySelectorAll('.form-floating-custom input, form .form-floating-custom textarea').forEach(inp => {
          inp.dispatchEvent(new Event('change'));
        });
      }, 400);
    });
  }
}

/**
 * Back to Top Button Visibility
 */
const backToTopBtn = document.getElementById('backToTop');
if (backToTopBtn) {
  // Hide initially
  backToTopBtn.style.opacity = '0';
  backToTopBtn.style.pointerEvents = 'none';
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backToTopBtn.style.opacity = '0.8';
      backToTopBtn.style.pointerEvents = 'auto';
    } else {
      backToTopBtn.style.opacity = '0';
      backToTopBtn.style.pointerEvents = 'none';
    }
  });
  
  backToTopBtn.addEventListener('mouseenter', () => {
    if (window.scrollY > 300) backToTopBtn.style.opacity = '1';
  });
  backToTopBtn.addEventListener('mouseleave', () => {
    if (window.scrollY > 300) backToTopBtn.style.opacity = '0.8';
  });
}
