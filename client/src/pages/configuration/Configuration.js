import React, { useEffect, useState } from 'react';
import './Configuration.css';
import api from '../../utils/api';

const Configuration = () => {
  const [formData, setFormData] = useState({
    TTMhost: '',
    TTMport: 0,
    TTMusername: '',
    TTMpassword: '',
    TTMHome: '',
    TTMPackagerCommand: '',
    TTMDeployerCommand: '',
  });

  const [alert, setAlert] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.get('/configuration/getConfiguration');
        setFormData(res.data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchData();
  }, []); // Runs once on mount

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!Number.isInteger(formData.TTMport) || formData.TTMport <= 0) {
      setAlert('Please enter a valid integer port number.');
      return;
    }

    try {
      await api.post('/configuration/setConfiguration', formData);
      setAlert('Change Success'); // Clear any previous error
    } catch (error) {
      setAlert('Failed to submit configuration.');
      console.error(error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === 'TTMport' ? Number(value) || 0 : value, // Convert port to number
    }));
  };

  const InputField = ({ label, name, type = 'text', value }) => (
    <div className='configuration-page-box-input'>
      <span className='configuration-page-box-input-title'>{label}</span>
      <input
        value={value || ''}
        name={name}
        type={type}
        onChange={handleChange}
        required
      />
    </div>
  );

  return (
    <div className='page-fixed-position-sidebar'>
      <div className='configuration-page-container'>
        <div className='configuration-page-box-container'>
          <div className='configuration-page-box-title'>
            <h1>Change the Configuration</h1>
          </div>
          {alert && alert === 'Change Success' ? (
            <p className='success-message'>{alert}</p>
          ) : (
            <p className='error-message'>{alert}</p>
          )}
          <form className='configuration-page-box-form' onSubmit={handleSubmit}>
            <div className='configuration-page-box-user-details'>
              <InputField
                label='TTM Host'
                name='TTMhost'
                value={formData.TTMhost}
              />
              <InputField
                label='TTM Port'
                name='TTMport'
                type='number'
                value={formData.TTMport}
              />
              <InputField
                label='TTM Username'
                name='TTMusername'
                value={formData.TTMusername}
              />
              <InputField
                label='TTM Password'
                name='TTMpassword'
                type='password'
                value={formData.TTMpassword}
              />
              <InputField
                label='TTM Home Path'
                name='TTMHome'
                value={formData.TTMHome}
              />
              <InputField
                label='TTM Packager Command'
                name='TTMPackagerCommand'
                value={formData.TTMPackagerCommand}
              />
              <InputField
                label='TTM Deployer Command'
                name='TTMDeployerCommand'
                value={formData.TTMDeployerCommand}
              />
            </div>
            <div className='configuration-page-box-submit'>
              <button
                type='submit'
                className='configuration-page-box-input-button'
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Configuration;
