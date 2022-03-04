import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import ArtbeesFlow from './index';

document.body.style.padding = '0';

const meta: ComponentMeta<typeof ArtbeesFlow> = {
  title: 'Artbees Flow',
  component: ArtbeesFlow,
  argTypes: {
    nodes: {
      description:
        'A map that represents everything about the flow and how each node is connected to others',
      control: {
        type: 'object',
      },
    },
  },
};

const BasicTemplate: ComponentStory<typeof ArtbeesFlow> = args => (
  <div style={{ width: '100vw', height: '100vh' }}>
    <ArtbeesFlow nodes={args.nodes} />
  </div>
);

const Basic: typeof BasicTemplate = BasicTemplate.bind({});
Basic.args = {
  nodes: {
    'node-1': {
      jsx: 'TOP NODE',
      targets: [
        {
          nodeId: 'node-2',
          edgeProps: {
            labelBgStyle: {
              fill: 'green',
              fillOpacity: 0.9,
            },
            labelBgPadding: [10, 5],
            label: 'YES',
            labelStyle: { fill: '#ffffff' },
          },
        },
        {
          nodeId: 'node-3',
        },
      ],
    },
    'node-2': {
      jsx: 'Left child',
      targets: [],
    },
    'node-3': {
      jsx: (
        <div
          onClick={() => alert('You clicked on right node!')}
          style={{
            pointerEvents: 'all',
            cursor: 'pointer',
            color: 'white',
            backgroundColor: 'darkred',
            padding: '10px 50px',
          }}
        >
          <i>Right child</i>
        </div>
      ),
      targets: [],
    },
  },
};

export default meta;
export { Basic };
