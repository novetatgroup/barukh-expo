# step 1: get job status

POST: {{url}}/smile-id/get-job-status

## payload

{
"userId": "{{userId}}"
}

---

# step 2: create verification

post: {{url}}/smile-id/document-verification

payload:

{
"userId": "{{userId}}",
"jobId": "DOC_VERIF_1780302757175_c525e754-b5b8-433c-b2d2-f8a13f12e7e8",
"idInfo": {
"idType": "IDENTITY_CARD",
"countryTypes": "UG" // UG, NG as per smile docs
},
"images": [
{
"imageTypeId": 2,// Selfie
"imageKey": "kyc/fb067c16-4666-4742-b758-e735d37e06b3/DOC_VERIF_1780302757175_c525e754-b5b8-433c-b2d2-f8a13f12e7e8/selfie.jpg" // returned from the get upload urls endpoint
},
{
"imageTypeId": 3, // ID Front
"imageKey": "kyc/e851eadd-448e-437c-9016-0ec61c184a94/DOC_VERIF_1779451057543_237a84bc-33b1-4cc7-a733-9495d4ac895c/id_front.jpg"
},
{
"imageTypeId": 7, // ID Back
"imageKey": "kyc/e851eadd-448e-437c-9016-0ec61c184a94/DOC_VERIF_1779451057543_237a84bc-33b1-4cc7-a733-9495d4ac895c/id_back.jpg"
}
]
} }
]
}

---
# get upload urls
get: {{url}}/smile-id/upload-urls/{{userId}}

---
# get my upload urls
{{url}}/smile-id/get-upload-urls/me

Shipment workflows

1. -> traveller create trip 
2. -> sender add package 
3. -> sender defines destination and origin 
4. -> system auto matches the sender and traveller 
5. -> (todo: To be added) traveller creates a quote [initiates the charge] to be invoiced to the sender 
6. -> (todo: modify the share pickup code added it as a step after paying the invoice from the traveller ) the sender accepts the charge and shares the pickup code to the traveller 
7. -> the traveller receives the code 
8. -> comfirms to travel with the by confirming the pickup code -> traveller starts the trip 
9. -> traveller on reaching the delivery point uploads the delivery photo 
10. -> the sender is notified and shares the delivery code 
11. -> the traveller receives and confirms the delivery code and deliveries the package 
12. -> (todo: Add this screen) the sender confirms the receipt of the package then confirms (traveller receives the payout after 24 hrs) or raises a dispute about the shipment  (traveller payout is held till the dispute is settled)
---
Step 5. endpoint to add
Initiate charge
post `{{url}}/payments/initiate-charge`
payload

{
  "currency":"USD",
  "shipmentId": "JFK-HTW-123-461",
  "customerId": "cus_lPce8z8sT3",
  "paymentMethodId": "pmd_MaZDhRcyaQ",
  "amount": 50,
  "redirectUrl":"https://instagram.com/",
  "meta":{
    "senderId":"cust123",
    "travellerId":"cust234",
    "senderName": "John Doe",
    "travellerName": "Jack Doe",
    "sourceDestination": "ny_ldn"
  }
}

---


