import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './utils/ProtectedRoute';
import PackagerDeployerManager from './pages/packagerDeployer/PackagerDeployerManager';
import TTMEnvironment from './pages/TTMEnvironment/TTMEnvironment';
import Profiles from './pages/profiles/Porfiles';
import Installation from './pages/installation/installation';
import History from './pages/history/History';
import EnvironmentValidation from './pages/environmentValidation/EnvironmentValidation';
import About from './components/layout/About';
import Obfuscation from './pages/obfuscation/Obfuscation';

/**
 * @module AppRoutes
 * @desc    Configures and renders all application routes, including protected routes,
 *          by mapping route paths to their corresponding components.
 * @access  Public
 *
 * Route Configuration:
 *
 * routeConfig - An array containing route path, component, and optional props for each route.
 *               Each route is either a protected or a regular route based on the path
 *               and component specified.
 *
 * Internal Components:
 *
 * ProtectedRoute - Wraps each component to handle protected routes based on the application's
 *                  environment validation and user access logic.
 *
 * @returns {JSX.Element} - The main route configuration rendered within <Routes>.
 */
const routeConfig = [
  {
    path: '/',
    component: About,
  },
  {
    path: '/Packager',
    component: PackagerDeployerManager,
    props: { isPackager: true },
  },
  {
    path: '/Deployer',
    component: PackagerDeployerManager,
    props: { isPackager: false },
  },
  { path: '/TTMEnvironment', component: TTMEnvironment },
  { path: '/Profiles', component: Profiles },
  { path: '/Installation', component: Installation },
  { path: '/LogHistory', component: History },
  { path: '/EnvironmentValidation', component: EnvironmentValidation },
  { path: '/Obfuscation', component: Obfuscation },
];

/**
 * @function AppRoutes
 * @desc    Maps route paths to corresponding components, wrapping each in a <ProtectedRoute>
 *          if necessary to manage access based on application state and permissions.
 *
 * @returns {JSX.Element} - The complete set of application routes.
 */
const AppRoutes = () => (
  <Routes>
    {routeConfig.map(({ path, component: Component, props }) => (
      <Route
        key={path}
        path={path}
        element={
          <ProtectedRoute path={path} component={Component} {...props} />
        }
      />
    ))}
  </Routes>
);

export default AppRoutes;
