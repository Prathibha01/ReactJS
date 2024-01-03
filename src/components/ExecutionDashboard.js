// ExecutionDashboard.js
import React, { useState, useEffect } from 'react';
import PlaywrightService from '../services/PlaywrightService';
import FileService from '../services/FileService';
import FileList from './FileList';
import './styles.css';
import Mylogo from './ANZ-logo.svg';
import axios from 'axios';

const ExecutionDashboard = () => {
  const [playwrightScripts, setPlaywrightScripts] = useState([]);
  const [selectedScript, setSelectedScript] = useState(null);
  const [executionResult, setExecutionResult] = useState('');
  const [htmlReportLink, setHtmlReportLink] = useState('');
  const [fileLinks, setFileLinks] = useState([]);
  const [showReportsList, setShowReportsList] = useState(false);
  const [reportFiles, setReportFiles] = useState([]);
  //const [executionUuid, setExecutionUuid] = useState(null);
  const [executionId, setExecutionId] = useState(null);
  const [executionStatus, setExecutionStatus] = useState(null);
  
  useEffect(() => {
    console.log('Component re-rendered');
    getPlaywrightScriptsList();
    getFilesInFolder();
  
}, [selectedScript]);

  const getPlaywrightScriptsList = () => {
    PlaywrightService.getPlaywrightScriptsList()
      .then((data) => {
        console.log('API Response:', data);  // Log the response
        const flattenedFiles = flattenFiles(data.files, data.subdirectories);
      setPlaywrightScripts(flattenedFiles);
      setHtmlReportLink(data.htmlReportLink);
      })
      .catch((error) => console.error('Error fetching Playwright scripts list:', error));
  };

  
  const flattenFiles = (files, subdirectories) => {
    const flattened = [];

    files.forEach((file) => {
      flattened.push(file);
    });

    if (Array.isArray(subdirectories)) {
      subdirectories.forEach((subdir) => {
        if (subdir.files && Array.isArray(subdir.files)) {
          subdir.files.forEach((subFile) => {
            flattened.push(`${subdir.directory}/${subFile}`);
          });
        }
      });
    }

    return flattened;
  };

  // const executePlaywrightScript = () => {
  //   if (!selectedScript) {
  //     console.error('No script selected.');
  //     return;
  //   }

  //   PlaywrightService.executePlaywrightScript(selectedScript)
  //     .then((response) => {
  //       if (response.success) {
  //         setExecutionResult(response.result);
  //       } else {
  //         console.error('Playwright execution failed:', response.error);
  //         setExecutionResult('Playwright execution failed');
  //       }
  //     })
  //     .catch((error) => {
  //       console.error('Error communicating with Playwright service:', error);
  //       setExecutionResult('Error communicating with Playwright service');
  //     });
  // };

  const executePlaywrightScript = async () => {
    try {
      if (!selectedScript) {
        console.error('No script selected.');
        return;
      }

      // Call the /execute-playwright-script endpoint in the microservice
      const response = await axios.post('http://localhost:8000/execute-playwright-script', {
        selectedScript,
      });

      if (response.data.success) {
        const { executionId } = response.data;
        setExecutionId(executionId);
        console.log(executionId);
      } else {
        console.error('Playwright execution failed:', response.data.error);
        setExecutionStatus('Playwright execution failed');
      }
    } catch (error) {
      console.error('Error executing Playwright script:', error);
      setExecutionStatus('Error executing Playwright script');
    }
  };

  useEffect(() => {
    // Poll the microservice for status
    const intervalId = setInterval(async () => {
      try {
        if (executionId) {
          const statusResponse = await axios.get(`http://localhost:8000/get-execution-status/${executionId}`);
          // const { status } = statusResponse.data.data[0];

          // Assuming the response structure is { success: true, status: { success: true, data: [{ status }] } }
        const { data } = statusResponse.data.status;

        // Update your UI with the current status
        if (data && data.length > 0) {
          const { status } = data[0];
          setExecutionStatus(status);

          // Check if the execution is complete, and if so, clear the interval
          if (status === 'Passed' || status === 'Failed') {
            clearInterval(intervalId);
          }
        }
      }
      } catch (error) {
        console.error('Error fetching execution status:', error);
      }
    }, 1000); // Poll every 1 second

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [executionId]);

  const executeAllPlaywrightScripts = () => {
    PlaywrightService.executeAllPlaywrightScripts()
      .then((response) => {
        if (response.success) {
          setExecutionResult(response.result);
        } else {
          console.error('Playwright execution failed:', response.error);
          setExecutionResult('Playwright execution failed');
        }
      })
      .catch((error) => {
        console.error('Error communicating with Playwright service:', error);
        setExecutionResult('Error communicating with Playwright service');
      });
  };

  const getFilesInFolder = async () => {
    try {
      const response = await FileService.getFilesInFolder();
      const folders = response.folders;

      if (Array.isArray(folders)) {
        const links = folders.map((folderItem) => ({
          folder: folderItem.folder,
          link: folderItem.link,
        }));

        setFileLinks(links);
        setReportFiles(links.map((folderItem) => folderItem.folder));

        console.log('Files fetched:', links);
      } else {
        console.error('Invalid folder link:', folders);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  
  const toggleReportsList = () => {
    setShowReportsList((prevShowReportsList) => !prevShowReportsList);
    if (!showReportsList && reportFiles.length === 0) {
      getFilesInFolder();
    }
  };

  const openHtmlReport = () => {
    const htmlReportLink = "http://localhost:8000/playwright-report/index.html";

    if (htmlReportLink) {
      window.open(htmlReportLink, '_blank');
    } else {
      console.error('No HTML report link available.');
    }
  };

    const customStyle = {
      fontStyle: 'italic',
      // You can add more styling properties here if needed
    };
  
  // Function to poll the server every 2 seconds to get the latest execution status
  // const getLatestExecutionStatus = async (scriptName) => {
  //   try {
  //     const result = await PlaywrightService.getLatestExecutionStatus(scriptName);
  //     if (result.success) {
  //       setLatestStatus(result.status);
  //     } else {
  //       console.error('Error fetching latest execution status:', result.error);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching latest execution status:', error);
  //   }
  // };

  return (
   
    <div className="main-container">
      <div class="logo-container">
      <img src={process.env.PUBLIC_URL + 'src/components/ANZ-symbol.png'} alt="Logo" />
      {/* <img src={Mylogo} alt="Logo" /> */}
    {/* <img id="anz-logo" src= "src/components/ANZ-symbol.png" alt="ANZ"/> */}
    <div id="color-strip"></div> 
   </div> 

   <div class="title-container">
  <h1>Execution Dashboard</h1>
   </div>

<div class="main-content">
  {/* <!-- Your main content goes here --> */}
  <router-outlet></router-outlet>
</div>

{/* Home page content */}
<div className="execution-dashboard">
        {/* Playwright Automation Dashboard Section */}
      <div className="playwright-automation-dashboard">
        <h2>Playwright Automation Dashboard</h2>
        <p>
          This application allows you to execute Playwright scripts and view the results in an interactive manner.
        </p>
        <p>
          Get started by selecting a script and running it using the provided buttons.
        </p>
        <p>
          Explore the HTML report generated after script execution by clicking the "Open Playwright Report" link.
        </p>
      </div>
      </div>

  <h2>Script Executor:</h2>
      <label htmlFor="scriptSelector">Select Playwright Script:</label>
      <select
        id="scriptSelector"
        value={selectedScript || ''}
        onChange={(e) => setSelectedScript(e.target.value)}
      >
        <option value="">Select a script</option>
        {playwrightScripts.map((script) => (
          <option key={script} value={script}>
            {script}
          </option>
        ))}
      </select>

     <button onClick={executePlaywrightScript}>Run Playwright Script</button>
     <button onClick={executeAllPlaywrightScripts}>Run All Scripts</button>
     <p style={customStyle}>Execution ID: {executionId}</p>
     <p style={customStyle}>Execution Status: {executionStatus}</p>
      {/* Display other status information here */}

      <h3>HTML Report</h3>
      <button onClick={openHtmlReport}>Open Playwright Report</button>

      <div>
        <h4>All Reports</h4>
        <button onClick={toggleReportsList}>List of Reports</button>
        <FileList showReportsList={showReportsList} fileLinks={fileLinks} />
        
      </div>
       {/* Display the latest execution status */}
       {/* <p>Latest Execution Status: {latestStatus}</p> */}
    </div>
  );
};

export default ExecutionDashboard;
