# Payments Integration Guide — `initiate-charge` / `next-action`

## 1. The big picture

There are two HTTP endpoints your frontend talks to:

| Endpoint                         | Purpose                                                                                                       |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `POST /payments/initiate-charge` | Start a new charge for a shipment                                                                             |
| `POST /payments/next-action`     | Submit whatever the provider (Flutterwave) is asking for next (PIN, OTP, redirect confirmation, extra fields) |

Card payments through Flutterwave are rarely "one and done." Depending on the card's authorization model, Flutterwave may come back and say "I need a PIN first," then "now I need an OTP," etc. The `nextAction` object in every response tells your frontend exactly what to render next. You keep calling `next-action` with the requested data until `paymentStatus` becomes a terminal state (`CAPTURED`, `FAILED`, `CANCELLED`, `REFUNDED`).

Internally: your gRPC gateway (`PaymentController` → `PaymentService` client) forwards to a backend microservice (`PaymentController` → `PaymentService` with `DatabaseService` + `FlutterwaveHttpService`), which talks to Flutterwave's `/charges` API and persists a `TripPayment` row per shipment.

## 2. Response shape you'll always get back

```ts
{
  status: 'success' | 'pending' | 'error',
  message: string,
  reference: string,           // your internal transfer reference, e.g. "bkh-<uuid>"
  paymentStatus: 'PENDING' | 'CAPTURED' | 'FAILED' | 'CANCELLED' | 'REFUNDED' | 'COMPLETED',
  nextAction?: {
    mode: 'REDIRECT_URL' | 'OTP' | 'PIN' | 'ADDITIONAL_FIELDS',
    url?: string,                       // present when mode === 'REDIRECT_URL'
    requiresAdditionalFields?: string[] // present when mode === 'ADDITIONAL_FIELDS', e.g. ["authorization.avs.address"]
  },
  data?: {
    amount: number,
    currency: string,
    meta: { senderId, travellerId, senderName, travellerName, sourceDestination }
  }
}
```

**Rule of thumb for the frontend:** after every call to either endpoint, check `paymentStatus` first, then `nextAction.mode` if it's still `PENDING`.

## 3. Step-by-step frontend flow

### Step 1 — Initiate the charge

```
POST /payments/initiate-charge
Body: CreateTransferRequestDto (currency, shipmentId, customerId, paymentMethodId, amount, redirectUrl, meta)
```

- If this is a duplicate call for a shipment that already has a payment record, the backend just returns the **existing** payment's current state instead of creating a new charge — safe to retry/re-call this endpoint if the user refreshes the page.
- Look at the response:
  - `paymentStatus: 'CAPTURED'` → done, show success. No further action needed. This happens for **NoAuth** cards.
  - `paymentStatus: 'PENDING'` with `nextAction` present → go to Step 2, branch on `nextAction.mode`.

### Step 2 — Branch on `nextAction.mode`

#### a) `mode: 'PIN'`

The card requires the cardholder's PIN.

1. Show a PIN input field.
2. Call `next-action`:
   ```
   POST /payments/next-action
   { reference: "<the reference from step 1>", data: { type: 'PIN', pin: '<user-entered pin>' } }
   ```
3. The PIN is AES-encrypted server-side before hitting Flutterwave — frontend just sends the raw PIN over HTTPS, nothing extra to do.
4. Response will typically now ask for OTP (`mode: 'OTP'`) — go collect that next.

#### b) `mode: 'OTP'`

The card requires a one-time passcode (usually sent via SMS/email after the PIN step).

1. Show an OTP input field.
2. Call `next-action`:
   ```
   POST /payments/next-action
   { reference: "<reference>", data: { type: 'OTP', otp: '<user-entered otp>' } }
   ```
3. Response should resolve to `CAPTURED` or `FAILED`.

#### c) `mode: 'REDIRECT_URL'`

The card requires 3D Secure / bank-page authentication.

