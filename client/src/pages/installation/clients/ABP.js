import React, { useEffect, useState } from 'react';
import './ABP.css';

const ABP = ({ ABPformData, setABPFormData }) => {
  const {
    ABP_EPCT_DP_PATH,
    ABP_SRC_DB_USER,
    ABP_SRC_DB_PASSWORD,
    ABP_SRC_DB_INSTANCE,
    ABP_TRG_DB_CONN_STRING,
  } = ABPformData;

  const onChange = (e) => {
    const { name, value } = e.target;

    setABPFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <div className='installation-abp-component-container'>
      <div className='installation-abp-component-title'>
        <h1>ABP configuration</h1>
      </div>

      <div className='installation-abp-component-form'>
        <div className='installation-abp-component-form-input'>
          <span className='installation-abp-component-form-input-title'>
            ABP Path for the Oracle Data Pump directory
          </span>
          <input
            value={ABP_EPCT_DP_PATH}
            name='ABP_EPCT_DP_PATH'
            onChange={(e) => onChange(e)}
            type='text'
            required
          ></input>
        </div>
        <div className='installation-abp-component-form-input'>
          <span className='installation-abp-component-form-input-title'>
            ABP Source DB User
          </span>
          <input
            value={ABP_SRC_DB_USER}
            name='ABP_SRC_DB_USER'
            onChange={(e) => onChange(e)}
            type='text'
            required
          ></input>
        </div>
        <div className='installation-abp-component-form-input'>
          <span className='installation-abp-component-form-input-title'>
            ABP Source DB Password
          </span>
          <input
            value={ABP_SRC_DB_PASSWORD}
            name='ABP_SRC_DB_PASSWORD'
            onChange={(e) => onChange(e)}
            type='text'
            required
          ></input>
        </div>
        <div className='installation-abp-component-form-input'>
          <span className='installation-abp-component-form-input-title'>
            ABP Source DB Instance
          </span>
          <input
            value={ABP_SRC_DB_INSTANCE}
            name='ABP_SRC_DB_INSTANCE'
            onChange={(e) => onChange(e)}
            type='text'
            required
          ></input>
        </div>
        <div className='installation-abp-component-form-input'>
          <span className='installation-abp-component-form-input-title'>
            ABP Target DB Connection String
          </span>
          <input
            value={ABP_TRG_DB_CONN_STRING}
            name='ABP_TRG_DB_CONN_STRING'
            onChange={(e) => onChange(e)}
            type='text'
            required
          ></input>
        </div>
      </div>
    </div>
  );
};

export default ABP;
