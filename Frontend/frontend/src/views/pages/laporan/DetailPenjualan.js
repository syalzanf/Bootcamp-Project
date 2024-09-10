import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const TransactionDetail = ({ transactions }) => {
  const location = useLocation();

  const { transactionCode } = useParams();
  const [transaction, setTransaction] = useState(null);

  useEffect(() => {
    // Cari transaksi berdasarkan transaction_code
    const foundTransaction = transactions.find(
      (t) => t.transaction_code === transactionCode
    );
    setTransaction(foundTransaction);
  }, [transactionCode, transactions]);

  if (!transaction) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h2>Transaction Detail for {transactionCode}</h2>
      <p>Date: {new Date(transaction.transaction_date).toLocaleDateString()}</p>
      <p>Member: {transaction.member}</p>
      <p>Cashier: {transaction.cashier}</p>
      <p>Total: {transaction.total}</p>
      <p>Payment: {transaction.payment}</p>
      <p>Change: {transaction.change}</p>
      <h3>Items:</h3>
      <ul>
        {transaction.items.map((item, index) => (
          <li key={index}>
            {item.product_name} - {item.qty} x {item.price}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TransactionDetail;
