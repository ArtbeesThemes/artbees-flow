import React, { useState, useEffect, useLayoutEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  isNode,
  ReactFlowProps,
  useStoreState,
  Node,
  useStoreActions,
  OnLoadParams,
} from 'react-flow-renderer';
import {
  Extent,
  ExtentAddition,
  calcFlowExtent,
} from './helpers/scrollBehavior';
import { Product } from 'index';
import { getLayoutedElements } from './helpers/layouterByDagre';
import { productProps } from 'helpers/productSpecificProps';

interface CustomFlowProps extends ReactFlowProps {
  product: Product;
  setFlowInstance?: (instance: OnLoadParams<any>) => void;
  extentAdditions?: ExtentAddition;
}

const LayoutFlow = React.forwardRef(
  (props: CustomFlowProps, ref: React.Ref<HTMLDivElement>) => {
    const {
      elements,
      product,
      extentAdditions,
      setFlowInstance,
      ...restLibProps
    } = props;

    const [layoutedElements, setLayoutedElements] = useState(elements); // initially just set to elements. we apply the layout later on when we have the width and height of each element.
    const [lastLayoutedNodes, setLastLayoutedNodes] = useState<Node[]>([]);
    const [extent, setExtent] = useState<Extent>(undefined); // Used to limit the scrollable area.
    const [container, setContainer] = useState<HTMLDivElement | null>(null);

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

    const handleOnNodeChange = (nodes: Node[]) => {
      if (shouldRelayout(nodes, lastLayoutedNodes)) {
        // TODO: run this with debounce
        const newLayoutedElements = getLayoutedElements([
          // The map below ensures that latest jsx is used from the direct props.
          // It fixes an important bug on slow systems where changing props too fast resulted in a race condition that ended up showing old jsx.
          ...nodes.map(node => ({
            ...elements.find(el => el.id === node.id)!,
            __rf: node.__rf,
          })),
          ...elements.filter(el => !isNode(el)),
        ]);

        const layoutedNodes = newLayoutedElements.filter(isNode);

        setExtent(calcFlowExtent(layoutedNodes, container, extentAdditions));

        setLayoutedElements(newLayoutedElements);
        setLastLayoutedNodes(nodes);
      }
    };

    const setRef = (el: HTMLDivElement | null) => {
      if (!el) return;
      setContainer(el);

      if (typeof ref === 'function') {
        ref(el);
        return;
      }

      if (ref) {
        // @ts-ignore
        ref.current = el;
      }
    };

    return (
      <div
        ref={setRef}
        className="artbees-flow__LayoutFlow"
        style={{ flexGrow: 1, width: '100%', height: '100%' }}
      >
        <style>{getFlowStyles(product)}</style>
        <ReactFlowProvider>
          <ReactFlow
            nodesDraggable={false}
            {...productProps(product)}
            {...restLibProps}
            elements={layoutedElements}
            elementsSelectable={false} // doc says we should have `pointer-events:all` since we disable this and have clickable elements in nodes
            translateExtent={extent}
            onLoad={flow => {
              setFlowInstance && setFlowInstance(flow);
              // Due to an unknown reason the flow extent doesn't get applied in first render until we
              // do some manipulation on the flow. (chose zoomTo(1) because it's a neutral command)
              flow.zoomTo(1);
            }}
            // onConnect={onConnect}
            // onElementsRemove={onElementsRemove}
          >
            <ReactFlowStateHandler onNodesChange={handleOnNodeChange} />
          </ReactFlow>
        </ReactFlowProvider>
      </div>
    );
  }
);

export default LayoutFlow;

function getFlowStyles(product: Product) {
  let style = `
	.artbees-flow__LayoutFlow * {
		box-sizing: border-box;
	}`;

  if (product === 'sellkit') {
    style += `
		.react-flow__pane {
			cursor: grab;
		}`;
  }

  return style;
}

function ReactFlowStateHandler({
  onNodesChange,
}: {
  onNodesChange: (nodes: Node[]) => void;
}) {
  const nodes = useStoreState(state => state.nodes);

  // will later be needed to use along with `requestAnimationFrame`, if we want to implement transition animations.
  const updateNodePos = useStoreActions(actions => actions.updateNodePos);

  useLayoutEffect(() => {
    onNodesChange(nodes);
  }, [nodes]);
  return null;
}

function shouldRelayout(newNodes: Node[], prevNodes: Node[]): Boolean {
  return (
    // Is there any node with height?
    newNodes.some(node => node.__rf?.height) &&
    // Do all nodes have height?
    newNodes.filter(node => node.__rf.height).length === newNodes.length &&
    // Is there any new node OR any change in nodes dimensions relative to last render?
    (newNodes.length !== prevNodes.length ||
      newNodes.some(
        (node, index) =>
          prevNodes[index].__rf.width !== node.__rf.width ||
          prevNodes[index].__rf.height !== node.__rf.height
      ))
  );
}
