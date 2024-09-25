import React from 'react'; // Import React library for building the component
import { Link } from 'react-router-dom'; // Import Link for client-side routing
import './Sidebar.css'; // Import CSS styles for the sidebar

// Define an array of sidebar items, each with a route, icon, and label
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

// Define the Sidebar component
const Sidebar = () => {
  return (
    <div className='warpper-sidebar'>
      {' '}
      {/* Wrapper for the sidebar */}
      <h2 className='sidebar-subject'>TTM-Web</h2> {/* Title of the sidebar */}
      <ul className='sidebar-list'>
        {' '}
        {/* Unordered list for sidebar items */}
        {sidebarItems.map(
          (
            item // Map over sidebarItems array to create list items
          ) => (
            <li key={item.to}>
              {' '}
              {/* Use the route as a unique key */}
              <Link className='sidebar-link-name' to={item.to}>
                {' '}
                {/* Link for navigation */}
                <i className={`bx ${item.icon}`}></i>{' '}
                {/* Icon for the sidebar item */}
                {item.label} {/* Label text for the sidebar item */}
              </Link>
            </li>
          )
        )}
      </ul>
    </div>
  );
};

// Export the Sidebar component for use in other parts of the application
export default Sidebar;
