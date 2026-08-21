# Julius Payment Integration Brief

**Frontend UI/UX hand-off for the Barukh Expo app**  
**Prepared for:** Julius, Frontend UI/UX Developer  
**Prepared:** 3 August 2026  
**Assessment basis:** Team responses from Izaiah, the supplied payment inquiry document and meeting notes, the current Expo repository, and the official Flutterwave and Expo documentation linked below.

Julius, this is your implementation hand-off. It separates confirmed decisions, provisional management statements, current repository evidence, work you can take on, recommendations, and unanswered questions. The main rule is simple: do not present an assumption as a completed payment outcome, and do not collect raw card data until the security gate in section 6 has been cleared.

> **Immediate security gate:** Do not ship a custom PAN/CVV card-entry form yet. The team has described backend-side encryption, but PCI DSS ownership and the approved mobile collection pattern have not been confirmed. Ask the backend to provide a Flutterwave v4-compatible hosted/tokenised flow, or obtain written compliance approval and an agreed encryption design before collecting card number, expiry, CVV, or PIN in the app.

## 1. How to read this brief

This document uses four confidence levels:

- **Confirmed team decision:** Izaiah stated it in the supplied material. This is a team decision, not proof that the live staging endpoint currently matches it.
- **Provisional management statement:** The direction is useful for design, but the amount, fee, or operational detail is not final and must not be hard-coded as a release contract.
- **Repository finding:** Confirmed by reviewing the current frontend worktree on 3 August 2026.
- **Recommendation or open question:** Not settled. Julius should not build irreversible behaviour around it until the owner answers.

This is an implementation brief only. It does not claim that the payment APIs were called successfully from staging, and it does not modify application code.

## 2. Confirmed team decisions and API contracts

| Area | Confirmed decision | Frontend consequence |
|---|---|---|
| Release currency and amount | Charges are USD-only and must be paid in full. Partial payment is not supported. | Present USD consistently, prevent partial-payment controls, and derive the full authoritative amount from shipment data after the amount-unit question is answered. |
| First-release methods | Cards are the only payment method in the first release. Mobile money is deferred to a future release. | Show cards only. Hide or clearly disable Mobile Money, PayPal, Apple Pay, Wallet Pay, Cash on Delivery, and any other unsupported option. |
| Sender card method | `POST /users/create-payment-card` creates a card payment method. Multiple saved cards are supported through an `is_default` flag. The backend stores the cardholder name and last four digits only, together with the Flutterwave reference. | Gate raw card collection until section 6 is resolved. After approval, render only server-returned masked details and provide a single selected/default card. |
| KYC gate | A Flutterwave customer ID is created after successful KYC and is mandatory for payment transactions. An unverified user cannot pay. | Check authoritative KYC/payment eligibility before card selection or payment initiation and route an ineligible sender to verification. |
| Traveller bank account | `POST /users/create-bank-account` creates a payout account. Multiple accounts are supported; the first becomes default. Existing accounts are updated through `/users/update-bank-account/me/:bankAccountId`. | Build a traveller-only create/update flow. Do not invent bank-list, default-switch, or deletion behaviour that the backend has not yet supplied. |
| Charge start | `POST /payments/initiate-charge` starts a charge for a shipment. | Call once for a shipment, save the returned `reference` immediately, and disable duplicate taps while it is in flight. |
| Charge continuation | `POST /payments/next-action` submits `PIN`, `OTP`, or `ADDITIONAL_FIELDS`. A bank may require PIN, then OTP, 3DS redirect, or other additional fields. For `REDIRECT_URL`, open the returned URL instead of calling `next-action`. | Drive the UI from a typed `nextAction` union rather than assuming a single-step card payment. |
| Payment statuses | Backend statuses are `PENDING`, `CAPTURED`, `FAILED`, `CANCELLED`, and `REFUNDED`. | Model these exact backend values. Keep local UI phases such as `submitting` separate from backend status. |
| Payment timing | Payment happens after the traveller accepts the item. | Do not expose an enabled Pay action before acceptance is confirmed in shipment data. |
| Holding and payout | The platform holds the payment and the backend initiates payout after trip completion. | The app displays lifecycle state; it does not trigger traveller payout unless a future contract explicitly says so. |
| Payout timing | Timing varies by bank, country, and SWIFT processing. | Avoid a fixed arrival promise. Use a status plus cautious copy such as "processing time varies by bank" until payout-status SLAs are supplied. |
| Rejected payout | Backend webhooks notify the user when a payout is rejected. A manual payout is intended after the traveller resolves the bank issue. | Display backend notification/status data. Do not add a Retry payout action until the manual-payout endpoint and permissions are supplied. |
| Delivery confirmation | The sender confirms delivery by providing the delivery code. The backend resolves the payment automatically when the trip is completed. | Treat sender-confirmed delivery as the operational completion signal, but display payout status only from backend data. |
| Verification | The backend verifies the transaction reference, status, amount, and currency with Flutterwave. | Never infer success from a redirect, HTTP 200 alone, or local state. Show success only from a backend-verified `CAPTURED` result. |
| API root | REST requests use `https://staging.api.barukhconnector.com/api`, and the current environment configuration already contains `/api`. | Keep endpoint constants relative and do not regress the completed base-URL change. |
| Chat transport | WebSockets remain in use and the chat call is unchanged. | Do not append `/api` to the chat/WebSocket URL or rewrite the chat flow as part of payment work. |
| Profile creation | Sender and traveller profile creation now require `userId`, `firstName`, `lastName`, and `email`. | Update both request types and both call sites. Source identity values from the authenticated user profile. |
| Matching | Auto-assign is now `GET /matching/auto-assign/{package_id}` and returns a `trip` object. | Replace the old POST body contract. Confirm how the frontend obtains the shipment ID before changing navigation. |
| Trip categories | `allowedCategories` is required again; use the seven enum values in section 11.3. | Send enum values, not display labels such as `Electronics` or `Documents`. |

