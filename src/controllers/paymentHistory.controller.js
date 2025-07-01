const axios = require("axios");
const { PaymentHistoryModel, StrategyPlanModel } = require("../models");
const { PAYMENT_TYPE } = require("../utils/constant");
const apiResponse = require("../utils/api.response");
const message = require("../json/message.json");
const fs = require("fs");
const { getPagination, pagingData } = require("../utils/utils");
require("dotenv").config();

const LEMON_API_KEY = process.env.LEMON_API_KEY;
const STORE_ID = process.env.STORE_ID;
const VARIANT_ID = process.env.VARIANT_ID; // Use Variant ID here
const URL = process.env.APP_BACKEND_URL;

const LEMON_PAYMENT_URL = process.env.NODE_ENV === "production" ? process.env.LEMON_LIVE_URL : process.env.LEMON_TESTMODE_URL;
 
module.exports = {
  createPaymentLink: async (req, res) => {
    try {
      const fiveMinutesLater = new Date(new Date().getTime() + 5 * 60000);
      const { name, email, metaAccountNo, strategyPlanId } = req.body;

      const strategyPlan = await StrategyPlanModel.findById(strategyPlanId);
      if (!strategyPlan) {
        return apiResponse.NOT_FOUND({ res, message: message.strategy_plan_not_found || "This strategy plan not found" });
      }

      // add payment as pending
      const payment = await PaymentHistoryModel.create({
        name,
        email,
        metaAccountNo,
        strategyPlanId,
        planType: strategyPlan.planType,
        amount: strategyPlan.price,
        paymentStatus: PAYMENT_TYPE.PENDING,
      });

      // generate payment link
      const response = await axios.post(
        `${LEMON_PAYMENT_URL}/v1/checkouts`,
        {
          data: {
            type: "checkouts",
            attributes: {
              custom_price: strategyPlan.price * 100,
              checkout_options: {
                button_color: "#7047EB",
              },
              checkout_data: {
                custom: {
                  // metadata
                  paymentId: payment._id,
                  name: name,
                  email: email,
                },
              },
              product_options: {
                redirect_url: `${URL}/api/v1/payment/success`,
                receipt_thank_you_note: "Thank you for your purchase!",
                receipt_button_text: "Continue",
                receipt_link_url: `${URL}/api/v1/payment/success`,
              },
              expires_at: fiveMinutesLater.toISOString(),
              preview: true,
            },
            relationships: {
              store: {
                data: {
                  type: "stores",
                  id: STORE_ID,
                },
              },
              variant: {
                data: {
                  type: "variants",
                  id: VARIANT_ID,
                },
              },
            },
          },
        },
        {
          headers: {
            Authorization: `Bearer ${LEMON_API_KEY}`,
            "Content-Type": "application/vnd.api+json",
            Accept: "application/vnd.api+json",
          },
        }
      );

      console.log("Checkout URL:", response.data);
      const checkoutUrl = response.data.data.attributes.url;

      return res.json({ status: true, message: "Checkout link generated successfully", url: checkoutUrl });
    } catch (error) {
      console.error("Error creating payment link:", error.response?.data || error.message);
      return res.status(500).json({ status: false, error: error.response?.data || error.message });
    }
  },

  webhook: async (req, res) => {
    console.log("Payment webhook call---------------", req.body);
    const payload = req.body;

    if (payload.meta.event_name === "order_created" && payload.data.attributes.status === "paid") {
      // update in db
      await PaymentHistoryModel.findOneAndUpdate(
        { _id: payload.meta.custom_data.paymentId, deletedAt: null },
        {
          paymentStatus: PAYMENT_TYPE.PAID,
          transactionId: payload.data.attributes.order_number,
        },
        { new: true }
      );

      res.status(200).send();
    }
    // fs.writeFileSync("webhook.json", JSON.stringify(req.body, null, 2));
  },

  getAllPaymentList: async (req, res) => {
    try {
      const status =req.query.status;
      const search = req.query.search || "";
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const { skip, limit: pageLimit } = getPagination(page, limit);
      let DataObj = [];

      if (search) {
        DataObj = [
          ...DataObj,
          { deletedAt: null },
          {
            $or: [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }, { metaAccountNo: { $regex: search, $options: "i" } }],
          },
        ];
      }
      if (status) {
        DataObj.push({ paymentStatus: { $eq: status } });
      }

      const paymentHistory = await PaymentHistoryModel.find({ $and: DataObj }).skip(skip).limit(pageLimit).sort({ createdAt: -1 });
      const response = pagingData({ data: paymentHistory, total: paymentHistory?.length, page, limit: pageLimit });

      return res.json({ status: true, message: "Payment history fetched successfully", response });
    } catch (error) {
      console.error("Error fetching payment history:", error);
      return res.status(500).json({ status: false, error: error.message });
    }
  },

  success: async (req, res) => {
    console.log("Payment successful");
    res.send("Payment successful");
  },

  cancel: async (req, res) => {
    console.log("Payment canceled");
    res.send("Payment canceled");
  },
};

