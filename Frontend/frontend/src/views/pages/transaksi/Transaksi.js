
import React, { useState, useEffect, useCallback } from 'react';
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
import Select from 'react-select';
import debounce from 'lodash/debounce';



const TransactionPage = () => {
  const [userName, setUserName] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [formValues, setFormValues] = useState({
    product_code: '',
    product_name: '',
    id_brand: '',    // Tetap simpan id_brand untuk pengiriman ke backend
    brand_name: '',  // Untuk menampilkan nama brand di frontend
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
  const [customerData, setCustomerData] = useState([]);
  const [addVisible, setAddVisible] = useState(false);
  const [formMemberValues, setFormMemberValues] = useState({
    kode_member: '',
    nama: '',
    telepon: '',
    alamat: '',
  });
  const [isNameVisible, setIsNameVisible] = useState(false);
  const [memberOptions, setMemberOptions] = useState([]);
  const token = localStorage.getItem("token");


  // const [brands, setBrands] = useState([]);


  // useEffect(() => {
  //   const fetchBrands = async () => {
  //     try {
  //       const token = localStorage.getItem('token');
  //       const response = await axios.get('http://localhost:3000/api/cashier/brands', {
  //         headers: { Authorization: `${token}` },
  //         withCredentials: true
  //       });
  //       if (Array.isArray(response.data)) {
  //         setBrands(response.data);
  //       } else {
  //         console.error('Data format is not an array:', response.data);
  //         setBrands([]);
  //       }
  //     } catch (error) {
  //       console.error('Error fetching brands:', error.response ? error.response.data : error.message);
  //     }
  //   };
  
  //   fetchBrands();
  // }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get('http://localhost:3000/api/cashier/products',  {
      headers: { Authorization: `${token}` },
      withCredentials: true
    })
      .then(response => {
        setProducts(response.data);
        console.log('PRODUCT', response.data)
      })
      .catch(error => {
        console.error('Error fetching products:', error);
      });

      axios.get('http://localhost:3000/api/cashier/customers',{
        headers: { Authorization: `${token}` },
        withCredentials: true
      })
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

  useEffect(() => {
    const currentDate = new Date().toISOString().slice(0, 10);
    const formattedDate = currentDate.replace(/-/g, '/');
    setTransactionDate(formattedDate);
  }, []);

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
    console.log('Brand Name:', selectedProduct.brand_name);


    if (selectedProduct) {
      if (selectedProduct.stock === 0) {

        showAlert('Produk tidak tersedia. stok habis.', 'danger');

      // Kosongkan form values jika stok 0
      setSelectedProductCode('');
      setFormValues({
        ...formValues,
        product_code: '',
        product_name: '',
        id_brand: '',
        brand_name: '',
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
        id_brand: selectedProduct.id_brand || '',       // Tetap simpan id_brand untuk backend
        brand_name: selectedProduct.brand_name, // Tampilkan brand_name di frontend
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
        id_brand: '',
        brand_name: '',
        type: '',
        price: '',
        stock: '',
        qty: '',
      });
      setAvailableStock('');
      setSelectedProductCode('');
    }
  };

  // fungsi handleMemberSearch dengan debounce
  const handleMemberSearch = useCallback(
    debounce(async (telepon) => {
      if (!telepon) {
        setMemberOptions([]); // kosongkan opsi jika input tidak ada
        setSelectedMember(null);
        setIsNameVisible(false);
        return;
      }

      try {

        const response = await axios.get(`http://localhost:3000/api/cashier/member/${telepon}`,{
          headers: { Authorization: `${token}` },
          withCredentials: true
        });
        if (response.data && response.data.nama) {
          const member = {
            value: response.data.member_id,
            label: response.data.nama
          };
          setMemberOptions([member]); // set opsi dengan member yang ditemukan
          setSelectedMember(member);
          setIsNameVisible(true);

          showAlert('Member terdaftar', 'success');
        } else {
          setMemberOptions([]);
          setSelectedMember(null);
          setIsNameVisible(false);

          showAlert('Member tidak terdaftar', 'danger');
        }
      } catch (error) {
        setMemberOptions([]);
          setSelectedMember(null);
          setIsNameVisible(false);

          showAlert('Member tidak terdaftar', 'danger');
        console.error('Error searching member by phone:', error);
        // showAlert('Terjadi kesalahan saat mencari member', 'danger');
      }
    }, 500), // debounce dengan delay 500ms
    []
  );
  
  const handleInputChange = (e) => {
    const value = e.target.value;
    setMemberSearchInput(value);
    handleMemberSearch(value); // memanggil fungsi handleMemberSearch dengan debounce
  };

  const handleSelectChange = (selectedOption) => {
    setSelectedMember(selectedOption);
    if (selectedOption) {
      showAlert(`Member terpilih: ${selectedOption.label}`, 'success');
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
    const newItem = {
      product_code: formValues.product_code,
      product_name: formValues.product_name,
      id_brand: formValues.id_brand,   // hanya id_brand yang disimpan
      brand_name: formValues.brand_name, // untuk tampilan saja
      type: formValues.type,
      price: formValues.price,
      qty: Number(formValues.qty)
    };

    console.log('NewItem', newItem)

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
      id_brand: '',
      brand_name: '',
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
          member_id: selectedMember ? selectedMember.value : null,
          cashier,
          total,
          payment_method: paymentMethod,
          debit_card_code: paymentMethod === 'debit' && debitCardCode ? debitCardCode : 0,
          payment,
          change,
          items: cartItems.map(item => ({
            product_code: item.product_code,
            product_name: item.product_name,
            id_brand: item.id_brand, // hanya id_brand yang dikirim ke backend
            type: item.type,
            price: item.price,
            qty: item.qty
          }))
        };

        try {
          const token = localStorage.getItem('token');

          const response = await axios.post('http://localhost:3000/api/cashier/transaksi', transactionData, {
            headers: { Authorization: `${token}` },
            withCredentials: true
          });

          console.log('TRANSAKSI RESPONSE DATA', response.data)
          console.log('CEK TRANSACTION ID', response.data.id)
          const transactionId = response.data.id;


          const receiptResponse = await axios.get(`http://localhost:3000/api/generate-receipt/${transactionId}`,  {
            headers: { Authorization: `${token}` },
            withCredentials: true
          });

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

          showAlert('Member berhasil ditambahkan', 'success');
          // setVisible(true);

          setCartItems([]);
          setFormValues({
            product_code: '',
            product_name: '',
            id_brand: '',
            // brand_name: '',
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

    const handleAdd = () => {
      setFormMemberValues({
        nama: '',
        telepon: '',
        alamat:'',
      });
      setAddVisible(true);
    }

    const handleSaveAdd = async () => {
      try {
        const newCustomer = {
          nama: formMemberValues.nama,
          telepon: formMemberValues.telepon,
          alamat: formMemberValues.alamat,
        };

        const response = await axios.post('http://localhost:3000/api/cashier/customers/add', newCustomer, {
          headers: { Authorization: `${token}` },
          withCredentials: true
        });

        showAlert('Member berhasil ditambahkan', 'success');

        setAddVisible(false);

        // setCustomerData((prevCustomers) => [...prevCustomers, response.data]);

      } catch (error) {
        const errorMessage = error.response?.data?.message || 'An error occurred';
        showAlert(errorMessage, 'success');
        setAddVisible(false);

        console.error('Terjadi kesalahan:', error);
      }
    };

  return (
    <div>
      <CRow>
      <div className="mb-3">
      {alert.visible && (
          <CAlert color={alert.color} onClose={() => setAlert({ ...alert, visible: false })} className="w-100">
            {alert.message}
          </CAlert>
        )}
       <div className="d-flex justify-content-between align-items-center">
            <CButton
              color="primary"
              size="sm"
              shape="rounded-pill"
              className="float-end"
              onClick={handleAdd}
            >
              Tambah Member
            </CButton>
          </div>
        </div>
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
                <CFormLabel htmlFor="brand_name">Merk</CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CFormInput id="brand_name" value={formValues.brand_name} readOnly />
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
            <CButton color="info" onClick={addItemToCart}>
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
                      <CTableDataCell>{item.brand_name}</CTableDataCell>
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
                  onChange={handleInputChange}
                  placeholder="Masukkan nomor telepon"
                  // onChange={(e) => setMemberSearchInput(e.target.value)}
                  // onBlur={() => handleMemberSearch(memberSearchInput)}
                  />
                {isNameVisible && (
                  <Select
                  id="member-select"
                  value={selectedMember}
                  onChange={handleSelectChange}
                  options={memberOptions} // Ganti nama opsi di sini
                  placeholder="Pilih member"
                  isClearable
                  isSearchable
                />
                )}
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

      <CModal alignment="center" visible={addVisible} onClose={() => setAddVisible(false)}>
        <CModalHeader>
          <CModalTitle>Tambah Customer</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            {/* <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="kode_member" className="col-form-label">
                  Kode Customers
                </CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CFormInput
                  id="kode_member"
                  type="text"
                  value={selectedCustomer?.kode_member || ''}
                  readOnly
                  plainText
                />
              </CCol>
            </CRow> */}
            <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="nama" className="col-form-label">
                  Nama Customer
                </CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CFormInput
                  id="nama"
                  placeholder="Nama Customer"
                  value={formMemberValues.nama}
                  onChange={(e) => setFormMemberValues({ ...formMemberValues, nama: e.target.value })}
                />
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="telepon" className="col-form-label">
                  Telepon
                </CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CFormInput
                  id="telepon"
                  placeholder="Telepon"
                  value={formMemberValues.telepon}
                  onChange={(e) => setFormMemberValues({ ...formMemberValues, telepon: e.target.value })}
                />
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="alamat" className="col-form-label">
                  Alamat
                </CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CFormInput
                  id="alamat"
                  placeholder="Alamat"
                  value={formMemberValues.alamat}
                  onChange={(e) => setFormMemberValues({ ...formMemberValues, alamat: e.target.value })}
                />
              </CCol>
            </CRow>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setAddVisible(false)}>Close</CButton>
          <CButton color="primary" onClick={handleSaveAdd}>Save changes</CButton>
        </CModalFooter>
      </CModal>

      </CRow>
    </div>
  );
}

export default TransactionPage;

