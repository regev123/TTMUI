import React, { useState, useEffect } from 'react';
import InputField from '../../components/common/InputField';
import Checkbox from '../../components/common/Checkbox';
import Button from '../../components/common/Button';
import Dropdown from '../../components/common/Dropdown';
import fetchMECProfileEmailConfiguration from '../../hooks/fetchData/useFetchMECProfileConfiguration';
import fetchMECProfileData from '../../hooks/fetchData/useFetchMECProfileData';
import setMECProfileEmail from '../../hooks/submitHandlers/handleSubmitMECProfileEmailConfiguration';
import setMECProfileRemoteDBUser from '../../hooks/submitHandlers/handleSubmitMECProfileRemoteDBUser';
import AlertMessage from '../../components/common/AlertMessage';
import Textarea from '../../components/common/Textarea';

const SUCCESS_MESSAGE = 'Change Succeeded!';

/**
 * @component MECProfile
 * @desc    Component for managing and configuring the MEC (Mobile Edge Computing) profile.
 *          It allows users to modify and submit configurations like email settings, zip file options,
 *          and remote DB user credentials, while handling loading states and displaying alerts.
 * @access  Public
 *
 * @param {Object} MECProfileFormData - The current MEC profile data including email settings, zip file options, and remote DB user.
 * @param {function} setMECProfileFormData - Function to update the MEC profile form data.
 * @param {boolean} isMECProfileConfigLoaded - Flag indicating if the MEC profile configuration has been loaded.
 * @param {function} setIsMECProfileConfigLoaded - Function to update the MEC profile configuration loaded state.
 *
 * @returns {JSX.Element} - The main JSX structure for the MEC Profile configuration form.
 *
 * Internal Function Descriptions:
 *
 * toggleOption - Toggles a boolean option (e.g., email settings, zip file option).
 * handleInputChange - Handles changes in input fields by updating the form data.
 * handleSubmit - Handles form submission by invoking the function to save the MEC profile configuration.
 * isDisabled - Checks if a field or button should be disabled based on the loading state or certain conditions.
 */
const MECProfile = ({
  MECProfileFormData,
  setMECProfileFormData,
  isMECEmailConfigLoaded,
  setIsMECEmailConfigLoaded,
}) => {
  const [alert, setAlert] = useState('');
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [isConfigLoading, setIsConfigLoading] = useState(false);
  const [selectedData, setSelectedData] = useState('');
  const [MECProfileData, setMECProfileData] = useState('');
  const { isEmailChecked, emailAddresses, isZipFile, remoteDBUser } =
    MECProfileFormData;

  useEffect(() => {
    if ((isMECEmailConfigLoaded && remoteDBUser) || !selectedData) return;

    fetchMECProfileEmailConfiguration(
      setIsMECEmailConfigLoaded,
      setIsConfigLoading,
      setMECProfileFormData,
      setAlert,
      selectedData
    );
  }, [selectedData]);

  useEffect(() => {
    fetchMECProfileData(setAlert, setMECProfileData);
  }, []);

  useEffect(() => {
    setAlert('');
  }, [selectedData]);

  const toggleOption = (option) => {
    setMECProfileFormData((prevData) => ({
      ...prevData,
      [option]: !prevData[option],
    }));
  };

  const handleInputChange = (name, value) => {
    setMECProfileFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    setMECProfileData('');
    if (selectedData === 'Email Details') {
      await setMECProfileEmail(
        e,
        setIsLoadingSubmit,
        setAlert,
        isEmailChecked,
        isZipFile,
        emailAddresses
      );
    } else {
      await setMECProfileRemoteDBUser(
        e,
        setIsLoadingSubmit,
        setAlert,
        remoteDBUser
      );
    }
    await fetchMECProfileData(setAlert, setMECProfileData);
  };

  const isDisabled = (condition) => isConfigLoading || condition;

  return (
    <div>
      <div className='component-container'>
        <h1>MEC Profile Configuration</h1>
        {alert && (
          <AlertMessage message={alert} isSuccess={alert === SUCCESS_MESSAGE} />
        )}

        <Dropdown
          selected={selectedData}
          setSelected={setSelectedData}
          options={['Email Details', 'Remote DB User']}
          title='Select Data Fetching'
        />

        <form onSubmit={handleSubmit}>
          {selectedData === 'Email Details' && (
            <div>
              <div className='elements-in-one-line'>
                <Checkbox
                  label='Send Report via Email'
                  checked={isEmailChecked}
                  onChange={() => toggleOption('isEmailChecked')}
                  disabled={isConfigLoading}
                />

                {isEmailChecked && (
                  <InputField
                    title=''
                    value={isEmailChecked ? emailAddresses : ''}
                    name='emailAddresses'
                    onChange={handleInputChange}
                    placeholder={isConfigLoading ? 'Loading...' : ''}
                  />
                )}
              </div>
              <Checkbox
                label='Send Report as ZIP'
                checked={isZipFile}
                onChange={() => toggleOption('isZipFile')}
                disabled={isDisabled(!isEmailChecked)}
              />
            </div>
          )}

          {selectedData === 'Remote DB User' && (
            <InputField
              title='Remote DB User *'
              value={remoteDBUser}
              name='remoteDBUser'
              onChange={handleInputChange}
              placeholder={isConfigLoading ? 'Loading...' : ''}
              disabled={isConfigLoading}
            />
          )}

          {selectedData && (
            <Button
              onClick={handleSubmit}
              title='Submit'
              disabled={isDisabled(isLoadingSubmit)}
            />
          )}

          {(isLoadingSubmit || isConfigLoading) && (
            <i className='bx bx-loader bx-spin icon-style' />
          )}
        </form>
      </div>
      <div className='component-container'>
        <h1>MEC.profile.ksh</h1>
        <Textarea value={MECProfileData} placeholder='Loading...' />
      </div>
    </div>
  );
};

export default MECProfile;
