import { useEffect, useState } from "react";
// import { Button } from "react-bootstrap";
import { GetProgress } from "../wailsjs/go/main/App";
import "./styles/Progress.css";


const Progress = ({display, setDisplay}) => {
  const [totalItems, setTotalItems] = useState(0);
  const [items, setItems] = useState(0);
  const [statTransferred, setStatTransferred] = useState(0);
  const [statSize, setStatSize] = useState(0);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [progressClass, setProgressClass] = useState("");

  const reloadProgress = () => {
    if(display) {
      setTimeout(() => {
        GetProgress().then((result) => {
          if(result && result.size) {
            var total_items = result.files + result.dirs + result.symlinks;
            setStatTransferred(result.transferred);
            setStatSize(result.size);
            setTotalItems(total_items);
            setItems(result.items);
            var percentage = Math.round(100*(result.items / total_items));
            setProgressPercentage(percentage);
            setProgressClass(progressCSS(percentage));
          }
          if(result.size) {
            reloadProgress();
          } else {
            setDisplay(false);
          }
        });
      }, 100);
    }
  };

  const progressCSS = (percentage) => {
    var className = "progress-bar";
    if(percentage < 25) {
      className += " bg-success";
    } else if(percentage < 50) {
      className += " bg-info";
    } else if(percentage < 75) {
      className += " bg-warning";
    } else {
      className += " bg-danger";
    }

    return className;
  };

  // const cancelTask = () => {
  //   console.log("sending cancel");
  //   Cancel().then(() => {
  //     console.log("cancel send");
  //     setDisplay(false);
  //   });
  // };

  useEffect(() => {
    reloadProgress();
  });

  return (
    <div className="overlay" style={{display: display ? "flex" : "none"}}>
      <div className="progress-content">
        Transferred size: {statTransferred}
        <br />
        Size to store: {statSize}
        <br />
        Items stored: {items}
        <br />
        Items to store: {totalItems}
        <br />
        <div className="progress">
          <span className="progress-used-percentage">
            {progressPercentage + "%"}
          </span>
          <div className={progressClass} role="progressbar" style={{width: progressPercentage + "%"}} aria-valuenow={progressPercentage} aria-valuemin="0" aria-valuemax="100"></div>
        </div>

        {/* <Button onClick={() => cancelTask()}>
          Cancel
        </Button> */}
      </div>
    </div>
  );
};

export default Progress;
