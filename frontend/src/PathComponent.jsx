import { Button } from "react-bootstrap";

const PathComponent = ({path, redirectTo}) => {
  const pathArr = path.split("/").filter((p) => {
    if(p === "" || p === "/") {
      return false;
    } else {
      return true;
    }
  });
  const pathElements = [];
  for(var i = 0; i < pathArr.length; i++) {
    let pathUntil = pathArr.slice(0, i + 1).join("/");
    if(pathUntil.charAt(0) !== "/") pathUntil = "/" + pathUntil;
    let button = <Button key={i} variant="link" onClick={() => redirectTo(pathUntil)}>{pathArr[i]}</Button>;
    pathElements.push(button);
    if(i !== pathArr.length - 1) {
      pathElements.push(" / ");
    }
  }

  return pathElements;
};

export default PathComponent;
