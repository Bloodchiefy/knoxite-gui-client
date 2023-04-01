import { Button } from "react-bootstrap";
import "./styles/ErrorMessages.css";


const ErrorMessages = ({
  display, 
  setDisplay,
  setError,
  error}) => {

  const hideError = () => {
    setError("");
    setDisplay(false);
  };

  return (
    <div className="overlay" style={{display: display ? "flex" : "none"}}>
      <div className="error-content">
        {error}
        <Button onClick={() => hideError()}>
          OK
        </Button>
      </div>

      
    </div>
  );
};

export default ErrorMessages;
