import 'antd/dist/antd.css';
import React, { useState } from 'react';
import { Button, Modal, Popover } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import ArtbeesFlow, { NodesMap } from '../index';

document.body.style.padding = '0';

const AddButton = ({
  onAdd = () => {},
}: {
  onAdd?: (nodeType: string) => void;
}) => {
  const [popoverVisible, setPopoverVisible] = useState(false);
  return (
    <Popover
      title="Add new node"
      content={
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          <Button
            ghost
            type="primary"
            onClick={() => {
              onAdd('decision');
              setPopoverVisible(false);
            }}
          >
            Decision
          </Button>
          <Button
            ghost
            type="primary"
            onClick={() => {
              onAdd('action');
              setPopoverVisible(false);
            }}
          >
            Action
          </Button>
        </div>
      }
      getPopupContainer={() =>
        document.getElementById('builder-main-scrollable') || document.body
      }
      trigger="click"
      visible={popoverVisible}
      onVisibleChange={setPopoverVisible}
      overlayStyle={{
        width: 340,
        zIndex: 1045,
      }}
    >
      <span>
        <Button
          // onBlur={() => setTimeout(() => setPopoverVisible(false), 100)}
          type="primary"
          shape="circle"
          icon={<PlusOutlined />}
        />
      </span>
    </Popover>
  );
};

const yesEdgeProps = {
  labelBgStyle: {
    fill: 'green',
    fillOpacity: 0.9,
  },
  labelBgPadding: [7, 4],
  label: 'YES',
  labelStyle: { fill: '#ffffff' },
};
const noEdgeProps = {
  labelBgStyle: {
    fill: 'red',
    fillOpacity: 0.9,
  },
  labelBgPadding: [7, 4],
  label: 'NO',
  labelStyle: { fill: '#ffffff' },
};

// TODO: having the END node as a normal node seems to mess the layout because of the layout engine. Maybe it's a better idea to have a boolean indicator to add the END node after the layout.
const CONNECT_TO_END = false as boolean;
const endTarget = CONNECT_TO_END ? [{ nodeId: 'END' }] : [];

const NormalNode = ({ title }: { title: string }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const showModal = () => {
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
  };

  return (
    <>
      <Button onClick={showModal}>A sample {title}</Button>
      <Modal
        title={`${title} Settings`}
        visible={modalVisible}
        onOk={hideModal}
        onCancel={hideModal}
      >
        <div>Lorem ipsum settings...</div>
      </Modal>
    </>
  );
};

type MyState = {
  [nodeId: string]: { targets: string[]; type: 'decision' | 'action' };
};

const MyFlow = () => {
  const [nodes, setNodes] = useState<MyState>({
    'root-node': {
      targets: [null, 'node-1'], // decision always has 2 targets
      type: 'decision',
    },
    'node-1': {
      targets: [null], // always has 1 target
      type: 'action',
    },
  });

  const onAddHandlerFor =
    (nodeId: string, targetIdx: number) => (nodeType: any) => {
      const newNodeId = Math.random().toString().substring(2, 7);
      setNodes(prevNodes => ({
        ...prevNodes,
        [nodeId]: {
          ...prevNodes[nodeId],
          targets: prevNodes[nodeId].targets.map((prevTarget, index) =>
            index === targetIdx ? newNodeId : prevTarget
          ),
        },
        [newNodeId]: {
          type: nodeType,
          targets: [
            prevNodes[nodeId].targets[targetIdx],
            ...(nodeType === 'decision' ? [null] : []),
          ],
        },
      }));
    };

  const nodesToRender: NodesMap = Object.entries(nodes).reduce(
    (acc, [nodeId, { targets, type }]) => ({
      ...acc,
      ...(type === 'decision' && {
        [nodeId]: {
          jsx: <NormalNode title="Decision" />,
          targets: targets.map((_, index) => ({
            nodeId: `ADD/${nodeId}/${index}`,
            edgeProps: index === 0 ? noEdgeProps : yesEdgeProps,
          })),
        },
        [`ADD/${nodeId}/0`]: {
          jsx: <AddButton onAdd={onAddHandlerFor(nodeId, 0)} />,
          targets: targets[0] ? [{ nodeId: targets[0] }] : endTarget,
        },
        [`ADD/${nodeId}/1`]: {
          jsx: <AddButton onAdd={onAddHandlerFor(nodeId, 1)} />,
          targets: targets[1] ? [{ nodeId: targets[1] }] : endTarget,
        },
      }),
      ...(type === 'action' && {
        [nodeId]: {
          jsx: <NormalNode title="Action" />,
          targets: [{ nodeId: `ADD/${nodeId}` }],
        },
        [`ADD/${nodeId}`]: {
          jsx: <AddButton onAdd={onAddHandlerFor(nodeId, 0)} />,
          targets: targets[0] ? [{ nodeId: targets[0] }] : endTarget,
        },
      }),
      ...(CONNECT_TO_END && {
        END: {
          jsx: 'END',
          targets: [],
        },
      }),
    }),
    {}
  );

  return <ArtbeesFlow nodes={nodesToRender} />;
};

const meta: ComponentMeta<typeof ArtbeesFlow> = {
  title: 'Artbees Flow - Stateful',
  component: MyFlow,
  // argTypes: {
  //   nodes: {
  //     description:
  //       'A map that represents everything about the flow and how each node is connected to others',
  //     control: {
  //       type: 'object',
  //     },
  //   },
  // },
};

const StatefulTemplate: ComponentStory<typeof ArtbeesFlow> = args => (
  <div style={{ width: '100vw', height: '100vh' }}>
    <MyFlow />
  </div>
);

const Stateful: typeof StatefulTemplate = StatefulTemplate.bind({});
Stateful.args = {};

export default meta;
export { Stateful };
