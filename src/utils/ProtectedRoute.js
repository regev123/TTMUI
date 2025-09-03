import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';

/**
 * @component ProtectedRoute
 * @desc    A higher-order component that protects specific routes based on environment configuration states.
 *          Routes are conditionally accessible based on Redux state values for `EnvironmentConncetionSuccess`
 *          and `EnvironmentHomePathValid`. Redirects to `/TTMEnvironment` if access conditions are not met.
 * @access  Private
 *
 * @param {string} path - The route path that is being protected.
 * @param {React.ElementType} component - The component to render if access is allowed.
 * @param {...object} rest - Any additional props to pass to the component.
 *
 * Redux State Dependencies:
 * - EnvironmentConncetionSuccess (boolean): Indicates if the environment connection check was successful.
 * - EnvironmentHomePathValid (boolean): Indicates if the home path configuration is valid.
 *
 * @returns {JSX.Element} - Either renders the specified component or redirects to `/TTMEnvironment`.
 */
const ProtectedRoute = ({ path, component: Component, ...rest }) => {
  const EnvironmentConncetionSuccess = useSelector(
    (state) => state.TTMEnvironment.EnvironmentConncetionSuccess
  );
  const EnvironmentHomePathValid = useSelector(
    (state) => state.TTMEnvironment.EnvironmentHomePathValid
  );

  const isDisabled =
    (!EnvironmentConncetionSuccess && path !== '/TTMEnvironment') ||
    (!EnvironmentHomePathValid &&
      path !== '/TTMEnvironment' &&
      path !== '/Installation');

  if (isDisabled) {
    return <Navigate to='/TTMEnvironment' replace />;
  }

  return <Component {...rest} />;
};

// Prop type validation for the ProtectedRoute component
ProtectedRoute.propTypes = {
  path: PropTypes.string.isRequired,
  component: PropTypes.elementType.isRequired,
};

export default ProtectedRoute;