// onetime payment link curl
{
  // curl --location 'https://api.lemonsqueezy.com/v1/checkouts' \
  // --header 'Accept: application/vnd.api+json' \
  // --header 'Content-Type: application/vnd.api+json' \
  // --header 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5NGQ1OWNlZi1kYmI4LTRlYTUtYjE3OC1kMjU0MGZjZDY5MTkiLCJqdGkiOiJjZGU1ZTFmM2JhODYyYmI3NDZjYTIyOWM3N2VkMWFlYjJjNDUyMjljNTk2Y2ZlYzUwNmIyNmU4MzVhODg1MWNiN2IzNzYyOTgyZTQ5YWQ4ZiIsImlhdCI6MTc1MDg1MzMyNi45NjQ5NTgsIm5iZiI6MTc1MDg1MzMyNi45NjQ5NiwiZXhwIjoyMDY2Mzg2MTI2LjkzMzgwMiwic3ViIjoiNTEwNDk1NSIsInNjb3BlcyI6W119.Xx1wjmingZV2hBEqzSZkHXWpbrRyPr9CMAlwA2E8HTg1BX2tc5HqH_D_DmFksyUu-IWtSH2UBN8yh61r1EEiTcPtibfR_q6GnWrRyiGWUxdmLFjPWgnmv2T5d4KqAtU61CXIDCi07WJyCZozrSGXXzyiRP2e2yoh8_-v70NP5hdVVphVJqodyO4caWwtweG57hFD4TEk-5Ec-jGe0T7Fl68Rv1UJy4GOpKPfeYKWY05RTuC5JOeqyImxN_pugQtKKBgdyPqTE6Grm3j-ldDh2iOD452voi8n9fzt5CNoWAOk3DbB4AFNBu-O8rYf36neECqeOm3cj5oDZsCoI_XrAZvN80JoPYMRG1jzFg13lNuWYqKQ3roQMMA_KzA3yYe_5vyp8rZ-ukaEuU2DbADkzdUuAPmqwRZjij5G60qgtx-Dga03WObvEiwLlaLxmXF3ZBMIbptcB0aasTt-ci2jfNLUC9NwE0ehrYVhlb9IBB1W1Zhek5N99fdZGq_XBlcK' \
  // --data '{
  //   "data": {
  //     "type": "checkouts",
  //     "attributes": {
  //       "checkout_options": {
  //         "button_color": "#7047EB"
  //       },
  //       "checkout_data": {
  //         "custom": {
  //           "user_id": "123"
  //         }
  //       },
  //       "expires_at": "2025-12-31T23:59:59Z",
  //       "preview": true
  //     },
  //     "relationships": {
  //       "store": {
  //         "data": {
  //           "type": "stores",
  //           "id": "194730"
  //         }
  //       },
  //       "variant": {
  //         "data": {
  //           "type": "variants",
  //           "id": "871501"
  //         }
  //       }
  //     }
  //   }
  // }'
}

