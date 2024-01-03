//PlaywrightService.js
class PlaywrightService {
    constructor(baseUrl = 'http://localhost:8000') {
      this.baseUrl = baseUrl;
    }
  
    executePlaywrightScript = async (selectedScript) => {
      try {
        const response = await fetch(`${this.baseUrl}/execute-playwright-script`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ selectedScript }),
        });
  
        if (response.ok) {
          return await response.json();
        } else {
          const errorData = await response.json();
          console.error(`Failed to execute Playwright script. ${errorData.error}`);
          return { success: false, result: null, error: `Failed to execute Playwright script. ${errorData.error}` };
        }
      } catch (error) {
        console.error('Error communicating with Playwright service:', error);
        return { success: false, result: null, error: 'Failed to execute Playwright script.' };
      }
    };
  
    getPlaywrightScriptsList = async () => {
      try {
        const response = await fetch(`${this.baseUrl}/get-playwright-scripts`);
  
        if (response.ok) {
          return await response.json();
        } else {
          throw new Error(`Failed to fetch Playwright scripts list. ${response.statusText}`);
        }
      } catch (error) {
        console.error('Error fetching Playwright scripts list:', error);
        return { files: [], htmlReportLink: '' };
      }
    };
  
    executeAllPlaywrightScripts = async () => {
      const url = `${this.baseUrl}/execute-all-playwright-scripts`;
      try {
        const response = await fetch(url, {
          method: 'POST',
        });
  
        if (response.ok) {
          return await response.json();
        } else {
          throw new Error(`Failed to execute Playwright scripts. ${response.statusText}`);
        }
      } catch (error) {
        console.error('Error communicating with Playwright service:', error);
        return { success: false, result: null, error: 'Failed to execute Playwright scripts.' };
      }
    };

  //   getLatestExecutionStatus = async (scriptName) => {
  //     const apiUrl = `${this.baseUrl}/get-latest-execution-status/${scriptName}`;
  
  //     try {
  //       const response = await fetch(apiUrl);
  //       const data = await response.json();
  
  //       if (response.ok) {
  //         return { success: true, status: data.status };
  //       } else {
  //         return { success: false, error: data.error || 'Unknown error' };
  //       }
  //     } catch (error) {
  //       console.error('Error fetching latest execution status:', error);
  //       return { success: false, error: 'Network error' };
  //     }
  //   };
   
}
  
const playwrightServiceInstance = new PlaywrightService();
export default playwrightServiceInstance;