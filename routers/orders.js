const {Order} = require('../models/order');
const express = require('express');
const { OrderList } = require('../models/order-list');
const { User } = require('../models/user');
const { OrderItem } = require('../models/order-item');
const router = express.Router();


router.get(`/`, async (req, res) =>{
    const orderList = await Order.find().populate('user', 'name').sort({'dateOrdered': -1});

    if(!orderList) {
        res.status(500).json({success: false})
    } 
    res.send(orderList);
})

router.get(`/:id`, async (req, res) =>{
    const order = await Order.findById(req.params.id)
    .populate('user', 'name')
    .populate({ 
        path: 'orderLists', populate: {
            path : 'product', populate: 'category'} 
        });

    if(!order) {
        res.status(500).json({success: false})
    } 
    res.send(order);
})

// router.post('/', async (req, res) => {
//     try {
//         const user = await User.findById(req.body.user);
//          if (!user) {
//              return res.status(400).send('Invalid User');
//          }
//         const orderListsIds = await Promise.all(req.body.orderLists.map(async (orderList) => {
//             try {
//                 let newOrderList = new OrderList({
//                     quantity: orderList.quantity,
//                     product: orderList.product
//                 });

//                 newOrderList = await newOrderList.save();

//                 return newOrderList._id;
//             } catch (error) {
//                 console.error("Error creating order List:", error);
//                 throw error; // Rethrow the error to be caught by the outer catch block
//             }
//         }));

//         const orderListsIdsResolved = await orderListsIds;

//         const totalPrices = await Promise.all(orderListsIdsResolved.map(async (orderListId) => {
//             try {
//                 const orderList = await OrderList.findById(orderListId).populate('product', 'price');
//                 const totalPrice = orderList.product.price * orderList.quantity;
//                 return totalPrice;
//             } catch (error) {
//                 console.error("Error fetching order List:", error);
//                 throw error; // Rethrow the error to be caught by the outer catch block
//             }
//         }));

//         const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

//         let order = new Order({
//             orderLists: orderListsIdsResolved,
//             shippingAddress1: req.body.shippingAddress1,
//             shippingAddress2: req.body.shippingAddress2,
//             city: req.body.city,
//             zip: req.body.zip,
//             country: req.body.country,
//             phone: req.body.phone,
//             status: req.body.status,
//             totalPrice: totalPrice,
//             user: req.body.user,
//         });

//         order = await order.save();

//         if (!order)
//             return res.status(400).send('The order cannot be created!');

//         res.send(order);
//     } catch (error) {
//         console.error("Error creating order:", error);
//         res.status(500).send('Internal Server Error');
//     }
// });
router.post('/', async (req, res) => {
    try {
        const user = await User.findById(req.body.user);
        if (!user) {
            return res.status(400).send('Invalid User');
        }

        const orderLists = await Promise.all(req.body.orderLists.map(async (orderList) => {
            try {
                // Kiểm tra xem user có tồn tại trong orderItem hay không
                const orderItem = await OrderItem.findOne({ user: req.body.user });

                // Nếu orderItem tồn tại, thì lưu thông tin vào orderList
                if (orderItem) {
                    orderList.quantity = orderItem.quantity;
                    orderList.product = orderItem.product;

                    // Tạo mới orderList và lưu vào cơ sở dữ liệu
                    let newOrderList = new OrderList({
                        quantity: orderList.quantity,
                        product: orderList.product
                    });

                    newOrderList = await newOrderList.save();

                    return newOrderList._id;
                } else {
                    console.error("OrderItem not found for user:", req.body.user, "and product:", orderList.product);
                    // Xử lý tùy thuộc vào logic của bạn khi không tìm thấy orderItem
                    return null; // hoặc throw một lỗi để sử lý ở catch block
                }
            } catch (error) {
                console.error("Error creating order List:", error);
                throw error;
            }
        }));

        // Loại bỏ các giá trị null từ mảng orderLists
        const validOrderLists = orderLists.filter(orderListId => orderListId !== null);

        // Kiểm tra xem có orderList hợp lệ nào không
        if (validOrderLists.length === 0) {
            return res.status(400).send('No valid orderLists found');
        }

        // Tính tổng giá trị của orderLists
        const totalPrices = await Promise.all(validOrderLists.map(async (orderListId) => {
            try {
                const orderList = await OrderList.findById(orderListId).populate('product', 'price');
                const totalPrice = orderList.product.price * orderList.quantity;
                return totalPrice;
            } catch (error) {
                console.error("Error fetching order List:", error);
                throw error;
            }
        }));

        // Tính tổng giá trị của đơn hàng
        const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

        // Tạo mới đơn hàng
        let order = new Order({
            orderLists: validOrderLists,
            shippingAddress1: req.body.shippingAddress1,
            shippingAddress2: req.body.shippingAddress2,
            city: req.body.city,
            zip: req.body.zip,
            country: req.body.country,
            phone: req.body.phone,
            status: req.body.status,
            totalPrice: totalPrice,
            user: req.body.user,
        });

        // Lưu đơn hàng vào cơ sở dữ liệu
        order = await order.save();

        // Kiểm tra xem đơn hàng có được lưu thành công hay không
        if (!order) {
            return res.status(400).send('The order cannot be created!');
        }

        // Trả về đơn hàng đã tạo
        res.send(order);

    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).send(error.message);
    }
});

