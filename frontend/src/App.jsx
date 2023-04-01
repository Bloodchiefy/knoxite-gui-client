import { useState } from 'react';
import './styles/App.css';
import BackupForm from './BackupForm';
import BackendForm from "./BackendForm";
import Progress from './Progress';
import ErrorMessages from './ErrorMessages';

const App = () => {
  const [backend, setBackend] = useState(null);
  const [displayError, setDisplayError] = useState(false);
  const [error, setError] = useState("");
  const [displayProgress, setDisplayProgress] = useState(false);

  const displayBackupOrBackend = () => {
    if (backend !== null) {
      return (
        <BackupForm 
          setBackend={setBackend} 
          setDisplayProgress={setDisplayProgress}
          setDisplay={setDisplayError}
          setError={setError} />
      );
    } else {
      return (
        <BackendForm 
          setBackend={setBackend} 
          setDisplayError={setDisplayError}
          setError={setError} />
      );
    }
  };


  return (
    <>
      <ErrorMessages 
        display={displayError} 
        setDisplay={setDisplayError}
        error={error}
        setError={setError} />
      <Progress display={displayProgress} setDisplay={setDisplayProgress} />
      {displayBackupOrBackend()}
    </>
  );
};

export default App;
