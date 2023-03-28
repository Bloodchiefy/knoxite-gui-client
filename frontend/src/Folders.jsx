import {Explore} from "../wailsjs/go/main/App";
import {useEffect, useState, useRef} from 'react';
import { Button, Table } from "react-bootstrap";
import "./styles/Folders.css";
import { getIconByType } from "./utils/utils";
import PathComponent from "./PathComponent";

const Folders = ({
  setBackend
}) => {
  const [entries, setEntries] = useState([]);
  const [currentPath, setCurrentPath] = useState("");
  const entriesRef = useRef(false);

  useEffect(() => {
    if(!entriesRef.current) {
      entriesRef.current = true;
      explore("");
    }
  });

  const explore = (path) => {
    Explore(path).then((result) => {
      setCurrentPath(result.path);
      setEntries(result.entries);
    });
  };

  const onClick = (event, entry) => {
    if(event.detail === 2 && entry.isDir) {
      explore(entry.path);
      const selected_btns = document.getElementsByClassName("selected");
      const btns = [...selected_btns];
      for(var i = 0; i < btns.length; i++) {
        btns[i].className = btns[i].className.replace(" selected", "");
      }
    } else if (event.currentTarget.children.length <= 1 || event.currentTarget.children[1].textContent !== "..") {
      var targetClassNames = event.currentTarget.className;
      if(targetClassNames.includes("selected")) {
        event.currentTarget.className = targetClassNames.replace(" selected", "");
      } else {
        event.currentTarget.className += " selected";
      }
    }
  };

  const getIcon = (entry) => {
    return getIconByType(entry.path, entry.isDir);
  };

  const entryElements = entries.map((entry, index) => {
    return (
      <tr data-path={entry.path} key={index} className='file-button' onClick={(event) => onClick(event, entry)}>
        <td>
          {getIcon(entry)}
          <span className="entry-name">{entry.name}</span>
        </td>
        <td>
          {entry.isDir ? "" : entry.size}
        </td>
        <td>
          {entry.isDir ? "" : entry.mode}
        </td>
        <td>
          {entry.isDir ? "" : entry.user}
        </td>
        <td>
          {entry.isDir ? "" : entry.group}
        </td>
      </tr>
    );
  });

  return (
    <>

      <div className="menu">
        <Button onClick={() => setBackend(null)}>
          Switch Backend
        </Button>
      </div>
      <div className="path-component">
        /
        <PathComponent path={currentPath} redirectTo={explore} />
      </div>
      <Table className='files'>
        <tbody>
          {entryElements}
        </tbody>
      </Table>
    </>
  );
};

export default Folders;
