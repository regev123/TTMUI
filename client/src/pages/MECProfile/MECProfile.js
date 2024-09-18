import React, { useEffect, useState } from 'react';
import './MECProfile.css';
import api from '../../utils/api';

const MECProfile = () => {
  const [emailFormData, setEmailFormData] = useState({
    EmailChcekcd: false,
    EmailString: '',
  });
  const [error, setError] = useState('');

  const { EmailChcekcd, EmailString } = emailFormData;

  //to change for get the mec profile configuration
  // useEffect(() => {
  //   async function fetchData() {
  //     try {
  //       const res = await api.get('/configuration/getConfiguration');
  //       setFormData(res.data);
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   }
  //   fetchData();
  // }, []); // Empty dependency array means this effect runs only once on mount

  const handleSubmitEmail = async (e) => {
    const res = await api.post(
      '/configuration/changeReportEmail',
      emailFormData
    );
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
                  value={EmailString}
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
