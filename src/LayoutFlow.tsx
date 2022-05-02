import React, { useState, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  isNode,
  ReactFlowProps,
  useStoreState,
  Node,
  useStoreActions,
  Elements,
  isEdge,
} from 'react-flow-renderer';
import dagre from 'dagre';

// base structure comes from https://reactflow.dev/examples/layouting/
// worth taking a look: https://github.com/wbkd/react-flow/issues/5

const getLayoutedElements = (elements: Elements<any>) => {
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
        width: el.__rf.width,
      });
    } else {
      dagreGraph.setEdge(el.source, el.target);
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
          y: nodeWithPosition.y - el.__rf.height / 2 - rootPosition.y,
        },
      };
    }

    return el;
  });
};

// TODO: center horizontally by using the container dimension along with position and dimension of the root node.
const LayoutFlow = React.forwardRef(
  (rendererProps: ReactFlowProps, ref: React.Ref<HTMLDivElement>) => {
    const { elements } = rendererProps;
    const [layoutedElements, setLayoutedElements] = useState(elements); // initially just set to elements. we apply the layout later on when we have the width and height of each element.
    const [lastLayoutedNodes, setLastLayoutedNodes] = useState<Node[]>([]);

    useEffect(() => {
      setLastLayoutedNodes([]); // to enforce the re-layout at the other part
      const existingElementIDs = layoutedElements.map(el => el.id);
      setLayoutedElements(
        elements
          .filter(el => isNode(el) || existingElementIDs.includes(el.id)) // exclude new edges
          .map(el =>
            isNode(el) && existingElementIDs.indexOf(el.id) === -1
              ? { ...el, position: { x: -10000, y: -10000 } }
              : {
                  ...el,
                  position: (layoutedElements as Node[]).find(
                    layoutedEl => layoutedEl.id === el.id
                  )!.position,
                }
          )
      );
    }, [elements]);

    return (
      // boxSizing: 'border-box' should be for all children. So maybe we should have some sort of css or style tag?
      <div
        ref={ref}
        className="artbees-flow__LayoutFlow"
        style={{
          flexGrow: 1,
          width: '100%',
          height: '100%',
        }}
      >
        <style>{`.artbees-flow__LayoutFlow * {
          box-sizing: border-box;
        }`}</style>
        <ReactFlowProvider>
          <ReactFlow
            panOnScroll
            panOnScrollSpeed={1}
            nodesDraggable={false}
            {...rendererProps}
            elements={layoutedElements}
            elementsSelectable={false} // doc says we should have `pointer-events:all` since we disable this and have clickable elements in nodes
            // onConnect={onConnect}
            // onElementsRemove={onElementsRemove}
          >
            <ReactFlowStateHandler
              onNodesChange={nodes => {
                if (
                  nodes.some(node => node.__rf?.height) &&
                  nodes.filter(node => node.__rf.height).length ===
                    nodes.length &&
                  // to prevent infinite re-rendering:
                  (nodes.length !== lastLayoutedNodes.length ||
                    nodes.some(
                      (node, index) =>
                        lastLayoutedNodes[index].__rf.width !==
                          node.__rf.width ||
                        lastLayoutedNodes[index].__rf.height !==
                          node.__rf.height
                    ))
                ) {
                  // TODO: run this with debounce
                  setLayoutedElements(
                    getLayoutedElements([
                      ...nodes,
                      ...elements.filter(el => !isNode(el)),
                    ])
                  );
                  setLastLayoutedNodes(nodes);
                }
              }}
            />
          </ReactFlow>
        </ReactFlowProvider>
      </div>
    );
  }
);

export default LayoutFlow;

function ReactFlowStateHandler({
  onNodesChange,
}: {
  onNodesChange: (nodes: Node[]) => void;
}) {
  const nodes = useStoreState(state => state.nodes);

  // will later be needed to use along with `requestAnimationFrame`, if we want to implement transition animations.
  const updateNodePos = useStoreActions(actions => actions.updateNodePos);

  useEffect(() => {
    onNodesChange(nodes);
  }, [nodes]);
  return null;
}

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
