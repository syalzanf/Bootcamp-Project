import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const TransactionDetail = () => {
    const { transaction_id } = useParams(); // Mendapatkan transaction_id dari URL
    const [transaction, setTransaction] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('Transaction ID:', transaction_id); // Debugging

        if (transaction_id) { // Pastikan transaction_id ada
            axios.get(`http://localhost:3000/api/admin/reportTransaction/${transaction_id}`)
                .then(response => {
                    setTransaction(response.data);
                    setLoading(false);
                })
                .catch(error => {
                    console.error('There was an error fetching the transaction details!', error);
                    setLoading(false);
                });
        } else {
            console.error('Transaction ID is undefined');
            setLoading(false);
        }
    }, [transaction_id]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!transaction) {
        return <div>No transaction found</div>;
    }

    return (
        <div>
            <h2>Transaction Detail</h2>
            <p>Transaction Code: {transaction.transaction_code}</p>
            <p>Date: {new Date(transaction.transaction_date).toLocaleDateString()}</p>
            <p>Member: {transaction.member}</p>
            <p>Cashier: {transaction.cashier}</p>
            <p>Total: {transaction.total}</p>
            <p>Payment: {transaction.payment}</p>
            <p>Change: {transaction.change}</p>

            <h3>Items</h3>
            <table>
                <thead>
                    <tr>
                        <th>Product Code</th>
                        <th>Brand</th>
                        <th>Type</th>
                        <th>Price</th>
                    </tr>
                </thead>
                <tbody>
                    {transaction.items.map((item, index) => (
                        <tr key={index}>
                            <td>{item.product_code}</td>
                            <td>{item.brand}</td>
                            <td>{item.type}</td>
                            <td>{item.price}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TransactionDetail;
