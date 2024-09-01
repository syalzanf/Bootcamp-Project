import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TransactionPage = () => {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [cart, setCart] = useState([]);
    const [total, setTotal] = useState(0);
    const [payment, setPayment] = useState(0);
    const [change, setChange] = useState(0);
    const [memberId, setMemberId] = useState(null);

    useEffect(() => {
        // Fetch products for the select dropdown
        const fetchProducts = async () => {
            try {
                const response = await axios.get('/api/products');
                setProducts(response.data);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };
        fetchProducts();
    }, []);

    const handleProductSelect = async (query) => {
        try {
            const response = await axios.get(`/api/products/${query}`);
            setSelectedProduct(response.data);
        } catch (error) {
            console.error('Error fetching product details:', error);
        }
    };

    const addItemToCart = () => {
        if (selectedProduct) {
            const item = {
                product_code: selectedProduct.product_code,
                name: selectedProduct.name,
                brand: selectedProduct.brand,
                type: selectedProduct.type,
                price: selectedProduct.price,
                image: selectedProduct.image,
                quantity: 1,
            };

            setCart([...cart, item]);
            setTotal(total + item.price);
            setSelectedProduct(null);
        }
    };

    const handlePaymentChange = (e) => {
        const paymentValue = parseFloat(e.target.value);
        setPayment(paymentValue);
        setChange(paymentValue - total);
    };

    const handleSubmitTransaction = async () => {
        const transactionData = {
            transaction_code: `TRX-${Date.now()}`,
            member_id: memberId,
            cashier: 'Cashier Name', // Replace with actual cashier name
            total,
            payment,
            change,
            items: cart,
        };

        try {
            const response = await axios.post('/api/cashier/transaksi', transactionData);
            alert('Transaction successful');
            // Reset the form after successful transaction
            setCart([]);
            setTotal(0);
            setPayment(0);
            setChange(0);
            setMemberId(null);
            // Optionally print the receipt
            console.log('Receipt:', response.data);
        } catch (error) {
            console.error('Error creating transaction:', error);
            alert('Transaction failed');
        }
    };

    return (
        <div className="container">
            <div className="row">
                {/* Left Side - Add Item Form */}
                <div className="col-md-6">
                    <h4>Add Item to Cart</h4>
                    <div className="form-group">
                        <label>Filter by Code or Name</label>
                        <select className="form-control" onChange={(e) => handleProductSelect(e.target.value)}>
                            <option value="">Select a product...</option>
                            {products.map((product) => (
                                <option key={product.product_code} value={product.product_code}>
                                    {product.product_code} - {product.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedProduct && (
                        <div>
                            <h5>Product Details</h5>
                            <p>Brand: {selectedProduct.brand}</p>
                            <p>Type: {selectedProduct.type}</p>
                            <p>Price: ${selectedProduct.price}</p>
                            <img src={selectedProduct.image} alt={selectedProduct.name} style={{ width: '100px' }} />
                            <button className="btn btn-primary mt-3" onClick={addItemToCart}>Add to Cart</button>
                        </div>
                    )}
                </div>

                {/* Right Side - Cart and Payment */}
                <div className="col-md-6">
                    <h4>Cart</h4>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Product Code</th>
                                <th>Name</th>
                                <th>Brand</th>
                                <th>Type</th>
                                <th>Price</th>
                                <th>Quantity</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cart.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.product_code}</td>
                                    <td>{item.name}</td>
                                    <td>{item.brand}</td>
                                    <td>{item.type}</td>
                                    <td>${item.price}</td>
                                    <td>{item.quantity}</td>
                                    <td>${item.price * item.quantity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <h4>Total: ${total}</h4>

                    <div className="form-group">
                        <label>Member ID (Optional)</label>
                        <input
                            type="text"
                            className="form-control"
                            value={memberId || ''}
                            onChange={(e) => setMemberId(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Payment</label>
                        <input
                            type="number"
                            className="form-control"
                            value={payment}
                            onChange={handlePaymentChange}
                        />
                    </div>
                    <h4>Change: ${change}</h4>

                    <button className="btn btn-success mt-3" onClick={handleSubmitTransaction}>Submit Transaction</button>
                </div>
            </div>
        </div>
    );
};

export default TransactionPage;