1. Redirect the browser (or open a webview) to `nextAction.url`.
2. Flutterwave will redirect back to the `redirectUrl` you supplied in the original charge request, appending query params (commonly `status` and `tx_ref`/reference).
3. On landing back, call `next-action` **without a `data` payload requirement from the user** — in practice for redirect flows you typically just poll/re-check status. Given the current backend, you'd call `next-action` with the reference and no meaningful `data.type` handled server-side for redirects (the switch in `PaymentService.nextAction` only branches on `PIN`, `OTP`, `ADDITIONAL_FIELDS` today) — flag this gap to backend if you need an explicit "confirm redirect completed" call; right now polling `next-action` with an empty/placeholder data won't push it to `succeeded` — that state transition for redirect-based cards is driven by Flutterwave's own webhook/status against `id`, not by frontend action. **Worth confirming with backend before building the redirect branch**, since as written, `action` stays `{}` for a redirect-type follow-up and would likely be rejected or no-op by Flutterwave.

#### d) `mode: 'ADDITIONAL_FIELDS'`

Address Verification (AVS) or similar — Flutterwave wants extra fields (e.g. billing address, zip code).

1. `requiresAdditionalFields` tells you which fields to render, e.g. `["authorization.avs.address", "authorization.avs.zip_code"]`.
2. Build a form matching those field names, collect values.
3. Call `next-action`:
   ```
   POST /payments/next-action
   {
     reference: "<reference>",
     data: {
       type: 'ADDITIONAL_FIELDS',
       additionalFields: { address: '...', zip_code: '...' }  // shape must match what backend forwards to Flutterwave
     }
   }
   ```

### Step 3 — Loop until terminal state

Every `next-action` response can itself contain another `nextAction` (e.g. PIN → OTP is two hops). Treat this as a loop:

```
while (paymentStatus === 'PENDING' && response.nextAction) {
  render UI for response.nextAction.mode
  wait for user input
  response = await call next-action(...)
}
if (paymentStatus === 'CAPTURED') show success
if (paymentStatus === 'FAILED') show response.message (already user-friendly, e.g. "Insufficient funds, please try again")
```

### Step 4 — Idempotency & resuming

- If a user closes the tab mid-flow and comes back, calling `initiate-charge` again with the same `shipmentId` will **not** create a duplicate — it returns the existing payment's current `status`/`nextAction`, so you can safely re-drive the same UI logic from wherever they left off. Store the `reference` client-side (or re-derive by re-calling `initiate-charge`) so you can resume.

## 4. Field-by-field notes worth knowing

- **`shipmentId`** is the dedupe key — one payment record per shipment.
- **`reference`** (`bkh-<uuid>`) is what you pass back into `next-action`, not `shipmentId`.
- **Failure messages** are already mapped to something displayable:
  - processor code `05` → "Transaction declined, please try again"
  - processor code `51` → "Insufficient funds, please try again"
  - anything else → generic "Transaction failed, please try again"
- **Testing header**: outside production, you can pass `x-test-scenario` as a header on `initiate-charge` / `next-action` calls to force specific Flutterwave scenarios (e.g. `scenario:auth_pin_3ds`). This is silently ignored in production regardless of what's sent, so it's safe to leave wired up in a shared client.

## 5. Test cards (from Flutterwave's official docs)

