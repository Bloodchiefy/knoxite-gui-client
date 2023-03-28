import { faFolderOpen, faRightToBracket } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {useEffect, useState, useRef} from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import { InitGlobalOptsOnExistingConfig, OpenDirectory, InitConfiguration, InitConfigOnAlias } from "../wailsjs/go/main/App";
import BackendFormNavigation from "./BackendFormNavigation";
import "./styles/BackendForm.css";

const BackendForm = ({setBackend}) => {
  const [formSelection, setFormSelection] = useState("alias");

  const formRender = () => {
    switch(formSelection) {
    case "alias": return <AlreadyConfiguredRepos setBackend={setBackend} />;
    case "file": return <FileSystemForm />;

    default: return <></>;
    }
  };

  return (
    <Container id="formContainer" className='no-user-select'>
      <BackendFormNavigation setFormSelection={setFormSelection} />
      <div id="right">
        {formRender()}
      </div>
    </Container>
  );
};

const AlreadyConfiguredRepos = ({setBackend}) => {
  const [aliases, setAliases] = useState([]);
  const [password, setPassword] = useState([]);
  const aliasesRef = useRef(false);

  useEffect(() => {
    if (!aliasesRef.current) {
      aliasesRef.current = true;
      InitGlobalOptsOnExistingConfig().then((result) => {
        if (result) setAliases(result);
      });
    }
  });

  const onPwChange = (event) => {
    if(event && event.target) setPassword(event.target.value);
  };

  const login = (alias) => {
    InitConfigOnAlias(alias, password).then(() => {
      setBackend(alias);
    });
  };

  const showPwField = (alias, index) => {
    const inputBtnGroups = document.getElementsByClassName("input-group");
    for (var i = 0; i < inputBtnGroups.length; i++) {
      inputBtnGroups[i].style.display = "none";
    }
    const inputBtnGroup = document.getElementById(alias + "-" + index + "-pw-field");
    inputBtnGroup.style.display = "flex";
  };

  const aliasesList = aliases.map((alias, index) => {
    return (
      <li key={index}>
        <Button className="alias" onClick={() => showPwField(alias, index)}>
          {alias}
        </Button>
        <div className='input-group input-group-alias' id={alias + "-" + index + "-pw-field"}>
          <Form.Control className='pw' type="password" value={password} onChange={onPwChange} />
          <Button className='pw' onClick={() => login(alias)}>
            <FontAwesomeIcon icon={faRightToBracket} />
          </Button>
        </div>
      </li>
    );
  });

  return (
    <>
      <h2>Already configured backends</h2>
      <ul className='aliases'>
        {aliasesList}
      </ul>
    </>
  );
};

const FileSystemForm = () => {
  const [folder, setFolder] = useState("");
  const [password, setPassword] = useState("");
  const [password_confirmation, setPasswordConfirmation] = useState("");
  const [alias, setAlias] = useState("");

  const selectFolder = () => {
    OpenDirectory().then((result) => {
      if (result) setFolder(result);
    });
  };

  const onChangePw = (event) => {
    if(event && event.target) setPassword(event.target.value);
  };
  const onChangePwCon = (event) => {
    if(event && event.target) setPasswordConfirmation(event.target.value);
  };

  const onChangeAlias = (event) => {
    if(event && event.target) setAlias(event.target.value);
  };

  const onSubmit = (event) => {
    if (password === password_confirmation && 
      password !== "" && 
      folder !== "" &&
      alias !== "") {
      InitConfiguration(folder, password, alias).then((result) => {
        if(result) debugger;
      });
    }
  };

  return (
    <>
      <h2>Filesystem</h2>
      <Form onSubmit={onSubmit}>
        <Form.Group className="mb-3" controlId="formBasicFolder">
          <Form.Label>Folder</Form.Label>
          <div className='input-group'>
            <Form.Control type="text" value={folder} disabled={true} />
            <div className='input-group-btn'>
              <Button variant="light" onClick={() => selectFolder()}>
                <FontAwesomeIcon icon={faFolderOpen} />
              </Button>
            </div>
          </div>
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control type="password" value={password} onChange={onChangePw} />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPasswordConfirmation">
          <Form.Label>Password Confirmation</Form.Label>
          <Form.Control type="password" value={password_confirmation} onChange={onChangePwCon} />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicAlias">
          <Form.Label>Alias</Form.Label>
          <Form.Control type="text" value={alias} onChange={onChangeAlias} />
        </Form.Group>

        <Button type="submit" variant="success">
          Submit
        </Button>
      </Form>
    </>
  );
};

export default BackendForm;
