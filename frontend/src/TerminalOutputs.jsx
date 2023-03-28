import React, { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import singletonTerminal from "./Terminal";
import "./styles/Terminal.css";

const TerminalOutputs = () => {
  const [output, setOutput] = useState(null);

  useEffect(() => {
    setInterval(()=> setOutput(singletonTerminal.getTerminalOutputBody()), 1000);
  }, [
    setOutput
  ]);

  return (
    <Table id="terminal">
      <thead>
        <tr>
          <th>ID</th>
          <th>Source</th>
          <th>Action</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {output}
      </tbody>
    </Table>
  );
};

export default TerminalOutputs;
