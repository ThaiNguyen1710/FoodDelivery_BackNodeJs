const {Product} = require('../models/product');
const express = require('express');
const { Category } = require('../models/category');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');

// const FILE_TYPE_MAP = {
//     'image/png': 'png',
//     'image/jpeg': 'jpeg',
//     'image/jpg': 'jpg',
//     'image/webp': 'webp'
// }

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         const isValid = FILE_TYPE_MAP[file.mimetype];
//         let uploadError = new Error('invalid image type');

//         if(isValid) {
//             uploadError = null
//         }
//       cb(uploadError, 'public/uploads')
//     },
//     filename: function (req, file, cb) {
        
//       const fileName = file.originalname.split(' ').join('-');
//       const extension = FILE_TYPE_MAP[file.mimetype];
//       cb(null, `${fileName}-${Date.now()}.${extension}`)
//     }
//   })
  
// const uploadOptions = multer({ storage: storage })

const FILE_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
  'image/webp': 'webp'
}

const storage = multer.memoryStorage(); // Sử dụng memory storage để không lưu file lên đĩa
const uploadOptions = multer({ storage: storage });

// http://localhost:8080/pbl6/products?categories=655087bce2f73b63aebfaad8
router.get(`/`, async (req, res) => {
  try {
      let filter = {};
      if (req.query.categories) {
          filter = { category: req.query.categories.split(',') };
      }

      const productList = await Product.find(filter).populate('category');

      if (!productList || productList.length === 0) {
          return res.status(404).json({ success: false, message: 'No products found' });
      }

      const formattedProductList = productList.map(product => {
          return {
              id: product.id,
              name: product.name,
              description: product.description,
              image: product.image ? `/pbl6/products/image/${product.id}` : null, // Đường dẫn đến route mới
              images: product.images.map(image => `/pbl6/products//gallery/${product.id}/images/${image.id}`),
              brand: product.brand,
              price: product.price,
              category: product.category,
              rating: product.rating,
              numRated: product.numRated,
              isFeatured: product.isFeatured,
          };
      });

      res.send(formattedProductList);
  } catch (error) {
      res.status(500).json({ success: false, message: 'An error occurred while processing your request' });
  }
});
  
router.get(`/:id`, async (req, res) => {
  try {
      const product = await Product.findById(req.params.id).populate('category');

      if (!product) {
          return res.status(404).json({ success: false, message: 'Product not found' });
      }

      // Lấy định dạng hình ảnh từ trường image của sản phẩm
      const formattedProduct = {
          id: product.id,
          name: product.name,
          description: product.description,
          image: product.image ? `/pbl6/products/image/${product.id}` : null, // Đường dẫn đến route mới
          images: product.images.map(image => `/pbl6/products//gallery/${product.id}/images/${image.id}`),
          brand: product.brand,
          price: product.price,
          category: product.category,
          rating: product.rating,
          numRated: product.numRated,
          isFeatured: product.isFeatured,
      };

      res.send(formattedProduct);
  } catch (error) {
      // Xử lý lỗi nếu có
      res.status(500).json({ success: false, message: 'An error occurred while processing your request' });
  }
});

router.post(`/`, uploadOptions.single('image'), async (req, res) => {
  try {
      const category = await Category.findById(req.body.category);
      if (!category) return res.status(400).send('Invalid Category');

      const file = req.file;
      if (!file) return res.status(400).send('No image in the request');

      const isValid = FILE_TYPE_MAP[file.mimetype];
      if (!isValid) {
          return res.status(400).send('Invalid image type');
      }

      const image = {
          data: file.buffer, // Sử dụng dữ liệu buffer thay vì đọc từ đĩa
          contentType: file.mimetype
      };

      const product = new Product({
          name: req.body.name,
          description: req.body.description,
          image: image,
          brand: req.body.brand,
          price: req.body.price,
          category: req.body.category,
          numRated: req.body.numRated,
          isFeatured: req.body.isFeatured,
      });

      await product.save();

      res.send("added product");
  } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).send('Internal Server Error');
  }
});


