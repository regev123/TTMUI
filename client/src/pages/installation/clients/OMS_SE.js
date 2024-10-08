import React from 'react'; // Importing React library
import './OMS_SE.css'; // Importing CSS for styling the component

const OMS_SE = ({ OMS_SEformData, setOMS_SEFormData }) => {
  // Destructuring form data for easier access
  const {
    ORACLE_DATA_PUMP_DIR,
    ORACLE_DATA_PUMP_DIR_PATH,
    SRC_DB_USER,
    SRC_DB_PASSWORD,
    SRC_DB_INSTANCE,
    TRG_DB_CONN_STRING,
  } = OMS_SEformData;

  // Function to handle input changes
  const onChange = (e) => {
    const { name, value } = e.target; // Destructure name and value from the event target

    // Update form data using the setter function
    setOMS_SEFormData({ [name]: value });
  };

  return (
    <div className='installation-oms_se-component-container'>
      <div className='installation-oms_se-component-title'>
        <h1>OMS SE Configuration</h1> {/* Title of the component */}
      </div>

      <div className='installation-oms_se-component-form'>
        {/* Array of form fields for easier mapping */}
        {[
          {
            label: 'Oracle Data Pump Directory',
            value: ORACLE_DATA_PUMP_DIR,
            name: 'ORACLE_DATA_PUMP_DIR',
          },
          {
            label: 'Path for the Oracle Data Pump Directory',
            value: ORACLE_DATA_PUMP_DIR_PATH,
            name: 'ORACLE_DATA_PUMP_DIR_PATH',
          },
          { label: 'Source DB User', value: SRC_DB_USER, name: 'SRC_DB_USER' },
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
        ].map((field) => (
          <div
            className='installation-oms_se-component-form-input'
            key={field.name}
          >
            <span className='installation-oms_se-component-form-input-title'>
              {`OMS SE ${field.label} *`}{' '}
              {/* Displaying the label with asterisk */}
            </span>
            <input
              value={field.value} // Controlled input value
              name={field.name} // Input name for state management
              onChange={onChange} // Handle input changes
              type='text' // Input type
              placeholder={field.placeholder ? field.placeholder : ''}
              required // Making this field mandatory
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default OMS_SE; // Exporting the component for use in other parts of the application
