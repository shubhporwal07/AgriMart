# AgriMart

AgriMart is an agricultural e-commerce application for discovering and ordering
certified seeds, fertilizers, micronutrients, and crop-care products. The
application includes a customer storefront, delivery-area validation, Firebase
authentication and data storage, an admin product area, Razorpay payments, and
email subscriptions.

## Features

- Product catalog for seeds, fertilizers, bio-inputs, and crop-care products
- Product search, category filters, product details, ratings, and stock status
- Shopping cart with quantity controls and order totals
- Firebase Authentication, Firestore, and Realtime Database integration
- Admin login and product management screens
- Razorpay online payments and cash-on-delivery order flows
- Razorpay payment-order creation and signature verification through the backend
- Delivery serviceability checks for the Phagwara and Etawah hubs
- GPS-based location detection and preset delivery locations
- Subscription email endpoint for promotional updates
- Responsive Next.js UI with Tailwind CSS and Framer Motion
- Vitest and Testing Library test coverage for core storefront behavior

## Technology

- **Frontend:** Next.js 14, React 18, JavaScript, Tailwind CSS
- **UI:** Framer Motion and Lucide React
- **Authentication and data:** Firebase Auth, Firestore, and Realtime Database
- **Backend:** Node.js, Express, Razorpay, Nodemailer
- **Testing:** Vitest, JSDOM, and Testing Library

## Repository structure

```text
AgriMart/
├── frontend/
│   ├── public/images/              Product and brand images
│   ├── src/app/                   Next.js App Router pages
│   ├── src/components/            Reusable UI components
│   ├── src/contexts/              Auth, product, and location state
│   ├── src/data/                  Default AgriMart product catalog
│   ├── src/views/                 Storefront and dashboard views
│   └── src/__tests__/             Unit and integration tests
├── backend/
│   ├── server.js                  Express payment and subscription API
│   └── functions/                 Firebase Functions configuration
├── render.yaml                    Render service configuration
└── vercel.json                    Vercel configuration
```

## Prerequisites

- Node.js 18 or later
- npm
- A Firebase project for authentication and database features
- Razorpay credentials for online payments
- SMTP credentials for the subscription email endpoint

## Run the frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at [http://localhost:3002](http://localhost:3002).

Available frontend scripts:

```bash
npm run dev       # Start the Next.js development server
npm run build     # Create a production build
npm run start     # Serve the production build
npm run test      # Run the Vitest test suite
npm run test:watch
```

## Run the backend

```bash
cd backend
npm install
npm start
```

The backend listens on port `5000` by default. Set `PORT` to use another port.
Set `NEXT_PUBLIC_BACKEND_URL` in the frontend environment when the backend is
running on a different origin. If it is not set, the frontend leaves the
backend payment API disabled.

The backend exposes:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Check whether the payment server is running |
| `POST` | `/api/create-order` | Create a Razorpay payment order |
| `POST` | `/api/verify-payment` | Verify a Razorpay payment signature |
| `POST` | `/api/subscribe` | Send a subscription welcome email |

## Environment variables

Create `backend/.env` for server-only settings:

```env
PORT=5000
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
FRONTEND_URL=http://localhost:3002
EMAIL_USER=your_smtp_username
EMAIL_PASS=your_smtp_password
```

Never commit `backend/.env`, payment secrets, or email credentials. The
Firebase web configuration is used by the frontend in
`frontend/src/config/firebase.js`; Firebase security rules and authentication
providers must be configured in the Firebase console before using those
features.

## Delivery hubs

The storefront currently evaluates delivery locations against two 10 km hubs:

- **AgriMart Kisan Hub #01:** Phagwara, Kapurthala, Punjab
- **AgriMart Kisan Hub #02:** Civil Lines, Etawah, Uttar Pradesh

Customers can select a preset location or allow the browser to detect their
location. Locations outside both service areas are marked unavailable and
cannot proceed through the serviceable checkout flow.

## Deployment

The frontend is a Next.js application and should be deployed as a Node.js
service capable of running `npm run build` followed by `npm run start`. The
Express backend should be deployed as a separate Node.js web service with its
server-only environment variables configured in the hosting provider.

The repository includes a root `vercel.json` that installs and builds the
Next.js frontend from `frontend/` and uses `frontend/.next` as its output.
In Vercel Project Settings, set the Root Directory to the repository root
(`./`) and clear any manually configured `dist` Output Directory. Do not use
`dist`, which is a static-output directory and is not produced by the
Next.js build.

Before deploying, configure:

1. The production frontend URL in the backend `FRONTEND_URL` variable.
2. The production backend URL as `NEXT_PUBLIC_BACKEND_URL` for the frontend.
3. Razorpay production keys and webhook/payment settings as required.
4. Firebase authentication providers, Firestore, Realtime Database, and rules.
5. SMTP credentials if newsletter subscriptions are enabled.

## License

This project is distributed under the MIT License.
