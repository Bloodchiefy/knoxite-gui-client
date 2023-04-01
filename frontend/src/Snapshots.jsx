import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect } from "react";
import { Button, Card, Container, Table } from "react-bootstrap";
import { GetSnapshots, OpenAllSnapshots, OpenSnapshot, DeleteSnapshot } from "../wailsjs/go/main/App";
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
        if(result) {
          setSnapshots(result);
        } else {
          setSnapshots([]);
        }
      });
    }, 1000);
  }, [
    setSnapshots,
    volume,
    snapshots
  ]);

  const deleteSnapshots = (snapID) => {
    DeleteSnapshot(snapID).then((result) => {
      if(result === "") {
        GetSnapshots().then((snaps) => {
          if(snaps) {
            setSnapshots(snaps);
          } else {
            setSnapshots([]);
          }
        });
      }
    });
  };

  const openSnapshot = (snapID) => {
    if(snapID === "all") {
      OpenAllSnapshots().then(result => {
        if(result) {
          setFiles(result);
          setSnapshot("all");
          setView("files");
        }
      });
    } else {
      OpenSnapshot(snapID).then((result) => {
        if(result) {
          setFiles(result);
          setSnapshot(snapID);
          setView("files");
        }
      });
    }
  };


  const snapshotsList = snapshots.map((snapshot, index) => {
    return (
      <tr key={index + 1}>
        <td>
          <Button variant="link" onClick={() => openSnapshot(snapshot[0])}>
            {snapshot[0]}
          </Button>
        </td>
        <td>{snapshot[1]}</td>
        <td>{snapshot[2]}</td>
        <td style={{textAlign: "right"}}>
          <Button variant="danger" onClick={() => deleteSnapshots(snapshot[0])}>
            <FontAwesomeIcon icon={faTrash} />
          </Button>
        </td>
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
      return <tr><td colSpan={4}>No snapshots found.</td></tr>;
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
