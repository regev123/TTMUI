import React, { useEffect, useState } from 'react';
import Spinner from '../../components/layout/Spinner';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';
import fetchConfiguration from '../../hooks/fetchData/useFetchTTMEnvironmentConfiguraion';
import AlertMessage from '../../components/common/AlertMessage';
import setConfiguration from '../../hooks/submitHandlers/handleSubmitTTMEnvironmentConfiguration';
import SpinIcon from '../../components/common/SpinIcon';

/**
 * @component formatInputTitle
 * @desc    Formats input field titles by adding a space after 'TTM' for better readability.
 * @access  Private
 *
 * @param {string} key - The original key name (e.g., "TTMhost").
 * @returns {string} - The formatted key name (e.g., "TTM host").
 */
const formatInputTitle = (key) => key.replace(/TTM/, 'TTM ');

/**
 * @function TTMEnvironment
 * @desc    Main component for the TTM Environment Configuration page. Manages form data, alert messages,
 *          and loading state, and renders the configuration form.
 * @access  Public
 *
 * @returns {JSX.Element} - The main JSX structure for the TTM Environment configuration page.
 *
 * Internal Function Descriptions:
 *
 * useEffect - Fetches the initial configuration data from the API when the component mounts,
 *             updating the form state, alert message, and loading state.
 *
 * handleChange - Updates the form data state when an input field value changes.
 *
 * handleSubmit - Handles form submission, sending the form data to the server.
 */
const TTMEnvironment = () => {
  const [formData, setFormData] = useState({
    TTMhost: '',
    TTMusername: '',
    TTMpassword: '',
    TTMHome: '',
  });

  const [alert, setAlert] = useState('');
  const [loading, setLoading] = useState(true);
  const [disableSubmit, setDisableSubmit] = useState(false);

  useEffect(() => {
    fetchConfiguration(setFormData, setAlert, setLoading);
  }, []);

  const handleChange = (name, value) => {
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    setDisableSubmit(true);
    const body = formData;
    if (body.TTMHome && !body.TTMHome.endsWith('/')) {
      body.TTMHome += '/';
    }
    await setConfiguration(e, body, setAlert);
    setDisableSubmit(false);
  };

  const isSuccess = alert === 'Change Success';

  if (loading) return <Spinner />;

  return (
    <div className='page-fixed-position-sidebar'>
      <div className='page-container'>
        <div className='component-container'>
          <h1>Change TTM Environment Configuration</h1>
          {alert && <AlertMessage message={alert} isSuccess={isSuccess} />}
          <ConfigurationForm
            formData={formData}
            onChange={handleChange}
            onSubmit={handleSubmit}
            disableSubmit={disableSubmit}
          />
        </div>
      </div>
    </div>
  );
};

/**
 * @function ConfigurationForm
 * @desc Renders the configuration form with input fields and a submit button.
 *
 * @param {Object} formData - The data to be displayed in each input field.
 * @param {function} onChange - Callback to handle changes in input fields.
 * @param {function} onSubmit - Callback to handle form submission.
 *
 * @returns {JSX.Element} - The rendered configuration form component.
 */
const ConfigurationForm = ({ formData, onChange, onSubmit, disableSubmit }) => (
  <form className='form-style' onSubmit={onSubmit}>
    {Object.entries(formData).map(([key, value]) => (
      <InputField
        key={key}
        title={formatInputTitle(key)}
        name={key}
        value={value}
        type={key === 'TTMpassword' ? 'password' : 'text'}
        onChange={onChange}
      />
    ))}
    <div className='elements-in-one-line'>
      <Button type='submit' title='Submit' disabled={disableSubmit} />
      {disableSubmit && <SpinIcon />}
    </div>
  </form>
);

export default TTMEnvironment;
