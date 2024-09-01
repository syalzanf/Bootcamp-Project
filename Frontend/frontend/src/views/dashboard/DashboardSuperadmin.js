import React from 'react';
import { CCard, CCardBody, CCardHeader, CCol, CRow } from '@coreui/react';

const SuperAdminDashboard = () => {
  return (
    <CRow>
      <CCol>
        <CCard>
          <CCardHeader>
            SuperAdmin Dashboard
          </CCardHeader>
          <CCardBody>
            {/* Tambahkan konten dashboard superadmin di sini */}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default SuperAdminDashboard;
