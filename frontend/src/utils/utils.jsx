import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile, faFileCode, faFileExcel, faFilePdf, faFilePowerpoint, faFileText, faFileWord, faFileZipper, faFolderOpen, faFileImage } from "@fortawesome/free-solid-svg-icons";

export const cn = (...args) => args.filter(Boolean).join(" ");

export const findNestedObj = (entireObj, keyToFind) => {
  let foundObj;
  JSON.stringify(entireObj, (_, nestedValue) => {
    if (nestedValue && nestedValue[keyToFind]) {
      foundObj = nestedValue;
    }
    return nestedValue;
  });
  return foundObj;
};

export const createFolderHirachyFromString = (obj, file, key) => {
  let keys = key.split("/").filter((k) => { return k !== ""; });
  if(keys.length === 0) {
    return obj;
  } else if(keys.length === 1) {
    let fileObj = {};
    if(file.isDir) {
      let find = findNestedObj(obj, key);
      if(find) {
        fileObj[key] = find[key];
      } else {
        fileObj[key] = {};
      }
    } else {
      fileObj[key] = file;
    }
    return fileObj;
  } else {
    let subobj = findNestedObj(obj, keys[0]);
    if(!subobj) {
      subobj = {};
      subobj[keys[0]] = {};
    }
    subobj[keys[0]] = Object.assign(subobj[keys[0]], createFolderHirachyFromString(subobj, file, keys.slice(1, keys.length).join("/")));
    return subobj;
  }
};

export const depthMatrix = (obj, output, lvl) => {
  if(!lvl) {
    lvl = 0;
    output = {};
  }
  if(!output[lvl]) {
    output[lvl] = [];
  }
  Object.keys(obj).map(key => {
    if(typeof obj[key] === "object") {
      output[lvl].push(key);
      return depthMatrix(obj[key], output, lvl+1); // may need to remove "return"
    } else {
      return []; // may need to be refactored (leave out else branch)
    }
  });
  return output;
};

export const getFolderPaths = (obj, path, output, lvl) => {
  if(!output) output = { "/": 0 };
  if(!path) path = "";
  if(!lvl) lvl = 1;
  Object.keys(obj).map(key => {
    if(typeof obj[key] === "object" && !("size" in obj[key])) {
      var pathC = path + "/" + key;
      output[pathC] = lvl;
      return getFolderPaths(obj[key], pathC, output, lvl+1);
    } else {
      return ""; // may need to be refactored (leave out else branch)
    }
  });
  return output;
};

export const rsplit = (string, sep, maxsplit) => {
  var split = string.split(sep);
  return maxsplit ? [ split.slice(0, -maxsplit).join(sep) ].concat(split.slice(-maxsplit)) : split;
};

export const getFiletype = (ext) => {
  switch (ext) {
  case "png":
  case "gif":
  case "jpg":
  case "jpeg":
  case "bmp":
    return "image";
  case "txt":
  case "rtf":
    return "text";
  case "pdf":
    return "pdf";
  case "odt":
  case "doc":
  case "docx":
  case "pages":
    return "word";
  case "ods":
  case "xls":
  case "xlsx":
  case "numbers":
    return "excel";
  case "odp":
  case "key":
  case "ppt":
  case "pptx":
    return "powerpoint";
  case "c":
  case "py":
  case "java":
  case "xml":
  case "cpp":
    return "code";
  case "zip":
  case "tar":
  case "bz":
  case "bz2":
  case "gz":
  case "tgz":
    return "archive";
  default:
    return undefined;
  }
};

export const getIconByType = (filepath, dir) => {
  if (dir) return <FontAwesomeIcon icon={faFolderOpen} style={{color: "#3dc17a"}} />;
  var filename = rsplit(filepath, "/", 1)[1];
  var ext = rsplit(filename, ".", 1)[1];
  var type = getFiletype(ext.toLowerCase());
  switch(type) {
  case "image":
    return <FontAwesomeIcon icon={faFileImage} />;
  case "pdf":
    return <FontAwesomeIcon icon={faFilePdf} />;
  case "text":
    return <FontAwesomeIcon icon={faFileText} />;
  case "word":
    return <FontAwesomeIcon icon={faFileWord} />;
  case "excel":
    return <FontAwesomeIcon icon={faFileExcel} />;
  case "powerpoint":
    return <FontAwesomeIcon icon={faFilePowerpoint} />;
  case "code":
    return <FontAwesomeIcon icon={faFileCode} />;
  case "archive":
    return <FontAwesomeIcon icon={faFileZipper} />;
  default:
    return <FontAwesomeIcon icon={faFile} />;
  }
};
