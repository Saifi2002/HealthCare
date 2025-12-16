// State variable to track which Tab is currently active
let currentActiveTab = 'all';

// --- Global DOM element references and NEW State Variables ---
const dateRangeToggle = document.getElementById('dateRangeToggle');
const dateRangePopover = document.getElementById('dateRangePopover');
const dateRangeApply = document.getElementById('dateRangeApply');
const dateRangeClear = document.getElementById('dateRangeClear');
const calendarContainer = document.getElementById('calendarContainer');
const dateRangeDisplay = document.getElementById('dateRangeDisplay');
const paginationContainer = document.getElementById('pagination-links'); // NEW DOM Reference

// 🎯 COMPLEX CALENDAR STATE: Used for the single-calendar range selection
let selectedStartDate = null;
let selectedEndDate = null;
let currentCalendarDate = new Date(); // Tracks the currently displayed month/year

// --- Pagination State and Configuration ---
const ITEMS_PER_PAGE = 5; // <<< CONFIGURATION: Set to 2 rows per page as requested for testing
let paginationRows = []; // Array to store all currently filtered/sorted visible rows (the "Master List")
let currentPage = 1;

// Helper function to get the number of days left (Time Trigger)
function getDaysLeft(row) {
    const timeTriggerCell = row.cells[6]; // 7th column (index 6)
    const timeTriggerText = timeTriggerCell ? timeTriggerCell.innerText.trim() : '';

    if (timeTriggerText.includes('Expired')) return -1; 
    if (timeTriggerText.includes('days left')) {
        const days = parseInt(timeTriggerText.split(' ')[0], 10);
        return isNaN(days) ? 9999 : days; 
    }
    if (timeTriggerText.includes('0 days left')) return 0;
    
    return 9999; 
}

// --- 1. RUN ON PAGE LOAD (Event Listeners & Initial Filter) ---
document.addEventListener('DOMContentLoaded', function() {
    // This runs the master filter immediately so colors appear right away
    applyFilters();
    
    // 🎯 Render the calendar on page load
    renderCalendar();

    // --- POPUP CONTROL LOGIC (Date Range Button) ---
    if (dateRangeToggle) {
        dateRangeToggle.addEventListener('click', (e) => {
            e.stopPropagation(); 
            if (dateRangePopover) {
                dateRangePopover.classList.toggle('hidden');
                dateRangeToggle.classList.toggle('active'); 
            }
        });
    }

    // Close popover when clicking outside
    document.addEventListener('click', (e) => {
        if (dateRangePopover && dateRangeToggle && 
            !dateRangePopover.contains(e.target) && !dateRangeToggle.contains(e.target)) {
            dateRangePopover.classList.add('hidden');
            dateRangeToggle.classList.remove('active');
        }
    });

    // Apply Button Logic
    if (dateRangeApply) {
        dateRangeApply.addEventListener('click', () => {
            updateDateRangeDisplay(); 
            applyFilters(); // Triggers the final filter
            dateRangePopover.classList.add('hidden'); 
            dateRangeToggle.classList.remove('active');
        });
    }

    // Clear Button Logic
    if (dateRangeClear) {
        dateRangeClear.addEventListener('click', () => {
            selectedStartDate = null;
            selectedEndDate = null;
            updateDateRangeDisplay(); 
            renderCalendar(); 
            applyFilters();
            dateRangePopover.classList.add('hidden'); 
            dateRangeToggle.classList.remove('active');
        });
    }

    updateDateRangeDisplay(); 

    // Add listeners for dropdowns that trigger filters immediately on change
    if (document.getElementById('statusSelect')) document.getElementById('statusSelect').addEventListener('change', applyFilters);
    if (document.getElementById('typeSelect')) document.getElementById('typeSelect').addEventListener('change', applyFilters);
    if (document.getElementById('sortSelect')) document.getElementById('sortSelect').addEventListener('change', sortRows); 

    // --- NEW: Pagination Click Listener ---
    if (paginationContainer) {
        paginationContainer.addEventListener('click', (e) => {
            e.preventDefault(); 
            const pageItem = e.target.closest('.page-item');
            if (pageItem && !pageItem.classList.contains('active') && !pageItem.classList.contains('disabled')) {
                // Use the data-page attribute to get the target page number
                const targetPage = parseInt(pageItem.dataset.page);
                loadPage(targetPage);
            }
        });
    }
    
    // Dropdown Animation Listeners (retained from your code)
    document.querySelectorAll('.select-wrapper select').forEach(selectElement => {
        const wrapper = selectElement.closest('.select-wrapper');
        selectElement.addEventListener('focus', () => { wrapper.classList.add('active'); });
        selectElement.addEventListener('blur', () => { setTimeout(() => { wrapper.classList.remove('active'); }, 100); });
    });
});

