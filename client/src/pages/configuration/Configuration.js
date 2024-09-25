import React, { useEffect, useState } from 'react'; // Import necessary React hooks
import './Configuration.css'; // Import CSS for styling
import api from '../../utils/api'; // Import API utility for making requests
import Spinner from '../../components/layout/Spinner'; // Import Spinner component for loading state

const Configuration = () => {
  // Define state for form data, input type, alerts, and loading state
  const [formData, setFormData] = useState({
    TTMhost: '',
    TTMport: '',
    TTMusername: '',
    TTMpassword: '',
    TTMHome: '',
    TTMPackagerCommand: '',
    TTMDeployerCommand: '',
  });
  const [inputType, setInputType] = useState('password'); // State to toggle password visibility
  const [alert, setAlert] = useState(''); // State for alert messages
  const [loading, setLoading] = useState(true); // Loading state to manage fetch operation

  useEffect(() => {
    // Fetch configuration data when the component mounts
    const fetchData = async () => {
      try {
        // Make a GET request to retrieve configuration
        const { data } = await api.get('/configuration/getConfiguration');
        // Set the form data with the fetched values, converting port to string
        setFormData({ ...data, TTMport: data.TTMport.toString() });
      } catch (error) {
        console.error(error); // Log any errors during the fetch
      } finally {
        setLoading(false); // Set loading to false once fetching is complete
      }
    };
    fetchData(); // Invoke the fetch function
  }, []); // Empty dependency array ensures this runs only once

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    const port = Number(formData.TTMport); // Convert port to a number

    // Validate port number
    if (!Number.isInteger(port) || port <= 0) {
      setAlert('Please enter a valid integer port number.'); // Set alert if validation fails
      return;
    }

    try {
      // Make a POST request to set configuration
      await api.post('/configuration/setConfiguration', {
        ...formData, // Spread existing form data
        TTMport: port, // Set the validated port
      });
      setAlert('Change Success'); // Set success alert on successful submission
    } catch (error) {
      setAlert('Failed to submit configuration.'); // Set error alert if submission fails
      console.error(error); // Log the error
    }
  };

  const changeType = () => {
    // Toggle input type between 'password' and 'text'
    setInputType((prevType) => (prevType === 'password' ? 'text' : 'password'));
  };

  const handleChange = ({ target: { name, value } }) => {
    // Update form data state when an input changes
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Show a loading spinner while data is being fetched
  if (loading) return <Spinner />;

  return (
    <div className='page-fixed-position-sidebar'>
      <div className='configuration-page-container'>
        <div className='configuration-page-box-container'>
          <h1 className='configuration-page-box-title'>
            Change the Configuration
          </h1>
          {alert && ( // Conditionally render alert message if it exists
            <p
              className={
                alert === 'Change Success' ? 'success-message' : 'error-message'
              }
            >
              {alert} {/* Display the alert message */}
            </p>
          )}
          <div className='configuration-page-box-user-details'>
            {Object.entries(formData).map(([key, value]) => (
              <div key={key} className='configuration-page-box-input'>
                <span className='configuration-page-box-input-title'>
                  {key.replace(/TTM/, 'TTM ')} {/* Format the input title */}
                  {key === 'TTMpassword' && ( // Conditionally render password toggle icon
                    <i className='bx bx-show-alt' onClick={changeType}></i>
                  )}
                </span>
                <input
                  value={value} // Set the input value to the corresponding state
                  name={key} // Set the input name to the corresponding key
                  type={key === 'TTMpassword' ? inputType : 'text'} // Set input type conditionally
                  onChange={handleChange} // Set the onChange event handler
                  required // Mark the input as required
                />
              </div>
            ))}
          </div>
          <div className='configuration-page-box-submit'>
            <button
              type='submit' // Button type to submit the form
              className='configuration-page-box-input-button'
              onClick={handleSubmit} // Set the onClick event handler for form submission
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configuration; // Export the Configuration component
