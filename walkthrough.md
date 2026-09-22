# CampusBite Project Walkthrough

All requested features and refinements have been fully implemented and verified. Below is a summary of the additions and modifications:

---

## 1. Promo Code & Discount Vouchers System

Both administrators and canteen owners can now configure discount coupons, including custom terms/descriptions and minimum cart values:

### 🎫 Global & Stall Vouchers Console (Admin & Canteens)
- **Admin Vouchers Panel (`Admin/Canteens.jsx`)**: Added a platform-wide voucher dashboard at the bottom of the page. Admins can create global coupons (valid for all stalls) or canteen-specific coupons, and monitor active offers in a clean data table.
- **Admin Delete Global Voucher Selector**: When an Admin clicks **Delete** on a **Global Voucher**, a dedicated modal opens showing a list of all registered canteens. Admins can:
  - Select specific canteen(s) from which to delete/remove the global voucher (persisted to `excludedCanteens` array in DB).
  - Or choose to delete the global voucher permanently from the entire platform (all canteens).
- **Live Orders Queue at Top & Top Selling Dishes Layout (`Canteen/Dashboard.jsx`)**: Reordered the Canteen Dashboard structure to optimize operational workflow and eliminate wasted space:
  - **Live Orders Queue**: Positioned directly at the **VERY TOP** of the dashboard right below the header banner, allowing canteen operators to process, accept, reject, and chat on incoming orders immediately without scrolling.
  - **Weekly Revenue Breakdown, Top Selling Dishes & Dish Ratings Summary**: The left column stacks three rectangular cards: **Weekly Revenue Breakdown** on top, **Top Selling Dishes** in the middle (`#1`, `#2`, `#3` dish ranks & units sold), and **Dish Ratings Summary** (student ratings & feedback per dish) directly underneath, creating a clean, balanced, high-density visualization.
- **Backend Model & Validation (`server/models/Voucher.js` & `server/routes/vouchers.js`)**: Backed by a Mongoose model containing `code`, `discount` %, `minCartValue`, `description`, `canteen`, `excludedCanteens`, and `isActive` flag. Supported by `PUT /api/vouchers/:id` endpoint for exclusions.

- **Full-Width Layout & Top-Right Profile Control Center (`StudentLayout`, `CanteenLayout`, `DeliveryLayout`, `AdminLayout`)**: Removed the fixed left sidebars across all role dashboards to maximize main workspace area and provide a clean, modern full-screen layout (`w-full`).
- **"Home Page" Navigation Tab Buttons**: Renamed "Dashboard" to **"Home Page"** across all navigation menus, header tab bars, and page titles. The top header navbar features horizontal navigation tab buttons:
  - **Student**: 📊 Home Page, 🛒 My Cart, 📋 My Orders, 👤 Profile
  - **Canteen**: 📊 Home Page, ➕ Add Food Item, 📑 Food List Menu, 📋 Live Orders Queue, 🏪 Storefront Profile
  - **Delivery**: 📊 Home Page, ✅ Completed Deliveries, 👤 Delivery Profile
  - **Admin**: 📊 Home Page, 👥 User Management, 🏬 Canteens & Coupons, 📈 Analytics Insights, 🛡️ Admin Profile
- **Dynamic Store Status & Admin Suspension Lock (`CanteenLayout.jsx` & `Canteen/Dashboard.jsx`)**:
  - **Dynamic Top Navbar Badge**: Replaced hardcoded badge in `CanteenLayout.jsx` with dynamic real-time status indicators: **`Store Active`** (Green), **`Store Closed`** (Amber), or **`Store Suspended`** (Red when suspended by Admin).
  - **Account Status Backend Sync (`server/routes/auth.js`)**: Included `status` attribute in all `/api/auth/me`, `/api/auth/login`, and `/api/auth/register` backend response payloads so the canteen owner's session immediately detects Admin suspensions via 3s polling.
  - **Suspension Prevention**: Disabled store status toggle button when canteen status is `Suspended` by Admin (`Store Status: Suspended (By Admin)`). Blocked non-admin store opening attempts on suspended accounts with clear user alerts.
