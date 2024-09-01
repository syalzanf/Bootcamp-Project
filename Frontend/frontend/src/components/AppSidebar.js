import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';

import {
  CCloseButton,
  CSidebar,
  CSidebarBrand,
  CSidebarFooter,
  CSidebarHeader,
  CSidebarToggler,
} from '@coreui/react-pro';
import CIcon from '@coreui/icons-react';

import { AppSidebarNav } from './AppSidebarNav';
import { logo } from 'src/assets/brand/logo';
import { sygnet } from 'src/assets/brand/sygnet';

// Import nav configurations
import { _navAdmin, _navCashier, _navSuperadmin } from '../_nav';

const AppSidebar = () => {
  const dispatch = useDispatch();
  const unfoldable = useSelector((state) => state.sidebarUnfoldable);
  const sidebarShow = useSelector((state) => state.sidebarShow);
  const [navigation, setNavigation] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userRole = localStorage.getItem('userRole');
        // Set navigation based on user role
        switch (userRole) {
          case 'admin':
            setNavigation(_navAdmin);
            break;
          case 'cashier':
            setNavigation(_navCashier);
            break;
          case 'superadmin':
            setNavigation(_navSuperadmin);
            break;
          default:
            setNavigation([]);
            console.error('Unknown user role:', userRole);
            break;
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setNavigation([]); // Handle error by showing no navigation
      }
    };

    if (token) {
      fetchUser();
    }
  }, [token]);

  return (
    <CSidebar
      className="border-end"
      colorScheme="light"
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => {
        dispatch({ type: 'set', sidebarShow: visible });
      }}
    >
      <CSidebarHeader className="border-bottom">
        <CSidebarBrand as={NavLink} to="/">
          <CIcon customClassName="sidebar-brand-narrow" icon={sygnet} height={32} />
        </CSidebarBrand>
        <CCloseButton
          className="d-lg-none"
          onClick={() => dispatch({ type: 'set', sidebarShow: false })}
        />
      </CSidebarHeader>
      <AppSidebarNav items={navigation} />
      <CSidebarFooter className="border-top d-none d-lg-flex">
        <CSidebarToggler
          onClick={() => dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })}
        />
      </CSidebarFooter>
    </CSidebar>
  );
};

export default React.memo(AppSidebar);






// // AppSidebar.js
// import React from 'react';
// import { NavLink } from 'react-router-dom';
// import { useSelector, useDispatch } from 'react-redux';
// import { CCloseButton, CSidebar, CSidebarBrand, CSidebarFooter, CSidebarHeader, CSidebarToggler } from '@coreui/react-pro';
// import CIcon from '@coreui/icons-react';
// import { AppSidebarNav } from './AppSidebarNav';
// import { sygnet } from 'src/assets/brand/sygnet';
// import Nav from '../_nav';

// const AppSidebar = () => {
//   const dispatch = useDispatch();
//   const unfoldable = useSelector((state) => state.sidebarUnfoldable);
//   const sidebarShow = useSelector((state) => state.sidebarShow);
//   const userRole = localStorage.getItem('userRole') || 'guest'; // Ambil role dari localStorage
  
//   // Get the navigation array based on the user role
//   const navigation = Nav(userRole);

//   return (
//     <CSidebar
//       className="border-end"
//       colorScheme="light"
//       position="fixed"
//       unfoldable={unfoldable}
//       visible={sidebarShow}
//       onVisibleChange={(visible) => {
//         dispatch({ type: 'set', sidebarShow: visible });
//       }}
//     >
//       <CSidebarHeader className="border-bottom">
//         <CSidebarBrand as={NavLink} to="/">
//           <CIcon customClassName="sidebar-brand-narrow" icon={sygnet} height={32} />
//         </CSidebarBrand>
//         <CCloseButton
//           className="d-lg-none"
//           onClick={() => dispatch({ type: 'set', sidebarShow: false })}
//         />
//       </CSidebarHeader>

//       {/* Pass the generated navigation array as items */}
//       <AppSidebarNav items={navigation} />

//       <CSidebarFooter className="border-top d-none d-lg-flex">
//         <CSidebarToggler
//           onClick={() => dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })}
//         />
//       </CSidebarFooter>
//     </CSidebar>
//   );
// };

// export default React.memo(AppSidebar);


// const userRole = localStorage.getItem('userRole') || 'guest'; // Ambil role dari localStorage
  
// // Get the navigation array based on the user role
// const navigation = Nav(userRole);