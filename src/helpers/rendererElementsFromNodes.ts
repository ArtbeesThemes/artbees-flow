import React, { CSSProperties } from 'react';
import { Elements } from 'react-flow-renderer';
import { EdgeProps, NodesMap } from '../index';

function rendererElementsFromNodes(
  nodes: NodesMap,
  customNodeName: string,
  defaultEdgeProps?: EdgeProps
): Elements<{ jsx: React.ReactNode }> {
  const elements: Elements<{
    jsx: React.ReactNode;
    hidden?: boolean;
    style?: CSSProperties;
  }> = [];
  Object.keys(nodes).forEach(nodeId => {
    const node = nodes[nodeId];
    // add the node itself
    elements.push({
      id: nodeId,
      position: { x: 0, y: 0 },
      data: {
        jsx: node.isHidden ? 'empty' : node.jsx,
        hidden: node.isHidden,
        style: node.style,
      },
      type: customNodeName,
      style: { visibility: node.isHidden ? 'hidden' : 'visible' },
    });
    // add edges sourcing from that node
    (node.targets || []).forEach(target => {
      elements.push({
        ...defaultEdgeProps,
        ...target.edgeProps,
        id: `${nodeId}->${target.nodeId}`,
        source: nodeId,
        target: target.nodeId,
      });
    });
  });
  return elements;
}

export default rendererElementsFromNodes;
