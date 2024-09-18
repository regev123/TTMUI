import React, { useEffect, useState } from 'react';
import './History.css';
import api from '../../utils/api';
import ToggleButton from '../../components/layout/ToggleButton';
import Dropdown from '../../components/layout/Dropdown';
import Spinner from '../../components/layout/Spinner';

const History = () => {
  const [isPackager, setIsPackager] = useState(true);
  const [selected, setSelected] = useState('');
  const [packagerLog, setPackagerLog] = useState(null);
  const [deployerLog, setDeployerLog] = useState(null);
  const [selectedLogContent, setSelectedLogContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.post('/validation/validateTTMHomeCorrectPath');
        const resPackager = await api.post('/history/getPackagerLogList');
        setPackagerLog(JSON.parse(resPackager.data.stdout));

        const resDeployer = await api.post('/history/getDeployerLogList');
        setDeployerLog(JSON.parse(resDeployer.data.stdout));
        setLoading(false);
      } catch (err) {
        setAlert(err.response?.data || 'An error occurred');
        setLoading(false);
        console.error(err);
      }
    };

    fetchLogs();
  }, []);

  useEffect(() => {
    if (selected === '') setSelectedLogContent('');
    else {
      if (isPackager) {
        packagerLog.map((log) => {
          if (log.fileName === selected) setSelectedLogContent(log.fileContent);
        });
      } else {
        deployerLog.map((log) => {
          if (log.fileName === selected) setSelectedLogContent(log.fileContent);
        });
      }
    }
  }, [selected]);

  if (loading) return <Spinner />;

  return (
    <div className='page-fixed-position-sidebar'>
      <div className='history-page-container'>
        <div className='history-page-container-run-deployer'>
          <ToggleButton
            isDefault={isPackager}
            setisDefault={setIsPackager}
            defaultOption='Packager'
            secondOption='Deployer'
            setSelected={setSelected}
          />
        </div>

        <Dropdown
          selected={selected}
          setSelected={setSelected}
          options={isPackager ? packagerLog : deployerLog}
        />

        {alert !== '' && <span className='history-page-alert'>{alert}</span>}

        <div className='history-page-textarea-container'>
          <textarea
            className='history-page-textarea'
            value={selectedLogContent}
            readOnly
          ></textarea>
        </div>
      </div>
    </div>
  );
};

export default History;
