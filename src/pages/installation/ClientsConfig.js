import React from 'react';
import InputField from '../../components/common/InputField';

/**
 * @component ClientConfig
 * @desc    Renders the configuration form for a specific client, allowing the user to input
 *          required details such as Oracle Data Pump directory and database connection strings.
 *          Each client type will have its own form with appropriate field labels and input validation.
 * @param {Object} props - The props for the component.
 * @param {string} props.clientType - The type of client (e.g., "ABP").
 * @param {Object} props.clientFormData - The current configuration data for the client.
 * @param {Function} props.setClientFormData - Function to update the client configuration data in the parent state.
 * @returns {JSX.Element} - The rendered configuration form for the selected client type.
 *
 * Internal Functions:
 *
 * handleInputChange - Handles the change event for each input field and updates the clientFormData state.
 */
const ClientConfig = ({ clientType, clientFormData, setClientFormData }) => {
  const {
    ORACLE_DATA_PUMP_DIR,
    ORACLE_DATA_PUMP_DIR_PATH,
    SRC_DB_CONN_STRING,
    TRG_DB_CONN_STRING,
  } = clientFormData;

  const fieldConfigs = [
    {
      label: `${clientType} Oracle Data Pump Directory *`,
      name: 'ORACLE_DATA_PUMP_DIR',
      value: ORACLE_DATA_PUMP_DIR,
    },
    {
      label: `${clientType} Path for Oracle Data Pump Directory *`,
      name: 'ORACLE_DATA_PUMP_DIR_PATH',
      value: ORACLE_DATA_PUMP_DIR_PATH,
    },
    {
      label: `${clientType} Source DB Connection String *`,
      name: 'SRC_DB_CONN_STRING',
      value: SRC_DB_CONN_STRING,
      placeholder: 'String structure User/Password@Instance',
    },
    {
      label: `${clientType} Target DB Connection String *`,
      name: 'TRG_DB_CONN_STRING',
      value: TRG_DB_CONN_STRING,
      placeholder: 'String structure User/Password@Instance',
    },
  ];

  const handleInputChange = (name, value) => {
    setClientFormData({ ...clientFormData, [name]: value });
  };

  return (
    <div className='component-container'>
      <h1>{clientType.split('_').join(' ')} Configuration</h1>

      <form className='form-style'>
        {fieldConfigs.map(({ label, name, value, placeholder = '' }) => (
          <InputField
            key={name}
            name={name}
            title={label}
            value={value}
            onChange={handleInputChange}
            placeholder={placeholder}
          />
        ))}
      </form>
    </div>
  );
};

export default ClientConfig;
