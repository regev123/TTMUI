import React, { useState } from 'react';
import './EnvironmentValidation.css';
import api from '../../utils/api';

// Initial validation state template used for each validation type.
const initialValidationState = {
  status: '',
  message: '',
};

const EnvironmentValidation = () => {
  // State for holding validation results for each step of the validation process.
  const [validations, setValidations] = useState({
    TNSPing: initialValidationState,
    SSHConnection: initialValidationState,
    DPDir: initialValidationState,
    DumpCreation: initialValidationState,
  });

  // Form data state for capturing user input.
  const [formData, setFormData] = useState({
    DBUser: '',
    DBPassword: '',
    DBInstance: '',
    DPDIRPath: '',
    DBServerUser: '',
    TTMDirDBIndentifier: '',
  });

  // Destructuring formData for easier access in the form.
  const {
    DBUser,
    DBPassword,
    DBInstance,
    DPDIRPath,
    DBServerUser,
    TTMDirDBIndentifier,
  } = formData;

  // Handler for updating form data when input fields are changed.
  const onChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Function to reset the validation state back to the initial state before each validation attempt.
  const resetValidations = () => {
    setValidations({
      TNSPing: initialValidationState,
      SSHConnection: initialValidationState,
      DPDir: initialValidationState,
      DumpCreation: initialValidationState,
    });
  };

  // Handler for form submission to trigger the validation processes.
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior.
    resetValidations(); // Reset validation statuses.

    // Delay to ensure reset occurs before the validations start.
    await new Promise((resolve) => setTimeout(resolve, 10));

    let DBHost; // Will store the host returned by TNS Ping validation.

    // TNS Ping validation
    try {
      // Set TNSPing validation to loading state.
      setValidations((prev) => ({ ...prev, TNSPing: { status: 'loading' } }));
      const res = await api.post('/environmentValidation/getTNSPingInternal', {
        DBInstance,
      });
      DBHost = res.data.host; // Extract host from response.

      // On success, update the validation state with the host and port.
      setValidations((prev) => ({
        ...prev,
        TNSPing: {
          status: 'success',
          message: `${res.data.host}:${res.data.port}`,
        },
      }));
    } catch (error) {
      // On failure, update the validation state with an error message.
      setValidations((prev) => ({
        ...prev,
        TNSPing: { status: 'failed', message: 'TNSPing validation failed' },
      }));
      return; // Exit if TNS Ping fails.
    }

    // SSH Connection validation
    try {
      setValidations((prev) => ({
        ...prev,
        SSHConnection: { status: 'loading' },
      }));
      await api.post('/environmentValidation/checkSSHConnection', {
        sshUserAndHost: `${DBServerUser}@${DBHost}`,
      });
      setValidations((prev) => ({
        ...prev,
        SSHConnection: {
          status: 'success',
          message: 'SSH connection successful',
        },
      }));
    } catch (error) {
      setValidations((prev) => ({
        ...prev,
        SSHConnection: { status: 'failed', message: 'SSH connection failed' },
      }));
      return; // Exit if SSH connection fails.
    }

    // DP Directory validation
    try {
      setValidations((prev) => ({ ...prev, DPDir: { status: 'loading' } }));
      await api.post('/environmentValidation/checkDirectory', {
        DPDIRPath,
        sshUserAndHost: `${DBServerUser}@${DBHost}`,
      });
      setValidations((prev) => ({
        ...prev,
        DPDir: { status: 'success', message: 'Directory found' },
      }));
    } catch (error) {
      setValidations((prev) => ({
        ...prev,
        DPDir: { status: 'failed', message: 'Directory not found' },
      }));
      return; // Exit if DP directory validation fails.
    }

    // Dump Creation validation
    try {
      setValidations((prev) => ({
        ...prev,
        DumpCreation: { status: 'loading' },
      }));
      const res = await api.post('/environmentValidation/checkDataPumpDump', {
        TTMDirDBIndentifier,
        DBConnectionString: `${DBUser}/${DBPassword}@${DBInstance}`,
      });
      setValidations((prev) => ({
        ...prev,
        DumpCreation: { status: 'success', message: res.data },
      }));
    } catch (error) {
      setValidations((prev) => ({
        ...prev,
        DumpCreation: { status: 'failed', message: error.response.data },
      }));
    }
  };

  // Component to display the appropriate validation status icon.
  const ValidationStatusIcon = ({ status }) => {
    if (status === 'loading') return <i className='bx bx-loader bx-spin'></i>;
    if (status === 'success') return <i className='bx bx-check'></i>;
    if (status === 'failed') return <i className='bx bx-error-circle'></i>;
    return null;
  };

  // Component to render the validation result for each step.
  const ValidationResult = ({ label, name, value, status }) => (
    <div className='environment-validation-page-box-db-details'>
      <div className='environment-validation-page-box-input'>
        <span className='environment-validation-page-box-input-title'>
          {label}
        </span>
        <input value={value} name={name} type='text' readOnly />
      </div>
      <ValidationStatusIcon status={status} />
    </div>
  );

  return (
    <div className='page-fixed-position-sidebar'>
      <div className='environment-validation-page-container'>
        <div className='environment-validation-page-box-container'>
          <div className='environment-validation-page-box-title'>
            <h1>Validate environement configuration</h1>
          </div>
          <div className='environment-validation-page-box-submit-alert'></div>
          <div className='environment-validation-page-boxx-form'>
            <div className='environment-validation-page-box-db-details'>
              <div className='environment-validation-page-box-input'>
                <span className='environment-validation-page-box-input-title'>
                  DB User
                </span>
                <input
                  value={DBUser}
                  name='DBUser'
                  onChange={(e) => onChange(e)}
                  type='text'
                  required
                ></input>
              </div>
              <div className='environment-validation-page-box-input'>
                <span className='environment-validation-page-box-input-title'>
                  DB Password
                </span>
                <input
                  value={DBPassword}
                  name='DBPassword'
                  onChange={(e) => onChange(e)}
                  type='password'
                  required
                ></input>
              </div>
              <div className='environment-validation-page-box-input'>
                <span className='environment-validation-page-box-input-title'>
                  DB Instance
                </span>
                <input
                  value={DBInstance}
                  name='DBInstance'
                  onChange={(e) => onChange(e)}
                  type='text'
                  required
                ></input>
              </div>
            </div>
          </div>
          <div className='environment-validation-page-boxx-form'>
            <div className='environment-validation-page-box-db-details'>
              <div className='environment-validation-page-box-input'>
                <span className='environment-validation-page-box-input-title'>
                  Data Pump Directory path
                </span>
                <input
                  value={DPDIRPath}
                  name='DPDIRPath'
                  onChange={(e) => onChange(e)}
                  type='text'
                  required
                ></input>
              </div>
              <div className='environment-validation-page-box-input'>
                <span className='environment-validation-page-box-input-title'>
                  User to DB Server
                </span>
                <input
                  value={DBServerUser}
                  name='DBServerUser'
                  onChange={(e) => onChange(e)}
                  type='text'
                  required
                ></input>
              </div>
              <div className='environment-validation-page-box-input'>
                <span className='environment-validation-page-box-input-title'>
                  TTM dir DB indentifier
                </span>
                <input
                  value={TTMDirDBIndentifier}
                  name='TTMDirDBIndentifier'
                  onChange={(e) => onChange(e)}
                  type='text'
                  required
                ></input>
              </div>
            </div>
          </div>
          <div className='environment-validation-page-box-submit'>
            <button
              onClick={(e) => {
                handleSubmit(e);
              }}
              className='environment-validation-page-box-input-button'
            >
              Verify
            </button>
          </div>
          <ValidationResult
            label='DB Server:Port based on TNS Ping'
            name='DBServerDBPortString'
            value={validations.TNSPing.message}
            status={validations.TNSPing.status}
          />
          <ValidationResult
            label='SSH Connection'
            name='SSHConnectionString'
            value={validations.SSHConnection.message}
            status={validations.SSHConnection.status}
          />
          <ValidationResult
            label='DP Directory on DB Server'
            name='DPDIRPathString'
            value={validations.DPDir.message}
            status={validations.DPDir.status}
          />
          <ValidationResult
            label='Dump creation'
            name='DumpCreationString'
            value={validations.DumpCreation.message}
            status={validations.DumpCreation.status}
          />
        </div>
      </div>
    </div>
  );
};

export default EnvironmentValidation;
