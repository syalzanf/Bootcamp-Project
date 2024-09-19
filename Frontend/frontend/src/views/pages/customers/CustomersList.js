import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CSmartTable,
} from '@coreui/react-pro';

  const CustomerList = () => {
  const [customerData, setCustomerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/customers', {
        headers: { Authorization: `${token}` },
        withCredentials: true
      });
      if (Array.isArray(response.data)) {
        setCustomerData(response.data);

      } else {
        console.error('Data format is not an array:', response.data);
        setCustomerData([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error.response ? error.response.data : error.message);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="pt-3 text-center">Loading...</div>;
  }

  if (error) {
    return <div className="pt-3 text-center">Error: {error.message}</div>;
  }

  const columns = [
    { key: 'kode_member', label: 'Customer Code' },
    { key: 'nama', label: 'Customer Name' },
    { key: 'telepon', label: 'Phone' },
    { key: 'alamat', label: 'Address' },
  ];

  return (
    <CRow>
      <CCol>
        <CCard>
          <CCardHeader>
            Customers Data
          </CCardHeader>
          <CCardBody>
          <CSmartTable
              clickableRows
              tableProps={{
                striped: true,
                hover: true
              }}
              columns={columns}
              items={customerData}
              columnFilter
              tableFilter
              cleaner
              itemsPerPageSelect
              itemsPerPage={5}
              columnSorter
              pagination
              
            />
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default CustomerList;