// --- COMPLEX CALENDAR LOGIC (Retained from your code) ---
function handleDateClick(event) {
    event.stopPropagation(); 
    const dateString = event.currentTarget.dataset.date;
    if (!dateString) return;
    const newDate = new Date(dateString + 'T00:00:00.000Z'); 
    const startKey = selectedStartDate ? selectedStartDate.getTime() : null;
    const endKey = selectedEndDate ? selectedEndDate.getTime() : null;
    const newKey = newDate.getTime();

    if (!startKey || (startKey && endKey)) {
        selectedStartDate = newDate;
        selectedEndDate = null;
    } else if (newKey < startKey) {
        selectedEndDate = selectedStartDate;
        selectedStartDate = newDate;
    } else {
        selectedEndDate = newDate;
    }
    
    renderCalendar();
    updateDateRangeDisplay(); 
}

function attachCalendarListeners() {
    const monthSelect = document.getElementById('monthSelect');
    const yearSelect = document.getElementById('yearSelect');

    const handleSelectChange = (e) => {
        e.stopPropagation(); 
        const newMonth = parseInt(monthSelect.value);
        const newYear = parseInt(yearSelect.value);
        currentCalendarDate.setMonth(newMonth);
        currentCalendarDate.setFullYear(newYear);
        renderCalendar();
    };

    if (monthSelect) monthSelect.addEventListener('change', handleSelectChange);
    if (yearSelect) yearSelect.addEventListener('change', handleSelectChange);
    
    if (document.getElementById('prevMonth')) {
        document.getElementById('prevMonth').addEventListener('click', (e) => {
            e.stopPropagation(); 
            currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
            renderCalendar();
        });
    }

    if (document.getElementById('nextMonth')) {
        document.getElementById('nextMonth').addEventListener('click', (e) => {
            e.stopPropagation(); 
            currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
            renderCalendar();
        });
    }

    if (calendarContainer) {
        calendarContainer.querySelectorAll('.day').forEach(cell => {
            cell.addEventListener('click', handleDateClick);
        });
    }
}