### 2.1 Traveller bank-account creation

**Endpoint:** `POST /users/create-bank-account`

```json
{
  "country": "Uganda",
  "currency": "UGX",
  "accountHolderName": "Account holder name",
  "accountNumber": "Account number",
  "bankName": "Bank name",
  "swiftCode": "Optional SWIFT code",
  "routingNumber": "Optional routing number",
  "sortCode": "Optional sort code",
  "branchCode": "Optional branch code",
  "isDefault": true
}
```

The confirmed country-dependent optional fields are `swiftCode`, `routingNumber`, `sortCode`, and `branchCode`. `isDefault` is optional, and the first account becomes default. East Africa should initially emphasise SWIFT where appropriate. Multiple accounts and updates are confirmed; use `/users/update-bank-account/me/:bankAccountId` for an existing account. The HTTP method, bank-list API, country-specific validation contract, set-default behaviour, deletion endpoint, and pending-payout deletion guard remain backend work.

### 2.2 Sender card payment-method creation

**Endpoint:** `POST /users/create-payment-card`

```json
{
  "cardHolderName": "Cardholder name",
  "cardNumber": "Full card number - blocked pending security approval",
  "expiryMonth": "MM",
  "expiryYear": "YY",
  "cvv": "CVV - blocked pending security approval"
}
```

The backend says it encrypts card data before sending it to Flutterwave and stores only the Flutterwave reference, cardholder name, and last four digits. Multiple saved cards and an `is_default` flag are confirmed. This does not, by itself, settle the app's PCI scope or establish that sending raw PAN/CVV to the backend is the approved v4 mobile pattern. Do not implement this request from a custom form until section 6 is resolved. The list, default-change, deletion, and replacement endpoint contracts are still required.

### 2.3 Initiating a charge

**Endpoint:** `POST /payments/initiate-charge`

```json
{
  "currency": "USD",
  "shipmentId": "shipment-id",
  "customerId": "cus_example",
  "paymentMethodId": "pmd_example",
  "amount": 250,
  "redirectUrl": "barukhexpo://payment-return",
  "meta": {
    "senderId": "sender-id",
    "travellerId": "traveller-id",
    "senderName": "Sender name",
    "travellerName": "Traveller name",
    "sourceDestination": "origin_destination"
  }
}
```

All fields were described as required. Charges are USD-only and full-payment only. The backend says `shipmentId` deduplicates initiation: retrying the same shipment should return the current charge rather than create another charge. Confirm the exact amount unit before using `priceMinor`; the supplied example says `amount: 250` but does not state whether that means minor units or major currency units.

Example response:

```json
{
  "status": "success",
  "message": "Transfer initiated",
  "reference": "bkh-reference",
  "paymentStatus": "PENDING",
  "nextAction": {
    "mode": "PIN",
    "url": null,
    "requiresAdditionalFields": []
  }
}
```

Persist `reference` as soon as it is received. A missing `nextAction` with `paymentStatus: "CAPTURED"` is complete. A `PENDING` response with another `nextAction` continues the authorisation loop.

### 2.4 Completing the next action

**Endpoint:** `POST /payments/next-action`

| Previous `nextAction.mode` | Request `data` | UI behaviour |
|---|---|---|
| `PIN` | `{ "type": "PIN", "pin": "..." }` | Prompt securely, submit once, then clear the PIN immediately. |
| `OTP` | `{ "type": "OTP", "otp": "..." }` | Prompt for the one-time code, submit once, then clear it. |
| `ADDITIONAL_FIELDS` | `{ "type": "ADDITIONAL_FIELDS", "additionalFields": { ... } }` | Render only the fields named in `requiresAdditionalFields`; validate them before submit. |
| `REDIRECT_URL` | No `next-action` call | Open `nextAction.url`, wait for the app return link, then ask the backend for the authoritative status. |

Example request:

```json
{
  "reference": "bkh-reference",
  "data": {
    "type": "OTP",
    "otp": "123456"
  }
}
```

