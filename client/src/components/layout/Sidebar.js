import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

const sidebarItems = [
  { to: '/packager', icon: 'bx-package', label: 'Packager' },
  { to: '/deployer', icon: 'bx-send', label: 'Deployer' },
  { to: '/Configuration', icon: 'bx-cog', label: 'TTM Environment' },
  { to: '/MECProfile', icon: 'bx-user-pin', label: 'MEC Profile' },
  { to: '/Installation', icon: 'bx-log-in-circle', label: 'Installation' },
  { to: '/History', icon: 'bx-history', label: 'History' },
  {
    to: '/EnvironmentValidation',
    icon: 'bx-list-check',
    label: 'Environment Validation',
  },
];

const Sidebar = () => {
  return (
    <div className='warpper-sidebar'>
      <h2 className='sidebar-subject'>TTM-Web</h2>
      <ul className='sidebar-list'>
        {sidebarItems.map((item) => (
          <li key={item.to}>
            <Link className='sidebar-link-name' to={item.to}>
              <i className={`bx ${item.icon}`}></i>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
