export const loginSuccess = (role) => ({
    type: 'LOGIN_SUCCESS',
    payload: { role },
  });
  
  export const logout = () => ({
    type: 'LOGOUT',
  });
  

  // Action Type
export const SET_USER_ROLE = 'SET_USER_ROLE';

// Action Creator
export const setUserRole = (role) => ({
  type: SET_USER_ROLE,
  payload: role,
});