- **1-Tap Quick Chat Presets (`OrderChat.jsx`)**:
  - **1-Click Message Chips**: Added role-based 1-tap quick reply preset pills inside `OrderChat.jsx`.
  - **Courier Presets**: `📍 Outside Hostel Gate`, `🔔 Left at Security Desk`, `👍 On my way!`, `⏱️ Arriving in 2 mins`.
  - **Student Presets**: `📍 I am outside hostel`, `🚶 Coming down now!`, `🏢 Leave at reception`, `📞 Please call my phone`.
- **1-Click PDF Tax Invoice & Earnings Statement Generator (`generateInvoice.js`, `Student/Orders.jsx`, `Delivery/CompletedOrders.jsx`)**:
  - **Student Tax Invoice**: Added a **`📄 Invoice PDF`** button on completed student orders that opens a formatted CampusBite Tax Invoice popup window configured for 1-click `window.print()` PDF download.
  - **Courier Earnings Statement**: Added a **`Printer Download Earnings PDF`** button on courier delivery history displaying completed drop logs, estimated campus distance covered, and total earnings.
- **Delivery Payment & Drop Confirmation Modal (`Delivery/Dashboard.jsx`)**:
  - **Student Wallet Payment Request Flow**: Removed manual "Confirm Payment Received & Mark Delivered" button from courier controls.
  - **Automated Delivery Upon Payment**: Riders click **`Request Payment from Student Wallet 📱`** (status: `Payment Pending`). Once the student clicks **`Pay from Wallet`** on their home page, the order is automatically paid and marked as **`Delivered`** in real-time!
- **Student Home Page Delivery Partner Chat (`Student/Dashboard.jsx` & `OrderChat.jsx`)**:
  - **Courier-Only Communication**: Configured the chat on the Student Home Page to connect students **exclusively with their assigned delivery partner (courier)**.
  - **Dynamic Rider Name & Status**: Displays `Chat with [Rider Name] (Rider)` on the Live Order Tracker card. Shows an `"Awaiting Courier Assignment"` notice inside the chat if the package hasn't been picked up by a rider yet.
