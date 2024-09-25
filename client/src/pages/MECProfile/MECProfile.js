import React, { useEffect, useState } from 'react';
import './MECProfile.css';
import api from '../../utils/api';
import Spinner from '../../components/layout/Spinner';

const MECProfile = () => {
  const [emailFormData, setEmailFormData] = useState({
    EmailChcekcd: false,
    EmailString: '',
  });
  const [alert, setAlert] = useState('');
  const [loading, setLoading] = useState(true);
  const { EmailChcekcd, EmailString } = emailFormData;

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
        setLoading(false);
      }
    }
    fetchData();
  }, []);

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

  const onChangeEmail = (e) => {
    const { name, value } = e.target;

    // Update formData state
    setEmailFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleEmailChange = () => {
    setEmailFormData((prevData) => ({
      ...prevData,
      EmailChcekcd: !prevData.EmailChcekcd,
    }));
  };

  if (loading) return <Spinner />;

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
      </div>
    </div>
  );
};

export default MECProfile;
