import { useState } from "react";
import { Link } from "react-router-dom";
import { extractNameFromEncryptedFileName, extractSlug } from "../utils/manipulator";
import ConfirmDelete from "./ConfirmDelete";
import { DeleteIcon } from "./deleteIcon";
import { ViewIcon } from "./viewIcon";

const FilesView = (props) => {
  const [showFileUploadModal, setShowFileUploadModal] = useState (false);
  const [fileToBeDeleted, setFileToBeDeleted] = useState (undefined);
  
  const onAddFilesClick = async (filename) => {
    setShowFileUploadModal(true);
    setFileToBeDeleted(filename);
  };
  const onAddFilesClose = async () => {
    setShowFileUploadModal(false);
    setFileToBeDeleted(undefined)
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-screen min-h-screen bg-[#FFF5E4] flex items-start justify-center font-sans overflow-hidden">
        <div className="w-full lg:w-5/6">
          <div className="bg-white shadow-md rounded my-6">
            <table className="min-w-max w-full table-auto">
              <thead>
                <tr className="bg-[#FFD1D1] text-gray-600 uppercase text-3xl leading-normal">
                  <th className="py-3 px-6 text-left">Title</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-3xl font-light">
                {props.photos.map((image, i) => (
                  <tr className="border-b border-[#FFF5E4] hover:bg-[#FFF5E4]/[0.9] bg-[#FFE3E1]" key={i}>
                    <td className="py-3 px-6 text-left whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="font-medium">{extractNameFromEncryptedFileName(image.filename)}</span>
                      </div>
                    </td>
                    <td className="p-0 text-center">
                      <div className="flex item-center justify-center">
                        <div className="w-8 mr-2 transform hover:text-[#FF9494] hover:scale-110">
                          <Link to={`/resource/${extractSlug(image.uri)}`} state={{filename: image.filename}}>
                            <ViewIcon />
                          </Link>
                        </div>
                        {/* <div className="w-8 mr-2 transform hover:text-[#FF9494] hover:scale-110">
                          <EditIcon />
                        </div> */}
                        <div onClick={() => {onAddFilesClick(image.filename)}} className="w-8 mr-2 transform hover:text-[#FF9494] hover:scale-110">
                          <DeleteIcon />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
                { showFileUploadModal && <ConfirmDelete fileToBeDeleted={fileToBeDeleted} onClose={onAddFilesClose}/> }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilesView;