The response follows the same status/next-action logic as initiation. On `FAILED`, display the backend message when it is safe and user-friendly. A generic `500` should be shown as a generic retryable error, without exposing internal details. The staging-only `x-test-scenario` header is a QA aid and must never control production UI behaviour.

## 3. Provisional management statements

These points are not final release contracts:

- Current commission figures are temporary make-shift numbers while management decides the exact payment commissions.
- Transaction charges are described as "likely" to be included in the charge calculation. The authoritative fee components, amounts, payer, rounding, and tax treatment are not confirmed.

Julius may reserve layout space for a fee breakdown, but must not hard-code temporary commissions or label a likely charge as final. The review screen should render only authoritative backend pricing fields once that response contract is supplied.

## 4. Current repository findings

| Finding | Evidence in the current repo | Impact |
|---|---|---|
| Checkout is a static prototype | `app/(sender)/modeOfPayment.tsx`, `app/(sender)/payScreen.tsx`, `components/forms/payments/ModeOfPaymentForm.tsx`, and `PayScreenForm.tsx` only pass display strings and navigate locally. | No payment is created, authorised, verified, or recovered. |
| Amounts are hard-coded dollar strings | Defaults include `$120`, `$3.20`, `$123.20`, and `$48.20`. | The display can disagree with shipment pricing and cannot safely populate an API amount. |
| Unsupported methods are advertised | The UI offers Mobile Money, PayPal, Apple Pay, Wallet Pay, and Cash on Delivery, while the supplied backend contract only confirms card creation/charge now. | Users could select a method that has no supported API path. Hide it or mark it unavailable. |
| No payment service or payment domain types exist | `services/api.ts` has no payment endpoints and there is no `paymentService`. | Julius needs a typed service and explicit state machine before wiring screens. |
| `My Payments` is not routed | `app/(tabs)/profile.tsx` sets the `My Payments` route to `null`. | Payment history/saved-method UX is missing and also backend-blocked until list APIs exist. |
| Traveller bank-account UI is absent | No route or form calls `/users/create-bank-account`. | Traveller payout setup cannot be completed in the app. |
| Matching still uses the old contract | `services/senderService.ts` POSTs `{ packageId }` to `/matching/auto-assign` and expects `shipmentId`. | It does not match the confirmed GET route or new response shape. |
| Profile creation still sends only `userId` | `CreateSenderParams`, `CreateTravellerParams`, and their call sites use only `userId`. | New backend validation or local-profile requirements will fail. |
| `allowedCategories` is commented out | It is commented in traveller service types, form values, validation, submit mapping, context mapping, and trip payload construction. | The new trip contract is not being sent. |
| Category enums already exist for sender packages | `components/forms/sender/shipmentForm/constants.ts` maps labels to exact enum values. | Reuse this mapping for trip categories; do not send labels. |
| REST base includes `/api` | The current `EXPO_PUBLIC_API_URL` ends in `/api`; endpoint constants remain relative. | This requirement is complete. Preserve it and keep the separate chat URL unchanged. |
| Request bodies and tokens can be logged | `services/api.ts` includes JSON request bodies in development error logs. Auth and service files log access/refresh tokens; traveller submission files log full values and payloads. | This is a serious card-data and account-token exposure risk. Fix before any card work or payment UAT. |
| Session restoration is partial | `AuthContext` restores a valid access token from SecureStore, but it does not restore/use the refresh token and logs tokens. Expired access tokens cause logout. | Basic restart persistence exists, but expiry recovery during a payment is incomplete. |
| Shipment pricing fields are typed | `ShipmentDetails` includes numeric `priceMinor` and `currency`. | Fetch authoritative shipment data for review and payment; do not trust route display strings. |
| WebSocket chat is already separate | `ChatContext` uses Socket.IO and a separate chat URL. | Leave it unchanged while adding `/api` to REST. Remove token logging without changing the transport. |

## 5. Julius's action matrix

Status meanings: **Complete** means the current app/team decision needs no payment-specific feature work; **In progress** means a usable piece exists but the contract is incomplete; **Missing** means Julius can implement it from confirmed information; **Backend-blocked** means an API, compliance decision, or response contract is required first.

