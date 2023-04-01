import { useState } from 'react';
import './styles/App.css';
import BackupForm from './BackupForm';
import BackendForm from "./BackendForm";
import Progress from './Progress';

const App = () => {
  const [backend, setBackend] = useState(null);
  // const [displayError, setDisplayError] = useState(false);
  const [displayProgress, setDisplayProgress] = useState(false);

  const displayBackupOrBackend = () => {
    if (backend !== null) {
      return (
        <BackupForm setBackend={setBackend} setDisplayProgress={setDisplayProgress} />
      );
    } else {
      return (
        <BackendForm setBackend={setBackend} />
      );
    }
  };


  return (
    <>
      <Progress display={displayProgress} setDisplay={setDisplayProgress} />
      {displayBackupOrBackend()}
    </>
  );
};

export default App;