Source: [developer.flutterwave.com/v3.0/docs/testing](https://developer.flutterwave.com/v3.0/docs/testing)

⚠️ These only work in **test mode**. Any OTP will pass validation unless you deliberately use the "wrong OTP" values below.

### Successful payment cards

| Flow to test               | Network    | Card Number         | Expiry | CVV | OTP   | PIN  |
| -------------------------- | ---------- | ------------------- | ------ | --- | ----- | ---- |
| PIN authentication         | Mastercard | 5531886652142950    | 09/32  | 564 | 12345 | 3310 |
| 3DS authentication         | Mastercard | 5438898014560229    | 10/31  | 564 | 12345 | 3310 |
| 3DS authentication         | Visa       | 4187427415564246    | 09/32  | 828 | 12345 | 3310 |
| 3DS authentication         | Afrigo     | 5640003941605320    | 05/26  | 044 | —     | —    |
| PIN authentication         | Verve      | 5061460410120223210 | 10/31  | 780 | 12345 | 3310 |
| NoAuth (no PIN/OTP step)   | Verve      | 5061460166976054667 | 10/29  | 564 | —     | 3310 |
| Address Verification (AVS) | Visa       | 4556052704172643    | 09/32  | 899 | 12345 | 3310 |
| Pre-authorization          | Mastercard | 5377283645077450    | 09/31  | 789 | —     | 3310 |

### Failed payment cards

| Scenario           | Network    | Card Number      | Expiry | CVV | OTP   | PIN  |
| ------------------ | ---------- | ---------------- | ------ | --- | ----- | ---- |
| Do Not Honour      | Mastercard | 5143010522339965 | 08/32  | 276 | 12345 | 3310 |
| Card Fraudulent    | Mastercard | 5590131743294314 | 11/32  | 887 | 12345 | 3310 |
| Insufficient Funds | Mastercard | 5258585922666506 | 09/31  | 883 | 12345 | 3310 |
| Insufficient Funds | Afrigo     | 5640007065275380 | 05/31  | 044 | —     | —    |
| Incorrect PIN      | Mastercard | 5399834697894723 | 09/31  | 883 | 12345 | 3310 |

### Special OTP values (to trigger failures mid-flow)
3 | 09/32 | 899 | 12345 | 3310 |
| Pre-authorization | Mastercard | 5377283645077450 | 09/31 | 789 | — | 3310 |

### Failed payment cards

| Scenario | Network | Card Number | Expiry | CVV | OTP | PIN |
|---|---|---|---|---|---|---|
| Do Not Honour | Mastercard | 5143010522339965 | 08/32 | 276 | 12345 | 3310 |
| Card Fraudulent | Mastercard | 5590131743294314 | 11/32 | 887 | 12345 | 3310 |
| Insufficient Funds | Mastercard | 5258585922666506 | 09/31 | 883 | 12345 | 3310 |
| Insufficient Funds | Afrigo | 5640007065275380 | 05/31 | 044 | — | — |
| Incorrect PIN | Mastercard | 5399834697894723 | 09/31 | 883 | 12345 | 3310 |

### Special OTP values (to trigger failures mid-flow)

- **Wrong OTP:** `5548`
- **Insufficient funds (via OTP):** `6648`

(Note: these special OTPs only work when OTP validation happens directly in Flutterwave's modal — if the flow redirects to Flutterwave's own OTP page instead, use one of the "failed payment" cards above instead.)

## 6. Suggested frontend test matrix

1. **NoAuth card** → `initiate-charge` should return `CAPTURED` immediately, no `nextAction`. Confirms your "instant success" UI path.
2. **PIN card (5531886652142950)** → expect `nextAction.mode: 'PIN'` → submit PIN `3310` → expect `nextAction.mode: 'OTP'` → submit OTP `12345` → expect `CAPTURED`.
3. **AVS card (4556052704172643)** → expect `nextAction.mode: 'ADDITIONAL_FIELDS'` with `requiresAdditionalFields` listing AVS fields → submit → expect further step or `CAPTURED`.
4. **Failed card (5258585922666506)** → run through PIN/OTP, then confirm you get `paymentStatus: 'FAILED'` with message "Insufficient funds, please try again".
5. **Wrong OTP (`5548`)** on any PIN card → confirm your UI handles a `FAILED` mid-flow instead of assuming success.
6. **3DS card (4187427415564246)** → confirm `nextAction.mode: 'REDIRECT_URL'` renders correctly and the redirect round-trips to your `redirectUrl`. Flag this one to backend per the note in Step 2c — the current `next-action` handler doesn't have a branch for resuming a redirect-type flow with user-submitted data, so this path likely needs either a webhook-driven status poll or a dedicated "confirm redirect" case added.

## 7. Known gap to raise with backend

`PaymentService.nextAction` only builds a Flutterwave `authorization` payload for `PIN`, `OTP`, and `ADDITIONAL_FIELDS`. There's no case for completing a `REDIRECT_URL` flow — frontend has nothing meaningful to submit after the user completes 3DS on Flutterwave's page. Worth confirming whether status resolution for that path is meant to happen via webhook (commented out in the proto/controller as `ProcessWebhook`) rather than another `next-action` call, so the frontend knows whether to poll a status endpoint instead.