- **Delivery Dashboard & Rating Synchronization (`Delivery/Dashboard.jsx`)**:
  - **Interactive Duty Status Toggle (`DeliveryLayout.jsx` & `Delivery/Dashboard.jsx`)**: Added an interactive **Duty Status** button (`🟢 Duty Online` vs `🌙 Duty Offline (On Break)`). When set to `Duty Offline`, incoming package assignments and audio dispatch chimes are paused, displaying a clear break notice until switched back online.
  - **Custom Today's Drop Goal Target (`Delivery/Dashboard.jsx`)**: Allowed delivery partners to set and edit their own custom **Today's Goal Target** (e.g. 5, 8, 10, or custom drops). Progress bars, percentages, and milestone achievement badges recalculate dynamically in real-time.
  - **Audio Order Dispatch Chime Alerts (`AppContext.jsx` & `Delivery/Dashboard.jsx`)**: Built a Web Audio synthesizer sound (`playPickupDispatchChime`) that automatically plays a double-tone audio chime (C5 -> E5 -> G5) whenever a canteen kitchen marks a package `Ready for Pickup`, giving riders instant audio notifications without refreshing. Added a **`🔊 Test Chime`** button on the Delivery Home Page.
  - **Assigned Pickups Queue on Home Page**: Integrated the **Assigned Canteen Pickups Queue** directly on the Delivery Home Page right next to active delivery routes so riders can accept ready packages with 1-click `Accept & Start Delivery`.
  - **Synchronized Dynamic Rider Rating**: Derived rider average rating dynamically from real rated orders (`myAvgRating`), ensuring **100% exact rating synchronization** across both the **Service Rating** summary stat card and the **Rider Leaderboard**.
  - **Weekly Earnings & Daily Payout Breakdown Chart (`Delivery/Dashboard.jsx`)**: Moved the Weekly Earnings breakdown card inside the main left column directly under **Active Deliveries & Routes**, strictly calculated from real completed order logs (`completedDeliveries`). Renamed "Rider Leaderboard" to **Delivery Leaderboard** and formatted canteen stall titles with clean Title Case.
  - **Food Category Specific Vouchers (`server/models/Voucher.js`, `Admin/Canteens.jsx`, `Canteen/Dashboard.jsx`, `Student/Cart.jsx`)**: Added a **FOOD CATEGORY TARGET** select dropdown to the pre-existing **Discount Vouchers** card in the right sidebar of `Canteen/Dashboard.jsx` (and Admin Vouchers Console), allowing canteen owners & admins to issue category-specific promo coupons (e.g. `Pizzas 🍕`, `Burgers 🍔`, `Biryani 🍲`, `Snacks 🥪`, `Beverages 🥤`, `Noodles 🍜`, `Chinese 🥢`, `All Food`). In Cart checkout, discounts calculate percentage savings **exclusively on items matching the target food category**, and validate that eligible category items are present in cart before applying.
  - **Duplicate Email Registration Protection (`server/routes/auth.js`, `Auth/Register.jsx`)**: Added case-insensitive email lookup during user registration. When a user tries to create an account with an email that is already registered, the backend returns `"An account with this email is already created. Please log in instead!"` and the frontend displays a prominent warning banner with a direct 1-click **"Already Have an Account? Log In Now →"** button.
  - **Password Visibility Eye Toggle (`Auth/Register.jsx`, `Auth/Login.jsx`)**: Added an interactive `Eye` / `EyeOff` toggle icon inside the password input fields on both the Account Creation (Registration) and Login pages, allowing users to toggle between masked (`••••••••`) and unmasked plain text while typing their password.
  - **Distance & Earnings Breakdown**: Displays estimated campus kilometers covered (`1.8 km/drop`) alongside payout earnings (`₹20/drop`).
- **Canteen Dashboard Runtime Stability & Blank Screen Fix (`Canteen/Dashboard.jsx`)**:
  - **Resolved Missing `X` Icon Import**: Added `X` icon to `lucide-react` imports in `Canteen/Dashboard.jsx` to prevent the `ReferenceError: X is not defined` component crash that caused a blank white screen.
  - **Null-Safe Calculations**: Added `(o.subtotal || 0)` and `(o.items || [])` null-safety guards across KPI revenue and top-seller aggregations to ensure smooth, robust execution.
- **Direct 1-Step Today's Specials Management (`Canteen/Dashboard.jsx`)**:
  - **Removed Draft Staging Queue**: Removed the intermediate `+ Add to Specials List` draft array and separate publish step.
  - **Direct Real-Time Addition**: Clicking **`➕ Add to Today's Specials`** directly publishes the selected dish/custom promo to live Today's Specials in real-time, instantly clearing input fields so canteen owners can add dishes one-by-one seamlessly.
  - **Direct Live Item Removal**: Each active special under **Active Today's Specials** features a direct `❌` remove button that instantly removes that individual dish from live Today's Specials.
- **Removed Intrusive Success `alert()` Popups (`Canteen/Dashboard.jsx`)**: Replaced routine popups like `"Specials published successfully!"` and `"Promotion ended and daily specials reset!"` with clean, non-intrusive inline success banners inside the Menu Announcement Board component. Popups now only appear for critical warnings/errors.
- **Removed Browser `alert()` Popups (`Student/Dashboard.jsx`)**: Removed intrusive browser popup dialogs when adding items/specials to the cart, allowing smooth interactive additions directly reflected on the floating bottom cart bar.
- **Plus Icon for Today's Specials (`Student/Dashboard.jsx`)**: Updated the "Add to Cart" action button in the "Today's Specials" promo section to display a clean, modern `<Plus />` icon matching the main food menu cards.
- **Floating Bottom Cart Popup Banner (`StudentLayout.jsx`)**: Whenever a student adds any item to their cart, a sticky floating bottom cart bar slides up at the bottom of the screen. It displays the total items count, subtotal in ₹, item preview snippet, a **Clear** option, and a direct **View Cart →** checkout button.

