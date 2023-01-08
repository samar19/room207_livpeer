import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import FilesView from "./FilesView";

import FileUpload from "./FileUpload";
import MonetizationView from "./MonetizationView";

const Sidebar = (props) => {
  const [showFileUploadModal, setShowFileUploadModal] = useState(false);
  let { slug } = useParams();
  
  const onAddFilesClick = async () => {
    setShowFileUploadModal(true);
  };
  const onAddFilesClose = async () => {
    setShowFileUploadModal(false);
  };
  
  return (
    <div className="flex w-full h-screen mt-[8rem] text-2xl">
      <aside className="flex w-72 flex-col space-y-2 border-r-2 border-gray-200 bg-[#FFE3E1] p-2"
        >
        <Link to="/admin/files" className="flex items-center space-x-1 rounded-md px-2 py-3 hover:bg-gray-100 hover:text-blue-600">
          <span><i className="bx bx-file"></i></span>
          <span>Files</span>
        </Link>

        <Link to="/admin/monetization" className="flex items-center space-x-1 rounded-md px-2 py-3 hover:bg-gray-100 hover:text-blue-600">
          <span><i className="bx bx-dollar"></i></span>
          <span>Monetization</span>
        </Link>

      </aside>

      <div className="w-full p-2">
      {
        slug === 'files' && (
          <div className="">
            <button onClick={onAddFilesClick} className="navLink navLink-hover"> Add Files </button>
            { showFileUploadModal && <FileUpload onClose={onAddFilesClose}/> }
            <div>
              <FilesView photos={props.photos}/>
            </div>
          </div>
          
        )
      }
      {
        slug === 'monetization' && (
          <div className="">
            <div>
              <MonetizationView photos={props.photos}/>
            </div>
          </div>
        )
      }
      </div>
    </div>
  );
}

export default Sidebar;