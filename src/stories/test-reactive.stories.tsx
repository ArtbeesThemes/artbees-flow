import React, { useCallback, useState } from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import ArtbeesFlow, { NodesMap } from '../index';
import { Button } from 'antd';

document.body.style.padding = '0';

const meta: ComponentMeta<typeof ArtbeesFlow> = {
  title: 'Artbees Flow - Reactive',
  component: MyFlow,
};

const ReactiveTemplate: ComponentStory<typeof ArtbeesFlow> = args => (
  <div style={{ width: '100vw', height: '100vh' }}>
    <MyFlow />
  </div>
);

function MyFlow() {
  const [firstPrimary, setFirstPrimary] = useState(false);
  const [secondPrimary, setSecondPrimary] = useState(false);

  const toggleFirstPrimary = useCallback(
    () => setFirstPrimary(val => !val),
    []
  );

  const nodesToRender: NodesMap = {
    first: {
      jsx: (
        <Button
          type={firstPrimary ? 'primary' : 'default'}
          onClick={toggleFirstPrimary}
        >
          First Button
        </Button>
      ),
      targets: [{ nodeId: 'second' }, { nodeId: 'desc' }],
    },
    second: {
      jsx: (
        <Button
          type={secondPrimary ? 'primary' : 'default'}
          onClick={() => setSecondPrimary(!secondPrimary)}
        >
          Second Button
        </Button>
      ),
    },
    desc: {
      jsx: 'Click on a button to see the reactivity.',
    },
  };

  return <ArtbeesFlow nodes={nodesToRender} />;
}

const Reactive: typeof ReactiveTemplate = ReactiveTemplate.bind({});
Reactive.args = {};

export default meta;
export const TestReactive = Reactive;
