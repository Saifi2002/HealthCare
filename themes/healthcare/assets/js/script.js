// State variable to track which Tab is currently active
let currentActiveTab = 'all';

// --- Global DOM element references and State Variables ---
const dateRangeToggle = document.getElementById('dateRangeToggle');
const dateRangePopover = document.getElementById('dateRangePopover');
const dateRangeApply = document.getElementById('dateRangeApply');
const dateRangeClear = document.getElementById('dateRangeClear');
const calendarContainer = document.getElementById('calendarContainer');
const dateRangeDisplay = document.getElementById('dateRangeDisplay');
const paginationContainer = document.getElementById('pagination-links');

// Calendar STATE
let selectedStartDate = null;
let selectedEndDate = null;
let currentCalendarDate = new Date();

// Pagination State and Configuration
const ITEMS_PER_PAGE = 5;
let paginationRows = [];
let currentPage = 1;

// Helper function to get the number of days left (Time Trigger)
function getDaysLeft(row) {
    const timeTriggerCell = row.cells[6];
    const timeTriggerText = timeTriggerCell ? timeTriggerCell.innerText.trim() : '';

    if (timeTriggerText.includes('Expired')) return -1;
    if (timeTriggerText.includes('days left')) {
        const days = parseInt(timeTriggerText.split(' ')[0], 10);
        return isNaN(days) ? 9999 : days;
    }
    if (timeTriggerText.includes('0 days left')) return 0;

    return 9999;
}

// --- RUN ON PAGE LOAD ---
document.addEventListener('DOMContentLoaded', function () {
    applyFilters();
    renderCalendar();

    // POPUP CONTROL LOGIC (Date Range Button)
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
            applyFilters();
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

    // Add listeners for dropdowns
    if (document.getElementById('statusSelect')) {
        document.getElementById('statusSelect')?.addEventListener('change', () => {
            fetchPosts(currentActiveTab);
        });

    }
    if (document.getElementById('typeSelect')) {
        document.getElementById('typeSelect')?.addEventListener('change', function () {
            currentActiveTab = this.value;

            // Sync tabs
            document.querySelectorAll('.tab').forEach(tab => {
                tab.classList.toggle(
                    'active',
                    tab.getAttribute('data-category') === this.value
                );
            });

            fetchPosts(this.value);
        });

    }
    if (document.getElementById('sortSelect')) {
        document.getElementById('sortSelect').addEventListener('change', sortRows);
    }

    // Pagination Click Listener
    if (paginationContainer) {
        paginationContainer.addEventListener('click', (e) => {
            e.preventDefault();
            const pageItem = e.target.closest('.page-item');
            if (pageItem && !pageItem.classList.contains('active') && !pageItem.classList.contains('disabled')) {
                const targetPage = parseInt(pageItem.dataset.page);
                loadPage(targetPage);
            }
        });
    }

    // Dropdown Animation Listeners
    document.querySelectorAll('.select-wrapper select').forEach(selectElement => {
        const wrapper = selectElement.closest('.select-wrapper');
        selectElement.addEventListener('focus', () => { wrapper.classList.add('active'); });
        selectElement.addEventListener('blur', () => {
            setTimeout(() => { wrapper.classList.remove('active'); }, 100);
        });
    });

    // Tab Click Handlers - FIXED AJAX INTEGRATION
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function (e) {
            e.preventDefault();

            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));

            // Add active class to clicked tab
            this.classList.add('active');

            // Get category ID
            const categoryId = this.getAttribute('data-category');
            currentActiveTab = categoryId;

            // Update the type dropdown to match
            const typeSelect = document.getElementById('typeSelect');
            if (typeSelect) {
                typeSelect.value = categoryId;
            }

            // Fetch posts via AJAX
            fetchPosts(categoryId);
        });
    });
});

// --- AJAX FETCH POSTS FUNCTION ---
function fetchPosts(categoryId = 'all') {
    const tableBody = document.getElementById('tableBody');

    const statusValue = document.getElementById('statusSelect')
        ? document.getElementById('statusSelect').value
        : 'all';

    const typeValue = document.getElementById('typeSelect')
        ? document.getElementById('typeSelect').value
        : 'all';

    tableBody.innerHTML =
        '<tr><td colspan="7" style="text-align:center;padding:20px;">Loading...</td></tr>';

    fetch(ajax_params.ajax_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            action: 'fetch_category_posts',
            nonce: ajax_params.nonce,
            category_id: categoryId,
            status: statusValue,
            type: typeValue
        })
    })
        .then(res => res.json())
        .then(res => {
            if (res.success) {
                tableBody.innerHTML = res.data.html;

                // Rebuild pagination + filters after AJAX
                applyFilters();
            } else {
                tableBody.innerHTML =
                    '<tr><td colspan="7" style="text-align:center">No applications found.</td></tr>';
                paginationRows = [];
                renderPaginationLinks();
            }
        })
        .catch(err => {
            console.error(err);
            tableBody.innerHTML =
                '<tr><td colspan="7" style="text-align:center">Error loading data</td></tr>';
        });
}


