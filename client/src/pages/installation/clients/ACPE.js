import React, { useEffect, useState } from 'react';
import './ACPE.css';

const ACPE = ({ ACPEformData, setACPEFormData }) => {
  const {
    ACPE_EPCT_DP_PATH,
    ACPE_SRC_DB_USER,
    ACPE_SRC_DB_PASSWORD,
    ACPE_SRC_DB_INSTANCE,
    ACPE_TRG_DB_CONN_STRING,
  } = ACPEformData;

  const onChange = (e) => {
    const { name, value } = e.target;

    setACPEFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <div className='installation-acpe-component-container'>
      <div className='installation-acpe-component-title'>
        <h1>ACPE configuration</h1>
      </div>

      <div className='installation-acpe-component-form'>
        <div className='installation-acpe-component-form-input'>
          <span className='installation-acpe-component-form-input-title'>
            ACPE Path for the Oracle Data Pump directory
          </span>
          <input
            value={ACPE_EPCT_DP_PATH}
            name='ACPE_EPCT_DP_PATH'
            onChange={(e) => onChange(e)}
            type='text'
            required
          ></input>
        </div>
        <div className='installation-acpe-component-form-input'>
          <span className='installation-acpe-component-form-input-title'>
            ACPE Source DB User
          </span>
          <input
            value={ACPE_SRC_DB_USER}
            name='ACPE_SRC_DB_USER'
            onChange={(e) => onChange(e)}
            type='text'
            required
          ></input>
        </div>
        <div className='installation-acpe-component-form-input'>
          <span className='installation-acpe-component-form-input-title'>
            ACPE Source DB Password
          </span>
          <input
            value={ACPE_SRC_DB_PASSWORD}
            name='ACPE_SRC_DB_PASSWORD'
            onChange={(e) => onChange(e)}
            type='text'
            required
          ></input>
        </div>
        <div className='installation-acpe-component-form-input'>
          <span className='installation-acpe-component-form-input-title'>
            ACPE Source DB Instance
          </span>
          <input
            value={ACPE_SRC_DB_INSTANCE}
            name='ACPE_SRC_DB_INSTANCE'
            onChange={(e) => onChange(e)}
            type='text'
            required
          ></input>
        </div>
        <div className='installation-acpe-component-form-input'>
          <span className='installation-acpe-component-form-input-title'>
            ACPE Target DB Connection String
          </span>
          <input
            value={ACPE_TRG_DB_CONN_STRING}
            name='ACPE_TRG_DB_CONN_STRING'
            onChange={(e) => onChange(e)}
            type='text'
            required
          ></input>
        </div>
      </div>
    </div>
  );
};

export default ACPE;
