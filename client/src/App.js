import React from 'react'; // Importing React library to use React features
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Importing routing components from react-router-dom

import './App.css'; // Importing CSS styles for the application
import Sidebar from './components/layout/Sidebar'; // Importing the Sidebar component for navigation
import Packager from './pages/packager/Packager'; // Importing the Packager page component
import Deployer from './pages/deployer/Deployer'; // Importing the Deployer page component
import Configuration from './pages/configuration/Configuration'; // Importing the Configuration page component
import MECProfile from './pages/MECProfile/MECProfile'; // Importing the MECProfile page component
import Installation from './pages/installation/installation'; // Importing the Installation page component
import History from './pages/history/History'; // Importing the History page component
import EnvironmentValidation from './pages/environmentValidation/EnvironmentValidation'; // Importing the Environment Validation page component

// Main App component that sets up routing and layout for the application
const App = () => (
  <Router>
    {' '}
    {/* Wrapping the application in Router to enable routing */}
    <Sidebar /> {/* Rendering the Sidebar for navigation links */}
    <Routes>
      {' '}
      {/* Defining routes for the application */}
      {/* Each Route maps a path to a component to be rendered */}
      <Route exact path='/Packager' element={<Packager />} />
      <Route exact path='/Deployer' element={<Deployer />} />
      <Route exact path='/Configuration' element={<Configuration />} />
      <Route exact path='/MECProfile' element={<MECProfile />} />
      <Route exact path='/Installation' element={<Installation />} />
      <Route exact path='/History' element={<History />} />
      <Route
        exact
        path='/EnvironmentValidation'
        element={<EnvironmentValidation />}
      />
    </Routes>
  </Router>
);

// Exporting the App component as the default export for use in other parts of the application
export default App;