// --- CALENDAR LOGIC ---
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
            dateRangeDisplay.textContent = `${startFmt} — ?`;
        } else if (start && end) {
            dateRangeDisplay.textContent = `${formatDate(start)} — ${formatDate(end)}`;
        } else {
            dateRangeDisplay.textContent = 'Date Range';
        }
    }
}

// --- PAGINATION RENDERING LOGIC ---
function renderTableContent() {
    const tableBody = document.getElementById('tableBody');
    if (!tableBody) return;

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    const rowsForPage = paginationRows.slice(startIndex, endIndex);

    const fragment = document.createDocumentFragment();
    rowsForPage.forEach(row => {
        row.style.display = "";
        fragment.appendChild(row);
    });

    tableBody.innerHTML = '';
    tableBody.appendChild(fragment);

    reapplyStriping();
}

function renderPaginationLinks() {
    if (!paginationContainer) return;

    const totalPages = Math.ceil(paginationRows.length / ITEMS_PER_PAGE);

    // Hide pagination if only 1 page or no data
    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }

    let html = '';
    const MAX_PAGES_TO_SHOW = 4;
    const middlePoint = Math.floor(MAX_PAGES_TO_SHOW / 2);

    // Previous Button
    const prevClass = currentPage === 1 ? 'disabled' : '';
    html += `<li class="page-item ${prevClass}" data-page="${currentPage - 1}"><a href="#">&laquo;</a></li>`;

    let startPage = Math.max(1, currentPage - middlePoint + 1);
    let endPage = Math.min(totalPages, currentPage + middlePoint - 1);

    if (currentPage <= middlePoint) {
        endPage = Math.min(totalPages, MAX_PAGES_TO_SHOW);
    } else if (currentPage > totalPages - middlePoint) {
        startPage = Math.max(1, totalPages - MAX_PAGES_TO_SHOW + 1);
    }

    // Always show page 1
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

    // Always show last page
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            html += `<li class="page-item disabled"><a href="#">...</a></li>`;
        }
        html += `<li class="page-item" data-page="${totalPages}"><a href="#">${totalPages}</a></li>`;
    }

    // Next Button
    const nextClass = currentPage === totalPages ? 'disabled' : '';
    html += `<li class="page-item ${nextClass}" data-page="${currentPage + 1}"><a href="#">&raquo;</a></li>`;

    paginationContainer.innerHTML = html;
}

window.loadPage = function (pageNumber) {
    const totalPages = Math.ceil(paginationRows.length / ITEMS_PER_PAGE);

    if (pageNumber < 1 || pageNumber > totalPages) {
        return;
    }

    currentPage = pageNumber;
    renderTableContent();
    renderPaginationLinks();
}





function matchesType(row, typeFilter) {
    if (typeFilter === 'all') return true;

    const rowCategoryId = row.getAttribute('data-category-id'); // term_id
    const rowCategoryName = row.getAttribute('data-type')?.toLowerCase(); // name

    const filterValue = typeFilter.toLowerCase();

    // Dropdown / tab using term_id
    if (!isNaN(filterValue)) {
        return rowCategoryId === filterValue;
    }

    // Safety fallback (name match)
    return rowCategoryName === filterValue;
}
function matchesStatus(row, statusFilter) {
    if (statusFilter === 'all') return true;

    const badge = row.querySelector('.badge');
    let badgeText = badge ? badge.innerText.toLowerCase() : '';

    if (badgeText.includes('acknowledged')) badgeText = 'acknowledged';
    else if (badgeText.includes('approved')) badgeText = 'approved';
    else if (badgeText.includes('denied')) badgeText = 'denied';
    else if (badgeText.includes('follow')) badgeText = 'follow-up';
    else badgeText = 'other';

    return badgeText === statusFilter;
}
function matchesDateRange(row, startDate, endDate) {
    if (!startDate && !endDate) return true;

    const dateText = row.cells[4]?.innerText || '';
    const submittedDate = new Date(dateText);

    if (isNaN(submittedDate.getTime())) return false;

    if (startDate && submittedDate < startDate) return false;

    if (endDate) {
        const endOfDay = new Date(
            endDate.getFullYear(),
            endDate.getMonth(),
            endDate.getDate(),
            23, 59, 59, 999
        );
        if (submittedDate > endOfDay) return false;
    }

    return true;
}




// --- MASTER FILTER (FIXED) ---
window.applyFilters = function () {
    const statusFilter = document.getElementById('statusSelect')
        ? document.getElementById('statusSelect').value.toLowerCase()
        : 'all';

    const typeFilter = document.getElementById('typeSelect')
        ? document.getElementById('typeSelect').value
        : 'all';

    const startDate = selectedStartDate || null;
    const endDate = selectedEndDate || null;

    const tableBody = document.getElementById('tableBody');
    if (!tableBody) return;

    const allRows = Array.from(tableBody.getElementsByTagName('tr'));

    paginationRows = allRows.filter(row =>
        matchesType(row, typeFilter) &&
        matchesStatus(row, statusFilter) &&
        matchesDateRange(row, startDate, endDate)
    );

    currentPage = 1;
    sortRows();
};


