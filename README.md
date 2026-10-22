# Deshi Dealz — Winter Store

A responsive static storefront for GitHub Pages with a Google Apps Script endpoint that appends orders to Google Sheets.

## Project structure

```text
deshi-dealz-winter-store/
├── index.html
├── styles.css
├── script.js
├── google-apps-script.gs
├── README.md
└── assets/
    └── products/
        └── (add your product photos here)
```

## Before launch

1. **Replace demo products** in `script.js` with your real names, prices, categories, available sizes and colours.
2. Add your product photos to `assets/products/`. Keep filenames consistent with the `image` property in `PRODUCTS`. For the hero image, either add `assets/products/hero.jpg` and update the hero markup, or keep the design placeholder.
3. Update `STORE_CONFIG.WHATSAPP_NUMBER` in `script.js` to your business WhatsApp number in international format, digits only (Bangladesh: `8801XXXXXXXXX`).
4. Connect the Google Sheet by following the instructions below.
5. Test a complete order on desktop and mobile before sharing the site.

## Set up Google Sheets

1. Create a Google Sheet called `Deshi Dealz Orders`.
2. Open **Extensions → Apps Script**.
3. Replace the starter code with `google-apps-script.gs` and save.
4. Choose **Deploy → New deployment → Web app**.
5. Set **Execute as** to **Me**. Set access to **Anyone** / **Anyone with the link**, if that option is available for your account and you accept that the endpoint is public.
6. Deploy and authorize the script.
7. Copy the deployed **Web app URL ending in `/exec`**.
8. Paste it into `STORE_CONFIG.APPS_SCRIPT_URL` in `script.js`:
   ```js
   APPS_SCRIPT_URL: "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec",
   ```
9. If you edit the Apps Script later, open **Deploy → Manage deployments → Edit**, create a new version and deploy it.

The script creates an `Orders` tab and its header row when the first order is received. You can also run `getOrdersSheet_` from the Apps Script editor only if you change its visibility; simplest is to submit a test order.

### Important integration note

The storefront uses `fetch(..., { mode: "no-cors" })` so a static GitHub Pages page can send a simple cross-origin POST without a JSON preflight. The browser receives an **opaque response**, meaning the site cannot prove that Google Sheets saved the order. Check the sheet after testing. The checkout copy warns the customer to contact the store to confirm. For production-grade confirmations, use a backend with proper CORS and server-side validation.

## Publish on GitHub Pages

1. Sign in to GitHub and create a **public repository**, for example `deshi-dealz-winter-store`.
2. Upload the files and folders in this project to the repository root. Do not upload the ZIP as the only file; extract it first.
3. Open the repository **Settings → Pages**.
4. Under build/deployment, choose **Deploy from a branch**.
5. Choose branch `main` and folder `/ (root)`, then Save.
6. Wait for the Pages deployment to finish. The URL will look like:
   `https://YOUR-USERNAME.github.io/deshi-dealz-winter-store/`
7. Every time you push or upload changes to `main`, Pages republishes the site.

## Payment setup

- COD is ready as an order method.
- bKash and Nagad are currently **manual payment options**. Before enabling them for customers, add your official merchant/personal payment instructions and a clear process to verify payments. Do not ask customers for PINs or OTPs.
- This demo does **not** automatically charge payments or verify transaction IDs. For automated payments, use an official supported payment gateway and server-side integration.

## Order data

The `Orders` sheet stores order time, order ID, customer details, address, payment method/reference, item JSON, subtotal, delivery fee, total and status. Keep the sheet private and restrict access to trusted staff. Do not publish the Google Sheet or embed its private URL in the storefront.

## Current demo details

- Product names and prices are placeholders.
- Product photos are placeholders until you add your own images.
- Delivery is configured as ৳90 inside Dhaka and ৳110 outside Dhaka.
- The form validates basic required fields and phone-number length, but does not authenticate customers.
- The endpoint is public. It may attract spam; monitor the sheet. For a high-volume store, add a proper backend, spam protection and stronger server-side product-price validation.
