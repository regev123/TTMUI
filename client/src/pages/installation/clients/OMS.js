import React, { useEffect, useState } from 'react';
import './OMS.css';

const OMS = ({ OMSformData, setOMSformData }) => {
  const {
    OMS_EPCT_DP_PATH,
    OMS_SRC_DB_USER,
    OMS_SRC_DB_PASSWORD,
    OMS_SRC_DB_INSTANCE,
    OMS_TRG_DB_CONN_STRING,
  } = OMSformData;

  const onChange = (e) => {
    const { name, value } = e.target;

    setOMSformData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <div className='installation-oms-component-container'>
      <div className='installation-oms-component-title'>
        <h1>OMS configuration</h1>
      </div>

      <div className='installation-oms-component-form'>
        <div className='installation-oms-component-form-input'>
          <span className='installation-oms-component-form-input-title'>
            OMS Path for the Oracle Data Pump directory
          </span>
          <input
            value={OMS_EPCT_DP_PATH}
            name='OMS_EPCT_DP_PATH'
            onChange={(e) => onChange(e)}
            type='text'
            required
          ></input>
        </div>
        <div className='installation-oms-component-form-input'>
          <span className='installation-oms-component-form-input-title'>
            OMS Source DB User
          </span>
          <input
            value={OMS_SRC_DB_USER}
            name='OMS_SRC_DB_USER'
            onChange={(e) => onChange(e)}
            type='text'
            required
          ></input>
        </div>
        <div className='installation-oms-component-form-input'>
          <span className='installation-oms-component-form-input-title'>
            OMS Source DB Password
          </span>
          <input
            value={OMS_SRC_DB_PASSWORD}
            name='OMS_SRC_DB_PASSWORD'
            onChange={(e) => onChange(e)}
            type='text'
            required
          ></input>
        </div>
        <div className='installation-oms-component-form-input'>
          <span className='installation-oms-component-form-input-title'>
            OMS Source DB Instance
          </span>
          <input
            value={OMS_SRC_DB_INSTANCE}
            name='OMS_SRC_DB_INSTANCE'
            onChange={(e) => onChange(e)}
            type='text'
            required
          ></input>
        </div>
        <div className='installation-oms-component-form-input'>
          <span className='installation-oms-component-form-input-title'>
            OMS Target DB Connection String
          </span>
          <input
            value={OMS_TRG_DB_CONN_STRING}
            name='OMS_TRG_DB_CONN_STRING'
            onChange={(e) => onChange(e)}
            type='text'
            required
          ></input>
        </div>
      </div>
    </div>
  );
};

export default OMS;
