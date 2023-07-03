import { useEffect, useState } from "react";
import { Button, Table } from "react-bootstrap";
import { GetProgress, Cancel } from "../wailsjs/go/main/App";
import "./styles/Progress.css";
import { speedString, durationString } from "./utils/utils";


const Progress = ({display, setDisplay}) => {
  const [totalItems, setTotalItems] = useState(0);
  const [items, setItems] = useState(0);
  const [statTransferred, setStatTransferred] = useState(0);
  const [statSize, setStatSize] = useState(0);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [progressClass, setProgressClass] = useState("");
  const startTime = Math.round(Date.now()/1000);
  const [transferSpeed, setTransferSpeed] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("");

  const reloadProgress = () => {
    if(display) {
      setTimeout(() => {
        GetProgress().then((result) => {
          if(result && result.size) {
            console.log(result);
            var total_items = result.files + result.dirs + result.symlinks;
            setStatTransferred(result.transferred);
            setStatSize(result.size);
            setTotalItems(total_items);
            setItems(result.items);
            var percentage = Math.round(100*(result.items / total_items));
            setProgressPercentage(percentage);
            setProgressClass(progressCSS(percentage));

            var transfer_speed = result.transferred/(Math.round(Date.now()/1000) - startTime);
            setTransferSpeed(speedString(transfer_speed));
            var estimate = Math.round(result.transferred/transfer_speed);
            setEstimatedTime(durationString(estimate));
          }
          if(!result.size) {
            setDisplay(false);
          } else {
            reloadProgress();
          }
        });
      }, 1000);
    }
  };

  const progressCSS = (percentage) => {
    var className = "progress-bar";
    if(percentage < 25) {
      className += " bg-danger";
    } else if(percentage >= 25 && percentage < 50) {
      className += " bg-warning";
    } else if(percentage >= 50 && percentage < 75) {
      className += " bg-info";
    } else {
      className += " bg-success";
    }

    return className;
  };

  const cancelTask = () => {
    Cancel().then(() => {
      setStatTransferred(0);
      setStatSize(0);
      setItems(0);
      setTotalItems(0);
      setTransferSpeed("");
      setEstimatedTime("");
      setProgressPercentage(0);
      setDisplay(false);
    });
  };

  useEffect(() => {
    reloadProgress();
  });

  return (
    <div className="overlay" style={{display: display ? "flex" : "none"}}>
      <div className="progress-content">
        <Table>
          <tbody>
            <tr>
              <td><b>Transferred size:</b></td>
              <td>{statTransferred}</td>
            </tr>
            <tr>
              <td><b>Size to store:</b></td>
              <td>{statSize}</td>
            </tr>
            <tr>
              <td><b>Items stored:</b></td>
              <td>{items}</td>
            </tr>
            <tr>
              <td><b>Items to store:</b></td>
              <td>{totalItems}</td>
            </tr>
            <tr>
              <td><b>Transfer speed:</b></td>
              <td>{transferSpeed}</td>
            </tr>
            <tr>
              <td><b>Time estimate:</b></td>
              <td>{estimatedTime}</td>
            </tr>
          </tbody>
        </Table>         
        <br />
        <div className="progress">
          <span className="progress-used-percentage">
            {progressPercentage + "%"}
          </span>
          <div className={progressClass} role="progressbar" style={{width: progressPercentage + "%"}} aria-valuenow={progressPercentage} aria-valuemin="0" aria-valuemax="100"></div>
        </div>

        <Button onClick={() => cancelTask()}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default Progress;