router.put('/:id', async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Product Id');
      }
  
      const category = await Category.findById(req.body.category);
      if (!category) {
        return res.status(400).send('Invalid Category');
      }
  
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
          name: req.body.name,
          description: req.body.description,
          image: req.body.image,
          brand: req.body.brand,
          price: req.body.price,
          category: req.body.category,
          rating: req.body.rating,
          numRated: req.body.numRated,
          isFeatured: req.body.isFeatured,
        },
        { new: true }
      );
  
      if (!product) {
        return res.status(500).send('The product cannot be updated');
      }
  
      // res.send(product);
      res.send("update success");
    } catch (error) {
      // Xử lý lỗi nếu có
      res.status(500).send('An error occurred while processing your request');
    }
  });
  
router.delete('/:id', async (req, res) => {
    try {
      const product = await Product.findByIdAndRemove(req.params.id);
      if (product) {
        return res.status(200).json({ success: true, message: 'The product is deleted' });
      } else {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
    } catch (error) {
      // Xử lý lỗi nếu có
      res.status(500).json({ success: false, error: error });
    }
  });
  

  router.get(`/get/count`, async (req, res) => {
    const productCount = await Product.countDocuments();

    if (!productCount) {
        res.status(500).json({ success: false });
    }
    res.send({
        productCount: productCount
    });
})


router.get(`/get/featured/:count`, async (req, res) => {
    const count = req.params.count || 0;
    const products = await Product.find({ isFeatured: true }).limit(parseInt(count));

    if (products && products.length > 0) {
        res.send(products);
    } else {
        res.status(404).json({ success: false, message: 'No featured products found' });
    }
});

router.put(
  '/gallery/:id',
  uploadOptions.array('images', 10),
  async (req, res) => {
      try {
          if (!mongoose.isValidObjectId(req.params.id)) {
              return res.status(400).send('Invalid Product Id');
          }

          const files = req.files;
          let images = [];

          if (files) {
              // Bổ sung kiểm tra định dạng ở đây
              const isValidFormat = files.every(file => {
                  return FILE_TYPE_MAP[file.mimetype];
              });

              if (!isValidFormat) {
                  // Nếu một hoặc nhiều file có định dạng không hợp lệ
                  return res.status(400).send('Invalid image format');
              }

              images = files.map(file => {
                  return {
                    data: file.buffer, // Sử dụng dữ liệu buffer thay vì đọc từ đĩa
                    contentType: file.mimetype
                  };
              });
          }

          const product = await Product.findByIdAndUpdate(
              req.params.id,
              {
                  $push: { images: { $each: images } }
              },
              { new: true }
          );

          if (!product) {
              return res.status(500).send('The gallery cannot be updated!');
          }

          // Xóa tệp ảnh sau khi đã lưu vào MongoDB (nếu bạn không muốn giữ lại)
          // files.forEach(file => {
          //     fs.unlinkSync(file.path);
          // });

          res.send("Add images success");
      } catch (error) {
          // Xử lý ngoại lệ và trả về một phản hồi lỗi
          console.error('Error updating gallery:', error);
          res.status(500).send('Internal Server Error');
      }
  }
);


router.get('/image/:id', async (req, res) => {
  try {
      const product = await Product.findById(req.params.id);

      if (!product || !product.image) {
          return res.status(404).json({ success: false, message: 'Image not found' });
      }

      // Đặt loại nội dung và gửi dữ liệu hình ảnh
      res.contentType(product.image.contentType);
      res.send(product.image.data);
  } catch (error) {
      console.error('Error retrieving image:', error);
      res.status(500).send('Internal Server Error');
  }
});
router.get('/gallery/:productId/images/:imageId', async (req, res) => {
  try {
      const productId = req.params.productId;
      const imageId = req.params.imageId;

      const product = await Product.findById(productId);

      if (!product) {
          return res.status(404).send('Product not found');
      }

      const image = product.images.id(imageId);

      if (!image) {
          return res.status(404).send('Image not found');
      }

      res.set('Content-Type', image.contentType);
      res.send(image.data);
  } catch (error) {
      console.error('Error getting image:', error);
      res.status(500).send('Internal Server Error');
  }
});
module.exports =router;