function renderCalendar() {
    if (!calendarContainer) return;
    calendarContainer.innerHTML = ''; 

    const date = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth(), 1);
    const month = date.getMonth();
    const year = date.getFullYear();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = date.getDay(); 

    let monthOptions = '';
    for (let i = 0; i < 12; i++) {
        const name = new Date(year, i, 1).toLocaleDateString(undefined, { month: 'long' });
        const selected = (i === month) ? 'selected' : '';
        monthOptions += `<option value="${i}" ${selected}>${name}</option>`;
    }
    
    let yearOptions = '';
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
        const selected = (i === year) ? 'selected' : '';
        yearOptions += `<option value="${i}" ${selected}>${i}</option>`;
    }

    let calendarHTML = `
        <div class="calendar-header">
            <button id="prevMonth" class="nav-button">←</button>
            <div class="month-year-selects">
                <select id="monthSelect">${monthOptions}</select>
                <select id="yearSelect">${yearOptions}</select>
            </div>
            <button id="nextMonth" class="nav-button">→</button>
        </div>
        <table class="calendar-grid">
            <thead>
                <tr><th>Sun</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th></tr>
            </thead>
            <tbody>
                <tr>`;

    let totalCells = 0;
    for (let i = 0; i < firstDayOfWeek; i++) {
        calendarHTML += '<td></td>';
        totalCells++;
    }

    const startKey = selectedStartDate ? selectedStartDate.getTime() : null;
    const endKey = selectedEndDate ? selectedEndDate.getTime() : null;
    
    for (let i = 1; i <= daysInMonth; i++) {
        const currentDate = new Date(Date.UTC(year, month, i)); 
        const dayKey = currentDate.getTime();

        let className = 'day';
        if (dayKey === startKey && dayKey === endKey) {
            className += ' start-date end-date';
        } else if (dayKey === startKey) {
            className += ' start-date';
        } else if (dayKey === endKey) {
            className += ' end-date';
        } else if (startKey && endKey && dayKey > startKey && dayKey < endKey) {
            className += ' range-date';
        }
        
        calendarHTML += `<td class="${className}" data-date="${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}">${i}</td>`;
        
        totalCells++;
        
        if (totalCells % 7 === 0 && i < daysInMonth) {
            calendarHTML += '</tr><tr>';
        }
    }

    while (totalCells % 7 !== 0) {
        calendarHTML += '<td></td>';
        totalCells++;
    }

    calendarHTML += '</tr></tbody></table>';
    calendarContainer.innerHTML = calendarHTML;
    
    attachCalendarListeners();
}

function updateDateRangeDisplay() {
    if (!dateRangeDisplay) return; 
    const start = selectedStartDate;
    const end = selectedEndDate;

    if (!start && !end) {
        dateRangeDisplay.textContent = 'Date Range';
    } else {
        const formatDate = (dateObj) => {
            if (!dateObj) return 'Any';
            return dateObj.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
        };
        
        const startFmt = start ? formatDate(start) : 'Any';
        
        if (start && !end) {
             dateRangeDisplay.textContent = `${startFmt} – ?`;
        } else if (start && end) {
             dateRangeDisplay.textContent = `${formatDate(start)} – ${formatDate(end)}`;
        } else {
             dateRangeDisplay.textContent = 'Date Range';
        }
    }
}


// --- PAGINATION RENDERING LOGIC (NEW FUNCTIONS) ---

// This function injects only the rows for the current page into the DOM
function renderTableContent() {
    const tableBody = document.getElementById('tableBody');
    if (!tableBody) return;

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    
    // 1. Get only the rows for the current page from the master list
    const rowsForPage = paginationRows.slice(startIndex, endIndex);

    // 2. Get all existing rows currently in the body to manage hidden ones
    const existingRows = Array.from(tableBody.getElementsByTagName('tr'));
    const fragment = document.createDocumentFragment();

    // 3. Add the visible rows (Current Page)
    rowsForPage.forEach(row => {
        row.style.display = ""; // Ensure visible
        fragment.appendChild(row);
    });

    // 4. Add the completely hidden rows (those filtered out) back to the fragment
    existingRows.forEach(row => {
        if (row.style.display === 'none') {
             fragment.appendChild(row);
        }
    });

    tableBody.innerHTML = ''; // Clear existing content
    tableBody.appendChild(fragment); // Insert all rows efficiently

    reapplyStriping();
}

