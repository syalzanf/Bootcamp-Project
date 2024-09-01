import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TransactionReport = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {

              const token = localStorage.getItem('token');

                const response = await axios.get('http://localhost:3000/api/admin/reportTransactions',  {
                  headers: { Authorization: `${token}` },
                  withCredentials: true
                });
                setTransactions(response.data);
            } catch (err) {
                setError('Error fetching transactions');
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <h1>Laporan Pen</h1>
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Transaction Code</th>
                        <th>Customer</th>
                        <th>Cashier</th>
                        <th>Total</th>
                        <th>Payment</th>
                        <th>Change</th>
                        <th>Items</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((transaction) => (
                        <tr key={transaction.transaction_code}>
                            <td>{new Date(transaction.transaction_date).toLocaleDateString()}</td>
                            <td>{transaction.transaction_code}</td>
                            <td>{transaction.member}</td>
                            <td>{transaction.cashier}</td>
                            <td>{transaction.total}</td>
                            <td>{transaction.payment}</td>
                            <td>{transaction.change}</td>
                            {/* <td>{JSON.stringify(transaction.items)}</td> */}
                            <td>
                            <ul>
                                {transaction.items.map((item, index) => (
                                    <li key={index}>
                                        {item.product_code} - {item.product_name} - {item.quantity} @ {item.price}
                                    </li>
                                ))}
                            </ul>
                        </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TransactionReport;
