import { Node, ReactFlowProps } from 'react-flow-renderer';
import { ScrollScheme } from 'index';

export type Extent = ReactFlowProps['translateExtent'];

export function scrollProps(scheme: ScrollScheme) {
  let props;

  switch (scheme) {
    case 'default':
      props = {
        panOnScroll: true,
        panOnScrollSpeed: 1,
      };
      break;
    case 'sellkit':
      props = {
        panOnScroll: false,
        zoomOnScroll: false,
        preventScrolling: false,
      };
      break;
  }

  return props;
}

export function calcFlowExtent(
  nodes: Node[],
  scheme: ScrollScheme,
  container: HTMLDivElement | null
): Extent {
  if (!container) {
    return;
  }

  const w = window.innerWidth;
  const h = window.innerHeight;

  const topMostY = Math.min(...nodes.map(n => n.position.y));
  const bottomMostY = Math.max(...nodes.map(n => n.position.y + n.__rf.height));
  const leftMostX = Math.min(...nodes.map(n => n.position.x));
  const rightMostX = Math.max(...nodes.map(n => n.position.x + n.__rf.width));

  const containerHeight = container.getBoundingClientRect().height;
  const containerFreeSpace = bottomMostY - topMostY - containerHeight;

  let left, top, right, bottom;

  switch (scheme) {
    case 'default':
      top = topMostY - h / 2;
      bottom = bottomMostY + h / 2;
      left = leftMostX - w / 2;
      right = rightMostX + w / 2;
      break;
    case 'sellkit':
      top = topMostY - 20;
      bottom =
        bottomMostY + (containerFreeSpace > 0 ? 20 : -containerFreeSpace - 20);
      left = leftMostX - w / 2;
      right = rightMostX + w / 2;
      break;
  }

  return [
    [left, top],
    [right, bottom],
  ];
}