// router.post('/', async (req, res) => {
//     try {
//         const user = await User.findById(req.body.user);
//         if (!user) {
//             return res.status(400).send('Invalid User');
//         }

//         const orderItems = await OrderItem.find({ user: req.body.user,product:req.body.product });

//         const orderLists = await Promise.all(req.body.orderLists.map(async (orderList) => {
//             try {
//                 const matchingOrderItems = orderItems.filter(item => item.product == orderList.product);

//                 if (matchingOrderItems.length > 0) {
//                     const newOrderLists = await Promise.all(matchingOrderItems.map(async (matchingOrderItem) => {
//                         let newOrderList = new OrderList({
//                             quantity: matchingOrderItem.quantity,
//                             product: matchingOrderItem.product
//                         });

//                         newOrderList = await newOrderList.save();

//                         return newOrderList._id;
//                     }));

//                     return newOrderLists;
//                 } else {
//                     console.error("OrderItem not found for user:", req.body.user, "and product:", orderList.product);
//                     return null;
//                 }
//             } catch (error) {
//                 console.error("Error creating order Lists:", error);
//                 throw error;
//             }
//         }));

//         const flatOrderLists = [].concat(...orderLists);
//         const validOrderLists = flatOrderLists.filter(orderListId => orderListId !== null);

//         const totalPrices = await Promise.all(validOrderLists.map(async (orderListId) => {
//             try {
//                 const orderList = await OrderList.findById(orderListId).populate('product', 'price');
//                 const totalPrice = orderList.product.price * orderList.quantity;
//                 return totalPrice;
//             } catch (error) {
//                 console.error("Error fetching order List:", error);
//                 throw error;
//             }
//         }));

//         const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

//         let order = new Order({
//             orderLists: validOrderLists,
//             shippingAddress1: req.body.shippingAddress1,
//             shippingAddress2: req.body.shippingAddress2,
//             city: req.body.city,
//             zip: req.body.zip,
//             country: req.body.country,
//             phone: req.body.phone,
//             status: req.body.status,
//             totalPrice: totalPrice,
//             user: req.body.user,
//         });

//         order = await order.save();

//         if (!order) {
//             return res.status(400).send('The order cannot be created!');
//         }

//         res.send(order);

//     } catch (error) {
//         console.error("Error creating order:", error);
//         res.status(500).send(error.message);
//     }
// });
// ////////////////

router.put('/:id',async (req, res)=> {
    const order = await Order.findByIdAndUpdate(
        req.params.id,
        {
            status: req.body.status
        },
        { new: true}
    )

    if(!order)
    return res.status(400).send('the order cannot be update!')

    res.send(order);
})


router.delete('/:id', (req, res)=>{
    Order.findByIdAndRemove(req.params.id).then(async order =>{
        if(order) {
            await order.orderLists.map(async orderList => {
                await OrderList.findByIdAndRemove(orderList)
            })
            return res.status(200).json({success: true, message: 'the order is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "order not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})

router.get('/get/totalsales', async (req, res)=> {
    const totalSales= await Order.aggregate([
        { $group: { _id: null , totalsales : { $sum : '$totalPrice'}}}
    ])

    if(!totalSales) {
        return res.status(400).send('The order sales cannot be generated')
    }

    res.send({totalsales: totalSales.pop().totalsales})
})

router.get(`/get/count`, async (req, res) => {
    const orderCount = await Order.countDocuments();

    if (!orderCount) {
        res.status(500).json({ success: false });
    }
    res.send({
        orderCount: orderCount
    });
})


router.get(`/get/userorders/:userid`, async (req, res) =>{
    const userOrderList = await Order.find({user: req.params.userid}).populate({ 
        path: 'orderLists', populate: {
            path : 'product', populate: 'category'} 
        }).sort({'dateOrdered': -1});

    if(!userOrderList) {
        res.status(500).json({success: false})
    } 
    res.send(userOrderList);
})



module.exports =router;