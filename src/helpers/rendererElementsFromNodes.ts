import React from 'react';
import { Elements } from 'react-flow-renderer';
import { NodesMap } from '../index';

function rendererElementsFromNodes(
  nodes: NodesMap,
  customNodeName: string
): Elements<{ jsx: React.ReactNode }> {
  const elements: Elements<{ jsx: React.ReactNode }> = [];
  Object.keys(nodes).forEach(nodeId => {
    const node = nodes[nodeId];
    // add the node itself
    elements.push({
      id: nodeId,
      position: { x: 0, y: 0 },
      data: { jsx: node.jsx },
      type: customNodeName,
    });
    // add edges sourcing from that node
    (node.targets || []).forEach(target => {
      elements.push({
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
