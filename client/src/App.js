import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import './App.css';
import Sidebar from './components/layout/Sidebar';
import Packager from './pages/packager/Packager';
import Deployer from './pages/deployer/Deployer';
import Configuration from './pages/configuration/Configuration';
import MECProfile from './pages/MECProfile/MECProfile';
import Installation from './pages/installation/installation';
import History from './pages/history/History';
import EnvironmentValidation from './pages/environmentValidation/EnvironmentValidation';
const App = () => (
  <Router>
    <Sidebar />
    <Routes>
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

export default App;
