
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
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
  CCol,
  CMultiSelect,
  CTable,
  CTableBody,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CTableDataCell,
  CFormSelect,
  CAlert

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
    stock: '',
    qty: '',
  });
  const [telepon, setTelepon] = useState('');
  const [members, setMembers] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cash'); // Default cash
  const [payment, setPayment] = useState('');
  const [total, setTotal] = useState('');
  const [change, setChange] = useState('');
  const [transactionCode, setTransactionCode] = useState('');
  const [transactionDate, setTransactionDate] = useState('');
  const [debitCardCode, setDebitCardCode] = useState('');
  const [availableStock, setAvailableStock] = useState('');
  const [selectedProductCode, setSelectedProductCode] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [memberSearchInput, setMemberSearchInput] = useState('');

  const [visible, setVisible] = useState(false);
  const [alert, setAlert] = useState({ visible: false, message: '', color: '' });


  useEffect(() => {
    axios.get('http://localhost:3000/api/cashier/products')
      .then(response => {
        setProducts(response.data);
      })
      .catch(error => {
        console.error('Error fetching products:', error);
      });

      axios.get('http://localhost:3000/api/cashier/customers')
      .then(response => {
        setMembers(response.data); // simpan data member di state
      })
      .catch(error => {
        console.error('Error fetching members:', error);
      });


    // ambil nama user dari localStorage
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

  const showAlert = (message, color) => {
    setAlert({
      visible: true,
      message,
      color
    });
    setTimeout(() => {
      setAlert(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  const handleProductSelect = (selectedCode) => {
    console.log('Selected Code:', selectedCode);

    const selectedProduct = products.find(product => product.product_code === selectedCode);

    console.log('Selected Product:', selectedProduct);

    if (selectedProduct) {
      if (selectedProduct.stock === 0) {

        showAlert('Produk tidak tersedia. stok habis.', 'danger');

      // Kosongkan form values jika stok 0
      setSelectedProductCode('');
      setFormValues({
        ...formValues,
        product_code: '',
        product_name: '',
        brand: '',
        type: '',
        price: '',
        stock: '',
        qty: '',
      });

   } else {

      setFormValues({
        ...formValues,
        product_code: selectedProduct.product_code,
        product_name: selectedProduct.product_name,
        brand: selectedProduct.brand,
        type: selectedProduct.type,
        price: selectedProduct.price,
        stock: selectedProduct.stock,
        qty: '',
      });
      setAvailableStock(selectedProduct.stock);
      setSelectedProductCode(selectedProduct.product_code);
    }

  } else {
      // kosongkan form values jika produk tidak ditemukan
      setFormValues({
        ...formValues,
        product_code: '',
        product_name: '',
        brand: '',
        type: '',
        price: '',
        stock: '',
        qty: '',
      });
      setAvailableStock('');
      setSelectedProductCode('');
    }
  };

  const handleMemberSearch = async (telepon) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/cashier/member/${telepon}`);
      const member = response.data.nama;
      const memberId = response.data.member_id;

      setSelectedMember(member);
      setSelectedMemberId(memberId);
      
      showAlert('Member ditemukan', 'success');
      console.log('MEMBER', response.data.member_id )

    } catch (error) {
      console.error('Error searching member by phone:', error);
      showAlert('Member tidak ditemukan', 'danger');
    }
  };

  const handleQtyChange = (e) => {
    const inputQty = e.target.value;

    if (inputQty > availableStock) {
      showAlert('Stok tidak muncukupi!', 'danger');
      setFormValues({
        ...formValues,
        qty: '',
      });
    } else {
      setFormValues({
        ...formValues,
        qty: inputQty,
      });
    }
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
        // member_id: member ? member : null,
        member_id: selectedMemberId ? selectedMemberId : null,
        cashier,
        total,
        payment_method: paymentMethod,
        debit_card_code: paymentMethod === 'debit' && debitCardCode ? debitCardCode : 0,
        payment,
        change,
        items: cartItems,
      };

      try {
        const response = await axios.post('http://localhost:3000/api/cashier/transaksi', transactionData);

        console.log('TRANSAKSI RESPONSE DATA', response.data)
        console.log('CEK TRANSACTION ID', response.data.id)
        const transactionId = response.data.id;


        const receiptResponse = await axios.get(`http://localhost:3000/api/generate-receipt/${transactionId}`);

        var file = base64ToBlob(receiptResponse.data.base64, "application/pdf")
        var fileURL = URL.createObjectURL(file);
        const printWindow = window.open(fileURL);
        if (printWindow) {
          printWindow.onload = () => {
              printWindow.print();
          };
        }

        // Clean up the Blob URL after printing
        // URL.revokeObjectURL(blobUrl);

        setVisible(true);

        setCartItems([]);
        setFormValues({
          product_code: '',
          product_name: '',
          brand: '',
          type: '',
          price: '',
          qty: '',
        });
        setSelectedMember(null);
        // setMemberSearchInput('');
        // setMembers('');
        setDebitCardCode('');
        setPaymentMethod('cash');
        setPayment('');
        setTotal('');
        setChange('');

        // if (printWindow) {
        //   printWindow.print();
        // }
      } catch (error) {
        alert('Gagal membuat transaksi: ' + error.message);
      }
    };

  function base64ToBlob(base64String, contentType) {
    const byteCharacters = atob(base64String);  
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
}



    const options = products.map((item) => ({
      value: item.product_code,
      label: `${item.product_code} - ${item.product_name}`,
    }));

  return (
    <div>
      <CRow>
      {alert.visible && (
          <CAlert color={alert.color} onClose={() => setAlert({ ...alert, visible: false })} className="w-100">
            {alert.message}
          </CAlert>
        )}
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
                  value={selectedProductCode}
                  // value={formValues.product_code}
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
                <CFormLabel htmlFor="member-telepon">Member</CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CFormInput
                  id="member-telepon"
                  type="text"
                  value={memberSearchInput}
                  onChange={(e) => setMemberSearchInput(e.target.value)}
                  onBlur={() => handleMemberSearch(memberSearchInput)} 
                  />
              {/* <CFormInput
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  readOnly
                /> */}
              <CFormInput
                  value={selectedMember}
                  onChange={(e) => setSelectedMember(e.target.value)}
                  readOnly
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
                      <CFormLabel htmlFor="debit_card_code">Kode Kartu Debit</CFormLabel>
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

          {/* {receipt && ( */}
          <CModal visible={visible} onClose={() => setVisible(false)} size="lg">
            <CModalHeader>
              <CModalTitle>Transaksi Berhasil</CModalTitle>
            </CModalHeader>
            <CModalBody>
              <p>Transaksi Anda telah berhasil dilakukan.</p>
            </CModalBody>
            <CModalFooter>
              <CButton color="secondary" onClick={() => setVisible(false)}>Tutup</CButton>
            </CModalFooter>
          </CModal>
      {/* )} */}

      </CRow>
    </div>
  );
}

export default TransactionPage;

