import React, { useEffect, useState, useCallback } from 'react';
import './History.css';
import api from '../../utils/api'; // Import the API utility for making requests
import ToggleButton from '../../components/layout/ToggleButton'; // Import ToggleButton component
import Dropdown from '../../components/layout/Dropdown'; // Import Dropdown component
import Spinner from '../../components/layout/Spinner'; // Import Spinner component for loading state

const History = () => {
  // State variables to manage component state
  const [isPackager, setIsPackager] = useState(true); // Toggle between Packager and Deployer logs
  const [selected, setSelected] = useState(''); // Selected log file name
  const [logs, setLogs] = useState({ packager: [], deployer: [] }); // Store logs for both Packager and Deployer
  const [selectedLogContent, setSelectedLogContent] = useState(''); // Content of the selected log
  const [loading, setLoading] = useState(true); // Loading state for fetch operation
  const [alert, setAlert] = useState(''); // Alert message for error handling

  // Function to sanitize invalid characters from JSON response
  const sanitizeJSONString = (str) => {
    return str
      .split('')
      .filter((char) => char >= ' ' && char !== '\u007F')
      .join('');
  };

  // Function to sort logs based on timestamp extracted from filename
  const sortLogs = (logs) => {
    return logs.sort((a, b) => {
      const extractTimestamp = (fileName) =>
        fileName.match(/_(\d+T\d+)\.log$/)?.[1] || ''; // Extract timestamp using regex
      return extractTimestamp(b.fileName).localeCompare(
        extractTimestamp(a.fileName)
      ); // Compare timestamps
    });
  };

  // Fetch logs from the server using an async function
  const fetchLogs = useCallback(async () => {
    try {
      const [resPackager, resDeployer] = await Promise.all([
        // Fetch both log lists concurrently
        api.post('/history/getPackagerLogList'),
        api.post('/history/getDeployerLogList'),
      ]);
      // Update state with sanitized and sorted logs
      setLogs({
        packager: sortLogs(
          JSON.parse(sanitizeJSONString(resPackager.data.stdout))
        ),
        deployer: sortLogs(
          JSON.parse(sanitizeJSONString(resDeployer.data.stdout))
        ),
      });
    } catch (err) {
      setAlert(err.response?.data || 'An error occurred'); // Set alert message on error
      console.error(err); // Log error for debugging
    } finally {
      setLoading(false); // Ensure loading is set to false in both success and error cases
    }
  }, []); // Empty dependency array to run only on mount

  useEffect(() => {
    fetchLogs(); // Fetch logs when the component mounts
  }, [fetchLogs]); // Dependency on fetchLogs to avoid stale closures

  // Update selected log content when `selected` or `isPackager` changes
  useEffect(() => {
    if (selected) {
      // Find the current log based on selected file name
      const currentLog = logs[isPackager ? 'packager' : 'deployer'].find(
        (log) => log.fileName === selected
      );
      setSelectedLogContent(currentLog ? currentLog.fileContent : ''); // Update log content or reset
    } else {
      setSelectedLogContent(''); // Reset content if no log is selected
    }
  }, [selected, isPackager, logs]); // Dependencies to re-run when these change

  if (loading) return <Spinner />; // Show loading spinner while fetching logs

  return (
    <div className='page-fixed-position-sidebar'>
      <div className='history-page-container'>
        <div className='history-page-container-run-deployer'>
          <ToggleButton
            isDefault={isPackager} // Pass current toggle state
            setisDefault={setIsPackager} // Function to toggle state
            defaultOption='Packager' // First option label
            secondOption='Deployer' // Second option label
            setSelected={setSelected} // Reset selected log when toggling
          />
        </div>
        <Dropdown
          selected={selected} // Current selected log
          setSelected={setSelected} // Function to update selected log
          options={logs[isPackager ? 'packager' : 'deployer']} // Show logs based on current toggle state
        />
        {alert && <span className='history-page-alert'>{alert}</span>}
        <div className='history-page-textarea-container'>
          <textarea
            className='history-page-textarea'
            value={selectedLogContent} // Show content of selected log
            readOnly // Prevent editing
          />
        </div>
      </div>
    </div>
  );
};

export default History; // Export the History component for use in other parts of the application
