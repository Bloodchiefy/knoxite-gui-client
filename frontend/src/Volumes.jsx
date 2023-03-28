import { useEffect, useRef, useState } from "react";
import { Card, Container, Table } from "react-bootstrap";
import { GetVolumes, OpenVolume } from "../wailsjs/go/main/App";
import singletonTerminal from "./Terminal";

const Volumes = ({setVolume, setView}) => {
  const [volumes, setVolumes] = useState([]);
  const volumesRef = useRef(false);
  const volumesList = volumes.length > 0 ? volumes.map((volume, index) => {
    return (
      <tr onClick={() => openVolume(volume[0])} key={index}>
        <td>{volume[0]}</td>
        <td>{volume[1]}</td>
        <td>{volume[2]}</td>
      </tr>
    );
  }) : <tr><td colSpan={3}>No volumes found.</td></tr>;

  useEffect(() => {
    if(!volumesRef.current) {
      volumesRef.current = true;
      var oID = singletonTerminal.insertOutput("GetVolumes", "start", "Running");
      GetVolumes().then((result) => {
        singletonTerminal.updateOutput(oID, "GetVolumes", "finished", "Success");
        setVolumes(result);
      }).catch((err) => {
        singletonTerminal.updateOutput(oID, "GetVolumes", err, "Crashed");
      });
    }
  });

  const openVolume = (volID) => {
    OpenVolume(volID).then(() => {
      setVolume(volID);
      setView("snapshots");
    });
  };

  

  return (
    <Container>
      <Card>
        <Card.Header>
          Volumes
        </Card.Header>
        <Card.Body>
          <Table className="volumes-snapshots-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {volumesList}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Volumes;
