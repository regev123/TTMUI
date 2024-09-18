import React, { useEffect, useState } from 'react';
import './EnvironmentValidation.css';
import api from '../../utils/api';

const EnvironmentValidation = () => {
  const [SRCValidation, setSRCValidation] = useState('');
  const [TRGValidation, setTRGValidation] = useState('');
  const [formData, setFormData] = useState({
    SRCUser: '',
    SRCPassword: '',
    SRCInstance: '',
    TRGUser: '',
    TRGPassword: '',
    TRGInstance: '',
  });

  const {
    SRCUser,
    SRCPassword,
    SRCInstance,
    TRGUser,
    TRGPassword,
    TRGInstance,
  } = formData;

  const onChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    //src body
    setSRCValidation('loading');
    try {
      const res = await api.post('/environmentValidation/clientsValidation', {
        body: `${SRCUser}/${SRCPassword}@${SRCInstance}`,
      });
      setSRCValidation('DB validation success');
    } catch (error) {
      setSRCValidation('DB validation failed');
      console.log(error);
    }

    //TRG body
    setTRGValidation('loading');
    try {
      const res = await api.post('/environmentValidation/clientsValidation', {
        body: `${TRGUser}/${TRGPassword}@${TRGInstance}`,
      });
      setTRGValidation('DB validation success');
    } catch (error) {
      setTRGValidation('DB validation failed');
      console.log(error);
    }
  };

  return (
    <div className='page-fixed-position-sidebar'>
      <div className='environment-validation-page-container'>
        <div className='environment-validation-page-box-container'>
          <div className='environment-validation-page-box-title'>
            <h1>Validate environement configuration</h1>
          </div>
          <div className='environment-validation-page-box-submit-alert'></div>
          <div className='environment-validation-page-box-form'>
            <div className='environment-validation-page-box-db-details'>
              <div className='environment-validation-page-box-input'>
                <span className='environment-validation-page-box-input-title'>
                  Source User
                </span>
                <input
                  value={SRCUser}
                  name='SRCUser'
                  onChange={(e) => onChange(e)}
                  type='text'
                  required
                ></input>
              </div>
              <h6>/</h6>
              <div className='environment-validation-page-box-input'>
                <span className='environment-validation-page-box-input-title'>
                  Source Password
                </span>
                <input
                  value={SRCPassword}
                  name='SRCPassword'
                  onChange={(e) => onChange(e)}
                  type='password'
                  required
                ></input>
              </div>
              <h6>@</h6>
              <div className='environment-validation-page-box-input'>
                <span className='environment-validation-page-box-input-title'>
                  Source Instance
                </span>
                <input
                  value={SRCInstance}
                  name='SRCInstance'
                  onChange={(e) => onChange(e)}
                  type='text'
                  required
                ></input>
              </div>
              {SRCValidation === 'loading' && (
                <i class='bx bx-loader bx-spin'></i>
              )}
              {SRCValidation === 'DB validation success' && (
                <i class='bx bx-check'></i>
              )}
              {SRCValidation === 'DB validation failed' && (
                <i class='bx bx-error-circle'></i>
              )}
            </div>

            <div className='environment-validation-page-box-db-details'>
              <div className='environment-validation-page-box-input'>
                <span className='environment-validation-page-box-input-title'>
                  Target User
                </span>
                <input
                  value={TRGUser}
                  name='TRGUser'
                  onChange={(e) => onChange(e)}
                  type='text'
                  required
                ></input>
              </div>
              <h6>/</h6>
              <div className='environment-validation-page-box-input'>
                <span className='environment-validation-page-box-input-title'>
                  Target Password
                </span>
                <input
                  value={TRGPassword}
                  name='TRGPassword'
                  onChange={(e) => onChange(e)}
                  type='password'
                  required
                ></input>
              </div>
              <h6>@</h6>
              <div className='environment-validation-page-box-input'>
                <span className='environment-validation-page-box-input-title'>
                  Target Instance
                </span>
                <input
                  value={TRGInstance}
                  name='TRGInstance'
                  onChange={(e) => onChange(e)}
                  type='text'
                  required
                ></input>
              </div>
              {TRGValidation === 'loading' && (
                <i class='bx bx-loader bx-spin'></i>
              )}
              {TRGValidation === 'DB validation success' && (
                <i class='bx bx-check'></i>
              )}
              {TRGValidation === 'DB validation failed' && (
                <i class='bx bx-error-circle'></i>
              )}
            </div>
          </div>
          <div className='environment-validation-page-box-submit'>
            <button
              onClick={(e) => {
                handleSubmit(e);
              }}
              className='environment-validation-page-box-input-button'
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnvironmentValidation;
