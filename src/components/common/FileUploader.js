import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import './FileUploader.css';

const FileUploader = ({ onUpload }) => {
  const onDrop = useCallback(
    (acceptedFiles) => {
      onUpload(acceptedFiles[0]); // Send the first file to the upload function
    },
    [onUpload]
  );

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div className='file-uploader-container' {...getRootProps()}>
      <input {...getInputProps()} />
      <p>Drag and drop a file here, or click to select a file</p>
    </div>
  );
};

export default FileUploader;
