import { GetProgress } from "../wailsjs/go/main/App";

let instance;
let outputCounts = 0;
let outputs = [];
let progress_id;

class Terminal {

  constructor() {
    if(instance) {
      throw new Error("You can only create one instance!");
    }
    instance = this;
  }

  getInstance() {
    return this;
  }

  getTerminalOutputBody() {
    return outputs.map((output, index) => {
      return (
        <tr key={index}>
          <td width="5%">{output[0]}</td>
          <td width="10%">{output[1]}</td>
          <td width="75%">{output[2]}</td>
          <td width="10%">{output[3]}</td>
        </tr>
      );
    });
  };

  insertOutput(actionSource, action, status) {
    var id = outputCounts++;

    outputs.push([id, actionSource, action, status]);
    return id;
  };

  updateOutput(id, actionSource, action, status) {
    outputs[id] = [id, actionSource, action, status];
  };

  insertProgress(actionSource, action, status, finishedStatus) {
    progress_id = this.insertOutput(actionSource, action, status);
    GetProgress().then((result) => {
      this.updateProgress(actionSource, result, status, finishedStatus);
    });
  };

  updateProgress(actionSource, action, status, finishedStatus) {
    this.updateOutput(progress_id, actionSource, action, status);
    setTimeout(() => {
      GetProgress().then((result) => {
        if(result !== action) {
          this.updateProgress(actionSource, result, status, finishedStatus);
        } else {
          this.updateOutput(progress_id, actionSource, result, finishedStatus);
        }
      });
    }, 10);
  };
};


const singletonTerminal = Object.freeze(new Terminal());
export default singletonTerminal;
