import React, { useEffect, useState } from 'react';
import './MECProfile.css';
import api from '../../utils/api';
import Spinner from '../../components/layout/Spinner';
import Dropdown from '../../components/layout/Dropdown';

const initialFormData = {
  SRC_DB_CONN_STRING: '',
  TRG_DB_CONN_STRING: '',
};

const MECProfile = () => {
  const [emailFormData, setEmailFormData] = useState({
    EmailChcekcd: false,
    EmailString: '',
  });
  const [selected, setSelected] = useState('');
  const [clients, setClients] = useState(null);
  const [alert, setAlert] = useState('');
  const [loading, setLoading] = useState({
    loadEmailConfiguration: true,
    loadExistingClients: true,
    loadDBDetaildForClient: false,
  });
  const { EmailChcekcd, EmailString } = emailFormData;

  useEffect(() => {
    const fetchData = async () => {
      try {
        let res = await api.post('/validation/validateTTMHomeCorrectPath');

        res = await api.post('/util/getExistingClients');

        const updatedClients = {
          ABP: {
            exists: res.data.includes('ABP'),
            ...initialFormData,
          },
          OMS: {
            exists: res.data.includes('OMS'),
            ...initialFormData,
          },
          OMS_SE: {
            exists: res.data.includes('OMS_SE'),
            ...initialFormData,
          },
          MCSS_SE: {
            exists: res.data.includes('MCSS_SE'),
            ...initialFormData,
          },
          ACPE: {
            exists: res.data.includes('ACPE'),
            ...initialFormData,
          },
        };

        setClients(updatedClients);
      } catch (err) {
        setAlert(err.response.data);
        console.error(err);
      } finally {
        updateLoadExistingClients(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.get('/configuration/getReportEmail');
        setEmailFormData({
          EmailChcekcd: res.data.EmailSelected === 'Y' ? true : false,
          EmailString: res.data.EmailString,
        });
      } catch (error) {
        console.log(error);
      } finally {
        updateLoadEmailConfiguration(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (clients[selected]?.SRC_DB_CONN_STRING === '') {
          updateLoadDBDetaildForClient(true);
          const res = await api.post('/configuration/getDBDetails', {
            selected,
          });
          const mergedObj = { ...clients, ...res.data };
          setClients(mergedObj);
        }
      } catch (error) {
        console.log(error);
      } finally {
        updateLoadDBDetaildForClient(false);
      }
    };
    fetchData();
  }, [selected]);

  const updateLoadExistingClients = (value) => {
    setLoading((prevState) => ({
      ...prevState,
      loadExistingClients: value,
    }));
  };

  const updateLoadEmailConfiguration = (value) => {
    setLoading((prevState) => ({
      ...prevState,
      loadEmailConfiguration: value,
    }));
  };

  const updateLoadDBDetaildForClient = (value) => {
    setLoading((prevState) => ({
      ...prevState,
      loadDBDetaildForClient: value,
    }));
  };

  const handleSubmitEmail = async (e) => {
    setLoading(true);
    try {
      const res = await api.post(
        '/configuration/changeReportEmail',
        emailFormData
      );
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDBConfiguration = async () => {
    const filteredClients = Object.keys(clients).reduce((acc, key) => {
      const client = clients[key];
      if (client.exists && client.SRC_DB_CONN_STRING !== '') {
        acc[key] = client;
      }
      return acc;
    }, {});
    try {
      const res = await api.post(
        '/configuration/setDBDetails',
        filteredClients
      );
    } catch (error) {
      console.log(error);
    } finally {
    }
  };

  const onChangeEmail = (e) => {
    const { name, value } = e.target;

    // Update formData state
    setEmailFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const onChangeDBDetails = (e) => {
    const { name, value } = e.target;

    setClients((prevData) => ({
      ...prevData,
      [selected]: {
        ...prevData[selected],
        [name]: value,
      },
    }));
  };

  const handleEmailChange = () => {
    setEmailFormData((prevData) => ({
      ...prevData,
      EmailChcekcd: !prevData.EmailChcekcd,
    }));
  };

  if (loading.loadEmailConfiguration || loading.loadExistingClients)
    return <Spinner />;

  return (
    <div className='page-fixed-position-sidebar'>
      <div className='mec-profile-page-container'>
        <div className='mec-profile-page-box-container'>
          <div className='mec-profile-page-box-title'>
            <h1>Email Configuration</h1>
          </div>
          <div className='mec-profile-page-box-email-form'>
            <div className='mec-profile-page-box-email-details'>
              <div className='mec-profile-page-email-checkbox'>
                <label>
                  <input
                    type='checkbox'
                    checked={EmailChcekcd}
                    onChange={() => handleEmailChange()}
                  />
                  Send Email
                </label>
              </div>
              <div className='mec-profile-page-box-email-input'>
                <span className='mec-profile-page-box-email-input-title'>
                  Email
                </span>
                <input
                  value={EmailChcekcd ? EmailString : ''}
                  name='EmailString'
                  onChange={(e) => onChangeEmail(e)}
                  type='text'
                  required
                  disabled={!EmailChcekcd}
                ></input>
              </div>
              <div className='mec-profile-page-box-email-submit'>
                <button
                  onClick={(e) => {
                    handleSubmitEmail(e);
                  }}
                  className='mec-profile-page-box-input-email-button'
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className='mec-profile-page-box-container'>
          <div className='mec-profile-page-box-title'>
            <h1>DB Details Configuration</h1>
          </div>

          <Dropdown
            selected={selected}
            setSelected={setSelected}
            options={Object.keys(clients).filter((key) => clients[key].exists)}
          />

          <div className='mec-profile-page-box-email-form'>
            <div className='mec-profile-page-box-email-details'>
              <div className='mec-profile-page-email-checkbox'></div>
              <div className='mec-profile-page-box-email-input'>
                <span className='mec-profile-page-box-email-input-title'>
                  Source DB
                </span>
                <input
                  value={
                    selected === ''
                      ? selected
                      : clients[selected].SRC_DB_CONN_STRING
                  }
                  placeholder={loading.loadDBDetaildForClient && 'Loading...'}
                  name='SRC_DB_CONN_STRING'
                  onChange={(e) => onChangeDBDetails(e)}
                  type='text'
                  required
                  disabled={selected === '' || loading.loadDBDetaildForClient}
                ></input>
              </div>
              <div className='mec-profile-page-box-email-input'>
                <span className='mec-profile-page-box-email-input-title'>
                  Target DB
                </span>
                <input
                  value={
                    selected === ''
                      ? selected
                      : clients[selected].TRG_DB_CONN_STRING
                  }
                  placeholder={loading.loadDBDetaildForClient && 'Loading...'}
                  name='TRG_DB_CONN_STRING'
                  onChange={(e) => onChangeDBDetails(e)}
                  type='text'
                  required
                  disabled={selected === '' || loading.loadDBDetaildForClient}
                ></input>
              </div>
              <div className='mec-profile-page-box-email-submit'>
                <button
                  onClick={() => {
                    handleSubmitDBConfiguration();
                  }}
                  className='mec-profile-page-box-input-email-button'
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MECProfile;