// one time payment link response
{
  // {
  //   "jsonapi": {
  //     "version": "1.0"   // 🔸 API version following JSON:API standards
  //   },
  //   "links": {
  //     "self": "https://api.lemonsqueezy.com/v1/checkouts/9b67bfb9-3622-44db-a084-a0967e6fc2b1"
  //     // 🔸 Link to this specific checkout API resource (RESTful endpoint)
  //   },
  //   "data": {
  //     "type": "checkouts",    // 🔸 Type of resource (this is a checkout session)
  //     "id": "9b67bfb9-3622-44db-a084-a0967e6fc2b1", // 🔸 Unique ID for this checkout session
  //     "attributes": {
  //       "store_id": 194730,   // 🔸 Store ID that this checkout belongs to
  //       "variant_id": 871501, // 🔸 Variant (product) ID used for this checkout
  //       "custom_price": null, // 🔸 No custom price set (Checkouts API doesn't support direct custom pricing)
  //       "product_options": {  // 🔸 Product-related UI & settings customization
  //         "name": "",  // 🔸 Override product name (empty = default)
  //         "description": "",  // 🔸 Override product description (empty = default)
  //         "media": [], // 🔸 Override media/images (empty = default)
  //         "redirect_url": "", // 🔸 Redirect after payment (if set)
  //         "receipt_button_text": "", // 🔸 Button text on receipt page
  //         "receipt_link_url": "", // 🔸 Link on receipt page
  //         "receipt_thank_you_note": "", // 🔸 Thank-you note on receipt
  //         "enabled_variants": [], // 🔸 Limit to certain variants (empty = allow default variant)
  //         "confirmation_title": "", // 🔸 Title on confirmation page
  //         "confirmation_message": "", // 🔸 Message on confirmation page
  //         "confirmation_button_text": "" // 🔸 Button text on confirmation
  //       },
  //       "checkout_options": { // 🔸 Options affecting checkout UI/flow
  //         "embed": false,    // 🔸 Whether it's embedded (iframe) or hosted (false = hosted)
  //         "media": true,     // 🔸 Show product image/media
  //         "logo": true,      // 🔸 Show store logo
  //         "desc": true,      // 🔸 Show product description
  //         "discount": true,  // 🔸 Allow discount code entry
  //         "skip_trial": false, // 🔸 Skip free trial (for subscriptions)
  //         "quantity": 1,     // 🔸 Quantity selector (usually 1 for one-time purchases)
  //         "subscription_preview": true, // 🔸 Show subscription breakdown (for recurring)
  //         "button_color": "#7047EB", // 🔸 Checkout button color
  //         "locale": "en"     // 🔸 Language (en = English)
  //       },
  //       "checkout_data": { // 🔸 Pre-filled checkout data (customer info, discount, etc.)
  //         "email": "",       // 🔸 Customer email (empty = user fills it)
  //         "name": "",        // 🔸 Customer name (empty = user fills it)
  //         "billing_address": [], // 🔸 Billing info (empty = user fills it)
  //         "tax_number": "",  // 🔸 Tax/VAT number
  //         "discount_code": "", // 🔸 Discount applied (none)
  //         "custom": {
  //           "user_id": "123"  // 🔸 Custom metadata (you sent this — useful to identify user)
  //         },
  //         "variant_quantities": [] // 🔸 (For multi-variant checkouts, not used here)
  //       },
  //       "preview": { // 🔸 Price preview breakdown
  //         "currency": "INR", // 🔸 Your store currency (₹)
  //         "currency_rate": 0.01165535, // 🔸 INR to USD conversion rate
  //         "subtotal": 10000, // 🔸 Subtotal in INR (₹100.00 * 100)
  //         "discount_total": 0, // 🔸 Discount applied (none)
  //         "tax": 0,            // 🔸 Tax applied (none)
  //         "setup_fee": 0,      // 🔸 Any setup fees (none)
  //         "total": 10000,      // 🔸 Total in INR (₹100.00)
  //         "subtotal_usd": 117, // 🔸 Approximate USD equivalent ($1.17)
  //         "discount_total_usd": 0,
  //         "tax_usd": 0,
  //         "setup_fee_usd": 0,
  //         "total_usd": 117,    // 🔸 Total in USD
  //         "subtotal_formatted": "₹100.00", // 🔸 Formatted display
  //         "discount_total_formatted": "₹0.00",
  //         "tax_formatted": "₹0.00",
  //         "setup_fee_formatted": "₹0.00",
  //         "total_formatted": "₹100.00"
  //       },
  //       "expires_at": "2025-12-31T23:59:59.000000Z", // 🔸 Link expiry date
  //       "created_at": "2025-06-26T05:40:56.000000Z", // 🔸 Created timestamp
  //       "updated_at": "2025-06-26T05:40:56.000000Z", // 🔸 Last updated timestamp
  //       "test_mode": true, // 🔸 ✅ This is in test mode (important to know!)
  //       "url": "https://rejoicestore.lemonsqueezy.com/checkout/custom/9b67bfb9-3622-44db-a084-a0967e6fc2b1?expires=1767225599&signature=d7186ccdf4f23efa78cee85701974e971ba61684ad025ccf084813355c94ca15"
  //       // 🔥 🔥 This is your **payment link** to send to the customer
  //     },
  //     "relationships": { // 🔸 Links to related resources (store, variant)
  //       "store": {
  //         "links": {
  //           "related": "https://api.lemonsqueezy.com/v1/checkouts/9b67bfb9-3622-44db-a084-a0967e6fc2b1/store",
  //           "self": "https://api.lemonsqueezy.com/v1/checkouts/9b67bfb9-3622-44db-a084-a0967e6fc2b1/relationships/store"
  //         }
  //       },
  //       "variant": {
  //         "links": {
  //           "related": "https://api.lemonsqueezy.com/v1/checkouts/9b67bfb9-3622-44db-a084-a0967e6fc2b1/variant",
  //           "self": "https://api.lemonsqueezy.com/v1/checkouts/9b67bfb9-3622-44db-a084-a0967e6fc2b1/relationships/variant"
  //         }
  //       }
  //     },
  //     "links": {
  //       "self": "https://api.lemonsqueezy.com/v1/checkouts/9b67bfb9-3622-44db-a084-a0967e6fc2b1"
  //       // 🔸 Direct API URL for this checkout object
  //     }
  //   }
  // }
}
