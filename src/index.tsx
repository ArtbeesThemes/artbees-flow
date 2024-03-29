import React, { CSSProperties, useState } from 'react';
import { Edge, OnLoadParams, ReactFlowProps } from 'react-flow-renderer';
import rendererElementsFromNodes from './helpers/rendererElementsFromNodes';
import CustomNode from './components/CustomNode';
import LayoutFlow from './LayoutFlow';
import { ExtentAddition } from 'helpers/scrollBehavior';

export type EdgeProps = Omit<Edge<any>, 'id' | 'source' | 'target'>;

export type NodeTarget = {
  /** `id` of the target node. */
  nodeId: string;
  // below `any` is type of the `data` key. That key is most likely not needed.
  edgeProps?: EdgeProps;
};

export type NodesMap = {
  [nodeId: string]: {
    // a great idea is to have a `component` instead of `jsx`. This can be more dynamic since \
    // props like `id` can be given to this component by this library and allow Further \
    // customization in a good structure.
    jsx: React.ReactNode;
    targets?: NodeTarget[];
    isHidden?: boolean;
    style?: CSSProperties;
  };
};

export type Product = 'growmatik' | 'sellkit';

export type FlowInstance = OnLoadParams<any>;

export type ArtbeesFlowProps = {
  nodes: NodesMap;
  /** Edge props that are by default applied to all  */
  defaultEdgeProps?: Omit<Edge<any>, 'id' | 'source' | 'target'>;
  /** props to be given to `react-flow-renderer` library for customizations. */
  rendererProps?: Omit<ReactFlowProps, 'elements'>;
  /** Intended to distinguish between the Artbees products specific flow settings */
  product: Product;
  setFlowInstance?: (instance: FlowInstance) => void;
  /** Pixels to add to default flow extent on each side. */
  extentAdditions?: ExtentAddition;
};

const CUSTOM_NODE_NAME = 'custom';

const ArtbeesFlow = React.forwardRef(
  (
    {
      nodes,
      rendererProps,
      defaultEdgeProps,
      product,
      setFlowInstance,
      extentAdditions,
    }: ArtbeesFlowProps,
    ref: React.Ref<HTMLDivElement>
  ) => {
    const elements = rendererElementsFromNodes(
      nodes,
      CUSTOM_NODE_NAME,
      defaultEdgeProps
    );
    const [containerWidth, setContainerWidth] = useState<number | null>(null);

    if (!containerWidth) {
      return (
        <div
          ref={el => setContainerWidth(el?.parentElement?.offsetWidth || 700)}
        ></div>
      );
    }

    return (
      <LayoutFlow
        ref={ref}
        {...rendererProps}
        defaultPosition={[containerWidth! / 2, 50]}
        nodeTypes={{
          [CUSTOM_NODE_NAME]: CustomNode,
        }}
        product={product}
        setFlowInstance={setFlowInstance}
        extentAdditions={extentAdditions}
        elements={elements}
      />
    );
  }
);

export default ArtbeesFlow;