// This function re-draws the page links (1, 2, 3, ...)
function renderPaginationLinks() {
    if (!paginationContainer) return;

    const totalPages = Math.ceil(paginationRows.length / ITEMS_PER_PAGE);
    
    let html = '';
    const MAX_PAGES_TO_SHOW = 4; 
    const middlePoint = Math.floor(MAX_PAGES_TO_SHOW / 2);
    
    // Previous Button (<<)
    const prevClass = currentPage === 1 ? 'disabled' : '';
    html += `<li class="page-item ${prevClass}" data-page="${currentPage - 1}"><a href="#">&laquo;</a></li>`;

    let startPage = Math.max(1, currentPage - middlePoint + 1);
    let endPage = Math.min(totalPages, currentPage + middlePoint - 1);

    if (currentPage <= middlePoint) {
        endPage = Math.min(totalPages, MAX_PAGES_TO_SHOW);
    } else if (currentPage > totalPages - middlePoint) {
        startPage = Math.max(1, totalPages - MAX_PAGES_TO_SHOW + 1);
    }

    // Always show page 1 (if not in the range)
    if (startPage > 1) {
        html += `<li class="page-item" data-page="1"><a href="#">1</a></li>`;
        if (startPage > 2) {
            html += `<li class="page-item disabled"><a href="#">...</a></li>`;
        }
    }

    // Show the active range
    for (let i = startPage; i <= endPage; i++) {
        const activeClass = i === currentPage ? 'active' : '';
        html += `<li class="page-item ${activeClass}" data-page="${i}"><a href="#">${i}</a></li>`;
    }

    // Always show last page (if not in the range)
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            html += `<li class="page-item disabled"><a href="#">...</a></li>`;
        }
        html += `<li class="page-item" data-page="${totalPages}"><a href="#">${totalPages}</a></li>`;
    }

    // Next Button (>>)
    const nextClass = currentPage === totalPages ? 'disabled' : '';
    html += `<li class="page-item ${nextClass}" data-page="${currentPage + 1}"><a href="#">&raquo;</a></li>`;

    paginationContainer.innerHTML = html;
}

// This function handles the click event and loads the new page
window.loadPage = function(pageNumber) {
    const totalPages = Math.ceil(paginationRows.length / ITEMS_PER_PAGE);

    if (pageNumber < 1 || pageNumber > totalPages) {
        return;
    }

    // 1. Update state
    currentPage = pageNumber;

    // 2. Redraw UI and table content
    renderTableContent();
    renderPaginationLinks();
}

// --- 2. Tab Click Logic ---
window.filterTabs = function(event, category) { 
    var tabs = document.getElementsByClassName("tab");
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove("active");
    }
    event.currentTarget.classList.add("active");

    const typeSelect = document.getElementById('typeSelect');
    if (typeSelect) {
        typeSelect.value = category; 
    }

    currentActiveTab = category;
    applyFilters();
}

// --- 3. Master Filter (Modified for Pagination) ---
window.applyFilters = function() { 
    // 1. Get ALL filter values
    const statusFilter = document.getElementById('statusSelect').value.toLowerCase();
    const typeFilter = document.getElementById('typeSelect').value;
    const startDate = selectedStartDate;
    const endDate = selectedEndDate;
    
    const tableBody = document.getElementById('tableBody');
    const allRows = Array.from(tableBody.getElementsByTagName('tr')); 

    // ** NEW: Array to hold rows that pass the filter **
    let filteredRows = [];

    allRows.forEach(row => {
        // --- Filtering Logic (Retained from your original code) ---
        const rowType = row.getAttribute('data-type');
        const typeMatch = (typeFilter === 'all' || rowType === typeFilter);

        const badge = row.querySelector('.badge');
        let badgeText = badge ? badge.innerText.toLowerCase() : '';
        if (badgeText.includes('acknowledged') || badgeText.includes('awaiting acknowledgment')) {
            badgeText = 'acknowledged';
        } else if (badgeText.includes('approved')) {
            badgeText = 'approved';
        } else if (badgeText.includes('denied')) {
            badgeText = 'denied';
        } else if (badgeText.includes('follow-up')) {
            badgeText = 'follow-up';
        } else {
            badgeText = 'other';
        }
        const statusMatch = (statusFilter === 'all' || badgeText === statusFilter);

        const submittedDateStr = row.cells[4] ? row.cells[4].innerText : ''; 
        let dateMatches = true;

        if (startDate || endDate) {
            const parseSubmittedDate = (dateStr) => {
                if (!dateStr) return null;
                const date = new Date(dateStr);
                return isNaN(date.getTime()) ? null : new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
            };
            const submittedDate = parseSubmittedDate(submittedDateStr);
            
            if (!submittedDate) {
                dateMatches = false;
            } else {
                const submittedKey = submittedDate.getTime();
                
                if (startDate && submittedKey < startDate.getTime()) {
                    dateMatches = false;
                }
                if (endDate) {
                    const endOfDay = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59, 999);
                    const normalizedEndDate = new Date(Date.UTC(endOfDay.getFullYear(), endOfDay.getMonth(), endOfDay.getDate(), 23, 59, 59, 999));
                    
                    if (submittedKey > normalizedEndDate.getTime()) {
                        dateMatches = false;
                    }
                }
            }
        }
        // --- End of Filtering Logic ---

        const showRow = statusMatch && typeMatch && dateMatches;

        if (showRow) {
            // ** CHANGE: Add to filtered list instead of showing immediately **
            row.style.display = ""; // Keep the display property correct
            filteredRows.push(row);
        } else {
            row.style.display = "none"; // Hide rows that fail the filter
        }
    });

    // ** PAGINATION STEP 1: Update the master list of visible rows **
    paginationRows = filteredRows;
    
    // ** PAGINATION STEP 2: Reset to the first page when filters change **
    currentPage = 1;

    // Trigger Sort (which now handles rendering the current page)
    sortRows();
}

