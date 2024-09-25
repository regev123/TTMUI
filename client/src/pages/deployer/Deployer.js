import React, { useEffect, useState } from 'react'; // Importing React and hooks
import './Deployer.css'; // Importing the CSS for styling
import api from '../../utils/api'; // Importing the API utility for making requests
import Spinner from '../../components/layout/Spinner'; // Importing the Spinner component for loading states

const Deployer = () => {
  // State variables to manage the component's data
  const [status, setStatus] = useState('Waiting for deployer running...'); // Status message for the deployer
  const [loading, setLoading] = useState({
    initalizeWebSocket: true, // Loading state for WebSocket initialization
    loadExistingClients: true, // Loading state for fetching existing clients
  });
  const [submitDeployerButtonText, setSubmitDeployerButtonText] =
    useState('Run Deployer'); // Button text
  const [disableSubmit, setDisableSubmit] = useState(false); // State to disable the submit button
  const [alert, setAlert] = useState(''); // State for alert messages
  const [clients, setClients] = useState({
    // State for clients and their statuses
    ABP: { exists: false, checked: false },
    OMS: { exists: false, checked: false },
    OMS_SE: { exists: false, checked: false },
    MCSS_SE: { exists: false, checked: false },
    ACPE: { exists: false, checked: false },
  });
  const [activeClientsString, setActiveClientsString] = useState(''); // String of active clients

  // Effect to initialize WebSocket and fetch deployer port
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetching the WebSocket port for the deployer
        const res = await api.get('/configuration/getwsDeployerPort');
        const socket = new WebSocket(
          `ws://localhost:${res.data.wsDeployerPort}`
        );

        // Handle incoming messages from the WebSocket
        socket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          setStatus((prev) => `${prev}\n${data.stdout}`); // Update status with incoming data
        };

        // Log WebSocket errors
        socket.onerror = (error) => {
          console.error('WebSocket error:', error);
        };

        updateInitializeWebSocket(false); // Update loading state for WebSocket initialization

        // Cleanup function to close the WebSocket on component unmount
        return () => {
          socket.close();
        };
      } catch (error) {
        console.log(error); // Log any errors during the fetching process
      }
    }
    fetchData(); // Execute the fetchData function
  }, []); // Empty dependency array means this runs once on mount

  // Effect to fetch existing clients and validate paths
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Validate the correct path for TTM Home
        let res = await api.post('/validation/validateTTMHomeCorrectPath');
        // Fetch existing clients
        res = await api.post('/util/getExistingClients');

        // Update client statuses based on response
        const updatedClients = {
          ABP: {
            exists: res.data.includes('ABP'),
            checked: res.data.includes('ABP'),
          },
          OMS: {
            exists: res.data.includes('OMS'),
            checked: res.data.includes('OMS'),
          },
          OMS_SE: {
            exists: res.data.includes('OMS_SE'),
            checked: res.data.includes('OMS_SE'),
          },
          MCSS_SE: {
            exists: res.data.includes('MCSS_SE'),
            checked: res.data.includes('MCSS_SE'),
          },
          ACPE: {
            exists: res.data.includes('ACPE'),
            checked: res.data.includes('ACPE'),
          },
        };

        setClients(updatedClients); // Update clients in state
        updateActiveClientsString(updatedClients); // Update active clients string
      } catch (err) {
        setAlert(err.response.data); // Set alert on error
        setDisableSubmit(true); // Disable the submit button on error
        console.error(err); // Log the error
      } finally {
        updateLoadExistingClients(false); // Update loading state
      }
    };
    fetchData(); // Execute the fetchData function
  }, []); // Empty dependency array means this runs once on mount

  // Effect to update active clients string whenever clients change
  useEffect(() => {
    updateActiveClientsString(clients); // Update active clients string
  }, [clients]);

  // Helper function to update the loading state for WebSocket initialization
  const updateInitializeWebSocket = (value) => {
    setLoading((prevState) => ({
      ...prevState,
      initalizeWebSocket: value,
    }));
  };

  // Helper function to update the loading state for fetching existing clients
  const updateLoadExistingClients = (value) => {
    setLoading((prevState) => ({
      ...prevState,
      loadExistingClients: value,
    }));
  };

  // Handler for client checkbox change
  const handleChange = (clientKey) => {
    setClients((prevClients) => ({
      ...prevClients,
      [clientKey]: {
        ...prevClients[clientKey],
        checked: !prevClients[clientKey].checked, // Toggle checked state
      },
    }));
  };

  // Update the string of active clients based on checked status
  const updateActiveClientsString = (updatedClients) => {
    const activeClients = Object.keys(updatedClients)
      .filter((client) => updatedClients[client].checked) // Filter checked clients
      .join(' '); // Join them into a string
    setActiveClientsString(activeClients); // Update the active clients string in state
  };

  // Function to run the deployer
  const runDeployer = async () => {
    setSubmitDeployerButtonText('Running...'); // Update button text
    setStatus('Running deployer...\n\n'); // Update status
    setAlert(''); // Clear previous alerts
    setDisableSubmit(true); // Disable the submit button
    let res;
    try {
      res = await api.post('/deployer/runDeployer', { activeClientsString }); // Call the run deployer API
      setAlert(res.data); // Set alert with response data
    } catch (err) {
      setAlert(err.response?.data || 'Error occurred'); // Handle errors
      console.log(err); // Log the error
    } finally {
      setDisableSubmit(false); // Re-enable the submit button
      setSubmitDeployerButtonText('Run Deployer'); // Reset button text
    }
  };

  // Get placeholder text for the textarea based on status
  const getPlaceholder = () =>
    status.trim() === '' || status === 'Waiting for deployer running...'
      ? 'Waiting for deployer running...' // Default placeholder
      : '';

  // Show spinner while loading states are true
  if (loading.initalizeWebSocket || loading.loadExistingClients)
    return <Spinner />; // Render spinner

  // Main component render
  return (
    <div className='page-fixed-position-sidebar'>
      <div className='deployer-page-container'>
        <div className='deployer-page-container-run-deployer'>
          <button
            onClick={runDeployer} // Trigger runDeployer on click
            className='deployer-page-button-run-deployer'
            disabled={disableSubmit} // Disable if submitting
          >
            {submitDeployerButtonText} {/*Button text*/}
          </button>
          <span
            className={
              alert === 'Deployer Succeeded' // Conditional alert class based on status
                ? 'deployer-page-alert-success'
                : 'deployer-page-alert-failed'
            }
          >
            {alert} {/*Alert message*/}
          </span>
        </div>

        <div className='deployer-page-clients-checkbox'>
          {Object.keys(clients).map(
            (client) =>
              clients[client].exists && ( // Only show if client exists
                <label key={client}>
                  <input
                    type='checkbox'
                    checked={clients[client].checked} // Checkbox checked state
                    onChange={() => handleChange(client)} // Handle checkbox change
                    disabled={disableSubmit} // Disable if submitting
                  />
                  {client} {/*Client name*/}
                </label>
              )
          )}
        </div>

        <div className='deployer-page-textarea-container'>
          <textarea
            className='deployer-page-textarea'
            placeholder={getPlaceholder()} // Placeholder based on status
            value={status} // Textarea value
            readOnly // Make textarea read-only
          ></textarea>
        </div>
      </div>
    </div>
  );
};

export default Deployer; // Exporting the Deployer component
