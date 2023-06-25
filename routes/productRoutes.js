// Importing necessary modules and dependencies
import express from 'express';
import Product from '../models/productModel.js';
import expressAsyncHandler from 'express-async-handler';

const productRouter = express.Router();
const PAGE_SIZE = 6;

// GET /api/v1/products
// Endpoint for retrieving all products
productRouter.get('/', async (req, res) => {
  // Fetching all products from the database using the Product model
  const products = await Product.find();

  res.send(products);
});

productRouter.get(
  '/categories',
  expressAsyncHandler(async (req, res) => {
    const categories = await Product.find().distinct('category');
    res.send(categories);
  })
);

// GET /api/v1/products/token/:token
// Endpoint for retrieving a product by token
productRouter.get('/token/:token', async (req, res) => {
  // Extracting the token from the request parameters
  const token = req.params.token;

  // Finding a product with the provided token in the database
  const product = await Product.findOne({ token });

  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: 'Product was not found' });
  }
});

productRouter.get(
  '/search',
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const pageSize = query.pageSize || PAGE_SIZE;
    const page = query.page || 1;
    const category = query.category || '';
    const price = query.price || '';
    const rating = query.rating || '';
    const order = query.order || '';
    const searchQuery = query.query || '';

    const queryFilter =
      searchQuery && searchQuery !== 'all'
        ? {
            title: {
              //like 'Contains' in ASP.NET
              $regex: searchQuery,
              //Case-insensitive for Mongo
              $options: 'i',
            },
          }
        : {};
    const categoryFilter = category && category !== 'all' ? { category } : {};
    const ratingFilter =
      rating && rating !== 'all'
        ? { 'rating.rate': { $gte: Number(rating) } }
        : {};
    const priceFilter =
      price && price !== 'all'
        ? {
            price: {
              $gte: Number(price.split('-')[0]),
              $lte: Number(price.split('-')[1]),
            },
          }
        : {};
    const sortOrder =
      order === 'lowest'
        ? { price: 1 }
        : order === 'highest'
        ? { price: -1 }
        : order === 'toprated'
        ? { rating: -1 }
        : order === 'newest'
        ? { createdAt: -1 }
        : { _id: -1 };

    const products = await Product.find({
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    })
      .sort(sortOrder)
      .skip(pageSize * (page - 1))
      .limit(pageSize);

    const countProducts = await Product.countDocuments({
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    });
    res.send({
      products,
      countProducts,
      page,
      pages: Math.ceil(countProducts / pageSize),
    });
  })
);

// GET /api/v1/products/:id
// Endpoint for retrieving a product by ID
productRouter.get('/:id', async (req, res) => {
  // Extracting the ID from the request parameters
  const id = req.params.id;

  // Finding a product with the provided ID in the database
  const product = await Product.findById(id);

  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: 'Product was not found' });
  }
});

export default productRouter;
