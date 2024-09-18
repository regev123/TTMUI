import React, { useEffect, useState } from 'react';
import './OMS_SE.css';

const OMS_SE = ({ OMSSEformData, setOMSSEformData }) => {
  const {
    OMS_SE_EPCT_DP_PATH,
    OMS_SE_SRC_DB_USER,
    OMS_SE_SRC_DB_PASSWORD,
    OMS_SE_SRC_DB_INSTANCE,
    OMS_SE_TRG_DB_CONN_STRING,
  } = OMSSEformData;

  const onChange = (e) => {
    const { name, value } = e.target;

    setOMSSEformData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <div className='installation-oms_se-component-container'>
      <div className='installation-oms_se-component-title'>
        <h1>OMS SE configuration</h1>
      </div>

      <div className='installation-oms_se-component-form'>
        <div className='installation-oms_se-component-form-input'>
          <span className='installation-oms_se-component-form-input-title'>
            OMS SE Path for the Oracle Data Pump directory
          </span>
          <input
            value={OMS_SE_EPCT_DP_PATH}
            name='OMS_SE_EPCT_DP_PATH'
            onChange={(e) => onChange(e)}
            type='text'
            required
          ></input>
        </div>
        <div className='installation-oms_se-component-form-input'>
          <span className='installation-oms_se-component-form-input-title'>
            OMS SE Source DB User
          </span>
          <input
            value={OMS_SE_SRC_DB_USER}
            name='OMS_SE_SRC_DB_USER'
            onChange={(e) => onChange(e)}
            type='text'
            required
          ></input>
        </div>
        <div className='installation-oms_se-component-form-input'>
          <span className='installation-oms_se-component-form-input-title'>
            OMS SE Source DB Password
          </span>
          <input
            value={OMS_SE_SRC_DB_PASSWORD}
            name='OMS_SE_SRC_DB_PASSWORD'
            onChange={(e) => onChange(e)}
            type='text'
            required
          ></input>
        </div>
        <div className='installation-oms_se-component-form-input'>
          <span className='installation-oms_se-component-form-input-title'>
            OMS SE Source DB Instance
          </span>
          <input
            value={OMS_SE_SRC_DB_INSTANCE}
            name='OMS_SE_SRC_DB_INSTANCE'
            onChange={(e) => onChange(e)}
            type='text'
            required
          ></input>
        </div>
        <div className='installation-oms_se-component-form-input'>
          <span className='installation-oms_se-component-form-input-title'>
            OMS SE Target DB Connection String
          </span>
          <input
            value={OMS_SE_TRG_DB_CONN_STRING}
            name='OMS_SE_TRG_DB_CONN_STRING'
            onChange={(e) => onChange(e)}
            type='text'
            required
          ></input>
        </div>
      </div>
    </div>
  );
};

export default OMS_SE;
