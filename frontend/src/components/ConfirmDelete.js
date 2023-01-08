import axios from 'axios';

import React,{Component} from 'react';
import { API_BASE_URL, PACKED_NONCE } from '../constants';
import { useState, useEffect } from "react";
import { extractNameFromEncryptedFileName } from '../utils/manipulator';
import { deleteContent } from '../utils/rest';

const ConfirmDelete = (props) => {
  const [deleted, setDeleted] = useState(false);

  const { onClose, fileToBeDeleted } = props;


  const onConfirmDelete = async () => {
    const {data, error} = await deleteContent(fileToBeDeleted);
    if (!error) {
      setDeleted(true);
      onClose();
      window.location.reload();
    }
	};

  const handleOnClose = (e) => {
    if (e.target.id === 'ConfirmDeleteContainer') {
      onClose()
    }
  }

  return (
    <div 
      id="ConfirmDeleteContainer"
      onClick={handleOnClose}
      className="fixed rounded backdrop-blur mt-[8rem] inset-0 items-center justify-center p-12">
      <div className="mx-auto w-full max-w-[550px] bg-white">
        <div className="py-6 px-9">

          <div className="mb-6 pt-4">
            <label className="mb-5 block text-xl font-semibold text-[#07074D]">
              Delete File {extractNameFromEncryptedFileName(fileToBeDeleted)}?
            </label>

            {
              fileToBeDeleted && !['', 'undefined'].includes(fileToBeDeleted) && (
                <div className="rounded-md bg-[#F5F7FB] py-4 px-8">
                  <div className="flex items-center justify-between">
                    <span className="truncate pr-3 text-base font-medium text-[#07074D]">
                      {extractNameFromEncryptedFileName(fileToBeDeleted)}
                    </span>
                  </div>
                  <div className="relative mt-5 h-[6px] w-full rounded-lg bg-[#E2E5EF]">
                    <div
                      className="absolute left-0 right-0 h-full rounded-lg bg-[#6A64F1]"
                      style={{width: `${deleted?100:0}%`}}
                    ></div>
                  </div>
                </div>
              )
            }
          </div>

          <div>
            <button
              className="hover:shadow-form w-full rounded-md bg-[#6A64F1] py-3 px-8 text-center text-base font-semibold text-white outline-none"
              onClick={() => {onConfirmDelete()}}
            >
              Delete now 🗑️
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDelete;