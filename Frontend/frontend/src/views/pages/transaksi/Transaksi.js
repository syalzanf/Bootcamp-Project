
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CForm,
  CFormLabel,
  CFormInput,
  CButton,
  CRow,
  CCol,
  CMultiSelect,
  CTable,
  CTableBody,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CTableDataCell,
  CFormSelect
} from '@coreui/react-pro';

const TransactionPage = () => {
  const [userName, setUserName] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [formValues, setFormValues] = useState({
    product_code: '',
    product_name: '',
    brand: '',
    type: '',
    price: '',
    qty: '',
  });
  const [member, setMember] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash'); // Default cash
  const [payment, setPayment] = useState('');
  const [total, setTotal] = useState('');
  const [change, setChange] = useState('');
  const [transactionCode, setTransactionCode] = useState('');
  const [transactionDate, setTransactionDate] = useState('');
  const [debitCardCode, setDebitCardCode] = useState(''); 

  useEffect(() => {
    axios.get('http://localhost:3000/api/cashier/products')
      .then(response => {
        setProducts(response.data);
      })
      .catch(error => {
        console.error('Error fetching products:', error);
      });

    // Ambil nama user dari localStorage
    const storedUserName = localStorage.getItem('userName');
    if (storedUserName) {
      setUserName(storedUserName);
    }
  }, []);


  useEffect(() => {
    if (paymentMethod === 'debit') {
      setPayment(total); 
    }
  }, [paymentMethod, total]);


  const handleProductSelect = (selectedCode) => {
    console.log('Selected Code:', selectedCode);

    const selectedProduct = products.find(product => product.product_code === selectedCode);

    console.log('Selected Product:', selectedProduct);

    if (selectedProduct) {
      setFormValues({
        ...formValues,
        product_code: selectedProduct.product_code,
        product_name: selectedProduct.product_name,
        brand: selectedProduct.brand,
        type: selectedProduct.type,
        price: selectedProduct.price,
        qty: '',
      });
    } else {
      setFormValues({
        ...formValues,
        product_code: '',
        product_name: '',
        brand: '',
        type: '',
        price: '',
        qty: '',
      });
    }
  };

  const handleQtyChange = (e) => {
    const qty = e.target.value;
    setFormValues({
      ...formValues,
      qty: qty,
    });
  };

  const addItemToCart = () => {
    const newItem = { ...formValues, qty: Number(formValues.qty) };
    if (newItem.qty <= 0) {
      alert('Quantity must be greater than 0.');
      return;
    }
    const updatedCart = [...cartItems, newItem];
    setCartItems(updatedCart);
    updateTotal(updatedCart);

    // Reset form values
    setFormValues({
      product_code: '',
      product_name: '',
      brand: '',
      type: '',
      price: '',
      qty: '',
    });
  };

  const removeItemFromCart = (index) => {
    const updatedCart = cartItems.filter((_, i) => i !== index);
    setCartItems(updatedCart);
    updateTotal(updatedCart);
  };

  const updateTotal = (items) => {
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    setTotal(totalAmount);
  };

  useEffect(() => {
    setChange(payment >= total ? payment - total : 0);
  }, [payment, total]);

  const handlePaymentMethodChange = (e) => {
    const method = e.target.value;
    setPaymentMethod(method);
    if (method === 'cash') {
      setPayment(''); 
    }
  };

  const handlePaymentChange = (e) => {
    const value = e.target.value;
    setPayment(value ? Number(value) : '');
  };

  const handleDebitCardCodeChange = (e) => {
    setDebitCardCode(e.target.value);
  };

  const handleSubmitTransaction = async () => {
    const cashier = localStorage.getItem('userName');
    const transactionData = {
      transaction_code: transactionCode,
      id_cashier: localStorage.getItem("id"),
      member_id: member ? member : null,
      cashier,
      total,
      payment_method: paymentMethod,
      debit_card_code: paymentMethod === 'debit' && debitCardCode ? debitCardCode : undefined,
      payment,
      change,
      items: cartItems,
    };

    try {
      const response = await axios.post('http://localhost:3000/api/cashier/transaksi', transactionData);
      alert('Transaksi berhasil dibuat!');

      // Reset form after successful transaction
      setCartItems([]);
      setFormValues({
        product_code: '',
        product_name: '',
        brand: '',
        type: '',
        price: '',
        qty: '',
      });
      setMember('');
      setDebitCardCode('');
      setPaymentMethod('cash'); 
      setPayment('');
      setTotal('');
      setChange('');
    } catch (error) {
      alert('Gagal membuat transaksi: ' + error.message);
    }
  };

  const options = products.map((item) => ({
    value: item.product_code,
    label: `${item.product_code} - ${item.product_name}`,
  }));  

  return (
    <div>
      <CRow>
      <CCol md={6}>
      <CCard>
        <CCardHeader>
          <CCardTitle>Form Transaksi</CCardTitle>
        </CCardHeader>
        <CCardBody>
          <CForm>
            {/* <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="transaction_code">Kode Transaksi</CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CFormInput
                  id="transaction_code"
                  value={transactionCode}
                  readOnly
                  plainText
                />
              </CCol>
            </CRow> */}
            <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="transaction_date">Tanggal</CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CFormInput
                  id="transaction_date"
                  value={transactionDate}
                  readOnly
                  plainText
                />
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="user_name">Kasir</CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CFormInput
                  id="user_name"
                  value={userName}
                  readOnly
                  plainText
                />
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="product_code">Kode Barang</CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CMultiSelect
                  options={options}
                  optionsStyle="text"
                  multiple={false}
                  onChange={(selectedOptions) => handleProductSelect(selectedOptions[0]?.value)} 
                  value={formValues.product_code}
                />
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="product_name">Nama Barang</CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CFormInput id="product_name" value={formValues.product_name} readOnly />
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="brand">Merk</CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CFormInput id="brand" value={formValues.brand} readOnly />
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="type">Tipe</CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CFormInput id="type" value={formValues.type} readOnly />
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="price">Harga</CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CFormInput id="price" value={formValues.price} readOnly />
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="qty">Qty</CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CFormInput
                  id="qty"
                  type="number"
                  value={formValues.qty}
                  onChange={handleQtyChange}
                />
              </CCol>
            </CRow>
            <CButton color="primary" onClick={addItemToCart}>
              Add to Cart
            </CButton>
            </CForm>
            </CCardBody>
          </CCard>
          </CCol>


          <CCol md={6}>
            <CCard>
            <CCardHeader>
              <CCardTitle>Cart Items</CCardTitle>
            </CCardHeader>
            <CCardBody>
              <CTable>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Product Code</CTableHeaderCell>
                    <CTableHeaderCell>Name</CTableHeaderCell>
                    <CTableHeaderCell>Brand</CTableHeaderCell>
                    <CTableHeaderCell>Type</CTableHeaderCell>
                    <CTableHeaderCell>Price</CTableHeaderCell>
                    <CTableHeaderCell>Qty</CTableHeaderCell>
                    <CTableHeaderCell>Subtotal</CTableHeaderCell>
                    <CTableHeaderCell>Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {cartItems.map((item, index) => (
                    <CTableRow key={index}>
                      <CTableDataCell>{item.product_code}</CTableDataCell>
                      <CTableDataCell>{item.product_name}</CTableDataCell>
                      <CTableDataCell>{item.brand}</CTableDataCell>
                      <CTableDataCell>{item.type}</CTableDataCell>
                      <CTableDataCell>{item.price}</CTableDataCell>
                      <CTableDataCell>{item.qty}</CTableDataCell>
                      <CTableDataCell>{item.price * item.qty}</CTableDataCell>
                      <CTableDataCell>
                        <CButton color="danger" onClick={() => removeItemFromCart(index)}>
                          Remove
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>

            <CForm>
            <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="total">Total</CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CFormInput id="total" value={total} readOnly />
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="total">Member</CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CFormInput
                    id="total"
                    value={member}
                    onChange={(e) => setMember(e.target.value)}
                />
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="payment">Payment Method</CFormLabel>
              </CCol>
              <CCol sm={9}>
                    <CFormSelect
                      id="payment_method"
                      value={paymentMethod}
                      onChange={handlePaymentMethodChange}
                    >
                      <option value="cash">Cash</option>
                      <option value="debit">Debit</option>
                    </CFormSelect>
              </CCol>
            </CRow>

            {paymentMethod === 'debit' && (
                  <CRow className="mb-3">
                    <CCol sm={3}>
                      <CFormLabel htmlFor="debit_card_code">Kode Kartu Debit (Opsional)</CFormLabel>
                    </CCol>
                    <CCol sm={9}>
                      <CFormInput
                        id="debit_card_code"
                        value={debitCardCode}
                        onChange={handleDebitCardCodeChange}
                      />
                    </CCol>
                  </CRow>
                )}
            
            <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="payment">Payment</CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CFormInput
                  id="payment"
                  type="text"
                  value={payment}
                  onChange={handlePaymentChange}
                />
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="change">Change</CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CFormInput
                  id="change"
                  value={`Rp. ${change}`}
                  readOnly
                />
              </CCol>
            </CRow>
            <CButton color="success" onClick={handleSubmitTransaction}>
              Submit
            </CButton>
          </CForm>
        </CCardBody>
      </CCard>
          </CCol>
      </CRow>
    </div>
  );
}

export default TransactionPage;


