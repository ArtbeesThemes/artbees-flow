import { Node, ReactFlowProps } from 'react-flow-renderer';

export type Extent = ReactFlowProps['translateExtent'];

export function calcFlowExtent(
  nodes: Node[],
  container: HTMLDivElement | null
): Extent {
  if (!container) {
    return;
  }

  const w = window.innerWidth;

  const topMostY = Math.min(...nodes.map(n => n.position.y));
  const bottomMostY = Math.max(...nodes.map(n => n.position.y + n.__rf.height));
  const leftMostX = Math.min(...nodes.map(n => n.position.x));
  const rightMostX = Math.max(...nodes.map(n => n.position.x + n.__rf.width));

  const containerHeight = container.getBoundingClientRect().height;
  const containerFreeSpace = bottomMostY - topMostY - containerHeight;

  const top = topMostY - 20;
  const bottom =
    bottomMostY + (containerFreeSpace > 0 ? 20 : -containerFreeSpace - 20);
  const left = leftMostX - 30;
  const right = rightMostX + 30;

  return [
    [left, top],
    [right, bottom],
  ];
}
