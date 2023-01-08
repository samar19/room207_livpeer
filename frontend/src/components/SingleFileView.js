
import React, { useState } from 'react';
import {
  useLocation, useParams
} from "react-router-dom";
import { extractNameFromEncryptedFileName, reconstructBlobUrl } from '../utils/manipulator';
import DonateModal from './DonateModal';

const SingleFileView = () => {
  const [showDonateModal, setShowDonateModal] = useState(false);
  const onDonateClick = async () => {
    setShowDonateModal(true);
  };
  const onDonateClose = async () => {
    setShowDonateModal(false);
  };
  let { slug } = useParams();
  const location = useLocation()
  var { filename } = location.state;
  return (
    <div className="car_container">
      <section className="car_section">
        <img alt="" src={reconstructBlobUrl(slug)} className='car_image'/>
      </section>
      <div className='py-[1rem]'>
        <hr/>
      </div>
      <div className='resource_title'>
        {extractNameFromEncryptedFileName(filename)}
      </div>
      {/* <div className='w-[3rem] h-[3rem] rounded-full py-[1rem]'>
        <img src="/taylor.jpg" alt="taylor"/>
      </div> */}
      <div className="flex flex-row py-[1rem]">
        <img src="/taylor.jpg" alt="..." className=" w-[3rem] shadow rounded-full align-middle border-none" />
        <span className='px-[1rem] pt-[1rem] text-xl font-semibold'>Taylor S.</span>
      </div>
      {localStorage.getItem('accessLevel') !== 'write' ? (
        <div className="py-[1rem]">
          <button onClick={onDonateClick} className="navLink navLink-hover mb-2"> Donate </button>
          { showDonateModal && <DonateModal onClose={onDonateClose}/> }
        </div>
      ):<></>}
    </div>
  );
}

export default SingleFileView;
