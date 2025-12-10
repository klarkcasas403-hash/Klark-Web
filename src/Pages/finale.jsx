import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Section from "../components/Section.jsx";
import { Header } from "../components/Header.jsx";
import { useTranslation } from "../context/TranslationContext.jsx";
import '../index.css';
import '../components/dropdown1.css';
import '../components/finale.css';

// Load Stripe with your test publishable key (replace with yours from stripe.com/dashboard)
const stripePromise = loadStripe('pk_test_51YourTestPublishableKeyHere');

export function Finale() {
  const { t } = useTranslation();
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [showPayment, setShowPayment] = useState(false);

  // Dummy data for available time slots
  const availableSlots = {
    '2025-10-29': ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM'],
    '2025-10-30': ['10:00 AM', '11:00 AM', '1:00 PM', '4:00 PM'],
    '2025-11-05': ['9:30 AM', '10:30 AM', '2:30 PM'],
  };

  // Function to generate calendar days as JSX
  const renderCalendarDays = () => {
    const date = new Date(currentYear, currentMonth, 1);
    const firstDayIndex = date.getDay();
    const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();
    const prevLastDay = new Date(currentYear, currentMonth, 0).getDate();
    const days = [];

    // Add previous month's inactive days
    for (let x = firstDayIndex; x > 0; x--) {
      days.push(
        <div key={`prev-${x}`} className="inactive">
          {prevLastDay - x + 1}
        </div>
      );
    }

    // Add current month's days
    for (let i = 1; i <= lastDay; i++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const isToday = i === new Date().getDate() && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear();
      const hasSlots = !!availableSlots[dateStr];
      const isSelected = selectedDate === dateStr;

      days.push(
        <div
          key={`day-${i}`}
          className={`day ${isToday ? 'today' : ''} ${hasSlots ? 'selectable' : 'inactive'} ${isSelected ? 'selected' : ''}`}
          style={{ cursor: hasSlots ? 'pointer' : 'not-allowed' }}
          onClick={hasSlots ? () => handleDateSelect(dateStr) : undefined}
        >
          {i}
        </div>
      );
    }

    return days;
  };

  // Handle date selection
  const handleDateSelect = (dateStr) => {
    setSelectedDate(dateStr);
    setSelectedTime(null);
  };

  // Function to generate time slots as JSX
  const renderTimeSlots = () => {
    if (!selectedDate || !availableSlots[selectedDate]) {
      return <p id="time-selection-info">{t('noTimeSlots')}</p>;
    }

    return availableSlots[selectedDate].map((slot) => (
      <div
        key={slot}
        className={`time-slot ${selectedTime === slot ? 'selected' : ''}`}
        onClick={() => setSelectedTime(slot)}
      >
        {slot}
      </div>
    ));
  };

  // Handle previous month
  const handlePrevMonth = () => {
    let newMonth = currentMonth - 1;
    let newYear = currentYear;
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  // Handle next month
  const handleNextMonth = () => {
    let newMonth = currentMonth + 1;
    let newYear = currentYear;
    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  // Handle booking - show payment form
  const handleBook = () => {
    if (selectedDate && selectedTime) {
      setShowPayment(true);
    } else {
      alert(t('pleaseSelectBoth'));
    }
  };

  // Get current month/year string for display
  const monthYear = new Date(currentYear, currentMonth, 1).toLocaleString('default', { month: 'long' }) + ' ' + currentYear;

  const PaymentForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const [service, setService] = useState('hair-color');
    const [depositAmount, setDepositAmount] = useState(50);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [processing, setProcessing] = useState(false);

    // Service options with deposit amounts
    const services = {
      'hair-color': { name: 'Hair Color', deposit: 50 },
      'highlights': { name: 'Highlights', deposit: 75 },
      'cut-and-style': { name: 'Cut & Style', deposit: 30 },
    };

    const handleServiceChange = (e) => {
      const selected = e.target.value;
      setService(selected);
      setDepositAmount(services[selected].deposit);
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setProcessing(true);
      setError(null);

      if (!stripe || !elements) return;

      const cardElement = elements.getElement(CardElement);

      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: { name, email },
      });

      if (error) {
        setError(error.message);
        setProcessing(false);
      } else {
        console.log('Payment Method:', paymentMethod);
        console.log(`Appointment: ${selectedDate} at ${selectedTime}`);
        setSuccess(true);
        setProcessing(false);
      }
    };

    return (
      <div className="appointment-section">
        <h3>3. {t('payDeposit')}</h3>
        {success ? (
          <div className="success-message">
            <p>{t('paymentSuccessful')} {services[service].name} {t('hasBeenProcessed')}</p>
            <p>{t('amount')} ${depositAmount}</p>
            <p>{t('appointment')} {selectedDate} {t('at')} {selectedTime}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <select value={service} onChange={handleServiceChange}>
              {Object.keys(services).map((key) => (
                <option key={key} value={key}>
                  {services[key].name} - {t('payDeposit')}: ${services[key].deposit}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder={t('name')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder={t('email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#495057',
                    '::placeholder': { color: '#aab7c4' },
                  },
                  invalid: { color: '#9e2146' },
                },
              }}
            />

            {error && <p className="error-message">{error}</p>}

            <button
              id="pay-btn"
              disabled={processing || !stripe}
              type="submit"
            >
              {processing ? t('processing') : `${t('payDepositAmount')} $${depositAmount}`}
            </button>
          </form>
        )}
      </div>
    );
  };

  return (
    <div>
      <Header />
      <main className="container-finale">
        <div className="appointment-section">
          <h3>1. {t('selectDate')}</h3>
          <div className="calendar-container">
            <div className="calendar-header">
              <button id="prev-month" onClick={handlePrevMonth}>&lt;</button>
              <h4 id="month-year">{monthYear}</h4>
              <button id="next-month" onClick={handleNextMonth}>&gt;</button>
            </div>
            <div className="weekdays">
              <div>{t('sun')}</div>
              <div>{t('mon')}</div>
              <div>{t('tue')}</div>
              <div>{t('wed')}</div>
              <div>{t('thu')}</div>
              <div>{t('fri')}</div>
              <div>{t('sat')}</div>
            </div>
            <div className="calendar-dates">
              {renderCalendarDays()}
            </div>
          </div>
        </div>

        <div className="appointment-section">
          <h3>2. {t('selectTime')}</h3>
          <div className="time-slots" id="time-slots-container">
            {selectedDate ? renderTimeSlots() : <p id="time-selection-info">{t('selectDateFirst')}</p>}
          </div>
        </div>

        <button id="book-appointment-btn" disabled={!selectedDate || !selectedTime} onClick={handleBook}>
          {t('bookAppointment')}
        </button>

        {showPayment && (
          <Elements stripe={stripePromise}>
            <PaymentForm />
          </Elements>
        )}
      </main>
    </div>
  );
}