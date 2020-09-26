import { useSelector } from 'react-redux';
import { closeInspect } from './redux/models/node_inspect';
import store from './redux/store';
import Modal from './modal';
import Task from './task';

const NodeInspect = (props) => {
  const closeCallback = () => store.dispatch(closeInspect());
  const { nodeID, hostname } = props;
  const { manifest } = useSelector(state => state.swarm);
  const services = manifest.stacks.map(stack => stack.services).flat();
  const createTask = (task) => (
    <Task key={`node-inspect-${task.id}`} task={task} manifest={manifest} />
  );

  const tasks = services.map(service => service.tasks)
                        .flat()
                        .filter(task => task.nodeID === nodeID)
                        .map(createTask);
  const content = (
    <div className="tasks">
      {tasks}
    </div>
  );

  return (
    <Modal
      content={content}
      closeCallback={closeCallback}
      wrapperClass="node-inspect-wrapper"
      contentClass="node-inspect"
      title="Node Tasks"
      subtitle={`${hostname} ${nodeID}`} />
  );
};

export default NodeInspect;
