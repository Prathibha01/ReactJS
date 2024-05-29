//ExecutionDashboard.js
import React, { useState, useEffect } from 'react';
import PlaywrightService from '../services/PlaywrightService';
import FileService from '../services/FileService';
import FileList from './FileList';
import './styles.css';
import Mylogo from './ANZ-symbol.png';
import axios from 'axios';
import Loader from './Loader';

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
  const [selectedScripts, setSelectedScripts] = useState([]);
  const [responsesIds, setResponsesIds] = useState([]);
  const [responsesStatus, setResponsesStatus] = useState([]);
  const [executions, setExecutions] = useState([]);
  const [isMultifileclicked, setIsMultifileclicked] = useState(false);
  const [loading, setLoading] = useState(false);
//const[var, func]

console.log(responsesIds);


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

  const getsinglefile = async (selectedScript) => {
    // const response = await axios.post('http://localhost:8000/execute-playwright-script', {
    //   selectedScript,
    // });
    const response = await PlaywrightService.executePlaywrightScript({selectedScript});
    console.log(response);
    return response 
  }

  const handleResponse = async (response) => {
    let res = {};
    console.log("hello", response);
    if (response.success) {
     
      console.log(response);
      res = {...res,id:response.executionId}
    } else {
      console.error('Playwright execution failed:', response.data.error);
      setExecutionStatus('Playwright execution failed');
    }
    return res;
  }

  // Call the /execute-playwright-script endpoint in the microservice
  const executePlaywrightScript = async () => {
    setLoading(true);
    setIsMultifileclicked(false);
    try {
      if (!selectedScript) {
        console.error('No script selected.');
        return;
      }

     const response = await getsinglefile(selectedScript);
      let res = await handleResponse(response);
      const { executionId } = response;
      setExecutionId(executionId);
      setResponsesIds([res]);

      
    } catch (error) {
      console.error('Error executing Playwright script:', error);
      setExecutionStatus('Error executing Playwright script');
    }
    setLoading(false);
  };

  const getstatus = async(executionId) => {
    const statusResponse = await axios.get(`http://localhost:8000/get-execution-status/${executionId}`);
    return statusResponse;
  }

  const handleStatusResponse = async(data) => {
    if (data && data.length > 0) {
      const { status, script_name, started_at } = data[0];
     
      return {script_name, started_at, status};
    }
   return "";
  }

  
  useEffect(() => {
    
    if (isMultifileclicked) {

    const intervalId = setInterval(async () => {
      console.log(responsesIds);

      responsesIds.forEach(async(element) => {
        console.log(element);
        const statusResponse = await getstatus(element.id);
      const status = await handleStatusResponse(statusResponse.data.status.data); 
      console.log(status);
      setResponsesStatus(oldvalue => {
        console.log(status);
        console.log(oldvalue);
        return oldvalue.map((i) => {
          console.log(i);
          if(i.id === element.id)
          {
            return {
              ...i, status:status
             }
          }
          return i
        })
       
      })
      });
    }, 5000); // Poll every 1 second
    return () => clearInterval(intervalId);
  }
  
  }, [isMultifileclicked]);

  useEffect(() => {
    // Poll the microservice for status
    if (executionId) {
    const intervalId = setInterval(async () => {
      try {
        console.log(executionId);
        await new Promise(resolve => setTimeout(resolve, 5000));
          const statusResponse = await getstatus(executionId);
          // console.log('statusResponse',statusResponse.data.status.data[0].status);
          
          // const { status } = statusResponse.data.data[0];

          // Assuming the response structure is { success: true, status: { success: true, data: [{ status }] } }
        const status = await handleStatusResponse(statusResponse.data.status.data); //statusResponse.data.status
        console.log(status);
        setResponsesStatus(oldvalue => 
        [{id:executionId, status:status.status, script_name: status.script_name, started_at: status.started_at}]);
        if (status === 'Passed' || status === 'Failed') {
          clearInterval(intervalId);
        }
        // Update your UI with the current status
        
     
      } catch (error) {
        console.error('Error fetching execution status:', error);
      }
    }, 5000); // Poll every 1 second
    return () => clearInterval(intervalId);
  }   
  }, [executionId]);

  
  // const executePlaywrightScript = async () => {
  //   try {
  //     if (selectedScripts.length === 0) {
  //       console.error('No scripts selected.');
  //       return;
  //     }

  //     // Execute each script in parallel
  //     const executionPromises = selectedScripts.map(async (selectedScript) => {
  //       const response = await axios.post('http://localhost:8000/execute-playwright-script', {
  //         selectedScript,
  //       });

  //       if (response.data.success) {
  //         return { success: true, executionId: response.data.executionId, script: selectedScript };
  //       } else {
  //         return { success: false, error: response.data.error, script: selectedScript };
  //       }
  //     });

  //     const results = await Promise.all(executionPromises);

  //     // Update the executions state with the results
  //     setExecutions(results);
  //   } catch (error) {
  //     console.error('Error executing Playwright scripts:', error);
  //   }
  // };

  // useEffect(() => {
  //   // Poll the microservice for status for each execution
  //   const intervalIds = executions.map(async ({ success, executionId, script }) => {
  //     if (success) {
  //       const intervalId = setInterval(async () => {
  //         try {
  //           const statusResponse = await axios.get(`http://localhost:8000/get-execution-status/${executionId}`);
  //           const { data } = statusResponse.data.status;

  //           // Update your UI with the current status
  //           if (data && data.length > 0) {
  //             const { status } = data[0];
  //             setExecutions(prevExecutions => {
  //               const updatedExecutions = [...prevExecutions];
  //               const index = updatedExecutions.findIndex(execution => execution.executionId === executionId);
  //               if (index !== -1) {
  //                 updatedExecutions[index].status = status;
  //               }
  //               return updatedExecutions;
  //             });

  //             // Check if the execution is complete, and if so, clear the interval
  //             if (status === 'Passed' || status === 'Failed') {
  //               clearInterval(intervalId);
  //             }
  //           }
  //         } catch (error) {
  //           console.error('Error fetching execution status:', error);
  //         }
  //       }, 1000); // Poll every 1 second

  //       return intervalId;
  //     }
  //   });

  //   // Clean up the intervals on component unmount
  //   return () => {
  //     intervalIds.forEach(clearInterval);
  //   };
  // }, [executions]);
  
  const executeAllScripts = async(playwrightScripts1) => {
    
    setResponsesStatus([]);
    setResponsesIds([]);
    playwrightScripts1.forEach(async(element) => {
      const response = await getsinglefile(element);
      let res = await handleResponse(response);
      console.log(res);
       //arr.push(res) 
       setResponsesIds(oldvalue => [...oldvalue, res]);

       console.log(element);
      const statusResponse = await getstatus(res.id);
      const status = await handleStatusResponse(statusResponse.data.status.data); 
      console.log({id:res.id, status:status})
        //arr1.push({id:res.id, status:status})
      setResponsesStatus(oldvalue => [...oldvalue, {id:res.id, status:status.status, script_name: status.script_name, started_at: status.started_at}]);
      console.log(setResponsesStatus);

    });
  }
  const executeAllPlaywrightScripts = async() => {
    setIsMultifileclicked(true);
  console.log("hello");
  //const response1 = await axios.post('http://localhost:8000/execute-all-playwright-scripts');
  //console.log(response1);
  const arr=[];
  const arr1 = [];
  executeAllScripts(playwrightScripts);
  // playwrightScripts.forEach(async(element) => {
  //   const response = await getsinglefile(element);
  //   let res = await handleResponse(response);
  //   console.log(res);
  //    //arr.push(res) 
  //    setResponsesIds(oldvalue => [...oldvalue, res]);

  //    console.log(element);
  //   const statusResponse = await getstatus(res.id);
  //   const status = await handleStatusResponse(statusResponse.data.status.data); 
  //   console.log({id:res.id, status:status})
  //   //arr1.push({id:res.id, status:status})
  //   setResponsesStatus(oldvalue => [...oldvalue, {id:res.id, status:status}]);
  // });
  console.log(arr)
   
 // arr.forEach(async(element) => {
    
  // });
  console.log(arr1);
        //setResponsesStatus(arr1);
  //   try{
  //     const response = await axios.post('http://localhost:8000/execute-all-playwright-scripts');
  //     console.log(response);
  //       if (response.success) {
  //         setExecutionResult(response.result);
         
  //       } else {
  //         console.error('Playwright execution failed:', response.error);
  //         setExecutionResult('Playwright execution failed');
  //       }
  //   }
  //   catch{
  // console.log("check log");
  //   }
    
    // PlaywrightService.executeAllPlaywrightScripts()
    //   .then((response) => {
    //     console.log(response);
    //     if (response.success) {
    //       setExecutionResult(response.result);
         
    //     } else {
    //       console.error('Playwright execution failed:', response.error);
    //       setExecutionResult('Playwright execution failed');
    //     }
    //   })
    //   .catch((error) => {
    //     console.log('Error communicating with Playwright service:', error);
    //     setExecutionResult('Error communicating with Playwright service');
    //   });
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
  console.log(responsesIds);
  console.log(responsesStatus);



  /* html code*/
  return <>   <div className="main-container">
  <div className="logo-container">
  <img src={Mylogo} alt="Logo" />
 </div> 

<div className="title-container">
<h1>Execution Dashboard</h1>
</div>

<div className="main-content">
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
  <span style={{ marginRight: '7px' }}></span>

 <button onClick={executePlaywrightScript}>Run Playwright Script</button>
 <span style={{ marginRight: '7px' }}></span>
 <button onClick={executeAllPlaywrightScripts}>Run All Scripts</button>

{
  loading?<Loader/>: <>
    
  <table>
    <thead>
      <tr>
        <th>Execution ID</th>
        <th>Script Name</th>
        <th>Started At</th>
        <th>Execution Status</th>
      </tr>
    </thead>
    <tbody>
      {responsesIds.map((execution) => {
         const statusObject = responsesStatus.find((i1) => execution.id === i1.id);
         if(statusObject){
          console.log(statusObject);
          console.log(execution);
          console.log(responsesStatus);

          const { script_name, started_at, status, id } = statusObject;
          const statusString = JSON.stringify(status);
         return (
          <tr key={id}>
          <td>{id}</td>
          <td>{script_name}</td>
          <td>{started_at}</td>
          <td>{status}</td>
        </tr>
         )       
         }
         return null;
      })}
    </tbody>
  </table>
</>
}


 {/* {
 responsesIds.map((i) => {
  const statusObject = responsesStatus.find((i1) => i.id === i1.id);
  const { script_name, started_at } = i;
  const status = statusObject ? statusObject.status : {};
  const statusString = JSON.stringify(status);

  return (
    <React.Fragment key={i.id}>
      <p style={customStyle}>Execution ID: {i.id}</p>
      <p style={customStyle}>Execution Status: {statusString}</p>
      {script_name && <p style={customStyle}>Script Name: {script_name}</p>}
      {started_at && <p style={customStyle}>Started At: {started_at}</p>}
    </React.Fragment>
  );
})
} */}
 {

  // responsesIds.map((i) =>{
  //   let status = "";
  //   status = responsesStatus.filter((i1)=>i.id === i1.id).map((i1)=>i1.status)
  //   return <React.Fragment key={i.id}>
  //     <p style={customStyle}>Execution ID: {i.id}</p>
  //   <p style={customStyle}>Execution Status: {status}</p>
  //   <p style={customStyle}>Script Name: {String(i.script_name)}</p>
  //   <p style={customStyle}>Started At: {String(i.started_at)}</p>
  //   </React.Fragment>
  // })
 }
 
  <h3>HTML Report</h3>
  <button onClick={openHtmlReport}>Open Playwright Report</button>

  <div>
    <h4>All Reports</h4>
    <button onClick={toggleReportsList}>List of Reports</button>
    <FileList showReportsList={showReportsList} fileLinks={fileLinks} />
    
  </div>
  
</div></>
};

export default ExecutionDashboard;