### 🛍️ Student Available Coupons Display
- **Canteen Menu Offers Banner (`Student/Dashboard.jsx`)**: When a student opens a canteen menu, a horizontal sliding card carousel displays all active and valid coupons for that stall (both platform-wide global coupons and stall-specific offers). It explicitly states minimum cart requirements and offer descriptions.
- **Min. Cart Subtotal Enforcement (`Student/Cart.jsx`)**: When checking out, the app validates whether the subtotal meets the coupon's `minCartValue` and applies the percentage discount only to items within that canteen's scope.

---

## 2. Live Chat Sound Alerts & Notification Badges

CampusBite now triggers instant feedback and visual cues for incoming coordination messages:

### 🔔 Ambient Audio Chime Alerts
- **AppContext Synthesizer (`AppContext.jsx`)**: Implemented a chime using the Web Audio API (`playMessageChime`). It synthesizes D5 (587.33Hz) and A5 (880Hz) sine-wave frequencies to chime softly when a chat message is received.

### 🔴 Unread Message badges
- **Visual Notification Badges**: Added glowing red notification badges on active order chat buttons across:
  - **Student Portal (`Student/Orders.jsx`)**
  - **Canteen Console (`Canteen/Dashboard.jsx`)**
  - **Delivery Console (`Delivery/Dashboard.jsx`)**
- **Read State Caching (`OrderChat.jsx`)**: When a user opens the chat box, the message count is cached in `sessionStorage` (synced via a custom window event `read_counts_updated`). The badge disappears instantly when the chat is active and only triggers when a new message arrives.

---

## 3. Rider Achievements & Performance Standings Leaderboard

Gamified courier ratings and standings to boost engagement:

### 🏆 Rider Leaderboard Standings
- **Dynamic Leaderboard (`Delivery/Dashboard.jsx`)**: Evaluates all orders in the system, aggregates total drops and average ratings per courier, and renders a live, real-time standings ladder.
- **Rider Achievements Badges**: Computes achievements for the logged-in rider and renders rich visual badges in their dashboard:
  - `🏆 Gold Champion`: Ranked #1 on campus deliveries.
  - `🥈 Silver Standing`: Ranked #2 on campus deliveries.
  - `🥉 Bronze Standing`: Ranked #3 on campus deliveries.
  - `⭐ Elite Service`: Maintained a rating above 4.8 stars.
  - `⚡ Speedster`: Completed over 5 successful drops.

---

## 4. Admin Page Editing Options (New Features)

Platform Administrators now have comprehensive, dynamic editing options that propagate updates immediately to the User Dashboard:

