Steps:- 
    1.Create Lemon Squeezy Account
    2.Create Store
    3.Create Product & Variant
    4.What is a Variant?
    5.One-Time Payment Flow
    6.Generate Payment Link
    7.Webhook Setup
    8.Database IDs to Store
    9,Important Webhook Events
    10.Control Price from Backend
    11.Conclusion


1️⃣ Create Lemon Squeezy Account
    Go to 👉 https://www.lemonsqueezy.com/
    Sign up with your email.
    Verify your email address.

2️⃣ Create Store
    After login, click "Create Store".
    This store acts as your business profile.
    Store ID is find as:
        go in ==> dashboard/setting/Stores/find your created store and Id / #194730
        ![image](https://github.com/user-attachments/assets/4eb5c4b3-1419-48c9-95ff-48428cfd0854)
        👉 Store ID = 194730

3️⃣ Create Product & Variant
    ➕ Create a Product
    Navigate to Products → "New Product".
    Select:
    Product Type: Digital Download, Service, Subscription, or License.
    For one-time payment: choose "Digital Product" or "Service".
    ➕ Create a Variant (Mandatory)
    A Variant represents a pricing option (e.g., Basic, Pro, Enterprise).
    Even for one-time payments, a variant is mandatory.

4️⃣ What is a Variant?
    In Lemon Squeezy:
    Product = What you're selling (e.g., E-book, Service, Software).
    Variant = Specific pricing option for the product.
    ✔️ Even one-time payments require a variant.
    This is where the default price is defined (but you can override it from your backend using custom_price).
    for find verient id ==> dashboard/store/products/click on already created product /add varient in side product / select varient/ show varient id in url/ like ==> https://app.lemonsqueezy.com/products/560551/variants/871501
![image](https://github.com/user-attachments/assets/6fe77889-5454-4dc7-b1d4-e2ba7436c5de)


5️⃣ One-Time Payment Flow
    ✔️ How to choose one-time payment:
    When creating a product, select "Digital Product" or "Service".
    Do NOT select Subscription.
    👉 If your product has no subscription period, it is automatically a one-time payment.

6️⃣ Generate Payment Link
    ➕ Steps:
    Get:
    API Key:
        From Account Settings → API → Create API key.
        Store ID (from URL)
        Variant ID (from the product variant page URL) it's use for set one-time, subscription payment flow
    note:- in this code you can check for demo of one time payment flow ==> paymentHistory.controller.js file
    
    webhook response ==> webhook.json(one time payment flow)
    onetime payment link curl ==> oneTimePaymentLinkCurl.text file
    one time payment link response ==> oneTimeLinkResponse.text file

7️⃣ Webhook Setup
    Go to Settings → Webhooks → Add Webhook.
    Set:
    Webhook URL:
    e.g., https://yourdomain.com/api/webhook
    Select events to listen to.

8️⃣ Database IDs to Store
    we need to store some id in our database, from webhook payload
        "store_id": 194730,
        "customer_id": 6134334,
        "identifier": "9a86792c-78c5-4b5c-8d23-3fd8b5868a46",
        "order_number": 1947305,

9️⃣ Important Webhook Events
    order_created	==> 🔥 Order initiated (use for success)
    order_paid	    ==> ✅ Payment completed
    order_refunded	==> ♻️ Refund issued
    order_expired	==> 🚫 Payment link expired

1️⃣0️⃣ Control Payment Price from Backend
    LemonSqueezy supports setting price from backend using:
    set in payload of generate payment link ==> "custom_price": <price_in_cents>
    This price will override the variant price
    ✔️ Customers cannot change this price. It’s fully server-side controlled.

1️⃣1️⃣official docs 👉 https://docs.lemonsqueezy.com



