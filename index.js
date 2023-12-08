const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv/config');
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');

app.use(cors());
app.options('*', cors())
// Middleware
app.use(express.json()); // Sử dụng express.json() để xử lý JSON
app.use(morgan('tiny'));
app.use(authJwt());
app.use(errorHandler);
//Routes
const productsRoutes = require('./routers/products');
const categorysRoutes = require('./routers/category');
const usersRoutes = require('./routers/user');
const shippersRoutes = require('./routers/shipper');
const orderItemRoutes = require('./routers/order-item');
const ordersRoutes = require('./routers/orders');
const ratesRoutes = require('./routers/rated'); 
const authRouter = require('./routers/authRouter');
// const vnPayRouter = require('./routers/vnPay');
const homeRoute = require('./routers/home');  // Thêm route mới

const api = process.env.API_URL;
app.use(`${api}/product`, productsRoutes);
app.use(`${api}/category`, categorysRoutes);
app.use(`${api}/user`, usersRoutes);
app.use(`${api}/shipper`, shippersRoutes);
app.use(`${api}/order`, ordersRoutes);
app.use(`${api}/orderItem`, orderItemRoutes);
app.use(`${api}/rated`, ratesRoutes);
app.use(`${api}/auth`, authRouter);
// app.use(`${api}/vnpay`, vnPayRouter);
app.use('/', homeRoute);  // Sử dụng route mới tại "/"
// Kết nối với cơ sở dữ liệu
mongoose.connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'edatabase'
})
    .then(() => {
        console.log('Database Connection is ready...');
    })
    .catch((err) => {
        console.error(err);
    });

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
