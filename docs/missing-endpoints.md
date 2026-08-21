# Missing Backend Endpoints

After removing all mock data from the app, the following screens are now rendering **static sample data** (with a "Sample data — waiting for backend endpoint" banner) or **falling back to a limited UX** because their backend endpoint does not yet exist.

For each, the request/response contract is a proposal — please confirm exact paths and shapes with the frontend before implementing.

---

## 1. `GET /payments/history`

**Blocks:** [components/forms/payments/PaymentActivityForm.tsx](../components/forms/payments/PaymentActivityForm.tsx) (Activity tab), [components/forms/payments/PaymentDetailsForm.tsx](../components/forms/payments/PaymentDetailsForm.tsx) (transaction detail)

**Hooks currently stubbed:** [hooks/usePaymentActivity.ts](../hooks/usePaymentActivity.ts), [hooks/usePaymentDetails.ts](../hooks/usePaymentDetails.ts)

**Proposed request:**
```
GET /payments/history?userId={userId}&page={n}&limit={n}
Authorization: Bearer {token}
```

**Proposed response:** array of `PaymentHistoryItem` matching the shape in [types/payment.ts](../types/payment.ts):
```ts
{
  reference: string;          // "bkh-<uuid>"
  shipmentId: string;
  amountMinor: number;        // e.g. 4860 for $48.60
  currency: "USD";
  status: "PENDING" | "CAPTURED" | "FAILED" | "CANCELLED" | "REFUNDED";
  createdAt: string;          // ISO 8601
  maskedMethod: { brand, last4, expiryMonth, expiryYear, cardholderName };
  description: string;        // e.g. "Documents to Kampala"
}
```

Detail endpoint could either accept `?reference=` filter on the list endpoint or a dedicated `GET /payments/history/:reference`.

---

## 2. `GET /matching/{packageId}/candidates`

**Blocks:** sender's "Traveller matches" tab (currently archived — not in the tab list). Would show a list of matched travellers instead of one auto-assigned trip.

**Current situation:** `GET /matching/auto-assign/:packageId` returns exactly one trip. There's no way to browse alternatives.

**Proposed request:**
```
GET /matching/{packageId}/candidates?limit=10&max-origin-distance=50&max-destination-distance=50
Authorization: Bearer {token}
```

**Proposed response:** `{ trips: AutoAssignedTrip[] }` (same shape as the existing `AutoAssignedTrip` in [services/senderService.ts](../services/senderService.ts)).

---

## 3. `GET /travellers/me/match-requests`

**Blocks:** traveller's "Match requests" tab (currently archived).

**Purpose:** inbox of shipment matches waiting for the traveller's accept/decline decision.

**Proposed request:**
```
GET /travellers/me/match-requests?status=PENDING&page={n}&limit={n}
Authorization: Bearer {token}
```

**Proposed response:** array of match objects with `{ shipmentId, packageId, senderName, packageName, pickupCity, destinationCity, priceMinor, weightKg, requestedAt }`.

---

## 4. `POST /shipments/{shipmentId}/accept` (traveller)

**Blocks:** [app/(traveller)/matchDetails.tsx](../app/(traveller)/matchDetails.tsx) → currently using `POST /shipments/{shipmentId}/traveller-confirm` as a placeholder (see the `TODO(izaiah)` comment there).

**Question:** is `PATCH /shipments/:id` with `{ status: "ACCEPTED" }` (via `travellerService.updateShipmentStatus`) the canonical accept path, or should there be a dedicated `POST /shipments/:id/accept` (and a matching `/decline`)?

**Also needed:** `POST /shipments/{shipmentId}/decline` for the decline button in the same screen.

---

## 5. `GET /payouts/status`

**Blocks:** payout status tab inside [components/forms/payments/PayoutAccountsForm.tsx](../components/forms/payments/PayoutAccountsForm.tsx) (currently renders `SAMPLE_PAYOUTS` under a banner).

**Purpose:** stream of payouts owed to / paid out to the traveller.

**Proposed request:**
```
GET /payouts/status?travellerId={id}&limit={n}
Authorization: Bearer {token}
```

**Proposed response:** array of `PayoutState` from [types/payment.ts](../types/payment.ts):
```ts
{ status: "NOT_STARTED" | "PENDING" | "PROCESSING" | "PAID" | "REJECTED";
  shipmentId: string;
  updatedAt?: string;
  maskedAccount?: string;   // present when PAID
  guidance?: string;        // present when REJECTED
}
```

---

## 6. `GET /payments/status/:reference` (dedicated status endpoint)

**Blocks:** clean 3DS resume flow and app-resume reconciliation.

**Current workaround:** [services/paymentService.ts](../services/paymentService.ts) — `getPaymentStatus()` posts to `/payments/next-action` with `{ data: { type: "STATUS_CHECK" } }` as a re-check hack. See the existing `TODO(izaiah)` there.

**Proposed request:**
```
GET /payments/status/{reference}
Authorization: Bearer {token}
```

**Proposed response:** same `PaymentResponse` shape as `POST /payments/initiate-charge` (so the frontend can just re-apply the same parser).

Used by:
- [hooks/usePaymentReturn.ts](../hooks/usePaymentReturn.ts) (polls every 3s up to 60s after the user returns from a 3DS redirect).
- [hooks/usePaymentCheckout.ts](../hooks/usePaymentCheckout.ts) `reconcile()` (runs on app-resume when a PENDING payment exists).

---

## 7. `GET /senders/{senderId}/traveller-requests`

**Blocks:** sender's "Traveller requests" tab (currently archived — distinct from "Traveller matches" above).

**Purpose:** list of travellers who *proactively* requested to carry a sender's package (as opposed to auto-matched candidates).

**Proposed request:**
```
GET /senders/{senderId}/traveller-requests?status=NEW&page={n}&limit={n}
Authorization: Bearer {token}
```

**Proposed response:** array of `{ requestId, travellerId, travellerName, requestedItem, packageId, proposedPickup, payoutOffer, status, createdAt }`.

---

## 8. `POST /disputes` (dispute submission)

**Blocks:** [components/forms/disputes/RaiseDisputeForm.tsx](../components/forms/disputes/RaiseDisputeForm.tsx) — currently persists the dispute payload to `AsyncStorage` under `barukh:pending-disputes` and shows "Support will follow up" toast. See existing `TODO(izaiah)` there.

**Proposed request:**
```
POST /disputes
Authorization: Bearer {token}
{
  "shipmentId": string,
  "reason": "NOT_DELIVERED" | "DAMAGED" | "WRONG_ITEM" | "OTHER",
  "description": string,
  "photoUrl": string   // optional S3 upload
}
```

**Proposed response:** `{ id: string, message: string, status: "OPEN" }`.

---

## 9. `POST /users/create-payment-card` (response contract)

**Not blocking** — endpoint exists and is wired in [services/paymentService.ts](../services/paymentService.ts). But: what exact shape does it return? Frontend assumes `{ id, last4, cardHolderName }` and needs `flwPaymentCardId` on the user profile after creation.

Please confirm:
1. Does the POST return the new `flwPaymentCardId` synchronously in the response body, or does the frontend need to re-fetch the user profile to see it?
2. What are the expected error codes for card decline / invalid card at creation time?

---

## 10. Bank-account endpoints (paths not yet confirmed)

Currently wired in [services/api.ts](../services/api.ts) with assumed paths (`GET/PATCH/DELETE /users/bank-accounts`, `POST /users/bank-accounts/:id/default`). Please confirm the actual REST paths match.
