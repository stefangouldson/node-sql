const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./util/database');

const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart')
const CartItem = require('./models/cart-item')

const app = express();

// App Setting
app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// user
app.use((req, res, next) => {
  User.findByPk(1)
  .then(user => {
    req.user = user;
    next();
  }).catch(err => console.error(err));  
})

// Controllers/Routes
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const errorController = require('./controllers/error');

// Use Routes
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(errorController.get404);

Product.belongsTo(User, {constraints: true, onDelete: 'CASCADE'});
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });

// Sync Database
sequelize.sync()
.then(result => {
    return User.findByPk(1);
}).then(user => {
    if(!user){
        return User.create({ name: 'stefan', email:'stefangouldson@gmail.com' })
    }
    return user
}).then(user => {
    // console.log(user);
    return user.createCart()
  }).then(cart => {
    app.listen(3000);
  }).catch(err => console.error(err));

