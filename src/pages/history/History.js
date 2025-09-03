import React, { useEffect, useState, useCallback, useRef } from 'react';
import fetchLogs from '../../hooks/fetchData/useFetchHistoryLogs';
import ToggleButton from '../../components/layout/ToggleButton';
import Dropdown from '../../components/common/Dropdown';
import Spinner from '../../components/layout/Spinner';
import Textarea from '../../components/common/Textarea';
import AlertMessage from '../../components/common/AlertMessage';
import Filter from '../../components/common/Filter';
import Button from '../../components/common/Button';
import SpinIcon from '../../components/common/SpinIcon';
import api from '../../utils/api';

/**
 * @component History
 * @desc    Displays a UI for viewing history logs. Allows toggling between "Packager" and "Deployer" logs,
 *          selecting a log file to view its content, and handles loading and error states.
 * @returns {JSX.Element} - Rendered component containing the log viewer interface.
 *
 * Internal Functions:
 *
 * fetchLogs - Fetches log data from the server and updates the logs state.
 * updateLogContent - Updates the content of the selected log file based on the current state.
 * getSelectedLog - Retrieves the log object corresponding to the selected log file.
 * getLogFileNames - Retrieves the file names of the logs for the currently selected log type (Packager or Deployer).
 */
const History = () => {
  const [isPackager, setIsPackager] = useState(true);
  const [selectedLog, setSelectedLog] = useState('');
  const [logs, setLogs] = useState({ packager: [], deployer: [] });
  const [logContent, setLogContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState('');
  const [TTMHomePath, setTTMHomePath] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('All');
  const [logFileNameOptions, setLogFileNameOptions] = useState([]);
  const [disableDelete, setDisableSubmit] = useState(false);

  useEffect(() => {
    fetchLogs(setIsLoading, setLogs, setAlertMessage, setTTMHomePath);
  }, []);

  useEffect(() => {
    setStatus('All');
    setDate('');

    setLogFileNameOptions(getInitLogsFileOptions());
  }, [logs, isPackager]);

  useEffect(() => {
    setLogContent('');
  }, [isPackager]);

  useEffect(() => {
    setSelectedLog('');
    setLogContent('');
    const initLogs = getInitLogsFileOptions();
    const filteredByStatus = FilterByStatus(initLogs);
    const filteredByDate = FilterByDate(filteredByStatus);
    setLogFileNameOptions(filteredByDate);
  }, [status, date]);

  const updateLogContent = useCallback(() => {
    if (isLoading || !selectedLog) return;
    const currentLog = getSelectedLog();
    setLogContent(currentLog ? currentLog.fileContent : '');
  }, [isPackager, selectedLog, logs]);

  const getSelectedLog = () => {
    const logType = isPackager ? 'packager' : 'deployer';
    return logs[logType].find((log) => log.fileName === selectedLog);
  };

  useEffect(() => {
    updateLogContent();
  }, [updateLogContent]);

  const getInitLogsFileOptions = () => {
    const logType = isPackager ? 'packager' : 'deployer';
    return logs[logType].map((log) => log.fileName);
  };

  const FilterByStatus = (logsToFilter) => {
    if (status === 'All') return logsToFilter;
    if (status === 'Success')
      return logsToFilter.filter((logName) => logName.endsWith('Success'));
    else return logsToFilter.filter((logName) => logName.endsWith('Failure'));
  };

  const FilterByDate = (logsToFilter) => {
    const formattedDate = date.replace(/-/g, '');
    return logsToFilter.filter((log) => log.includes(formattedDate));
  };

  const getCleanFileName = (str) => {
    return str.replace(/\.log.*/, '.log');
  };

  const handleDeleteSubmit = async () => {
    setDisableSubmit(true);
    try {
      await api.delete(
        `/history/deleteSelectedLog/${getCleanFileName(selectedLog)}`
      );
      removeLogFromList();
    } catch (error) {
      setAlertMessage('Failed to delete Log file');
    } finally {
      setDisableSubmit(false);
    }
  };

  const removeLogFromList = () => {
    const logType = isPackager ? 'packager' : 'deployer';
    const updatedLogs = logs[logType].filter(
      (log) => log.fileName !== selectedLog
    );
    setLogs({ ...logs, [logType]: updatedLogs });
    setSelectedLog('');
    setLogContent('');
  };

  if (isLoading) return <Spinner />;

  return (
    <div className='page-fixed-position-sidebar'>
      <div className='page-container'>
        <div>
          <ToggleButton
            isDefault={isPackager}
            toggleDefaultState={setIsPackager}
            defaultLabel='Packager'
            secondLabel='Deployer'
            setSelected={setSelectedLog}
          />
        </div>

        <Filter
          date={date}
          setDate={setDate}
          status={status}
          setStatus={setStatus}
        />
        <div className='elements-in-one-line'>
          {logs[isPackager ? 'packager' : 'deployer'].length > 0 && (
            <Dropdown
              selected={selectedLog}
              setSelected={setSelectedLog}
              options={logFileNameOptions}
              title='Select Log File'
            />
          )}

          {selectedLog && (
            <div className='elements-in-one-line'>
              <Button
                onClick={handleDeleteSubmit}
                title='Delete'
                disabled={disableDelete}
              />
              {disableDelete && <SpinIcon />}
            </div>
          )}
        </div>

        {alertMessage && (
          <AlertMessage message={alertMessage} isSuccess={false} />
        )}

        <Textarea value={logContent} />

        {selectedLog && (
          <h2>
            {TTMHomePath}WORK_DIR/{getCleanFileName(selectedLog)}
          </h2>
        )}
      </div>
    </div>
  );
};

export default History;
