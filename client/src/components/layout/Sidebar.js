import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

const SIDEBAR_ITEMS = [
  { path: '/TTMEnvironment', iconClass: 'bx-cog', label: 'TTM Environment' },
  {
    path: '/Installation',
    iconClass: 'bx-log-in-circle',
    label: 'Installation',
  },
  { path: '/Profiles', iconClass: 'bx-user-pin', label: 'Profiles' },
  {
    path: '/EnvironmentValidation',
    iconClass: 'bx-list-check',
    label: 'Environment Validation',
  },
  { path: '/packager', iconClass: 'bx-package', label: 'Packager' },
  { path: '/deployer', iconClass: 'bx-send', label: 'Deployer' },
  { path: '/LogHistory', iconClass: 'bx-history', label: 'Log History' },
  { path: '/obfuscation', iconClass: 'bx-lock-open-alt', label: 'Obfuscation' },
];

/**
 * @function Sidebar
 * @desc    Renders the Sidebar component that includes the sidebar header and list of sidebar items.
 * @access  Public
 *
 * @returns {JSX.Element} - The rendered Sidebar component containing the header and list of navigation items.
 */
const Sidebar = ({
  EnvironmentConncetionSuccess,
  EnvironmentHomePathValid,
}) => {
  const isDisabledTTMConncetionFailed = !EnvironmentConncetionSuccess;
  const isDisabledTTMHomePathInvalid = !EnvironmentHomePathValid;

  return (
    <div className='warpper-sidebar'>
      <SidebarHeader />
      <SidebarItems
        items={SIDEBAR_ITEMS}
        isDisabledTTMConncetionFailed={isDisabledTTMConncetionFailed}
        isDisabledTTMHomePathInvalid={isDisabledTTMHomePathInvalid}
      />
    </div>
  );
};

/**
 * @function SidebarHeader
 * @desc    Renders the header of the sidebar with the title "TTM UI" and a store icon.
 * @access  Private
 *
 * @returns {JSX.Element} - The rendered sidebar header.
 */
const SidebarHeader = () => (
  <h2 className='sidebar-subject'>
    TTM UI <i className='bx bxs-store'></i>
  </h2>
);

/**
 * @function SidebarItems
 * @desc    Renders the list of sidebar items.
 * @access  Private
 *
 * @param {Array} items - The list of items to be rendered in the sidebar.
 *
 * @returns {JSX.Element} - The rendered list of sidebar items.
 */
const SidebarItems = ({
  items,
  isDisabledTTMConncetionFailed,
  isDisabledTTMHomePathInvalid,
}) => (
  <ul className='sidebar-list'>
    {items.map((item) => (
      <SidebarItem
        key={item.path}
        item={item}
        isDisabledTTMConncetionFailed={isDisabledTTMConncetionFailed}
        isDisabledTTMHomePathInvalid={isDisabledTTMHomePathInvalid}
      />
    ))}
  </ul>
);

/**
 * @function SidebarItem
 * @desc    Renders an individual item in the sidebar with a link, icon, and label.
 * @access  Private
 *
 * @param {Object} item - The item object containing path, icon, and label for the sidebar item.
 *
 * @returns {JSX.Element} - The rendered sidebar item with a link.
 */
const SidebarItem = ({
  item,
  isDisabledTTMConncetionFailed,
  isDisabledTTMHomePathInvalid,
}) => {
  const shouldDisable =
    (isDisabledTTMConncetionFailed && item.path !== '/TTMEnvironment') ||
    (isDisabledTTMHomePathInvalid &&
      item.path !== '/TTMEnvironment' &&
      item.path !== '/Installation');

  const handleClick = (e) => {
    if (isDisabledTTMConncetionFailed) {
      e.preventDefault();
    }
  };

  return (
    <li>
      <Link
        className={`sidebar-link-name ${shouldDisable ? 'disabled' : ''}`}
        to={item.path}
        onClick={handleClick}
      >
        <i className={`bx ${item.iconClass}`}></i>
        {item.label}
      </Link>
    </li>
  );
};

Sidebar.propTypes = {
  EnvironmentConncetionSuccess: PropTypes.bool.isRequired,
  EnvironmentHomePathValid: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
  EnvironmentConncetionSuccess:
    state.TTMEnvironment.EnvironmentConncetionSuccess,
  EnvironmentHomePathValid: state.TTMEnvironment.EnvironmentHomePathValid,
});

export default connect(mapStateToProps, {})(Sidebar);
