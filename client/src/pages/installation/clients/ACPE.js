import React from 'react';
import './ACPE.css';

const ACPE = ({ ACPEformData, setACPEFormData }) => {
  // Destructure the form data for easier access
  const {
    ORACLE_DATA_PUMP_DIR,
    ORACLE_DATA_PUMP_DIR_PATH,
    SRC_DB_USER,
    SRC_DB_PASSWORD,
    SRC_DB_INSTANCE,
    TRG_DB_CONN_STRING,
  } = ACPEformData;

  // Handles changes in the input fields
  const onChange = (e) => {
    const { name, value } = e.target;

    // Update the form data in the parent component
    setACPEFormData({ [name]: value });
  };

  return (
    <div className='installation-acpe-component-container'>
      {/* Title of the configuration section */}
      <div className='installation-acpe-component-title'>
        <h1>ACPE Configuration</h1>
      </div>

      {/* Form container for input fields */}
      <div className='installation-acpe-component-form'>
        {/* Helper function to create input fields */}
        {[
          {
            label: 'ACPE Oracle Data Pump Directory *',
            name: 'ORACLE_DATA_PUMP_DIR',
            value: ORACLE_DATA_PUMP_DIR,
          },
          {
            label: 'ACPE Path for Oracle Data Pump Directory *',
            name: 'ORACLE_DATA_PUMP_DIR_PATH',
            value: ORACLE_DATA_PUMP_DIR_PATH,
          },
          {
            label: 'ACPE Source DB User *',
            name: 'SRC_DB_USER',
            value: SRC_DB_USER,
          },
          {
            label: 'ACPE Source DB Password *',
            name: 'SRC_DB_PASSWORD',
            value: SRC_DB_PASSWORD,
            type: 'password', // Use 'password' type for security
          },
          {
            label: 'ACPE Source DB Instance *',
            name: 'SRC_DB_INSTANCE',
            value: SRC_DB_INSTANCE,
          },
          {
            label: 'ACPE Target DB Connection String *',
            name: 'TRG_DB_CONN_STRING',
            value: TRG_DB_CONN_STRING,
            placeholder: 'String structure DB_USER/DB_PASSWORD@DB_INSTANCE',
          },
        ].map(({ label, name, value, placeholder = '' }) => (
          <div className='installation-acpe-component-form-input' key={name}>
            <span className='installation-acpe-component-form-input-title'>
              {label}
            </span>
            <input
              value={value}
              name={name}
              onChange={onChange}
              type='text'
              placeholder={placeholder}
              required
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ACPE;