| Work item | Status | Julius's next action | Dependency or completion rule |
|---|---|---|---|
| Existing checkout visual scaffold | In progress | Refactor into the step flow in section 8 and remove hard-coded amounts. | Use authoritative shipment pricing and fixed USD presentation after amount units are confirmed. |
| Card charge service and domain types | Missing | Add typed endpoints, DTOs, status unions, and next-action unions. | Confirm amount units and customer/method ID source. |
| Custom card-entry form | Backend-blocked | Do not collect PAN/CVV. Prepare the saved-card selection shell only. | Written PCI decision plus a v4-compatible hosted/tokenised or reviewed encryption flow. |
| Cards-only method selector | Missing | Replace the unsupported options with saved cards and an approved Add card path. | Saved-card retrieval and approved card-collection contracts are supplied. |
| KYC/eligibility gate | Missing | Check backend KYC/payment eligibility before enabling payment and route ineligible users to verification. | Backend exposes the authoritative KYC/customer-ID state. |
| Initiate and PIN/OTP/additional-field loop | Missing | Implement as a guarded state machine with one request at a time. | Card method and amount contracts are resolved. |
| 3DS/redirect return route | Backend-blocked | Prepare a dedicated Expo Router return route and generate its URL with `Linking.createURL`. | Backend allowlists the URI and provides status recovery. |
| Payment status/recovery after app close | Backend-blocked | Persist the safe identifiers listed in section 7 and reconcile on resume. | Backend provides a `GET` status-by-reference or status-by-shipment endpoint. |
| Duplicate-tap and retry protection | Missing | Disable while submitting; reuse shipment/reference for uncertain retries. | Backend confirms semantics after `FAILED` and for a genuinely new attempt. |
| `My Payments` route and history | Backend-blocked | Keep the route hidden/disabled or show an honest unavailable state. | List/history and saved-method APIs are supplied. |
| Traveller bank-account creation UI | Missing | Add a traveller-only route/form with country-aware optional fields. | Country-specific requirements and validation errors should be confirmed before release. |
| Bank-account update UI | Backend-blocked | Update an existing account through `/users/update-bank-account/me/:bankAccountId` after a list/detail source exists. | HTTP method, bank list/detail response, and permissions are supplied. |
| Bank list/default/delete | Backend-blocked | Do not invent client-only management. | Bank-list API, default-change behaviour, delete endpoint, and deletion guard are supplied. |
| Rejected-payout notification | Backend-blocked | Prepare a status/notification surface; do not add a manual retry button yet. | Webhook-derived status/notification and manual-payout contracts are supplied. |
| Profile creation payloads | Missing | Send `userId`, `firstName`, `lastName`, and `email` for both roles. | Authenticated user profile is loaded. |
| Matching GET migration | Backend-blocked | Prepare the typed `trip` response migration. | Backend confirms the shipment ID/navigation contract. |
| Trip `allowedCategories` | Missing | Re-enable form state, validation, payload mapping, and enum values. | Use the exact seven enums in section 11.3. |
| REST base URL `/api` | Complete | Preserve the configured `/api` REST root and relative endpoints. | Do not change the chat URL. |
| WebSocket chat transport | Complete | Leave behaviour unchanged. Remove sensitive token/payload logs only. | Regression-test chat connection and messaging. |
| Sensitive logging removal | Missing | Redact or remove request bodies, tokens, PIN/OTP, card data, and sensitive FormData logging. | Must be complete before payment testing. |
| Access-token restoration | In progress | Preserve current restoration but remove token logs. | Refresh-token restoration/recovery still needs a confirmed auth refresh contract. |
| Refresh-token recovery | Backend-blocked | Add single-flight refresh and retry only after the auth contract is confirmed. | Refresh endpoint, rotation rules, and failure behaviour are required. |

## 6. Security and PCI gate for card entry

### 6.1 What is confirmed

- Flutterwave secrets stay in server-side environment secrets and must never be included in the React Native app.
- The backend says it uses Flutterwave v4, encrypts card fields before forwarding them, and retains only a Flutterwave reference plus limited masked/display details.
- Flutterwave's current [card flow](https://developer.flutterwave.com/docs/card) requires `encrypted_card_number`, encrypted expiry fields, `encrypted_cvv`, and a nonce before creating a payment method; it also requires transaction verification before value is given to the customer.
- Flutterwave's [encryption guidance](https://developer.flutterwave.com/docs/encryption) says card information must be encrypted before a direct card request and documents AES-256/GCM handling. That is technical guidance, not a Barukh PCI ownership decision.

### 6.2 What is not confirmed

- Who formally owns PCI DSS compliance for raw PAN/CVV capture in the mobile app.
- Whether the frontend may send raw card data to the Barukh backend.
- Whether encryption must occur in the app, and if so, which reviewed v4-compatible library/protocol provides the nonce and encrypted fields.
- Whether a hosted checkout or backend-created hosted/tokenisation URL is available.

### 6.3 Required decision

Before Julius builds custom card entry, the backend/security owner must provide one of these in writing:

1. **Preferred:** a Flutterwave v4-compatible hosted or tokenised collection flow. The app opens the approved URL and receives only non-sensitive identifiers/results.
2. **Alternative:** explicit compliance approval for direct mobile capture, including PCI ownership, a reviewed v4 encryption design, key/nonce handling, log redaction, secure input requirements, test approach, and proof that PAN/CVV never persists.

