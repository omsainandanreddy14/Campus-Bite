export const printStudentInvoice = (order) => {
  const printWindow = window.open('', '_blank', 'width=800,height=900');
  if (!printWindow) return;

  const itemsHtml = (order.items || []).map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: 600;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  const subtotal = order.subtotal || 0;
  const platformFee = 10.00;
  const deliveryFee = 30.00;
  const total = order.total || (subtotal + platformFee + deliveryFee);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>CampusBite Tax Invoice - Order #${order.id}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; padding: 40px; margin: 0; background: #fff; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #6366f1; padding-bottom: 20px; margin-bottom: 30px; }
        .brand { font-size: 26px; font-weight: 900; color: #4f46e5; letter-spacing: -0.5px; }
        .badge { background: #e0e7ff; color: #4338ca; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
        .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; }
        .details-col { font-size: 13px; line-height: 1.6; }
        .details-col strong { color: #0f172a; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 13px; }
        th { background: #f1f5f9; padding: 12px 10px; text-align: left; font-weight: 700; color: #475569; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
        .summary { width: 300px; margin-left: auto; background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; font-size: 13px; }
        .summary-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
        .summary-total { display: flex; justify-content: space-between; margin-top: 12px; padding-top: 12px; border-top: 2px solid #cbd5e1; font-weight: 900; font-size: 16px; color: #ea580c; }
        .footer { text-align: center; margin-top: 50px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="brand">CampusBite 🍔</div>
          <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Official Campus Dining & Delivery Tax Invoice</div>
        </div>
        <div style="text-align: right;">
          <span class="badge">Paid Tax Invoice</span>
          <div style="font-size: 14px; font-weight: 800; margin-top: 8px; color: #0f172a;">#${order.id}</div>
        </div>
      </div>

      <div class="invoice-details">
        <div class="details-col">
          <strong>Customer Details:</strong><br>
          Name: ${order.customer}<br>
          Address: ${order.address}<br>
          Phone: ${order.phone || 'N/A'}
        </div>
        <div class="details-col" style="text-align: right;">
          <strong>Order Information:</strong><br>
          Kitchen Stand: ${order.canteen}<br>
          Order Date: ${order.date || new Date().toLocaleDateString()}<br>
          Payment Status: <span style="color: #16a34a; font-weight: 800;">Completed ✓</span>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Item Name</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div class="summary">
        <div class="summary-row"><span>Food Subtotal:</span> <strong>₹${subtotal.toFixed(2)}</strong></div>
        <div class="summary-row"><span>Platform Fee:</span> <span>₹${platformFee.toFixed(2)}</span></div>
        <div class="summary-row"><span>Campus Delivery Fee:</span> <span>₹${deliveryFee.toFixed(2)}</span></div>
        ${order.courierTip ? `<div class="summary-row"><span>Courier Tip:</span> <span>₹${order.courierTip.toFixed(2)}</span></div>` : ''}
        <div class="summary-total"><span>Total Paid:</span> <span>₹${total.toFixed(2)}</span></div>
      </div>

      <div class="footer">
        Thank you for dining with CampusBite! • Questions? Contact support@campusbite.edu
      </div>

      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};

export const printDeliveryEarningsStatement = (riderName, completedDeliveries, earningsToday, totalKm) => {
  const printWindow = window.open('', '_blank', 'width=800,height=900');
  if (!printWindow) return;

  const rowsHtml = (completedDeliveries || []).map(d => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: 700;">#${d.id}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${d.canteen} ➔ ${d.address}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">1.8 km</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: 700; color: #16a34a;">₹20.00</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>CampusBite Delivery Partner Earnings Statement - ${riderName}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; padding: 40px; margin: 0; background: #fff; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #10b981; padding-bottom: 20px; margin-bottom: 30px; }
        .brand { font-size: 26px; font-weight: 900; color: #059669; }
        .badge { background: #d1fae5; color: #047857; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 30px; }
        .stat-card { background: #f8fafc; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0; text-align: center; }
        .stat-val { font-size: 22px; font-weight: 900; color: #0f172a; margin-top: 5px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 13px; }
        th { background: #f1f5f9; padding: 12px 10px; text-align: left; font-weight: 700; color: #475569; text-transform: uppercase; font-size: 11px; }
        .footer { text-align: center; margin-top: 50px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="brand">CampusBite Delivery Fleet 🚴‍♂️</div>
          <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Courier Daily Payout & Distance Statement</div>
        </div>
        <div style="text-align: right;">
          <span class="badge">Verified Statement</span>
          <div style="font-size: 14px; font-weight: 800; margin-top: 8px; color: #0f172a;">${riderName}</div>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div style="font-size: 11px; color: #64748b; font-weight: 700;">Completed Drops</div>
          <div class="stat-val">${completedDeliveries.length}</div>
        </div>
        <div class="stat-card">
          <div style="font-size: 11px; color: #64748b; font-weight: 700;">Estimated Campus Distance</div>
          <div class="stat-val" style="color: #6366f1;">${totalKm} km</div>
        </div>
        <div class="stat-card">
          <div style="font-size: 11px; color: #64748b; font-weight: 700;">Total Payout Earnings</div>
          <div class="stat-val" style="color: #059669;">₹${earningsToday.toFixed(2)}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Route (Kitchen ➔ Hostel)</th>
            <th style="text-align: center;">Distance</th>
            <th style="text-align: right;">Drop Payout</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml || '<tr><td colspan="4" style="text-align:center; padding: 20px;">No completed delivery logs for today.</td></tr>'}
        </tbody>
      </table>

      <div class="footer">
        CampusBite Logistics Partner Network • Statement Generated on ${new Date().toLocaleDateString()}
      </div>

      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};
