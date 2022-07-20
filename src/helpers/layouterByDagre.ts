import { Node, isNode, isEdge, Elements } from 'react-flow-renderer';
import dagre from 'dagre';

// base structure comes from https://reactflow.dev/examples/layouting/
// worth taking a look: https://github.com/wbkd/react-flow/issues/5
export const getLayoutedElements = (elements: Elements<any>) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: 'TB' }); // set direction to "Top-to-Bottom"

  let rootId = '';

  elements.forEach(el => {
    if (isNode(el)) {
      if (isRootNode(el, elements)) {
        rootId = el.id;
      }

      dagreGraph.setNode(el.id, {
        height: el.__rf.height,
        width: Math.max(el.__rf.width, 120),
      });
    } else {
      dagreGraph.setEdge(el.target, el.source); // we add the edges with reverse direction and then flip the graph later. This helps to have a better layout when we have final End(Exit) node in the graph.
    }
  });

  dagre.layout(dagreGraph);

  const rootPosition = dagreGraph.node(rootId);

  return elements.map(el => {
    if (isNode(el)) {
      const nodeWithPosition = dagreGraph.node(el.id);
      // el.targetPosition = isHorizontal ? 'left' : 'top';
      // el.sourcePosition = isHorizontal ? 'right' : 'bottom';
      // unfortunately we need this little hack to pass a slightly different position
      // to notify react flow about the change. Moreover we are shifting the dagre node position
      // (anchor=center center) to the top left so it matches the react flow node anchor point (top left).
      // ---- NOTE: the 3-line comment above from the example itself doesn't seem relevant. We experienced
      // ---- the issue that position didn't get updated and it got fixed by being immutable and creating a new object for the node.
      return {
        ...el,
        position: {
          // add position prop immutably
          x: nodeWithPosition.x - el.__rf.width / 2 - rootPosition.x,
          y: -(nodeWithPosition.y + el.__rf.height / 2 - rootPosition.y),
        },
      };
    }

    return el;
  });
};

function isRootNode(node: Node<any>, elements: Elements<any>) {
  for (let el of elements) {
    if (isEdge(el)) {
      if (el.target === node.id) {
        return false;
      }
    }
  }
  return true;
}
