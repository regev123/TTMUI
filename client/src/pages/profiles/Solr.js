import React, { useState } from 'react';

import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';
import AlertMessage from '../../components/common/AlertMessage';

import setUpSolr from '../../hooks/submitHandlers/handleSubmitUpSolr';
import setPingSolr from '../../hooks/submitHandlers/handleSubmitPingSolr';

const Solr = ({ selectedProfile }) => {
  const [solrForm, setSolrForm] = useState({
    Username: '',
    Password: '',
    Host: '',
  });
  const [pageAlert, setPageAlert] = useState('');
  const [buttonTitle, setButtonTitle] = useState('Ping');
  const [isLoading, setIsLoading] = useState(false);

  const { Username, Password, Host } = solrForm;

  const onChange = (name, value) => {
    setSolrForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (buttonTitle === 'Ping') {
      await setPingSolr(
        Username,
        Password,
        Host,
        setIsLoading,
        setButtonTitle,
        setPageAlert
      );
    } else {
      await setUpSolr(
        Username,
        Password,
        Host,
        setIsLoading,
        setButtonTitle,
        setPageAlert
      );
    }
  };

  return (
    <div className='component-container'>
      <h1>{selectedProfile.split('_').join(' ')} Solr Activation</h1>
      <div className='elements-in-one-line'>
        <InputField
          name={'Username'}
          title={`Solr User`}
          value={Username}
          onChange={onChange}
        />
        <InputField
          name={'Password'}
          title={`Solr Password`}
          value={Password}
          onChange={onChange}
        />
        <InputField
          name={'Host'}
          title={`Solr Host`}
          value={Host}
          onChange={onChange}
        />
      </div>
      <div className='elements-in-one-line'>
        <Button title={buttonTitle} onClick={handleSubmit} />
        {pageAlert && (
          <AlertMessage message={pageAlert} isSuccess={pageAlert === 'UP'} />
        )}
        {isLoading && <i className='bx bx-loader bx-spin icon-style' />}
      </div>
    </div>
  );
};

export default Solr;
