import axios from 'axios';

import React, { useState } from 'react';
import { API_BASE_URL } from '../constants';

const FileUpload = (props) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [percentUploaded, setPercentUploaded] = useState(0);

  const { onClose } = props;

  // On file select (from the pop up)
  const onFileChange = event => {
    // Update the state
    setSelectedFile(event.target.files[0]);
    setPercentUploaded(0)
  };

  const onFileUpload = () => {
    // Create an object of formData
    const formData = new FormData();
    formData.append('file', selectedFile);

    const options = {
      onUploadProgress: (progressEvent) => {
        const {loaded, total} = progressEvent;
        let percent = Math.floor( (loaded * 100) / total )

        if( percent < 100 ){
          setPercentUploaded(percent)
        }
      },
      withCredentials: true,
    }
    
    // Send formData object
    axios.post(`${API_BASE_URL}/upload`, formData, options).then(res => { 
      setPercentUploaded(100);
    })
	};

  const handleOnClose = (e) => {
    if (e.target.id === 'fileUploadContainer') {
      onClose()
    }
  }

  return (
    <div 
      id="fileUploadContainer"
      onClick={handleOnClose}
      className="fixed rounded backdrop-blur mt-[8rem] inset-0 items-center justify-center p-12">
      <div className="mx-auto w-full max-w-[550px] bg-white">
        <div className="py-6 px-9">

          <div className="mb-6 pt-4">
            <label className="mb-5 block text-xl font-semibold text-[#07074D]">
              Upload File
            </label>

            <div className="mb-8">
              <input type="file"name=" file" id="file" className="sr-only" onChange={onFileChange}/>
              <label
                htmlFor='file'
                className="relative flex min-h-[200px] items-center justify-center rounded-md border border-dashed border-[#e0e0e0] p-12 text-center"
              >
                <div>
                  <span
                    className="inline-flex rounded border border-[#e0e0e0] py-2 px-7 text-base font-medium text-[#07074D]"
                  >
                    Browse
                  </span>
                </div>
              </label>
            </div>

            {
              selectedFile && selectedFile.name && (
                <div className="rounded-md bg-[#F5F7FB] py-4 px-8">
                  <div className="flex items-center justify-between">
                    <span className="truncate pr-3 text-base font-medium text-[#07074D]">
                      {selectedFile.name}
                    </span>
                  </div>
                  <div className="relative mt-5 h-[6px] w-full rounded-lg bg-[#E2E5EF]">
                    <div
                      className="absolute left-0 right-0 h-full rounded-lg bg-[#6A64F1]"
                      style={{width: `${percentUploaded}%`}}
                    ></div>
                  </div>
                </div>
              )
            }
          </div>

          <div>
            <button
              className="hover:shadow-form w-full rounded-md bg-[#6A64F1] py-3 px-8 text-center text-base font-semibold text-white outline-none disabled:opacity-75 disabled:cursor-not-allowed"
              onClick={onFileUpload}
              disabled={percentUploaded!==0 || selectedFile===null}
            >
              {percentUploaded === 0
                ? 'Encrypt & Upload 🚀'
                : percentUploaded === 100
                  ? 'Encrypted & Uploaded 🎉'
                  : 'Encrypting & Uploading ⏳'
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FileUpload;