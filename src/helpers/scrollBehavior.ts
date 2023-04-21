import { Node, ReactFlowProps } from 'react-flow-renderer';

export type Extent = ReactFlowProps['translateExtent'];

export type ExtentAddition = {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
};

export function calcFlowExtent(
  nodes: Node[],
  container: HTMLDivElement | null,
  /** Extra adjustments received directly from user. */
  extentAddition?: ExtentAddition
): Extent {
  if (!container) {
    return;
  }

  // Adjustments
  const addTop = extentAddition?.top || 20;
  const addBottom = extentAddition?.bottom || 20;
  const addLeft = extentAddition?.left || 30;
  const addRight = extentAddition?.right || 30;

  // Filter only visible nodes
  const Vodes = nodes.filter(n => !n.data?.hidden);

  // Calculate physical extent of nodes
  const topMostY = Math.min(...Vodes.map(n => n.position.y));
  const leftMostX = Math.min(...Vodes.map(n => n.position.x));
  const rightMostX = Math.max(...Vodes.map(n => n.position.x + n.__rf.width));
  const bottomMostY = Math.max(...Vodes.map(n => n.position.y + n.__rf.height));

  // Calculate free space in flow (whether nodes span to longer than the container)
  const containerHeight = container.getBoundingClientRect().height;
  const freeSpace = containerHeight - (bottomMostY - (topMostY - addTop));

  // Calculate real extent (physical + adjustments)
  const top = topMostY - addTop;
  const left = leftMostX - addLeft;
  const right = rightMostX + addRight;
  const bottom = bottomMostY + (freeSpace < 0 ? addBottom : freeSpace);

  return [
    [left, top],
    [right, bottom],
  ];
}
