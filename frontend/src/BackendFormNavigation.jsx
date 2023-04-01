import Nav from 'react-bootstrap/Nav';
import logo from "./assets/images/knoxite-logo.svg";
// import Navbar from 'react-bootstrap/Navbar';
// import NavDropdown from 'react-bootstrap/NavDropdown';
import "./styles/BackendFormNavigation.scss";

const BackendFormNavigation = ({
  setFormSelection,
  aliases
}) => {

  const switchForm = (form) => {
    setFormSelection(form);
  };

  return (
    <Nav className="sidebar">
      <div className='sidebar-heading'>
        <img alt="knoxite-logo" src={logo} />
      </div>
      <div>
        {aliases.length > 0 ? <Nav.Item>
          <Nav.Link onClick={() => switchForm("alias")}>Aliases</Nav.Link>
        </Nav.Item> : ""}
        <Nav.Item>
          <Nav.Link onClick={() => switchForm("file")}>Filesystem</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link href="#">Test1</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link href="#">Test1</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link href="#">Test1</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link href="#">Test1</Nav.Link>
        </Nav.Item>
      </div>
    </Nav>
  );
};

export default BackendFormNavigation;
