const express = require('express');
const router = express.Router();
const paypal = require('paypal-rest-sdk');
const { OrderList } = require('../models/order-list');
const { Order } = require('../models/order');
// Tính tỷ giá hối đoái (ví dụ)
const exchangeRate = 0.000043;
// Cấu hình PayPal
paypal.configure({
    'mode': 'sandbox', // sandbox or live
    'client_id': 'AbJt-1D4Zer7X5p-EJHy9WQR8Dhdt94PBrj3n1q2v8ZMhSutDjuaClGqnW7XgO2Hnd0HRubjK90XuuJZ',
    'client_secret': 'EMmS0_a45ezkRMiybz4EF4mjkE_tZ3JlsYz6ZM2fvvbsmWGan-EVaMOQHejcRgBkjfQZn4qmuYvX8lbD'
});

// Tạo đơn hàng và chuyển hướng đến trang thanh toán PayPal
router.all('/:idOrder', async function (req, res) {
    // Lấy idOrder từ đường dẫn
    const idOrder = req.params.idOrder;

    // Kiểm tra xem idOrder có tồn tại không
    if (!idOrder) {
        return res.status(400).send("Invalid or missing 'idOrder' in the request path.");
    }

    try {
        // Sử dụng populate để lấy thông tin đầy đủ của các OrderList
        const order = await Order.findById(idOrder).populate({
            path: 'orderLists',
            populate: {
                path: 'product',
                model: 'Product'
            }
        });

        // Kiểm tra xem order có tồn tại không
        if (!order) {
            return res.status(404).send("Order not found for the provided idOrder.");
        }

        // Tính tổng tiền từ thông tin orderLists
        const total = order.orderLists.reduce((acc, orderList) => {
            return acc + (orderList.product.price * orderList.quantity);
        }, 0);

        const api = process.env.API_URL;
        const create_payment_json = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": `https://pbl-6-nine.vercel.app${api}/paypal/${idOrder}/success`,
                "cancel_url": `https://pbl-6-nine.vercel.app${api}/paypal/${idOrder}/cancel`
            },
            "transactions": [{
                "item_list": {
                    "items": order.orderLists.map(orderList => ({
                        "name": orderList.product.name,
                        "price": (orderList.product.price * exchangeRate).toString(), // Chuyển đổi giá sang USD
                        "currency": "USD",
                        "quantity": orderList.quantity
                    }))
                },
                "amount": {
                    "currency": "USD",
                    "total": (total * exchangeRate).toString() // Chuyển đổi tổng tiền sang USD
                },
                "description": "Hat for the best team ever"
            }]
        };

        paypal.payment.create(create_payment_json, function (error, payment) {
            if (error) {
                res.status(400).send("Has an error: " + error);
            } else {
                res.send(payment);
            }
        });
    } catch (error) {
        res.status(500).send("Internal Server Error");
    }
});

// Trang hủy đơn hàng
router.get('/:idOrder/cancel', function (req, res) {
    res.render('cancel');
});

// Trang thanh toán thành công
router.get('/:idOrder/success', async (req, res) => {
    try {
        const idOrder = req.params.idOrder;

        if (!idOrder) {
            return res.status(400).send("Invalid or missing 'idOrder' in the request params.");
        }

        const order = await Order.findById(idOrder).populate({
            path: 'orderLists',
            populate: {
                path: 'product',
                model: 'Product'
            }
        });

        if (!order) {
            return res.status(404).send("Order not found for the provided idOrder.");
        }

        const total = order.orderLists.reduce((acc, orderList) => {
            return acc + (orderList.product.price * orderList.quantity);
        }, 0);

        const payerId = req.query.PayerID;
        const paymentId = req.query.paymentId;

        const execute_payment_json = {
            "payer_id": payerId,
            "transactions": [{
                "amount": {
                    "currency": "USD",
                    "total": (total * exchangeRate).toString() // Chuyển đổi tổng tiền sang USD
                }
            }]
        };

        paypal.payment.execute(paymentId, execute_payment_json, async function (error, payment) {
            if (error) {
                console.log(error);
                res.redirect('/cancel');
            } else {
                console.log(JSON.stringify(payment));

                // Cập nhật trạng thái isPay của đơn hàng thành true
                await Order.findByIdAndUpdate(idOrder, { $set: { isPay: true } });

                res.render('success');
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
});


module.exports = router;
