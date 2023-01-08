import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { Link } from "react-router-dom";
import { extractNameFromEncryptedFileName, extractSlug } from "../utils/manipulator";

const Showcase = (props) => {
  return (
    <div className="showcase">
      <ResponsiveMasonry columnsCountBreakPoints={{350: 1, 750: 2, 900: 4}}>
        <Masonry gutter="10px">
          {props.photos.map((image, i) => (
            <div className="relative group" key={image.uri}>
              <Link to={`resource/${extractSlug(image.uri)}`} state={{filename: image.filename}}>
                <img
                    key={image.uri}
                    src={image.uri}
                    style={{width: "100%", display: "block"}}
                    alt=""
                    className="rounded-2xl group-hover:opacity-80 duration-300"
                  /> 
                  <div className="opacity-0 group-hover:opacity-100 duration-300 absolute left-0 bottom-0 right-0 z-10 flex justify-center items-end text-xl text-white font-semibold">{extractNameFromEncryptedFileName(image.filename)}</div>
              </Link>  
            </div>
          ))}
        </Masonry>
      </ResponsiveMasonry>
    </div>
    
  )
}

export default Showcase;