// --- 4. Sorting Logic (Modified for Pagination) ---
window.sortRows = function() { 
    const sortValue = document.getElementById('sortSelect').value;
    
    // ** CHANGE: Sort the data in the paginationRows array, not the DOM. **
    if (paginationRows.length > 0) {
        paginationRows.sort((a, b) => {
            const daysA = getDaysLeft(a);
            const daysB = getDaysLeft(b);

            // 1. Handle missing data
            if (daysA === 9999 && daysB !== 9999) return 1;
            if (daysB === 9999 && daysA !== 9999) return -1;
            
            // 2. Handle Expired
            if (sortValue === 'oldest') {
                if (daysA === -1 && daysB !== -1) return -1; 
                if (daysB === -1 && daysA !== -1) return 1;  
            } else { 
                if (daysA === -1 && daysB !== -1) return 1;
                if (daysB === -1 && daysA !== -1) return -1;
            }

            // 3. Primary Sort based on Days Left
            if (sortValue === 'newest') {
                return daysB - daysA; 
            } else {
                return daysA - daysB; 
            }
        });
    }

    // ** PAGINATION STEP 3: Render only the current page's content **
    renderTableContent();

    // ** PAGINATION STEP 4: Render the pagination links **
    renderPaginationLinks();
}

// --- 5. Striping Logic (Retained from your code) ---
function reapplyStriping() {
    const tableBody = document.getElementById('tableBody');
    const rows = Array.from(tableBody.getElementsByTagName('tr'));
    
    let visibleCount = 0; 

    rows.forEach(row => {
        row.classList.remove('highlight-row');

        if (row.style.display !== 'none') {
            if (visibleCount % 2 !== 0) {
                row.classList.add('highlight-row');
            }
            visibleCount++;
        }
    });
}

// --- 6. Reset Button (Retained from your code) ---
window.resetFilters = function() { 
    document.getElementById('statusSelect').value = 'all';
    document.getElementById('typeSelect').value = 'all'; 
    document.getElementById('sortSelect').value = 'newest';
    
    selectedStartDate = null;
    selectedEndDate = null;
    updateDateRangeDisplay(); 
    currentCalendarDate = new Date(); 
    renderCalendar(); 
    
    const tabs = document.getElementsByClassName("tab");
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove("active");
    }
    if (tabs.length > 0) {
        tabs[0].classList.add("active");
    }
    currentActiveTab = 'all';

    applyFilters(); 
}


document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelectorAll('.tab');
    const tableBody = document.getElementById('tableBody');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Get category ID
            const categoryId = this.getAttribute('data-category');
            
            // Fetch posts
            fetchPosts(categoryId);
        });
        
    });
    
    function fetchPosts(categoryId) {
        // Show loading state
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">Loading...</td></tr>';
        
        fetch(ajax_params.ajax_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                action: 'fetch_category_posts',
                category_id: categoryId,
                nonce: ajax_params.nonce
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                tableBody.innerHTML = data.data.html;
            } else {
                tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">No applications found.</td></tr>';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">Error loading applications.</td></tr>';
        });
    }
});