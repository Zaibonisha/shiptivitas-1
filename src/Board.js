import React from 'react';
import Dragula from 'dragula';
import 'dragula/dist/dragula.css';
import Swimlane from './Swimlane';
import './Board.css';

export default class Board extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      clients: {
        backlog: [],
        inProgress: [],
        complete: [],
      },
    };
    this.swimlanes = {
      backlog: React.createRef(),
      inProgress: React.createRef(),
      complete: React.createRef(),
    };
  }

  componentDidMount() {
    this.drake = Dragula([
      this.swimlanes.backlog.current,
      this.swimlanes.inProgress.current,
      this.swimlanes.complete.current,
    ]);
    this.drake.on('drop', (el, target, source, sibling) => this.updateClient(el, target, source, sibling));
  }

  componentWillUnmount() {
    this.drake.remove();
  }

  updateClient(el, target, _, sibling) {
    this.drake.cancel(true);

    let targetSwimlane = 'backlog';
    if (target === this.swimlanes.inProgress.current) {
      targetSwimlane = 'in-progress';
    } else if (target === this.swimlanes.complete.current) {
      targetSwimlane = 'complete';
    }

    const clientsList = [
      ...this.state.clients.backlog,
      ...this.state.clients.inProgress,
      ...this.state.clients.complete,
    ];
    const clientThatMoved = clientsList.find(client => client.id === el.dataset.id);
    const clientThatMovedClone = {
      ...clientThatMoved,
      status: targetSwimlane,
    };

    const updatedClients = clientsList.filter(client => client.id !== clientThatMovedClone.id);
    const index = sibling ? updatedClients.findIndex(client => client.id === sibling.dataset.id) : -1;
    updatedClients.splice(index === -1 ? updatedClients.length : index, 0, clientThatMovedClone);

    this.setState({
      clients: {
        backlog: updatedClients.filter(client => !client.status || client.status === 'backlog'),
        inProgress: updatedClients.filter(client => client.status && client.status === 'in-progress'),
        complete: updatedClients.filter(client => client.status && client.status === 'complete'),
      },
    });
  }

  renderSwimlane(name, clients, ref) {
    return <Swimlane name={name} clients={clients} dragulaRef={ref} />;
  }

  render() {
    return (
      <div className="Board">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-4">
              {this.renderSwimlane('Backlog', this.state.clients.backlog, this.swimlanes.backlog)}
            </div>
            <div className="col-md-4">
              {this.renderSwimlane('In Progress', this.state.clients.inProgress, this.swimlanes.inProgress)}
            </div>
            <div className="col-md-4">
              {this.renderSwimlane('Complete', this.state.clients.complete, this.swimlanes.complete)}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
