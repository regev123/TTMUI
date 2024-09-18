import React, { useEffect, useState } from 'react';
import './installation.css';
import api from '../../utils/api';
import ABP from './clients/ABP';
import OMS from './clients/OMS';
import OMS_SE from './clients/OMS_SE';
import MCSS_SE from './clients/MCSS_SE';
import ACPE from './clients/ACPE';

const _ = require('lodash');

const Installation = () => {
  const [ABPchecked, setABPchecked] = React.useState(false);
  const [OMSchecked, setOMSchecked] = React.useState(false);
  const [OMSSEchecked, setOMSSEchecked] = React.useState(false);
  const [MCSSSEchecked, setMCSSSEchecked] = React.useState(false);
  const [ACPEchecked, setACPEchecked] = React.useState(false);
  const [installing, setInstalling] = React.useState(false);
  const [requestStatus, setRequestStatus] = React.useState(false);

  const [ACPEformData, setACPEFormData] = useState({
    ACPE_EPCT_DP_PATH: '',
    ACPE_SRC_DB_USER: '',
    ACPE_SRC_DB_PASSWORD: '',
    ACPE_SRC_DB_INSTANCE: '',
    ACPE_TRG_DB_CONN_STRING: '',
  });

  const [ABPformData, setABPFormData] = useState({
    ABP_EPCT_DP_PATH: '',
    ABP_SRC_DB_USER: '',
    ABP_SRC_DB_PASSWORD: '',
    ABP_SRC_DB_INSTANCE: '',
    ABP_TRG_DB_CONN_STRING: '',
  });

  const [MCSSSEformData, setMCSSSEformData] = useState({
    MCSS_SE_EPCT_DP_PATH: '',
    MCSS_SE_SRC_DB_USER: '',
    MCSS_SE_SRC_DB_PASSWORD: '',
    MCSS_SE_SRC_DB_INSTANCE: '',
    MCSS_SE_TRG_DB_CONN_STRING: '',
  });

  const [OMSSEformData, setOMSSEformData] = useState({
    OMS_SE_EPCT_DP_PATH: '',
    OMS_SE_SRC_DB_USER: '',
    OMS_SE_SRC_DB_PASSWORD: '',
    OMS_SE_SRC_DB_INSTANCE: '',
    OMS_SE_TRG_DB_CONN_STRING: '',
  });

  const [OMSformData, setOMSformData] = useState({
    OMS_EPCT_DP_PATH: '',
    OMS_SRC_DB_USER: '',
    OMS_SRC_DB_PASSWORD: '',
    OMS_SRC_DB_INSTANCE: '',
    OMS_TRG_DB_CONN_STRING: '',
  });

  const handleChange = (client) => {
    switch (client) {
      case 'ABP':
        setABPchecked(!ABPchecked);
        break;
      case 'OMS':
        setOMSchecked(!OMSchecked);
        break;
      case 'OMS_SE':
        setOMSSEchecked(!OMSSEchecked);
        break;
      case 'MCSS_SE':
        setMCSSSEchecked(!MCSSSEchecked);
        break;
      case 'ACPE':
        setACPEchecked(!ACPEchecked);
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setInstalling(true);
    const clients = [];
    const clientsFormData = {};
    if (ABPchecked) {
      clients.push('ABP');
      _.merge(clientsFormData, ABPformData);
    }
    if (OMSchecked) {
      clients.push('OMS');
      _.merge(clientsFormData, OMSformData);
    }
    if (OMSSEchecked) {
      clients.push('OMS_SE');
      _.merge(clientsFormData, OMSSEformData);
    }
    if (MCSSSEchecked) {
      clients.push('MCSS_SE');
      _.merge(clientsFormData, MCSSSEformData);
    }
    if (ACPEchecked) {
      clients.push('ACPE');
      _.merge(clientsFormData, ACPEformData);
    }
    const body = { clients, clientsFormData };

    const res = await api.post('/installation/install', body);
    setInstalling(false);
    if (res.status === 200)
      setRequestStatus('Installation finished succefully');
    if (res.status === 500) setRequestStatus('Installation failed');
  };

  return (
    <div className='page-fixed-position-sidebar'>
      <div className='installation-page-container'>
        <div className='installation-page-clients-container'>
          <div className='installation-page-clients-title'>
            <h1>Choose clients</h1>
            <h1>{requestStatus}</h1>
            <div className='installation-page-clients-checkbox'>
              <label>
                <input
                  type='checkbox'
                  checked={ABPchecked}
                  onChange={() => handleChange('ABP')}
                />
                ABP
              </label>
              <label>
                <input
                  type='checkbox'
                  checked={OMSchecked}
                  onChange={() => handleChange('OMS')}
                />
                OMS
              </label>
              <label>
                <input
                  type='checkbox'
                  checked={OMSSEchecked}
                  onChange={() => handleChange('OMS_SE')}
                />
                OMS_SE
              </label>
              <label>
                <input
                  type='checkbox'
                  checked={MCSSSEchecked}
                  onChange={() => handleChange('MCSS_SE')}
                />
                MCSS_SE
              </label>
              <label>
                <input
                  type='checkbox'
                  checked={ACPEchecked}
                  onChange={() => handleChange('ACPE')}
                />
                ACPE
              </label>
            </div>
          </div>
        </div>
        {ABPchecked ? (
          <ABP ABPformData={ABPformData} setABPFormData={setABPFormData} />
        ) : null}
        {OMSchecked ? (
          <OMS OMSformData={OMSformData} setOMSformData={setOMSformData} />
        ) : null}
        {OMSSEchecked ? (
          <OMS_SE
            OMSSEformData={OMSSEformData}
            setOMSSEformData={setOMSSEformData}
          />
        ) : null}
        {MCSSSEchecked ? (
          <MCSS_SE
            MCSSSEformData={MCSSSEformData}
            setMCSSSEformData={setMCSSSEformData}
          />
        ) : null}
        {ACPEchecked ? (
          <ACPE ACPEformData={ACPEformData} setACPEFormData={setACPEFormData} />
        ) : null}
        {(ABPchecked ||
          OMSchecked ||
          OMSSEchecked ||
          ACPEchecked ||
          MCSSSEchecked) && (
          <div className='configuration-page-box-submit'>
            <button
              onClick={(e) => {
                handleSubmit(e);
              }}
              className={
                installing
                  ? 'configuration-page-box-input-button-disabled'
                  : 'configuration-page-box-input-button'
              }
              disabled={installing}
            >
              {installing ? 'installing...' : 'install'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Installation;
