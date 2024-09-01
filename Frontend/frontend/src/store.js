import { legacy_createStore as createStore } from 'redux';

// Initial state
const initialState = {
  sidebarShow: true,
  asideShow: false,
  theme: 'light',
  userRole: 'guest', // Default role
};

// Reducer
const changeState = (state = initialState, action) => {
  switch (action.type) {
    case 'set':
      return { ...state, ...action.payload }; // Corrected payload access
    case 'SET_USER_ROLE':
      return { ...state, userRole: action.payload }; // Corrected payload access
    default:
      return state;
  }
};

// Create store
const store = createStore(changeState);

export default store;
