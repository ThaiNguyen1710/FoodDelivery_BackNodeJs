// routes.js
const express = require('express');
const router = express.Router();
const paypal = require('paypal-rest-sdk');

// Cấu hình PayPal
paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AbJt-1D4Zer7X5p-EJHy9WQR8Dhdt94PBrj3n1q2v8ZMhSutDjuaClGqnW7XgO2Hnd0HRubjK90XuuJZ',
  'client_secret': 'EMmS0_a45ezkRMiybz4EF4mjkE_tZ3JlsYz6ZM2fvvbsmWGan-EVaMOQHejcRgBkjfQZn4qmuYvX8lbD'
});

// Tính tổng tiền
var total = 0;
var items = [
  {
    "name": "blue sky",
    "sku": "001",
    "price": "100.00",
    "currency": "USD",
    "quantity": 2
  },
  {
    "name": "green grass",
    "sku": "002",
    "price": "3.00",
    "currency": "USD",
    "quantity": 1
  }
];

for (let i = 0; i < items.length; i++) {
  total += parseFloat(items[i].price) * items[i].quantity;
}
const api = process.env.API_URL;
// Tạo đơn hàng và chuyển hướng đến trang thanh toán PayPal
router.all('/', function (req, res) {
  const create_payment_json = {
    "intent": "sale",
    "payer": {
      "payment_method": "paypal"
    },
    "redirect_urls": {
      "return_url":  `https://pbl-6-nine.vercel.app/${api}/paypal/success`,
      "cancel_url":  `https://pbl-6-nine.vercel.app/${api}/paypal/cancel`
    },
    "transactions": [{
      "item_list": {
        "items": items
      },
      "amount": {
        "currency": "USD",
        "total": total.toString()
      },
      "description": "Hat for the best team ever"
    }]
  };

  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
      res.send("has an error ", error);
    } else {
      console.log('create payment response');
      console.log(payment);
      res.send(payment);
    }
  });
});

// Trang hủy đơn hàng
router.get('/cancel', function(req, res){
  res.render('cancel');
});

// Trang thanh toán thành công
router.get('/success', (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
      "amount": {
        "currency": "USD",
        "total": total.toString()
      }
    }]
  };

  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
      res.redirect('/cancel');
    } else {
      console.log(JSON.stringify(payment));
      res.render('success');
    }
  });
});

module.exports = router;
