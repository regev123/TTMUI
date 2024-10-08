import React from 'react'; // Importing React library for building components
import './ABP.css'; // Importing CSS for styling the ABP component

const ABP = ({ ABPformData, setABPFormData }) => {
  // Destructure properties from ABPformData for easier access
  const {
    ORACLE_DATA_PUMP_DIR,
    ORACLE_DATA_PUMP_DIR_PATH,
    SRC_DB_USER,
    SRC_DB_PASSWORD,
    SRC_DB_INSTANCE,
    TRG_DB_CONN_STRING,
  } = ABPformData;

  // Handler for input changes
  const onChange = (e) => {
    const { name, value } = e.target;
    // Update state with the new value for the specific input field
    setABPFormData({ [name]: value });
  };

  return (
    <div className='installation-abp-component-container'>
      <div className='installation-abp-component-title'>
        <h1>ABP Configuration</h1>
      </div>

      <form className='installation-abp-component-form'>
        {/*
          Array of input fields and their corresponding titles for rendering.
          This reduces code duplication and makes it easier to manage fields.
        */}
        {[
          {
            label: 'ABP the Oracle Data Pump directory *',
            name: 'ORACLE_DATA_PUMP_DIR',
            value: ORACLE_DATA_PUMP_DIR,
          },
          {
            label: 'ABP Path for the Oracle Data Pump directory *',
            name: 'ORACLE_DATA_PUMP_DIR_PATH',
            value: ORACLE_DATA_PUMP_DIR_PATH,
          },
          {
            label: 'ABP Source DB User *',
            name: 'SRC_DB_USER',
            value: SRC_DB_USER,
          },
          {
            label: 'ABP Source DB Password *',
            name: 'SRC_DB_PASSWORD',
            value: SRC_DB_PASSWORD,
          },
          {
            label: 'ABP Source DB Instance *',
            name: 'SRC_DB_INSTANCE',
            value: SRC_DB_INSTANCE,
          },
          {
            label: 'ABP Target DB Connection String *',
            name: 'TRG_DB_CONN_STRING',
            value: TRG_DB_CONN_STRING,
            placeholder: 'String structure DB_USER/DB_PASSWORD@DB_INSTANCE',
          },
        ].map(({ label, name, value, placeholder = '' }) => (
          <div className='installation-abp-component-form-input' key={name}>
            <span className='installation-abp-component-form-input-title'>
              {label}
            </span>
            <input
              value={value} // Controlled input value
              name={name} // Input name for identifying which data to update
              onChange={onChange} // Change handler to update form data
              type='text' // Text input type
              placeholder={placeholder}
              required // Marking the field as required
            />
          </div>
        ))}
      </form>
    </div>
  );
};

export default ABP; // Exporting the ABP component for use in other parts of the application
