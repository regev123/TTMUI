import api from '../../utils/api';

const FileUpload = async (file, setLoadingUploadFile) => {
  setLoadingUploadFile(true);
  const formData = new FormData();
  formData.append('file', file);

  try {
    await api.post('/installation/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    alert('File uploaded successfully!');
  } catch (error) {
    console.error('Error uploading file:', error);
    alert('Failed to upload file.');
  } finally {
    setLoadingUploadFile(false);
  }
};

export default FileUpload;
