const {OrderItem} = require('../models/order-item');
const {Product} = require('../models/product');
const { User } = require('../models/user');
const express = require('express');
const router = express.Router();

// http://localhost:8080/pbl6/orderItem?products=6553cc59c46a1274e138d6d4
// http://localhost:8080/pbl6/orderItem?users=6553b71403d45d46c46a9624
router.get(`/`, async (req, res) => {
    try {
        let filter = {};

        if (req.query.products) {
            filter = { product: req.query.products.split(',') };
        }

        if (req.query.users) {
            filter = { ...filter, user: req.query.users.split(',') };
        }

        const orderItemList = await OrderItem.find(filter)
            .populate({
                path: 'product',
                select: '-image',
            })
            .populate({
                path: 'user',
                select: '-passwordHash -image', // Loại bỏ các trường không mong muốn
            });

        if (!orderItemList || orderItemList.length === 0) {
            return res.status(404).json({ success: false, message: 'No orderItems found' });
        }

        res.status(200).send(orderItemList);
    } catch (error) {
        console.error('Error fetching orderItems:', error);
        res.status(500).json({ success: false, message: 'An error occurred while processing your request' });
    }
});

router.get(`/123`, async (req, res) =>{
    res.send("hello")
})
router.get('/:id', async (req, res) => {
    try {
      const orderItem = await OrderItem.findById(req.params.id);
  
      if (!orderItem) {
        res.status(404).json({ message: 'The orderItem with the given ID was not found.' });
      } else {
        res.status(200).send(orderItem);
      }
    } catch (error) {
      // Xử lý lỗi nếu có
      res.status(500).json({ message: 'An error occurred while processing your request.' });
    }
  });
  
//   router.post('/', async (req, res) => {
//     try {
//       const product = await Product.findById(req.body.product);
//       if (!product) {
//         return res.status(400).send('Invalid product');
//       }
  
//       const user = await User.findById(req.body.user);
//       if (!user) {
//         return res.status(400).send('Invalid User');
//       }
  
//       let orderItem = new OrderItem({
//         product: req.body.product,
//         quantity: req.body.quantity,
//         user: req.body.user,
//       });
  
//       orderItem = await orderItem.save();
  
//       if (!orderItem) {
//         return res.status(400).send('The orderItem cannot be created!');
//       }
  
//       res.send(orderItem);
//     } catch (error) {
//       res.status(500).json({ success: false, error: error.message });
//     }
//   });
router.post('/', async (req, res) => {
    try {
      const product = await Product.findById(req.body.product);
      if (!product) {
        return res.status(400).send('Invalid product');
      }
  
      const user = await User.findById(req.body.user);
      if (!user) {
        return res.status(400).send('Invalid User');
      }
  
      // Kiểm tra xem đã có OrderItem cho user và product chưa
      let existingOrderItem = await OrderItem.findOne({ user: req.body.user, product: req.body.product });
  
      if (existingOrderItem) {
        // Nếu đã tồn tại, tăng quantity lên 1
        existingOrderItem.quantity += 1;
        orderItem = await existingOrderItem.save();
        res.send(orderItem);
      } else {
        // Nếu chưa tồn tại, tạo mới OrderItem
        let orderItem = new OrderItem({
          product: req.body.product,
          quantity: req.body.quantity,
          user: req.body.user,
        });
  
        orderItem = await orderItem.save();
  
        if (!orderItem) {
          return res.status(400).send('The orderItem cannot be created!');
        }
  
        res.send(orderItem);
      }
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
  

router.put('/:id',async (req, res)=> {
    const orderItem = await OrderItem.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            icon: req.body.icon || orderItem.icon
        },
        { new: true}
    )

    if(!orderItem)
    return res.status(400).send('the orderItem cannot be created!')

    res.send(orderItem);
})

router.delete('/:id', (req, res)=>{
    OrderItem.findByIdAndRemove(req.params.id).then(orderItem =>{
        if(orderItem) {
            return res.status(200).json({success: true, message: 'the orderItem is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "orderItem not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})
// router.get(`/get/count`, async (req, res) => {
//     const orderItemCount = await OrderItem.countDocuments();

//     if (!orderItemCount) {
//         res.status(500).json({ success: false });
//     }
//     res.send({
//         orderItemCount: orderItemCount
//     });
// })
router.get(`/get/count`, async (req, res) => {
    try {
        let filter = {};

        if (req.query.products) {
            filter.product = { $in: req.query.products.split(',') };
        }

        if (req.query.users) {
            filter.user = { $in: req.query.users.split(',') };
        }

        const orderItemCount = await OrderItem.countDocuments(filter);

        if (!orderItemCount) {
            return res.status(404).json({ success: false, message: 'No orderItems found' });
        }

        res.send({
            orderItemCount: orderItemCount
        });
    } catch (error) {
        console.error("Error getting order item count:", error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

module.exports =router;