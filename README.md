# 🛒 Gupta Mart — 12-Minute Farm-Fresh Grocery Delivery

> **Gupta Mart** is a high-performance, Blinkit-inspired quick commerce and farm-fresh grocery delivery web application built with **Next.js (JavaScript / JSX)**, Tailwind CSS, Framer Motion, and Firebase.

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.2-blue?style=flat&logo=react)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-10.14-orange?style=flat&logo=firebase)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## ⚡ Key Highlights

- **Blinkit-Style 12-Minute Delivery Experience**: Express delivery badges, flash coupon banners (`FLASH100`), live cart steppers, and quick categories.
- **Strict 10 km Geofencing Engine**:
  - **Primary Dark Store Pod**: Phagwara, Kapurthala, Punjab (`31.2240° N, 75.7708° E`).
  - **Secondary Hub**: Civil Lines, Etawah, UP (`26.7769° N, 79.0238° E`).
  - **Location Prompt on Entry**: Automatic prompt for GPS detection or area selection upon entering the site.
  - **Dynamic Unserviceable Protection**: Areas beyond 10 km (e.g. Jalandhar Cantt, Kapurthala City, Delhi) automatically display *"Currently Not Available in Your Area — Outside 10 km Hub Zone"*, mark product items as unavailable, and prevent checkout with location-switching prompts.
- **Cash on Delivery (COD) & Online Payments**:
  - Full support for **Cash on Delivery (COD)** as a native payment method alongside online checkout.
  - Generates tracked COD orders stored with `Pending (Pay on Delivery)` status in Firebase.
- **Full Catalog & Aisle Navigation**:
  - Comprehensive grocery catalog spanning Fresh Fruits & Vegetables, Dairy, Paneer & Eggs, Artisanal Bakery, Staples & Grains, Meat & Seafood, and Household Essentials.
  - Detailed product specifications including Nutritional Facts, Shelf Life & Storage, Origin, and FSSAI licensing.
- **Pure JavaScript / Next.js Architecture**: Fully standardized in clean `.js` / `.jsx` format without TypeScript.

---

## 🏗️ Project Architecture

```
gupta-mart/
├── frontend/                     # Next.js Application
│   ├── public/                   # Static assets, logos, and icons
│   ├── src/
│   │   ├── app/                  # Next.js App Router (layout.js, page.js, globals.css)
│   │   ├── components/           # Navbar, ProductCard, LocationSelectorModal, UnserviceableNotice, etc.
│   │   ├── contexts/             # LocationContext, ProductContext, AuthContext
│   │   ├── data/                 # Grocery catalog database & dark store configurations
│   │   ├── views/                # LandingPage, DashboardPage, CartPage, OrdersPage
│   │   └── __tests__/            # Automated test suite (18 unit/integration tests)
│   ├── package.json              # Next.js scripts & dependencies
│   ├── tailwind.config.js        # Artisanal Navy & Citrus theme tokens
│   └── next.config.mjs           # Next.js configuration
├── backend/                      # Firebase Cloud Functions & API Services
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.x or later)
- npm or yarn

### Installation

1. Clone repository:
```bash
git clone https://github.com/PRANAV-SINGH-CSE/Gupta-Mart.git
cd Gupta-Mart/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run development server:
```bash
npm run dev
```
Open [http://localhost:3002](http://localhost:3002) in your browser.

4. Run tests:
```bash
npm run test
```

5. Build for production:
```bash
npm run build
```

---

## 🛡️ License
Distributed under the MIT License.
