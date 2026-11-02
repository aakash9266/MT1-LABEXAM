import express from "express";

const app = express();

// Middleware to read JSON data
app.use(express.json());

// Shopping cart array with 3 sample products
let cart = [
  {
    id: 1,
    productName: "Wireless Mouse",
    price: 799,
    quantity: 2,
    category: "Electronics",
  },
  {
    id: 2,
    productName: "Keyboard",
    price: 1499,
    quantity: 1,
    category: "Electronics",
  },
  {
    id: 3,
    productName: "Laptop",
    price: 50000,
    quantity: 1,
    category: "Computers",
  },
];

// 1. GET - Retrieve all cart items
app.get("/cart", (req, res) => {
  res.status(200).json(cart);
});

// 2. GET - Retrieve product by ID
app.get("/cart/:id", (req, res) => {
  const id = Number(req.params.id);

  const product = cart.find((item) => item.id === id);

  if (!product) {
    return res.status(404).json({
      message: "Product not found",
    });
  }

  res.status(200).json({
    product: product,
    totalPrice: product.price * product.quantity,
  });
});

// 3. POST - Add new product
app.post("/cart", (req, res) => {
  const { id, productName, price, quantity, category } = req.body;

  // Validate product details
  if (
    id == null ||
    !productName ||
    typeof price !== "number" ||
    typeof quantity !== "number" ||
    price < 0 ||
    quantity <= 0
  ) {
    return res.status(400).json({
      message: "Please provide valid product details",
    });
  }

  // Check duplicate ID
  if (cart.some((item) => item.id === id)) {
    return res.status(400).json({
      message: "Product ID already exists",
    });
  }

  const newProduct = {
    id,
    productName,
    price,
    quantity,
    category: category || "General",
  };

  cart.push(newProduct);

  res.status(201).json({
    message: "Product added successfully",
    product: newProduct,
  });
});

// 4. PUT - Update product
app.put("/cart/:id", (req, res) => {
  const id = Number(req.params.id);

  const product = cart.find((item) => item.id === id);

  if (!product) {
    return res.status(404).json({
      message: "Product not found",
    });
  }

  const { productName, price, quantity, category } = req.body;

  if (
    !productName ||
    typeof price !== "number" ||
    typeof quantity !== "number" ||
    price < 0 ||
    quantity <= 0
  ) {
    return res.status(400).json({
      message: "Invalid product details",
    });
  }

  // Update product details
  product.productName = productName;
  product.price = price;
  product.quantity = quantity;
  product.category = category || product.category;

  res.status(200).json({
    message: "Product updated successfully",
    product: product,
    totalPrice: product.price * product.quantity,
  });
});

// 5. DELETE - Remove product
app.delete("/cart/:id", (req, res) => {
  const id = Number(req.params.id);

  const index = cart.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({
      message: "Product not found",
    });
  }

  const deletedProduct = cart.splice(index, 1);

  res.status(200).json({
    message: "Product deleted successfully",
    product: deletedProduct[0],
  });
});

// Handle invalid routes
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

// Handle invalid JSON and other errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400) {
    return res.status(400).json({
      message: "Invalid JSON format",
    });
  }

  res.status(500).json({
    message: "Internal Server Error",
  });
});

// Start Express server
app.listen(4000, () => {
  console.log("Express Server running at http://localhost:4000");
});
