document.addEventListener('DOMContentLoaded', () => {
    const calendarDates = document.querySelector('.calendar-dates');
    const monthYearDisplay = document.getElementById('month-year');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const timeSlotsContainer = document.getElementById('time-slots-container');
    const bookAppointmentBtn = document.getElementById('book-appointment-btn');
    
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    let selectedDate = null;
    let selectedTime = null;

    // Dummy data for available time slots
    const availableSlots = {
        '2025-10-29': ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM'],
        '2025-10-30': ['10:00 AM', '11:00 AM', '1:00 PM', '4:00 PM'],
        '2025-11-05': ['9:30 AM', '10:30 AM', '2:30 PM'],
    };

    function renderCalendar() {
        calendarDates.innerHTML = '';
        const date = new Date(currentYear, currentMonth, 1);
        const firstDayIndex = date.getDay();
        const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();
        const prevLastDay = new Date(currentYear, currentMonth, 0).getDate();

        // Update month and year display
        monthYearDisplay.textContent = `${date.toLocaleString('default', { month: 'long' })} ${currentYear}`;

        // Add previous month's inactive days
        for (let x = firstDayIndex; x > 0; x--) {
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('inactive');
            dayDiv.textContent = prevLastDay - x + 1;
            calendarDates.appendChild(dayDiv);
        }

        // Add current month's days
        for (let i = 1; i <= lastDay; i++) {
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('day');
            dayDiv.textContent = i;
            
            // Highlight today's date
            if (i === new Date().getDate() && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear()) {
                dayDiv.classList.add('today');
            }

            // Mark a day as selectable if it has available slots
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            if (availableSlots[dateStr]) {
                dayDiv.classList.add('selectable');
                dayDiv.dataset.date = dateStr;
                
                // Add click listener for selectable days
                dayDiv.addEventListener('click', () => {
                    document.querySelectorAll('.calendar-dates .day.selected').forEach(d => d.classList.remove('selected'));
                    dayDiv.classList.add('selected');
                    selectedDate = dateStr;
                    renderTimeSlots(selectedDate);
                });
            } else {
                dayDiv.classList.add('inactive');
                dayDiv.style.cursor = 'not-allowed';
            }
            calendarDates.appendChild(dayDiv);
        }
    }

    function renderTimeSlots(date) {
        timeSlotsContainer.innerHTML = '';
        selectedTime = null;
        bookAppointmentBtn.disabled = true;

        if (availableSlots[date]) {
            availableSlots[date].forEach(slot => {
                const slotDiv = document.createElement('div');
                slotDiv.classList.add('time-slot');
                slotDiv.textContent = slot;
                slotDiv.addEventListener('click', () => {
                    document.querySelectorAll('.time-slot.selected').forEach(s => s.classList.remove('selected'));
                    slotDiv.classList.add('selected');
                    selectedTime = slot;
                    bookAppointmentBtn.disabled = false;
                });
                timeSlotsContainer.appendChild(slotDiv);
            });
        } else {
            timeSlotsContainer.innerHTML = '<p id="time-selection-info">No available time slots for this date.</p>';
        }
    }

    // Event listeners for month navigation
    prevMonthBtn.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });

    // Event listener for booking button
    bookAppointmentBtn.addEventListener('click', () => {
        if (selectedDate && selectedTime) {
            alert(`Appointment booked for ${selectedDate} at ${selectedTime}!`);
            // Here you would typically send data to a server
        } else {
            alert('Please select both a date and a time.');
        }
    });
    
    renderCalendar();
});