// --- SORTING LOGIC ---
window.sortRows = function () {
    const sortValue = document.getElementById('sortSelect')
        ? document.getElementById('sortSelect').value
        : 'newest';

    paginationRows.sort((a, b) => {

        const getSubmittedDate = row => {
            const text = row.cells[4]?.innerText.trim(); // Date Submitted
            const date = new Date(text);
            return isNaN(date.getTime()) ? 0 : date.getTime();
        };

        const dateA = getSubmittedDate(a);
        const dateB = getSubmittedDate(b);

        // Most Recent first
        if (sortValue === 'newest') {
            return dateB - dateA;
        }

        // Oldest first
        return dateA - dateB;
    });

    renderTableContent();
    renderPaginationLinks();
};


// --- STRIPING LOGIC ---
function reapplyStriping() {
    const tableBody = document.getElementById('tableBody');
    if (!tableBody) return;

    const rows = Array.from(tableBody.querySelectorAll('tr'));

    rows.forEach((row, index) => {
        row.classList.remove('highlight-row');

        // Apply striping based on position
        if (index % 2 !== 0) {
            row.classList.add('highlight-row');
        }
    });
}


// --- RESET BUTTON ---
window.resetFilters = function () {
    if (document.getElementById('statusSelect')) {
        document.getElementById('statusSelect').value = 'all';
    }
    if (document.getElementById('typeSelect')) {
        document.getElementById('typeSelect').value = 'all';
    }
    if (document.getElementById('sortSelect')) {
        document.getElementById('sortSelect').value = 'newest';
    }

    selectedStartDate = null;
    selectedEndDate = null;
    updateDateRangeDisplay();
    currentCalendarDate = new Date();
    renderCalendar();

    const tabs = document.getElementsByClassName("tab");
    for (let i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove("active");
    }
    if (tabs.length > 0) {
        tabs[0].classList.add("active");
    }
    currentActiveTab = 'all';

    // Reset to show all posts
    fetchPosts('all');
}


// Dynamic Application Table Click Handler
document.addEventListener('DOMContentLoaded', function() {
    const appRows = document.querySelectorAll('.application-table tbody tr');
    const appDetails = document.getElementById('application-details');
    
    // Initially hide the application details
    if (appDetails) {
        appDetails.style.display = 'none';
    }
    
    // Add click handler to each application row
    appRows.forEach((row, index) => {
        // Skip the "no applications" row if it exists
        if (row.querySelector('td[colspan]')) return;
        
        // Make row clickable
        row.style.cursor = 'pointer';
        
        // Get application data from the row
        const cells = row.querySelectorAll('td');
        if (cells.length < 3) return;
        
        const appName = cells[0].textContent.trim();
        const appStatus = cells[1].textContent.trim();
        const appDueDate = cells[2].textContent.trim();
        
        row.addEventListener('click', function(e) {
            // Prevent default if clicking on a link
            if (e.target.tagName === 'A') {
                e.preventDefault();
            }
            
            // Show the application details section
            if (appDetails) {
                // Update the application details dynamically
                updateApplicationDetails(appName, appDueDate, index + 1);
                
                // Show the details section
                appDetails.style.display = 'block';
                
                // Smooth scroll to the details section
                setTimeout(() => {
                    appDetails.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start' 
                    });
                }, 100);
                
                // Add active state to clicked row
                appRows.forEach(r => r.classList.remove('active-row'));
                this.classList.add('active-row');
            }
        });
    });
    
    // Function to update application details dynamically
    function updateApplicationDetails(appName, dueDate, appNumber) {
        // Format the date (convert from DD/MM/YYYY to readable format)
        let dateDisplay = dueDate || 'Nov 12, 2025';
        
        // If date is in format like "31/12/2025", convert it
        if (dueDate && dueDate.includes('/')) {
            const dateParts = dueDate.split('/');
            if (dateParts.length === 3) {
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const day = parseInt(dateParts[0]);
                const month = parseInt(dateParts[1]) - 1;
                const year = dateParts[2];
                dateDisplay = `${monthNames[month]} ${day}, ${year}`;
            }
        }
        
        // Update ONLY the first h2 inside the application-details div (the main title)
        const mainTitle = appDetails.querySelector('h2');
        if (mainTitle) {
            mainTitle.innerHTML = `${appName} <span style="color: black;"> (${dateDisplay})</span>`;
        }
        
        // Optional: Log which application was clicked
        console.log(`Opened: ${appName} - Due: ${dateDisplay}`);
    }
});

// Add CSS for hover and active states
const style = document.createElement('style');
style.textContent = `
    .application-table tbody tr:not([colspan]) {
        transition: background-color 0.2s ease, transform 0.1s ease;
    }
    
    .application-table tbody tr:not([colspan]):hover {
        background-color: #f3f4f6;
        transform: translateX(2px);
    }
    
    .application-table tbody tr.active-row {
        background-color: #dbeafe;
        border-left: 3px solid #0ea5e9;
    }
    
    .application-table tbody tr:not([colspan]) td:first-child {
        font-weight: 500;
    }
`;
document.head.appendChild(style);