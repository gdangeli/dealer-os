/**
 * DealerOS Test Drive Booking Widget
 * 
 * Usage:
 * <div id="dealeros-testdrive" data-dealer-id="YOUR_DEALER_ID"></div>
 * <script src="https://dealeros.ch/widget/test-drive.js"></script>
 */

(function() {
  'use strict';

  const API_BASE = 'https://dealeros.ch/api/public/test-drives';
  
  // Styles
  const STYLES = `
    .dos-widget {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      max-width: 500px;
      margin: 0 auto;
      padding: 24px;
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    .dos-widget * { box-sizing: border-box; }
    .dos-widget h3 {
      margin: 0 0 20px 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #1f2937;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .dos-widget .dos-form { display: flex; flex-direction: column; gap: 16px; }
    .dos-widget .dos-field { display: flex; flex-direction: column; gap: 4px; }
    .dos-widget .dos-field label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
    }
    .dos-widget .dos-field label .dos-required { color: #ef4444; }
    .dos-widget .dos-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .dos-widget input, .dos-widget select, .dos-widget textarea {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .dos-widget input:focus, .dos-widget select:focus, .dos-widget textarea:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    .dos-widget textarea { resize: vertical; min-height: 80px; }
    .dos-widget .dos-btn {
      width: 100%;
      padding: 12px 24px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .dos-widget .dos-btn:hover { background: #2563eb; }
    .dos-widget .dos-btn:disabled { background: #9ca3af; cursor: not-allowed; }
    .dos-widget .dos-btn .dos-spinner {
      width: 20px;
      height: 20px;
      border: 2px solid transparent;
      border-top-color: white;
      border-radius: 50%;
      animation: dos-spin 0.8s linear infinite;
    }
    @keyframes dos-spin { to { transform: rotate(360deg); } }
    .dos-widget .dos-success {
      text-align: center;
      padding: 32px 16px;
    }
    .dos-widget .dos-success-icon {
      width: 64px;
      height: 64px;
      margin: 0 auto 16px;
      background: #dcfce7;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
    }
    .dos-widget .dos-success h4 {
      margin: 0 0 8px 0;
      font-size: 1.25rem;
      color: #166534;
    }
    .dos-widget .dos-success p {
      margin: 0;
      color: #6b7280;
    }
    .dos-widget .dos-error {
      background: #fef2f2;
      color: #dc2626;
      padding: 12px;
      border-radius: 8px;
      font-size: 0.875rem;
      margin-bottom: 16px;
    }
    .dos-widget .dos-powered {
      text-align: center;
      margin-top: 16px;
      font-size: 0.75rem;
      color: #9ca3af;
    }
    .dos-widget .dos-powered a { color: #6b7280; text-decoration: none; }
    .dos-widget .dos-powered a:hover { text-decoration: underline; }
    @media (max-width: 480px) {
      .dos-widget { padding: 16px; }
      .dos-widget .dos-row { grid-template-columns: 1fr; }
    }
  `;

  // Initialize widget
  function init() {
    const container = document.getElementById('dealeros-testdrive');
    if (!container) {
      console.error('DealerOS: Container #dealeros-testdrive not found');
      return;
    }

    const dealerId = container.dataset.dealerId;
    if (!dealerId) {
      console.error('DealerOS: data-dealer-id attribute required');
      return;
    }

    // Inject styles
    const styleEl = document.createElement('style');
    styleEl.textContent = STYLES;
    document.head.appendChild(styleEl);

    // Load vehicles and render
    loadVehiclesAndRender(container, dealerId);
  }

  async function loadVehiclesAndRender(container, dealerId) {
    try {
      const response = await fetch(`${API_BASE}?dealer_id=${dealerId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load');
      }

      render(container, dealerId, data.dealer, data.vehicles);
    } catch (error) {
      console.error('DealerOS:', error);
      container.innerHTML = `
        <div class="dos-widget">
          <div class="dos-error">Widget konnte nicht geladen werden. Bitte später erneut versuchen.</div>
        </div>
      `;
    }
  }

  function render(container, dealerId, dealer, vehicles) {
    // Get tomorrow's date as default
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const defaultDate = tomorrow.toISOString().split('T')[0];

    const vehicleOptions = vehicles.map(v => 
      `<option value="${v.id}">${v.make} ${v.model}${v.variant ? ' ' + v.variant : ''}${v.asking_price ? ' - CHF ' + v.asking_price.toLocaleString() : ''}</option>`
    ).join('');

    container.innerHTML = `
      <div class="dos-widget">
        <h3>🚗 Probefahrt buchen</h3>
        <form class="dos-form" id="dos-form">
          <div class="dos-field">
            <label>Fahrzeug</label>
            <select name="vehicle_id">
              <option value="">-- Fahrzeug wählen --</option>
              ${vehicleOptions}
            </select>
          </div>
          
          <div class="dos-field">
            <label>Ihr Name <span class="dos-required">*</span></label>
            <input type="text" name="customer_name" required placeholder="Max Mustermann">
          </div>
          
          <div class="dos-row">
            <div class="dos-field">
              <label>Telefon <span class="dos-required">*</span></label>
              <input type="tel" name="customer_phone" required placeholder="+41 79 123 45 67">
            </div>
            <div class="dos-field">
              <label>E-Mail</label>
              <input type="email" name="customer_email" placeholder="max@beispiel.ch">
            </div>
          </div>
          
          <div class="dos-row">
            <div class="dos-field">
              <label>Wunschdatum <span class="dos-required">*</span></label>
              <input type="date" name="scheduled_date" required value="${defaultDate}" min="${defaultDate}">
            </div>
            <div class="dos-field">
              <label>Wunschzeit <span class="dos-required">*</span></label>
              <select name="scheduled_time" required>
                <option value="09:00">09:00</option>
                <option value="10:00" selected>10:00</option>
                <option value="11:00">11:00</option>
                <option value="13:00">13:00</option>
                <option value="14:00">14:00</option>
                <option value="15:00">15:00</option>
                <option value="16:00">16:00</option>
                <option value="17:00">17:00</option>
              </select>
            </div>
          </div>
          
          <div class="dos-field">
            <label>Nachricht (optional)</label>
            <textarea name="notes" placeholder="Ihre Nachricht an uns..."></textarea>
          </div>
          
          <div class="dos-error" id="dos-error" style="display: none;"></div>
          
          <button type="submit" class="dos-btn" id="dos-submit">
            Probefahrt anfragen
          </button>
        </form>
        <div class="dos-powered">
          Powered by <a href="https://dealeros.ch" target="_blank">DealerOS</a>
        </div>
      </div>
    `;

    // Handle form submit
    const form = document.getElementById('dos-form');
    form.addEventListener('submit', (e) => handleSubmit(e, container, dealerId));
  }

  async function handleSubmit(e, container, dealerId) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = document.getElementById('dos-submit');
    const errorEl = document.getElementById('dos-error');
    
    // Get form data
    const formData = new FormData(form);
    const data = {
      dealer_id: dealerId,
      vehicle_id: formData.get('vehicle_id') || null,
      customer_name: formData.get('customer_name'),
      customer_email: formData.get('customer_email') || null,
      customer_phone: formData.get('customer_phone'),
      scheduled_at: new Date(`${formData.get('scheduled_date')}T${formData.get('scheduled_time')}:00`).toISOString(),
      notes: formData.get('notes') || null,
    };

    // Validate
    if (!data.customer_name || !data.customer_phone) {
      errorEl.textContent = 'Bitte füllen Sie alle Pflichtfelder aus.';
      errorEl.style.display = 'block';
      return;
    }

    // Submit
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<div class="dos-spinner"></div> Wird gesendet...';
    errorEl.style.display = 'none';

    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Buchung fehlgeschlagen');
      }

      // Success
      const widget = container.querySelector('.dos-widget');
      widget.innerHTML = `
        <div class="dos-success">
          <div class="dos-success-icon">✓</div>
          <h4>Vielen Dank!</h4>
          <p>Ihre Probefahrt-Anfrage wurde erfolgreich gesendet.<br>Wir melden uns in Kürze bei Ihnen.</p>
        </div>
        <div class="dos-powered">
          Powered by <a href="https://dealeros.ch" target="_blank">DealerOS</a>
        </div>
      `;

    } catch (error) {
      errorEl.textContent = error.message;
      errorEl.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Probefahrt anfragen';
    }
  }

  // Auto-init when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
