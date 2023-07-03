import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Button, Form, Card, Container, Table } from "react-bootstrap";
import { CreateVolume, DeleteVolume, GetVolumes, OpenVolume } from "../wailsjs/go/main/App";

const Volumes = ({setVolume, setView, setDisplayLoading}) => {
  const [volumes, setVolumes] = useState([]);
  const [volumesView, setVolumesView] = useState("index");
  const [volumeName, setVolumeName] = useState("");
  const [volumeDescription, setVolumeDescription] = useState("");
  const volumesList = volumes.length > 0 ? volumes.map((volume, index) => {
    return (
      <tr key={index}>
        <td>
          <Button variant="link" onClick={() => openVolume(volume[0])}>
            {volume[0]}
          </Button>
        </td>
        <td>{volume[1]}</td>
        <td>{volume[2]}</td>
        <td style={{textAlign: "right"}}>
          <Button variant="danger" onClick={() => deleteVolume(volume[0])}>
            <FontAwesomeIcon icon={faTrash} />
          </Button>
        </td>
      </tr>
    );
  }) : <tr><td colSpan={4}>No volumes found.</td></tr>;

  useEffect(() => {
    setTimeout(() => {
      GetVolumes().then((result) => {
        if(result) 
          setVolumes(result);
        else
          setVolumes([]);
      });
    }, 1000);
  }, [
    setVolumes
  ]);

  const deleteVolume = (volID) => {
    DeleteVolume(volID).then((result) => {
      if(result === "") {
        GetVolumes().then((vols) => {
          if(vols) 
            setVolumes(vols);
          else
            setVolumes([]);
        });
      }
    });
  };

  const openVolume = (volID) => {
    OpenVolume(volID).then(() => {
      setVolume(volID);
      setView("snapshots");
    });
  };

  const onChangeName = (event) => {
    if(event && event.target) setVolumeName(event.target.value);
  };

  const onChangeDescription = (event) => {
    if(event && event.target) setVolumeDescription(event.target.value);
  };

  const onSubmit = () => {
    if(volumeName !== "") {
      CreateVolume(volumeName, volumeDescription).then(() => {
        setVolumeName("");
        setVolumeDescription("");
        setVolumesView("index");

        GetVolumes().then((result) => {
          if(result) setVolumes(result);
        });
      });
    }
  };

  const volumesContent = () => {
    if(volumesView === "index") {
      return (
        <Table className="volumes-snapshots-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {volumesList}
          </tbody>
        </Table>
      );
    } else if (volumesView === "create") {
      return (
        <Form>
          <Form.Group className="mb-3" controlId="formBasicName">
            <Form.Label>Name</Form.Label>
            <Form.Control type="text" value={volumeName} onChange={onChangeName} />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicDescription">
            <Form.Label>Description</Form.Label>
            <Form.Control type="text" value={volumeDescription} onChange={onChangeDescription} />
          </Form.Group>

          <Button variant="success" onClick={onSubmit}>
            Submit
          </Button>
        </Form>
      );
    }
  };

  return (
    <Container>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <span>
            Volumes
          </span>
          {volumesView === "index" ? <Button onClick={() => setVolumesView("create")} variant="success">
            <FontAwesomeIcon icon={faPlus} />
          </Button> : ""}
        </Card.Header>
        <Card.Body>
          {volumesContent()}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Volumes;
