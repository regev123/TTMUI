import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import './App.css';
import Sidebar from './components/layout/Sidebar';
import { Provider } from 'react-redux';
import store from './store';
import { checkTTMEnvironmentConfiguration } from './actions/TTMEnvDetails';
import { checkIsEnvironmentObfuscated } from './actions/Obfuscation';
import { getExistingClientsArray } from './actions/ExsitingClients';
import Spinner from './components/layout/Spinner';
import AppRoutes from './AppRoutes';

/**
 * @component App
 * @desc    Main application component responsible for initializing the app, managing loading states,
 *          and rendering core layout components such as Sidebar and AppRoutes.
 *          It also dispatches an action to check the environment configuration on load.
 * @access  Public
 *
 * Internal State:
 * - isLoading (boolean): Tracks whether the initial environment configuration check is still loading.
 *
 * Internal Effects:
 * - useEffect: Triggers the environment configuration check upon component mount,
 *              and updates `isLoading` once completed.
 *
 * @returns {JSX.Element} - The root component that provides the Redux store, renders the Sidebar, and manages route rendering.
 */
const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      await store.dispatch(checkTTMEnvironmentConfiguration());
      await store.dispatch(checkIsEnvironmentObfuscated());
      await store.dispatch(getExistingClientsArray());
      setIsLoading(false);
    };
    fetchData();
  }, []);

  if (isLoading) return <Spinner />;

  return (
    <Provider store={store}>
      <Router>
        <Sidebar />
        <AppRoutes />
      </Router>
    </Provider>
  );
};

export default App;
