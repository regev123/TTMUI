import React, { useEffect, useState } from 'react';
import './MCSS_SE.css';

const MCSS_SE = ({ MCSSSEformData, setMCSSSEformData }) => {
  const {
    MCSS_SE_EPCT_DP_PATH,
    MCSS_SE_SRC_DB_USER,
    MCSS_SE_SRC_DB_PASSWORD,
    MCSS_SE_SRC_DB_INSTANCE,
    MCSS_SE_TRG_DB_CONN_STRING,
  } = MCSSSEformData;

  const onChange = (e) => {
    const { name, value } = e.target;

    setMCSSSEformData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <div className='installation-mcss_se-component-container'>
      <div className='installation-mcss_se-component-title'>
        <h1>MCSS SE configuration</h1>
      </div>

      <div className='installation-mcss_se-component-form'>
        <div className='installation-mcss_se-component-form-input'>
          <span className='installation-mcss_se-component-form-input-title'>
            MCSS SE Path for the Oracle Data Pump directory
          </span>
          <input
            value={MCSS_SE_EPCT_DP_PATH}
            name='MCSS_SE_EPCT_DP_PATH'
            onChange={(e) => onChange(e)}
            type='text'
            required
          ></input>
        </div>
        <div className='installation-mcss_se-component-form-input'>
          <span className='installation-mcss_se-component-form-input-title'>
            MCSS SE Source DB User
          </span>
          <input
            value={MCSS_SE_SRC_DB_USER}
            name='MCSS_SE_SRC_DB_USER'
            onChange={(e) => onChange(e)}
            type='text'
            required
          ></input>
        </div>
        <div className='installation-mcss_se-component-form-input'>
          <span className='installation-mcss_se-component-form-input-title'>
            MCSS SE Source DB Password
          </span>
          <input
            value={MCSS_SE_SRC_DB_PASSWORD}
            name='MCSS_SE_SRC_DB_PASSWORD'
            onChange={(e) => onChange(e)}
            type='text'
            required
          ></input>
        </div>
        <div className='installation-mcss_se-component-form-input'>
          <span className='installation-mcss_se-component-form-input-title'>
            MCSS SE Source DB Instance
          </span>
          <input
            value={MCSS_SE_SRC_DB_INSTANCE}
            name='MCSS_SE_SRC_DB_INSTANCE'
            onChange={(e) => onChange(e)}
            type='text'
            required
          ></input>
        </div>
        <div className='installation-mcss_se-component-form-input'>
          <span className='installation-mcss_se-component-form-input-title'>
            MCSS SE Target DB Connection String
          </span>
          <input
            value={MCSS_SE_TRG_DB_CONN_STRING}
            name='MCSS_SE_TRG_DB_CONN_STRING'
            onChange={(e) => onChange(e)}
            type='text'
            required
          ></input>
        </div>
      </div>
    </div>
  );
};

export default MCSS_SE;
