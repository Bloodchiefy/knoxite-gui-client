import { useState } from 'react';
import './styles/App.css';
import BackupForm from './BackupForm';
import BackendForm from "./BackendForm";
import Progress from './Progress';
import Loading from './Loading';
import ErrorMessages from './ErrorMessages';

const App = () => {
  const [backend, setBackend] = useState(null);
  const [displayError, setDisplayError] = useState(false);
  const [displayLoading, setDisplayLoading] = useState(false);
  const [error, setError] = useState("");
  const [displayProgress, setDisplayProgress] = useState(false);

  const displayBackupOrBackend = () => {
    if (backend !== null) {
      return (
        <BackupForm 
          setBackend={setBackend} 
          setDisplayProgress={setDisplayProgress}
          setDisplayError={setDisplayError}
          setDisplayLoading={setDisplayLoading}
          setError={setError} />
      );
    } else {
      return (
        <BackendForm 
          setBackend={setBackend} 
          setDisplayError={setDisplayError}
          setDisplayLoading={setDisplayLoading}
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
      <Loading display={displayLoading} setDisplay={setDisplayLoading} />
      {displayBackupOrBackend()}
    </>
  );
};

export default App;
