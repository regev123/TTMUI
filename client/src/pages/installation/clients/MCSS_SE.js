import React from 'react'; // Import React library
import './MCSS_SE.css'; // Import associated CSS file

const MCSS_SE = ({ MCSS_SEformData, setMCSS_SEFormData }) => {
  // Destructure form data for cleaner access
  const {
    ORACLE_DATA_PUMP_DIR,
    ORACLE_DATA_PUMP_DIR_PATH,
    SRC_DB_USER,
    SRC_DB_PASSWORD,
    SRC_DB_INSTANCE,
    TRG_DB_CONN_STRING,
  } = MCSS_SEformData;

  // Handle changes in input fields
  const onChange = ({ target: { name, value } }) => {
    setMCSS_SEFormData({ [name]: value }); // Update form data
  };

  // Array of form fields to reduce code repetition
  const formFields = [
    {
      label: 'MCSS SE the Oracle Data Pump directory *',
      value: ORACLE_DATA_PUMP_DIR,
      name: 'ORACLE_DATA_PUMP_DIR',
    },
    {
      label: 'MCSS SE Path for the Oracle Data Pump directory *',
      value: ORACLE_DATA_PUMP_DIR_PATH,
      name: 'ORACLE_DATA_PUMP_DIR_PATH',
    },
    {
      label: 'MCSS SE Source DB User *',
      value: SRC_DB_USER,
      name: 'SRC_DB_USER',
    },
    {
      label: 'MCSS SE Source DB Password *',
      value: SRC_DB_PASSWORD,
      name: 'SRC_DB_PASSWORD',
    },
    {
      label: 'MCSS SE Source DB Instance *',
      value: SRC_DB_INSTANCE,
      name: 'SRC_DB_INSTANCE',
    },
    {
      label: 'MCSS SE Target DB Connection String *',
      value: TRG_DB_CONN_STRING,
      name: 'TRG_DB_CONN_STRING',
      placeholder: 'String structure DB_USER/DB_PASSWORD@DB_INSTANCE',
    },
  ];

  return (
    <div className='installation-mcss_se-component-container'>
      <div className='installation-mcss_se-component-title'>
        <h1>MCSS SE Configuration</h1> {/* Title of the configuration */}
      </div>

      <div className='installation-mcss_se-component-form'>
        {/* Render form fields dynamically */}
        {formFields.map((field, index) => (
          <div
            className='installation-mcss_se-component-form-input'
            key={index}
          >
            <span className='installation-mcss_se-component-form-input-title'>
              {field.label} {/* Display the label for the input */}
            </span>
            <input
              value={field.value} // Input value from form data
              name={field.name} // Input name for form data binding
              onChange={onChange} // Handle input changes
              type='text' // Input type
              placeholder={field.placeholder ? field.placeholder : ''}
              required // Mark field as required
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MCSS_SE; // Export the component for use in other parts of the application
