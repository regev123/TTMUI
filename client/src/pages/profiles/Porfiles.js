import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import fetchExistingClientsProfile from '../../hooks/fetchData/useFetchExistingClientsProfile';
import Spinner from '../../components/layout/Spinner';
import MECProfile from './MECProfile';
import ClientsProfile from './ClientsProfile';
import Dropdown from '../../components/common/Dropdown';
import PrePostDeployment from './PrePostDeployment';
import AlertMessage from '../../components/common/AlertMessage';
import Solr from './Solr';

/**
 * @component Profiles
 * @desc    Main component for managing and displaying various client profile configurations.
 *          It handles fetching client profiles, selecting a profile, and displaying the respective configuration form
 *          (MECProfile, ClientsProfile) or Pre/Post Deployment configuration if required.
 * @access  Public
 *
 * @returns {JSX.Element} - The main JSX structure for selecting and managing client profiles and configurations.
 *
 * Internal Function Descriptions:
 *
 * loadExistingClientsProfile - Fetches the list of existing client profiles and sets them in the state.
 *
 * markClientConfigAsLoaded - Marks a specific configuration type (e.g., MEC, ClientsProfile) as loaded for the selected profile.
 *
 * renderProfileContent - Conditionally renders the profile content based on the selected profile (either MEC or ClientsProfile).
 *
 * isPrePostDeploymentRequired - Determines whether Pre/Post deployment configuration is required for the selected profile.
 */
const Profiles = ({ existingClientsArray }) => {
  const [selectedProfile, setSelectedProfile] = useState('');
  const [clients, setClients] = useState({});
  const [alert, setAlert] = useState('');
  const [isLoadingExistingClients, setIsLoadingExistingClients] =
    useState(true);
  const [MECProfileFormData, setMECProfileFormData] = useState({});
  const [isMECEmailConfigLoaded, setIsMECEmailConfigLoaded] = useState(false);
  const [isClientConfigLoaded, setIsClientConfigLoaded] = useState({});
  const [prePostDeploymentCommand, setPrePostDeploymentCommand] = useState({});

  useEffect(() => {
    loadExistingClientsProfile();
  }, []);

  const loadExistingClientsProfile = async () => {
    try {
      await fetchExistingClientsProfile(
        setIsLoadingExistingClients,
        setClients,
        setAlert,
        existingClientsArray
      );
    } catch (error) {
      setAlert('Error loading client profiles');
    }
  };

  const markClientConfigAsLoaded = (configType) => {
    setIsClientConfigLoaded((prevState) => ({
      ...prevState,
      [selectedProfile]: {
        ...prevState[selectedProfile],
        [configType]: true,
      },
    }));
  };

  if (isLoadingExistingClients) {
    return <Spinner />;
  }

  return (
    <div className='page-fixed-position-sidebar'>
      <div className='page-container'>
        {alert && <AlertMessage message={alert} isSuccess={false} />}
        <ProfileDropdown
          selectedProfile={selectedProfile}
          setSelectedProfile={setSelectedProfile}
          clients={clients}
        />
        {selectedProfile && renderProfileContent()}
        {selectedProfile && isPrePostDeploymentRequired(selectedProfile) && (
          <>
            <PrePostDeployment
              prePostDeploymentCommand={prePostDeploymentCommand}
              setPrePostDeploymentCommand={setPrePostDeploymentCommand}
              selectedProfile={selectedProfile}
              isClientConfigLoaded={isClientConfigLoaded}
              markClientConfigAsLoaded={markClientConfigAsLoaded}
            />
            <Solr selectedProfile={selectedProfile} />
          </>
        )}
      </div>
    </div>
  );

  function renderProfileContent() {
    if (selectedProfile === 'MEC') {
      return (
        <MECProfile
          MECProfileFormData={MECProfileFormData}
          setMECProfileFormData={setMECProfileFormData}
          isMECEmailConfigLoaded={isMECEmailConfigLoaded}
          setIsMECEmailConfigLoaded={setIsMECEmailConfigLoaded}
        />
      );
    }

    return (
      <ClientsProfile
        clients={clients}
        setClients={setClients}
        selectedProfile={selectedProfile}
        isClientConfigLoaded={isClientConfigLoaded}
        markClientConfigAsLoaded={markClientConfigAsLoaded}
      />
    );
  }

  function isPrePostDeploymentRequired(profile) {
    return profile === 'OMS_SE' || profile === 'MCSS_SE';
  }
};

/**
 * @function ProfileDropdown
 * @desc    Renders a dropdown to select a client profile from the list of available profiles.
 * @access  Private
 *
 * @param {string} selectedProfile - The currently selected client profile.
 * @param {function} setSelectedProfile - Function to update the selected profile.
 * @param {Object} clients - The list of available client profiles.
 *
 * @returns {JSX.Element} - The dropdown JSX for selecting a profile.
 */
const ProfileDropdown = ({ selectedProfile, setSelectedProfile, clients }) => {
  const options = [
    'MEC',
    ...Object.keys(clients).filter((key) => clients[key].exists),
  ];

  return (
    <Dropdown
      selected={selectedProfile}
      setSelected={setSelectedProfile}
      options={options}
      title='Select Profile'
    />
  );
};

Profiles.propTypes = {
  existingClientsArray: PropTypes.array.isRequired,
};

const mapStateToProps = (state) => ({
  existingClientsArray: state.ExistingClients.existingClientsArray,
});

export default connect(mapStateToProps)(Profiles);
