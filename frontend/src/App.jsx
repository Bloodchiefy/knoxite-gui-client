import { useState } from 'react';
import './styles/App.css';
import BackupForm from './BackupForm';
import BackendForm from "./BackendForm";

const App = () => {
  const [backend, setBackend] = useState(null);

  

  if (backend !== null) {
    return (
      <BackupForm setBackend={setBackend} />
    );
  } else {
    return (
      <BackendForm setBackend={setBackend} />
    );
  }
};

export default App;
