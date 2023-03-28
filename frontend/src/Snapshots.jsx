import { useEffect } from "react";
import { Card, Container, Table } from "react-bootstrap";
import { GetSnapshots, OpenAllSnapshots, OpenSnapshot } from "../wailsjs/go/main/App";
import "./styles/VolumesSnapshots.css";

const Snapshots = ({
  volume, 
  snapshots, 
  setSnapshots,
  setSnapshot,
  setView,
  setFiles
}) => {

  useEffect(() => {
    setTimeout(() => {
      GetSnapshots(volume).then((result) => {
        if(result) setSnapshots(result);
      });
    }, 1000);
  }, [
    setSnapshots,
    volume,
    snapshots
  ]);

  const openSnapshot = (snapID) => {
    if(snapID === "all") {
      OpenAllSnapshots().then(result => {
        if(result) setFiles(result);
        setSnapshot("all");
        setView("files");
      });
    } else {
      OpenSnapshot(snapID).then((result) => {
        if(result) setFiles(result);
        setSnapshot(snapID);
        setView("files");
      });
    }
  };


  const snapshotsList = snapshots.map((snapshot, index) => {
    return (
      <tr key={index + 1} onClick={() => openSnapshot(snapshot[0])}>
        <td>{snapshot[0]}</td>
        <td>{snapshot[1]}</td>
        <td>{snapshot[2]}</td>
      </tr>
    );
  });

  const snapshotsTable = () => {
    if(snapshots.length > 0) {
      return [
        <tr key={0} onClick={() => openSnapshot("all")}>
          <td>All</td>
          <td>All snapshots</td>
          <td>-</td>
        </tr>,
        ...snapshotsList
      ];
    } else {
      return <tr><td colSpan={3}>No snapshots found.</td></tr>;
    }
  };

  return (
    <Container>
      <Card>
        <Card.Header>
          Snapshots
        </Card.Header>
        <Card.Body>
          <Table className="volumes-snapshots-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Description</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {snapshotsTable()}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Snapshots;
