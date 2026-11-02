import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let cart = [
  { id: 1, productName: "Laptop", price: 50000, quantity: 1 },
  { id: 2, productName: "Mouse", price: 799, quantity: 2 },
  { id: 3, productName: "Keyboard", price: 1499, quantity: 1 },
];

function sendResponse(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}

function getBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });

    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  const pathname = url.pathname;

  // GET /
  if (req.method === "GET" && pathname === "/") {
    res.setHeader("Content-Type", "text/html");
    res.end("<h1>Welcome to Shopping Cart Application</h1>");
  }

  // GET /cart
  else if (req.method === "GET" && pathname === "/cart") {
    sendResponse(res, 200, cart);
  }

  // GET /cart/:id
  else if (req.method === "GET" && /^\/cart\/\d+$/.test(pathname)) {
    const id = Number(pathname.split("/")[2]);
    const product = cart.find((p) => p.id === id);

    if (!product) {
      sendResponse(res, 404, { message: "Product not found" });
    } else {
      sendResponse(res, 200, product);
    }
  }

  // GET /about
  else if (req.method === "GET" && pathname === "/about") {
    res.setHeader("Content-Type", "text/plain");
    res.end("This is a Shopping Cart Management Application.");
  }

  // GET /home
  else if (req.method === "GET" && pathname === "/home") {
    const filePath = path.join(__dirname, "public", "index.html");

    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.end("Error reading HTML file");
      } else {
        res.setHeader("Content-Type", "text/html");
        res.end(data);
      }
    });
  }

  // POST /cart - Add Product
  else if (req.method === "POST" && pathname === "/cart") {
    try {
      const product = await getBody(req);

      if (
        !Number.isInteger(product.id) ||
        !product.productName ||
        typeof product.price !== "number" ||
        typeof product.quantity !== "number" ||
        product.price < 0 ||
        product.quantity <= 0
      ) {
        return sendResponse(res, 400, {
          message: "Please provide valid product details",
        });
      }

      const exists = cart.find((p) => p.id === product.id);

      if (exists) {
        return sendResponse(res, 400, {
          message: "Product ID already exists",
        });
      }

      cart.push(product);

      sendResponse(res, 201, {
        message: "Product added successfully",
        product,
      });
    } catch {
      sendResponse(res, 400, { message: "Invalid JSON data" });
    }
  }

  // PUT /cart/:id - Update Product
  else if (req.method === "PUT" && /^\/cart\/\d+$/.test(pathname)) {
    try {
      const id = Number(pathname.split("/")[2]);
      const index = cart.findIndex((p) => p.id === id);

      if (index === -1) {
        return sendResponse(res, 404, {
          message: "Product not found",
        });
      }

      const updates = await getBody(req);

      const updatedProduct = {
        ...cart[index],
        ...updates,
        id,
      };

      if (
        !updatedProduct.productName ||
        typeof updatedProduct.price !== "number" ||
        typeof updatedProduct.quantity !== "number" ||
        updatedProduct.price < 0 ||
        updatedProduct.quantity <= 0
      ) {
        return sendResponse(res, 400, {
          message: "Please provide valid product details",
        });
      }

      cart[index] = updatedProduct;

      sendResponse(res, 200, {
        message: "Product updated successfully",
        product: updatedProduct,
      });
    } catch {
      sendResponse(res, 400, { message: "Invalid JSON data" });
    }
  }

  // DELETE /cart/:id - Remove Product
  else if (req.method === "DELETE" && /^\/cart\/\d+$/.test(pathname)) {
    const id = Number(pathname.split("/")[2]);
    const index = cart.findIndex((p) => p.id === id);

    if (index === -1) {
      return sendResponse(res, 404, {
        message: "Product not found",
      });
    }

    const deletedProduct = cart.splice(index, 1)[0];

    sendResponse(res, 200, {
      message: "Product removed successfully",
      product: deletedProduct,
    });
  }

  // Invalid route
  else {
    sendResponse(res, 404, { message: "Route not found" });
  }
});

server.listen(3000, () => {
  console.log("HTTP Server running at http://localhost:3000");
});
