import React from 'react';

import AuthRoute from './AuthRoute';
import AppRoute from './AppRoute';

import AuthContext from '../contexts/auth';

const Routes: React.FC = () => {
  const { signed } = React.useContext(AuthContext)

  if (!signed) return <AuthRoute />;

  return <AppRoute />;
}

export default Routes;