import React from 'react';
import './OMS.css';

const OMS = ({ OMSformData, setOMSFormData }) => {
  // Destructure form data for easier access to individual form fields
  const {
    ORACLE_DATA_PUMP_DIR,
    ORACLE_DATA_PUMP_DIR_PATH,
    SRC_DB_USER,
    SRC_DB_PASSWORD,
    SRC_DB_INSTANCE,
    TRG_DB_CONN_STRING,
  } = OMSformData;

  // Handle input change events for all form fields
  // This function updates the formData state by setting the changed field's value
  const onChange = ({ target: { name, value } }) => {
    setOMSFormData({ [name]: value }); // Dynamically update the correct field by using its name
  };

  return (
    <div className='installation-oms-component-container'>
      {/* Title for the OMS Configuration */}
      <div className='installation-oms-component-title'>
        <h1>OMS Configuration</h1>
      </div>

      {/* Form section for input fields related to OMS */}
      <div className='installation-oms-component-form'>
        {/* Map over an array of field configurations to reduce repeated JSX */}
        {[
          {
            label: 'Oracle Data Pump Directory', // Display label for the input field
            value: ORACLE_DATA_PUMP_DIR, // Corresponding value from OMSformData
            name: 'ORACLE_DATA_PUMP_DIR', // Name attribute used for state updating
          },
          {
            label: 'Oracle Data Pump Directory Path',
            value: ORACLE_DATA_PUMP_DIR_PATH,
            name: 'ORACLE_DATA_PUMP_DIR_PATH',
          },
          {
            label: 'Source DB User',
            value: SRC_DB_USER,
            name: 'SRC_DB_USER',
          },
          {
            label: 'Source DB Password',
            value: SRC_DB_PASSWORD,
            name: 'SRC_DB_PASSWORD',
          },
          {
            label: 'Source DB Instance',
            value: SRC_DB_INSTANCE,
            name: 'SRC_DB_INSTANCE',
          },
          {
            label: 'Target DB Connection String',
            value: TRG_DB_CONN_STRING,
            name: 'TRG_DB_CONN_STRING',
            placeholder: 'String structure DB_USER/DB_PASSWORD@DB_INSTANCE',
          },
        ].map((field, index) => (
          <div className='installation-oms-component-form-input' key={index}>
            {/* Display label for the input field */}
            <span className='installation-oms-component-form-input-title'>
              {`OMS ${field.label} *`} {/* Required field indicator (*) */}
            </span>
            {/* Render the input field */}
            <input
              value={field.value} // Bind input value from formData
              name={field.name} // Use the field's name to update the correct formData value
              onChange={onChange} // Call onChange handler when user types in input
              type='text' // Set input type as text
              placeholder={field.placeholder ? field.placeholder : ''}
              required // Mark input as required
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default OMS;
