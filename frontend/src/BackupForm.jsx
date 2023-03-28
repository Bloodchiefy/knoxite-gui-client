import { useState } from 'react';
import { useResizable } from 'react-resizable-layout';
import { cn } from './utils/utils';
import Splitter from "./components/Splitter";
import SplitterBackup from './components/SplitterBackup';
import Folders from "./Folders";
import Repository from "./Repository";
import TerminalOutputs from './TerminalOutputs';
import { Store, Restore } from '../wailsjs/go/main/App';
import "./styles/BackupForm.css";
import singletonTerminal from './Terminal';

const BackupForm = ({
  setBackend
}) => {
  const [volume, setVolume] = useState("");
  const [snapshot, setSnapshot] = useState("");
  const [snapshots, setSnapshots] = useState([]);
  const {
    isDragging: isTerminalDragging,
    position: terminalH,
    splitterProps: terminalDragBarProps
  } = useResizable({
    axis: "y",
    initial: 150,
    min: 50,
    reverse: true
  });
  const {
    isDragging: isFileDragging,
    position: fileW,
    splitterProps: fileDragBarProps
  } = useResizable({
    axis: "x",
    initial: window.innerWidth/2 - 23,
    min: 335,
    max: window.innerWidth - 46 - 335
  });

  const onClick = (event) => {
    if(event.details === 2) {
      event.preventDefault();
      const divs = document.getElementsByClassName("shrink-0 contents");
      debugger;
      for(var i = 0; i < divs.length; i++) {
        debugger;
        divs.style.width = window.innerWidth/2 - 23;
      }
    }
  };

  const store = () => {
    if (volume !== "") {
      var targetDoms = document.getElementsByClassName("selected");
      var targets = [];
      for (var i = 0; i < targetDoms.length; i++) {
        targets.push(targetDoms[i].dataset.path);
      }

      if(targets.length > 0) {
        var oID = singletonTerminal.insertProgress(
          "Store", 
          "storing data", 
          "Running", 
          "Success");
        Store(volume, targets).catch(() => {
          singletonTerminal.updateOutput(oID, "Store", "finished", "Crashed");
        });
      }
    }
  };

  const restore = () => {
    if (snapshot !== "") {
      var targetDoms = document.getElementsByClassName("selected");
      if (targetDoms.length === 1) {
        var target = targetDoms[0].dataset.path;
        Restore(snapshot, target);
      }
    }
  }

  return (
    <div className={"flex flex-column h-screen font-mono color-white overflow-hidden"}>
      <div className={"flex grow"}>
        <div
          className={cn("shrink-0 contents", isFileDragging && "dragging")}
          style={{ width: fileW }}
        >
          <Folders setBackend={setBackend} />
        </div>
        <SplitterBackup onClick={onClick} store={store} restore={restore} isDragging={isFileDragging} {...fileDragBarProps} />
        <div
          className={cn("flex grow shrink-0 contents", isFileDragging && "dragging", "no-user-select")}
          style={{ width: window.innerWidth/2 - 23 - fileW }}
        >
          <Repository 
            volume={volume} 
            setVolume={setVolume} 
            snapshots={snapshots} 
            setSnapshots={setSnapshots}
            snapshot={snapshot}
            setSnapshot={setSnapshot} />
        </div>
      </div>
      <Splitter
        dir={"horizontal"}
        isDragging={isTerminalDragging}
        {...terminalDragBarProps}
      />
      <div
        className={cn(
          "shrink-0 bg-darker contents",
          isTerminalDragging && "dragging"
        )}
        style={{ height: terminalH }}
      >
        <TerminalOutputs />
      </div>
    </div>
  );
};

export default BackupForm;