### 📢 Canteen Specials List Builder (Admin)
- **Edit Canteen Modal**: Replaced the legacy single promoted dish fields with a complete **Specials List Manager**.
- Admins can draft multiple specials simultaneously (either selected from the canteen's menu or entered as custom items), adjust their promotional prices, and delete/add specials from the draft list.
- **Backend Route Synchronization (`server/routes/auth.js`)**: Refactored the `PUT /api/auth/users/:id` endpoint to parse and save the `specialDishes` array, keeping it fully compatible with legacy single-dish properties.

### 🍔 Menu Dish Editor (Admin)
- **Manage Menu Modal**: Added an **"Edit"** (`Edit2`) action button next to each dish.
- Clicking it opens an **Edit Menu Item Modal** allowing the admin to update the dish's Name, Price, Category, Image URL, and Vegetarian status.
- Once saved, the modal triggers the `updateFood` context dispatcher which updates MongoDB and propagates changes to the student's menu list in real-time.

---

## 5. Stepper Alignment & Plus/Minus Cart Buttons

### 📈 Live Stepper Alignment
- Updated the Student Dashboard home page Live Order Tracker progress steps from a 4-step model to match the 5-step model used on the "My Orders" progress page:
  `['Pending', 'Preparing', 'Ready for Pickup', 'Out for Delivery', 'Delivered']`
- Synchronized status indices and helper text descriptions so active order states are mapped identically between pages.
- Handled the courier `Accepted` status to render as active for the `Out for Delivery` step on both pages.

### ➕/➖ Inline Cart Quantity Adjusters
- Replaced static **"Add to Cart"** buttons on the Student Dashboard with interactive inline `- quantity +` control blocks.
- Applies to both **Regular Menu Food Cards** and **Today's Specials Promo Cards**.
- If an item is added to the cart, the card dynamically displays the current quantity in the cart with `-` and `+` adjusters. Clicking `-` decreases quantity (and removes it from the cart if it drops to `0`), and clicking `+` increases it.

---

## 6. Courier Delivery Actions & Workflow

We have decoupled the delivery rider actions into a progressive step-by-step workflow (Accept Order, Picked Up Package, and Delivered Order).

### 🛠️ Architecture Changes
* **Database State Machine (`server/routes/orders.js`)**:
  - Restructured the status transitions inside the `PUT /:id/status` endpoint to validate transitions:
    - `Ready for Pickup` ➔ `Accepted` (Assigned rider claims the order).
    - `Accepted` ➔ `Out for Delivery` (Rider picked up food from the canteen).
    - `Out for Delivery` ➔ `Payment Pending` (Rider marked order as delivered to hostel).
    - `Payment Pending` ➔ `Delivered` (Student pays via wallet).
  - Enforces authorization: only the assigned rider can advance the status after acceptance.
* **Mongoose Schema Validation (`server/models/Order.js`)**:
  - Added `'Accepted'` to the schema status `enum` constraint, resolving database validation errors when couriers claim assignments.
* **Assigned Deliveries (`client/src/pages/Delivery/AssignedOrders.jsx`)**:
  - Clicking **Accept Order** now updates the order status to `Accepted` in the database, assigning the rider immediately.
* **Delivery Dashboard Console (`client/src/pages/Delivery/Dashboard.jsx`)**:
  - Displays all orders in `Accepted`, `Out for Delivery`, and `Payment Pending` under active routes.
  - Dynamically renders conditional action buttons based on status:
    - `Accepted` ➔ Displays **Picked Up Package** button.
    - `Out for Delivery` ➔ Displays **Mark as Delivered** button.
    - `Payment Pending` ➔ Displays pulsing indicator *"Awaiting Student Payment..."*.

---

## 7. Manual Verification Walkthrough

1. **Verify Vouchers Display & Min Cart (Student)**:
   - Log in as Student (`student@gmail.com`).
   - Open Canteen 2 stall menu. Look for the sliding promo banners displaying codes (e.g. `WELCOME10`, terms, min value).
   - Go to Cart, type a coupon code. If the cart subtotal is less than the coupon's minimum value, it displays an error. Increase the quantity to satisfy the minimum and apply it successfully.
2. **Verify Vouchers Creation (Canteen & Admin)**:
   - Log in as Canteen Owner (`canteen2@gmail.com`) or Admin (`admin@gmail.com`).
   - Access the Vouchers widgets, input details (e.g., Code `TEST20`, Discount `20%`, Min Cart `₹150`, terms).
   - Click Create and check that it updates on the list immediately.
   - Canteen owners will now see both global platform vouchers and their canteen's specific vouchers in their console list.
   - Attempting to delete a global voucher as a canteen owner will display a clean prompt block: *"This is a global voucher. Please ask an administrator to delete it."* while still allowing them to delete their own custom vouchers.
3. **Verify Chat Notification Badges & Audio Chime**:
   - Send chat messages between Student and Rider / Canteen.
   - When a new message is received in the background, a synthesizer sound chime will play, and the red badge `●` will appear on the Chat buttons on their respective dashboards.
4. **Verify Rider Leaderboard (Delivery)**:
   - Log in as Delivery Rider (`rider1@gmail.com`).
   - View the Rider Leaderboard and Achievements card, showing ratings, drops, and unlocked badges based on delivery history.
