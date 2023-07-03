import { useEffect, useRef, useState } from "react";
import { Button, Table } from "react-bootstrap";
// import singletonTerminal from "./Terminal";
import { createFolderHirachyFromString, getFolderPaths, rsplit, getIconByType } from "./utils/utils";
import Volumes from "./Volumes";
import Snapshots from "./Snapshots";
import "./styles/Repository.css";
import "./styles/Folders.css";
import PathComponent from "./PathComponent";

const Repository = ({
  volume,
  setVolume,
  snapshot,
  setSnapshot,
  snapshots,
  setSnapshots,
  setDisplayLoading,
  setDisplayError,
  setError,
}) => {
  const [view, setView] = useState("volumes");
  const [files, setFiles] = useState([]);


  switch(view) {
  case "volumes":
    return (
      <Volumes setVolume={setVolume} setView={setView} setDisplayLoading={setDisplayLoading} />
    );
  case "snapshots":
    return (
      <>
        <div className="menu">
          <Button onClick={() => setView("volumes")}>
            Volumes
          </Button>
        </div>
        <Snapshots 
          setFiles={setFiles} 
          volume={volume} 
          snapshots={snapshots} 
          setSnapshots={setSnapshots} 
          setSnapshot={setSnapshot} 
          setView={setView}
          setDisplayLoading={setDisplayLoading}
          setDisplayError={setDisplayError}
          setError={setError} />
      </>
    );
  case "files":
    return (
      <>
        <div className="menu">
          <Button onClick={() => setView("volumes")}>
            Volumes
          </Button>{' '}
          <Button onClick={() => setView("snapshots")}>
            Snapshots
          </Button>
        </div>
        <FileBrowsing files={files} />
      </>
    );
  default:
    return (<></>);
  }
};


const FileBrowsing = ({files}) => {
  const fileSystemRef = useRef(false);
  const [fileSystem, setFileSystem] = useState([]);
  const [folders, setFolders] = useState([]);
  const [tableFiles, setTableFiles] = useState([]);
  const [path, setPath] = useState("");

  useEffect(() => {
    if(!fileSystemRef.current && files.length > 0) {
      fileSystemRef.current = true;
      let dirs = {};
      for(var i = 0; i < files.length; i++) {
        dirs = createFolderHirachyFromString(dirs, files[i], files[i].key);
      }
      setFileSystem(dirs);

      var newFolders = {};
      var newFiles = {};
      for (const [key, value] of Object.entries(dirs)) {
        if(!("size" in value)) {
          newFolders[key] = "";
        } else {
          newFiles[key] = value;
        }
      }
      setTableFiles(Object.values(newFiles));
      setFolders(Object.keys(newFolders));
      var folderPaths = getFolderPaths(dirs);
      setPath(Object.keys(folderPaths)[0]);
    }
  }, [
    fileSystem, 
    files, 
    setPath, 
    setFileSystem, 
    setTableFiles,
    setFolders
  ]);

  const redirectTo = (p) => {
    setPath(p);
    var traversePaths = p.split("/");
    var obj = fileSystem;
    for(var i = 0; i < traversePaths.length; i++) {
      if(traversePaths[i] in obj) {
        obj = obj[traversePaths[i]];
      }
    }
    var newFolders = {};
    var newFiles = {};
    for (const [key, value] of Object.entries(obj)) {
      if(!("size" in value)) {
        newFolders[key] = "";
      } else {
        newFiles[key] = value;
      }
    }
    setTableFiles(Object.values(newFiles));
    setFolders(Object.keys(newFolders));
  };

  if(fileSystem) {
    return (
      <>
        <div className="path-component">
          /
          <PathComponent path={path} redirectTo={redirectTo} />
        </div>
        <FolderHirachy files={tableFiles} path={path} folders={folders} redirectTo={redirectTo} />
      </>
    );
  }
};

const FolderHirachy = ({files, folders, path, redirectTo}) => {
  const openFolder = (f) => {
    redirectTo(f);
  };
  const foldersElements = folders.map((f, index) => {
    var ownPath = path + (path === "/" ? "" : "/") + f;
    var key = path === "/" ? index+1 : index+2;
    return (
      <FolderElement folder={f} key={key} index={key} path={ownPath} openFolder={() => openFolder(ownPath)} />
    );
  });
  const fileElements = files.map((entry, index) => {
    var filename = rsplit(entry.key, "/", 1)[1];
    return (
      <tr key={folders.length + index + 2} className='file-button' onClick={() => { if(entry.isDir) openFolder(entry.key); }}>
        <td>
          {getIconByType(filename, entry.isDir)}
          <span className="entry-name">{filename}</span>
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

  const openParentFolder = (f) => {
    var parentFolder = rsplit(f, "/", 1)[0];
    if(parentFolder === "") parentFolder = "/";
    if(parentFolder.charAt(0) !== "/") parentFolder = "/" + parentFolder;
    redirectTo(parentFolder);
  };

  if(path && typeof path === "string") {
    var elements = [
      <FolderElement key={0} folder={".."} index={0} path={path} openFolder={() => openParentFolder(path)} />,
      ...foldersElements,
      ...fileElements
    ];
    return (
      <Table className="files">
        <tbody>
          {elements}
        </tbody>
      </Table>
    );
  } else {
    return (
      <Table className="files">
        <tbody>
          <tr>
            <td colSpan={5}>
              No files found.
            </td>
          </tr>
        </tbody>
      </Table>
    );
  };
};

const FolderElement = ({index, folder, path, openFolder}) => {
  const onFolderClickOpen = () => {
    openFolder(path);
  };

  return (
    <tr style={{display: path === "/" ? "none" : ""}} key={index} className='file-button' onClick={() => onFolderClickOpen(path)}>
      <td>
        {getIconByType(path, true)}
        <span className="entry-name">{folder}</span>
      </td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
  );
};

export default Repository;
