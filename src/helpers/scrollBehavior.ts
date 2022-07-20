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

export function calcFlowExtent(nodes: Node[], scheme: ScrollScheme): Extent {
  const w = window.innerWidth;
  const h = window.innerHeight;
  // TODO: Do the following with "ref" instead of DOM API.
  const containerHeight = document
    .getElementsByClassName('artbees-flow__LayoutFlow')[0]
    .getBoundingClientRect().height;

  const topMostY = Math.min(...nodes.map(n => n.position.y));
  const bottomMostY = Math.max(...nodes.map(n => n.position.y + n.__rf.height));
  const leftMostX = Math.min(...nodes.map(n => n.position.x));
  const rightMostX = Math.max(...nodes.map(n => n.position.x + n.__rf.width));

  const flowSmallerThanContainer = bottomMostY - topMostY > containerHeight;

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
      bottom = bottomMostY + (flowSmallerThanContainer ? 20 : h / 2);
      left = leftMostX - w / 2;
      right = rightMostX + w / 2;
      break;
  }

  return [
    [left, top],
    [right, bottom],
  ];
}
