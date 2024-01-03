//FileService.js
class FileService {

    baseUrl = 'http://localhost:8000';
  
       getFilesInFolder = () => {
        
      return fetch(`${this.baseUrl}/list-custom-reports`)
        .then((response) => response.json())
        .catch((error) => {
          console.error('Error fetching files:', error);
          return { folders: [] };
        });
    };
  }
  
  const fileServiceInstance = new FileService();
  export default fileServiceInstance;
  