import { faFolderOpen, faRightToBracket } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {useEffect, useRef, useState} from 'react';
import { Form, Button, Container, Card } from 'react-bootstrap';
import { InitGlobalOptsOnExistingConfig, OpenDirectory, InitConfiguration, InitConfigOnAlias } from "../wailsjs/go/main/App";
import BackendFormNavigation from "./BackendFormNavigation";
import "./styles/BackendForm.css";

const BackendForm = ({
  setBackend,
  setError,
  setDisplayError,
  setDisplayLoading,
}) => {
  const [formSelection, setFormSelection] = useState("alias");
  const [aliases, setAliases] = useState([]);
  const aliasesRef = useRef(false);

  useEffect(() => {
    if(!aliasesRef.current) {
      aliasesRef.current = true;
      setDisplayLoading(true);
      InitGlobalOptsOnExistingConfig().then((result) => {
        setDisplayLoading(false);
        if (result) {
          setAliases(result);
          setFormSelection("alias");
        } else {
          setFormSelection("file");
        }
      });
    }
  });

  const switchToAlias = (form) => {
    setDisplayLoading(true);
    InitGlobalOptsOnExistingConfig().then((result) => {
      setDisplayLoading(false);
      if (result) {
        setAliases(result);
        setFormSelection("alias");
      } else {
        setFormSelection(form);
      }
    });
  };

  const formRender = () => {
    switch(formSelection) {
    case "alias": return <AlreadyConfiguredRepos aliases={aliases} setBackend={setBackend} setError={setError} setDisplayError={setDisplayError} setDisplayLoading={setDisplayLoading} />;
    case "file": return <FileSystemForm switchToAlias={switchToAlias} />;

    default: return <></>;
    }
  };

  return (
    <Container id="formContainer" className='no-user-select'>
      <BackendFormNavigation aliases={aliases} switchToAlias={switchToAlias} formSelection={formSelection} setFormSelection={setFormSelection} />
      <div id="right">
        <Card>
          <Card.Body>
            {formRender()}
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

const AlreadyConfiguredRepos = ({
  setBackend, 
  aliases,
  setDisplayError,
  setError,
  setDisplayLoading,
}) => {
  const [password, setPassword] = useState([]);

  const onPwChange = (event) => {
    if(event && event.target) setPassword(event.target.value);
  };

  const login = (alias) => {
    setDisplayLoading(true);
    InitConfigOnAlias(alias, password).then((result) => {
      setDisplayLoading(false);
      if(result !== "") {
        setDisplayError(true);
        setError(result);
      } else {
        setBackend(alias);
      }
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
      <li className='alias-div' key={index}>
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

const FileSystemForm = ({
  switchToAlias
}) => {
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

  const onSubmit = () => {
    if (password === password_confirmation && 
      password !== "" && 
      folder !== "" &&
      alias !== "") {
      InitConfiguration(folder, password, alias).then(() => {
        switchToAlias("file");
      });
    }
  };

  return (
    <>
      <h2>Filesystem</h2>
      <Form>
        <Form.Group className="mb-3" controlId="formBasicFolder">
          <Form.Label>Folder</Form.Label>
          <div className='input-group'>
            <Form.Control type="text" value={folder} disabled={true} aria-describedby="formBasicFolderCheck" isInvalid={folder.trim() === ""} />
            {" "}
            <div className='input-group-btn'>
              <Button variant="light" onClick={() => selectFolder()}>
                <FontAwesomeIcon icon={faFolderOpen} />
              </Button>
            </div>
          </div>
          <Form.Control.Feedback type="invalid" tooltip>
            Folder must be selected!
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control type="password" value={password} onChange={onChangePw} aria-describedby="formBasicPasswordCheck" isInvalid={password.trim() === "" || password !== password_confirmation} />

          <Form.Control.Feedback type="invalid" tooltip>
            Password musn't be empty!
            Password must be the same as password confirmation!
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPasswordConfirmation">
          <Form.Label>Password Confirmation</Form.Label>
          <Form.Control type="password" value={password_confirmation} onChange={onChangePwCon} aria-describedby="formBasicPasswordConfirmationCheck" isInvalid={password_confirmation.trim() === "" || password !== password_confirmation} />

          <Form.Control.Feedback type="invalid" tooltip>
            Password confirmation musn't be empty!
            Password must be the same as password confirmation!
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicAlias">
          <Form.Label>Alias</Form.Label>
          <Form.Control type="text" value={alias} onChange={onChangeAlias} aria-describedby="formBasicAliasCheck" isInvalid={alias.trim() === ""}/>

          <Form.Control.Feedback type="invalid" tooltip>
            Alias musn't be empty!
          </Form.Control.Feedback>
        </Form.Group>

        <Button variant="success" onClick={() => onSubmit()}>
          Submit
        </Button>
      </Form>
    </>
  );
};

export default BackendForm;
