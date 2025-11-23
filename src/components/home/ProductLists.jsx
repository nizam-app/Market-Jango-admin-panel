import React, { useState, useEffect } from "react";
// import { approveProduct, cancelProduct } from "./api"; // Add your API calls here

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    // Fetch all products
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/product");
        const data = await response.json();
        setProducts(data.data);
      } catch (error) {
        console.error("Error fetching products", error);
      }
    };
    fetchProducts();
  }, []);

  const handleApprove = async (productId) => {
    try {
      await approveProduct(productId); // Call your approve API here
      alert("Product Approved!");
      setSelectedProduct(null); // Close modal
    } catch (error) {
      console.error("Error approving product", error);
    }
  };

  const handleCancel = async (productId) => {
    try {
      await cancelProduct(productId); // Call your cancel API here
      alert("Product Canceled!");
      setSelectedProduct(null); // Close modal
    } catch (error) {
      console.error("Error canceling product", error);
    }
  };

  return (
    <div>
      <h1>Product List</h1>
      <div>
        {products.map((product) => (
          <div key={product.id}>
            <img src={product.image} alt={product.name} />
            <p>{product.name}</p>
            <button onClick={() => setSelectedProduct(product)}>View Details</button>
          </div>
        ))}
      </div>

      {selectedProduct && (
        <div className="modal">
          <h2>{selectedProduct.name}</h2>
          <img src={selectedProduct.image} alt={selectedProduct.name} />
          <p>{selectedProduct.description}</p>
          <button onClick={() => handleApprove(selectedProduct.id)}>Approve</button>
          <button onClick={() => handleCancel(selectedProduct.id)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default ProductList;
