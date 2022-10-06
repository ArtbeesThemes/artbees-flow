import { Product } from 'index';
import { ReactFlowProps } from 'react-flow-renderer';

export function productProps(product: Product): Partial<ReactFlowProps> {
  let props: ReturnType<typeof productProps>;

  switch (product) {
    case 'growmatik':
      props = {
        panOnScroll: true,
        panOnScrollSpeed: 1,
        zoomOnDoubleClick: false,
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