Do not use the [official Flutterwave React Native SDK](https://github.com/Flutterwave/React-Native) as a shortcut in this backend v4 flow. Its repository states that it uses Flutterwave v3, so mixing it with the backend's v4 contract creates a version and ownership mismatch.

### 6.4 Frontend data-handling rules after approval

- Keep card number, expiry, CVV, PIN, and OTP only in the local component state that needs them.
- Clear sensitive fields after submission, on terminal result, on cancellation, and on component unmount.
- Never put them in context, Redux-like shared state, AsyncStorage, SecureStore, route params, analytics, crash breadcrumbs, screenshots, or logs.
- Disable copy/paste and screenshots where the approved security design requires it, while preserving accessibility and password-manager behaviour agreed by the team.
- Persist only the backend payment `reference`, `shipmentId`, backend `paymentStatus`, and masked method details returned by the server.
- Do not expose secret keys, encryption private material, or backend-only identifiers that the server can derive from the authenticated user.

## 7. Recommended frontend architecture

### 7.1 Domain types

Keep the confirmed backend status separate from local UI progress:

```ts
export type PaymentStatus =
  | "PENDING"
  | "CAPTURED"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED";

export type PaymentUiPhase =
  | "idle"
  | "reviewing"
  | "submitting"
  | "authorising"
  | "redirecting"
  | "recovering"
  | "complete";

export type PaymentNextAction =
  | { mode: "PIN"; url: null; requiresAdditionalFields: [] }
  | { mode: "OTP"; url: null; requiresAdditionalFields: [] }
  | {
      mode: "ADDITIONAL_FIELDS";
      url: null;
      requiresAdditionalFields: string[];
    }
  | { mode: "REDIRECT_URL"; url: string; requiresAdditionalFields: [] };

export type PaymentChallenge =
  | { type: "PIN"; pin: string }
  | { type: "OTP"; otp: string }
  | { type: "ADDITIONAL_FIELDS"; additionalFields: Record<string, string> };

export type PaymentResponse = {
  status: "success";
  message: string;
  reference: string;
  paymentStatus: PaymentStatus;
  nextAction?: PaymentNextAction;
  data?: {
    amount: number;
    currency: string;
    meta: Record<string, string>;
  };
};
```

Do not use `any`. Validate unknown API responses at the service/rendering boundary so an unexpected `mode`, empty redirect URL, or malformed status becomes a controlled error.

### 7.2 Service boundary

Create a typed `services/paymentService.ts` with narrowly scoped methods such as:

```ts
createBankAccount(input, accessToken)
createPaymentCard(input, accessToken) // gated until section 6 is cleared
initiateCharge(input, accessToken)
submitNextAction(input, accessToken)
getPaymentStatus(reference, accessToken) // add when backend supplies it
updateBankAccount(bankAccountId, input, accessToken)
```

Add relative endpoint constants under `API_ENDPOINTS`. Keep authentication in the shared request layer, but add a payment-safe logging policy: no request body or sensitive response body should be logged for payment endpoints, even in development.

### 7.3 Shared payment state

If multiple screens need continuity, use a small payment context or hook containing only:

- `shipmentId`
- `reference`
- `paymentStatus`
- `uiPhase`
- masked method information returned by the backend
- the last safe backend message/error code

Sensitive challenge values remain local to their form screen and are cleared immediately. Safe recovery state can be stored locally only after the storage key, expiry, logout cleanup, and multi-account isolation rules are defined.

## 8. Checkout UX and navigation flow

Build the operational flow as quiet, scannable steps rather than one long payment form:

1. **Eligibility and acceptance:** Confirm sender role, successful KYC/customer eligibility, and the authoritative shipment status that proves traveller acceptance. If any gate fails, explain what the user needs to do and do not enable Pay.
2. **Order summary:** Fetch shipment details by `shipmentId`. Present the full charge in USD only, after confirming how `priceMinor` maps to the API `amount`. Include route and sender/traveller details. Do not accept amount/currency from display route params.
3. **Saved card:** Show only cards in the first release. Let the sender select one masked saved card and identify the default card from the backend. Card creation remains gated. Hide Mobile Money, PayPal, Apple Pay, Wallet Pay, Cash on Delivery, and any other unsupported method.
4. **Review and pay:** Show the masked card, full USD amount, authoritative fee breakdown, hold explanation, and retry/cancellation rules. Do not offer partial payment. Disable the Pay button on the first tap and expose progress.
5. **Required authorisation:** Render the discriminated `PIN`, `OTP`, or `ADDITIONAL_FIELDS` challenge. Authentication depends on the issuing bank; a PIN-to-OTP sequence, 3DS, or requested additional fields are valid outcomes.
6. **Redirect/3DS:** Open only an `https` URL from an allowlisted Flutterwave/backend host. Add a dedicated Expo Router return route and generate the return URL using [`Linking.createURL`](https://docs.expo.dev/versions/latest/sdk/linking/) with the existing `barukhexpo` scheme rather than hard-coding a development URL.
7. **Pending:** Explain that payment is still being confirmed. Allow the user to leave safely. Recover by reference when the app resumes or the screen refocuses.
8. **Final result:** Show success only for a backend-verified `CAPTURED`. Show distinct, accessible states for `FAILED`, `CANCELLED`, and `REFUNDED`; do not label them all as generic errors.

The redirect back into the app is a return signal, not evidence of payment. The payment-return route should read only safe identifiers, load the stored/reference context, call the future status endpoint, and navigate to the final state after backend verification.

## 9. Reliability and recovery requirements

- **Double-tap protection:** Disable submission synchronously on the first tap. Keep a single in-flight initiation promise and ignore repeated taps.
- **Idempotent uncertain retry:** If initiation times out and no response is received, retry using the same shipment identity as agreed by the backend. Never generate a second local payment attempt merely because the screen was tapped again.
- **Explicit failed-payment retry:** Ask the backend whether a `FAILED` shipment can be re-initiated with the same `shipmentId`, whether it returns the failed record, or whether a new attempt identifier is needed.
- **Next-action sequencing:** Submit one challenge at a time. Reject stale responses if the screen moved to a later reference/action.
- **App-close recovery:** Save only safe recovery fields. On app start/resume, fetch authoritative status before enabling another charge.
- **Network loss:** Preserve the reference and show a recoverable pending state. Do not turn a timeout into `FAILED` locally.
- **Backend verification:** Require verified reference, status, amount, and currency. Flutterwave's [webhook guidance](https://developer.flutterwave.com/docs/webhooks) requires signature checking and recommends server-side re-query of status, amount, currency, and reference plus idempotent handling of duplicate events.
- **Logout/account switch:** Clear payment recovery state that belongs to the prior user. Never show one account's masked method or transaction to another account.
- **Accessibility:** Announce status changes, move focus to validation errors/challenge headings, keep countdowns readable, and do not rely on colour alone.

## 10. Traveller bank-account UX

Treat payout setup as a separate traveller-only flow, not another sender checkout method.

Recommended first screen:

- Country
- Currency
- Bank name
- Account-holder name
- Account number
- SWIFT code when relevant
- Routing number, sort code, and branch code only when required by the chosen country
- `isDefault` only if the backend wants the creation toggle exposed; explain that the first account becomes default automatically

Use backend-supplied country rules rather than one universal validator. Show field-level errors and masked account details; never log the full account number.

After a list/detail source is supplied, updates use `/users/update-bank-account/me/:bankAccountId`; confirm its HTTP method first. Defer bank listing, default switching, deletion, and the deletion guard until their contracts exist. Show rejected payouts from backend webhook-driven notification/status data, with no manual Retry control until its endpoint is supplied. Avoid fixed timing promises because processing varies by bank, country, and SWIFT.

## 11. Required non-payment edits

These changes are part of making the payment flow reachable and reliable, even though they are not payment screens.

### 11.1 Sender and traveller profile payloads

Update both profile-creation DTOs and call sites to send:

```json
{
  "userId": "authenticated-user-id",
  "firstName": "First",
  "lastName": "Last",
  "email": "user@example.com"
}
```

Load the current user profile first. Do not duplicate stale name/email values in route params.

### 11.2 Matching contract

Replace:

```text
POST /matching/auto-assign
body: { "packageId": "..." }
```

with:

```text
GET /matching/auto-assign/{package_id}
```

The new supplied response contains `trip.id`, traveller identity/name, coordinates, distances, and capacity/dimensions. It does not show the `shipmentId` currently required by the frontend's next navigation and shipment fetch. This is a blocking contract question; do not substitute `trip.id` for `shipmentId` without backend confirmation.

### 11.3 Exact category mapping

Use one shared typed option list for sender package categories and traveller `allowedCategories`:

| UI label | API enum |
|---|---|
| Electronics | `ELECTRONIC` |
| Documents | `DOCUMENT` |
| Clothing | `CLOTHING` |
| Food Items | `FOOD` |
| Fragile Items | `FRAGILE` |
| Books | `BOOK` |
| Other | `OTHER` |

Re-enable `allowedCategories` in form values, initial state, validation, submit types, shipment context, and `CreateTripParams`. Require at least one selection and send the enum array unchanged.

### 11.4 API and session handling

- Keep the completed REST base configuration at `https://staging.api.barukhconnector.com/api` and keep all REST endpoints relative.
- Keep the chat/WebSocket URL and behaviour unchanged.
- Remove logging of access tokens, refresh tokens, request bodies, traveller form values, payment challenges, card/account data, and sensitive response bodies.
- Preserve access-token restoration from SecureStore.
- Add refresh-token restoration and single-flight refresh/retry only after the backend supplies the refresh endpoint, rotation rules, expiry behaviour, and invalid-refresh response.
- Never retry a non-idempotent payment request automatically after auth refresh unless the idempotency contract makes it safe.

## 12. Questions that need answers

### 12.1 Blocking frontend work now

1. **PCI ownership:** Who formally owns PCI DSS compliance for PAN, expiry, CVV, and PIN capture in the mobile application and Barukh backend?
2. **V4 collection method:** Will the backend provide a Flutterwave v4-compatible hosted/tokenised flow, or is direct capture approved with a reviewed encryption protocol, key/nonce lifecycle, and secure-input design?
3. **Customer and card IDs:** How does the authenticated frontend retrieve the mandatory Flutterwave `customerId` and the selected saved-card `paymentMethodId`? Which identifiers should the backend derive rather than trust from the client?
4. **Amount units:** Is `amount` in major or minor units, and exactly how does the frontend convert the typed `priceMinor` value to the USD charge request?
5. **Authoritative fees:** Which backend fields provide the shipment price, exact commission, Flutterwave charge, insurance, taxes, total, rounding, and payer? Temporary figures and "likely included" charges are not sufficient.
6. **Status recovery:** What authenticated endpoint returns the authoritative payment by `reference` or `shipmentId` after redirect, app termination, timeout, or webhook delay?
7. **Redirect allowlisting:** Which staging and production return URIs and redirect hosts are allowlisted? Must Barukh support only the custom scheme, or also universal/app links?
8. **Failed-retry semantics:** After `FAILED`, does the same `shipmentId` return the failed record, reopen it, or create a new attempt? What identifier represents an intentional new attempt?
9. **Matching shipment ID:** Where does the frontend obtain the `shipmentId` when `GET /matching/auto-assign/{package_id}` returns a `trip` object but no shipment ID?
10. **Refresh-token contract:** What is the refresh endpoint, rotation model, expiry behaviour, invalid-refresh response, and safe retry rule while charge initiation or authorisation is in progress?

### 12.2 Needed before release

1. What are the final commission figures, who pays each fee, and which values must appear in the user-facing breakdown?
2. What are the cancellation, refund, partial-refund, dispute, chargeback, and sender/traveller disagreement rules, including who may initiate each action?
3. Which APIs list saved cards, return `is_default` and masked fields, change the default, delete/replace a card, and power `My Payments` history? What authentication can recur on saved-card use?
4. Which bank-list, bank-code, country/currency, account-name validation, and field-requirement APIs support East Africa and Canada?
5. What are the exact set-default and delete behaviours for bank accounts? When does the promised pending-payout deletion guard block a request?
6. What manual-payout endpoint, authorisation rule, and UI eligibility signal should be used after a traveller fixes a rejected bank account?
7. What payout statuses, rejection reasons, notification payloads, and timing copy should the frontend support?
8. Which test-user emails should receive Flutterwave customer IDs, and which accounts are confirmed KYC-approved?
9. Which staging cards/accounts and `x-test-scenario` values cover direct success, decline, PIN, OTP, 3DS, additional fields, pending, cancellation, refund, duplicate submission, and payout rejection?
10. Are test and production keys, customer IDs, webhooks, encryption material, redirect allowlists, and data stores separated?
11. What UAT evidence is required: screenshots, recordings, backend-verified references, webhook records, redacted logs, storage inspection, or signed test-case results?

## 13. Recommended implementation sequence

1. **Remove sensitive logging:** Eliminate request bodies, access/refresh tokens, OTPs, PINs, FormData, card/account data, and sensitive responses from every log path before payment work or UAT.
2. **Resolve security and blocking contracts:** Obtain the written PCI/v4 collection decision plus answers for identifiers, amount units, fees, recovery, redirects, retries, matching, and refresh.
3. **Complete contract groundwork:** Update profile DTOs, restore enum-safe `allowedCategories`, migrate matching after the shipment-ID answer, and define typed payment DTOs/services. Preserve the completed `/api` base and unchanged WebSocket transport.
4. **Build safe checkout:** Fetch authoritative shipment pricing, enforce KYC and acceptance, present cards-only/full USD payment, add review/pending/result screens, and protect against duplicate taps.
5. **Add authorisation and recovery:** Implement PIN/OTP/additional-field challenges, the dedicated payment-return route, allowlisted URL handling, safe persistence, and backend reconciliation.
6. **Add traveller payout setup:** Build bank-account creation and update with country-aware fields; keep uncontracted management and manual payout actions disabled.
7. **Add history and management:** Implement `My Payments`, saved-card management, bank listing/default/deletion, payout statuses, and manual payout only when APIs are delivered.
8. **Run UAT and release hardening:** Execute the matrix below with backend evidence and inspect logs and storage for sensitive data.

## 14. Implementation acceptance test matrix

| Scenario | Setup/action | Expected frontend result | Required evidence |
|---|---|---|---|
| Direct success | Initiation returns `CAPTURED` with no next action. | One charge request; success screen only after backend-verified status; correct amount/currency/reference. | Redacted request count and backend verification record. |
| PIN to OTP | Initiation requests `PIN`; next response requests `OTP`; final response is `CAPTURED`. | Correct challenge order; fields cleared after each submit; no duplicate calls. | Screen recording plus redacted references. |
| Redirect/3DS | Response has `REDIRECT_URL`; user completes 3DS and returns. | Only allowlisted HTTPS URL opens; return route reconciles with backend; redirect params alone never show success. | Return URI, status-query result, and final screen. |
| Additional fields | Backend requests known AVS/additional field paths. | Only requested allowlisted fields render; validation is field-specific; data is cleared after submit. | Field list and redacted validation results. |
| Card decline | Backend returns `FAILED` with safe message. | Clear decline state; no success navigation; retry follows confirmed semantics. | Reference and backend status. |
| Generic server failure | Endpoint returns `500` or network error. | Generic message; reference/safe state retained; no raw backend error or card data shown. | UI capture and redacted logs. |
| Duplicate tap | User taps Pay repeatedly or the UI re-renders. | One in-flight initiation and no second charge. | Network request count and backend record count. |
| Uncertain initiation retry | First request times out after reaching backend; user retries. | Same idempotent shipment/attempt identity; current backend state is recovered. | Matching references/record count. |
| Pending and resume | Leave or terminate the app during pending/redirect, then reopen. | Safe reference restored for the same user; backend status fetched before another Pay is enabled; no local timeout is shown as final failure. | Storage inspection, resume recording, and status responses. |
| Cancellation | Backend returns `CANCELLED` or user exits approved redirect flow. | Cancelled state is distinct from failed; no payout or success copy. | Backend status and UI. |
| Refund | Existing charge becomes `REFUNDED`. | Refunded state is displayed from backend data; captured copy is no longer shown as current. | Status transition and UI. |
| KYC gate | Use a sender without successful KYC/customer eligibility. | Card selection and Pay are unavailable; the reason and verification route are clear; no charge request occurs. | Eligibility response and network request count. |
| USD and full payment | Open checkout for a shipment and attempt to alter amount/currency. | The authoritative full amount is shown in USD; no partial amount or currency selector is available; request matches verified pricing and amount units. | UI capture, request, and backend verification. |
| Saved-card selection | Use an account with multiple masked cards and one `is_default`. | Default is selected, another card can be chosen, only cardholder/masked details display, and the chosen backend ID is charged. | Redacted list response and charge request. |
| Bank-account validation | Submit required, invalid, and country-dependent bank fields. | Field-level errors; optional fields shown by country; account number masked after success. | Test cases and redacted response examples. |
| Unsupported method | Open method selector in the first release. | PayPal, Apple Pay, Wallet Pay, Cash on Delivery, and unsupported mobile money cannot start payment. | Method-selector capture. |
| Role-aware navigation | Test sender and traveller profiles. | Only sender can pay; only traveller can manage payout bank account; unauthorised routes fail safely. | Navigation recording for both roles. |
| Acceptance gate | Shipment is not accepted, then becomes accepted. | Pay disabled/hidden before confirmed acceptance and enabled only after authoritative status. | Shipment status and screen states. |
| Auth expiry during payment | Access token expires during a safe recovery or approved idempotent request. | No token/card data leaks; refresh follows confirmed rules or user is safely asked to sign in; no duplicate charge. | Request sequence and redacted auth logs. |
| No sensitive data in logs | Exercise card, PIN, OTP, error, bank, chat, and auth paths. | No PAN, CVV, PIN, OTP, full account number, access/refresh token, or sensitive body appears in console, crash, network, or analytics logs. | Search/export from all logging destinations. |
| No sensitive data in storage | Inspect local/shared state, AsyncStorage, SecureStore, route params, persisted queries, and crash breadcrumbs. | Only approved recovery identifiers and masked details exist; no card or challenge secret persists. | Redacted storage inventory. |
| WebSocket regression | Use chat after the REST base adds `/api`. | Chat connects and messages behave as before; no `/api` is added to the chat URL. | Connection/message test result. |

## 15. Definition of ready for payment UAT

Payment UAT should not start until all of these are true:

- The card security/PCI decision is signed off.
- Sensitive logging is removed and verified.
- Amount units, fees, currency, customer ID, payment-method ID, acceptance status, redirect URI, and failed-retry semantics are documented.
- A backend payment-status recovery endpoint is available.
- Staging accounts, KYC/customer IDs, test scenarios, and webhook verification are ready.
- The frontend enforces KYC, traveller acceptance, cards-only selection, full-payment only, fixed USD presentation, and backend shipment pricing.
- Direct, challenge, redirect, decline, duplicate, pending, resume, cancellation, refund, role, log, and storage tests pass.

## 16. References

- Team source: `docs/Payment Module Inquiries.docx`, including Izaiah's embedded comments.
- Team source: `docs/meeting minutes.txt`.
- [Flutterwave card flow](https://developer.flutterwave.com/docs/card) - current card payment-method encryption, charge authorisation, and verification flow.
- [Flutterwave encryption guidance](https://developer.flutterwave.com/docs/encryption) - encryption requirement and documented AES-256/GCM examples for direct card data.
- [Flutterwave webhook guidance](https://developer.flutterwave.com/docs/webhooks) - signature verification, server-side re-query, fallback polling, and idempotent processing.
- [Official Flutterwave React Native SDK](https://github.com/Flutterwave/React-Native) - the repository states that the SDK uses/supports Flutterwave v3.
- [Expo Linking API](https://docs.expo.dev/versions/latest/sdk/linking/) - `Linking.createURL`, custom schemes, incoming links, and stable build guidance.
