// FileList.js
import React, { useState, useEffect } from 'react';
import FileService from '../services/FileService';

const FileList = ({ showReportsList, fileLinks }) => {
  const [folders, setFolders] = useState([]);

  useEffect(() => {
    if (showReportsList && fileLinks.length > 0) {
      // Fetch folders only once when the component mounts
      getFilesInFolder(fileLinks[0].link);
    }
  }, [showReportsList, fileLinks]);

  const getFilesInFolder = (folderLink) => {
    FileService.getFilesInFolder(folderLink)
      .then((response) => {
        setFolders(response.folders);
      })
      .catch((error) => {
        console.error('Error fetching files:', error);
        setFolders([]);
      });
  };

  return (
    <ul style={{ display: showReportsList ? 'block' : 'none' }}>
      {folders.map((folderLink) => (
        <li key={folderLink.folder}>
          <a href="name" onClick={() => console.log('Clicked on', folderLink.folder)}>
            {folderLink.folder}
          </a>
          <button
  style={{ border: 'none', background: 'none', color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}
  onClick={() => getFilesInFolder(folderLink.link)}
>
  {folderLink.folder}
</button>          
        </li>
      ))}
    </ul>
  );
};

export default FileList;
