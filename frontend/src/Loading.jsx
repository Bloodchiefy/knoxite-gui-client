// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./styles/Loading.css";
// import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import spinner from "./assets/images/knoxite-spinner-1.png";

const Loading = ({display}) => {
  return (
    <div className="overlay" style={{display: display ? "flex" : "none"}}>
      <div className="loading-content">
        {/* <FontAwesomeIcon size="4x" icon={faSpinner} className="fa-spin" /> */}
        <img width="70px" height="70px" src={spinner} />
      </div>
    </div>
  );
};

export default Loading;