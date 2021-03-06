import 'antd/dist/antd.css';
import React, { useState } from 'react';
import { Button, InputNumber, Modal, Popover } from 'antd';
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
const CONNECT_TO_END = true as boolean;
const endTarget = CONNECT_TO_END ? [{ nodeId: 'END' }] : [];

type NodeData = {
  width: number;
  height: number;
};

const NormalNode = ({
  title,
  value,
  onChange,
}: {
  title: string;
  value?: NodeData;
  onChange?: (v: NodeData) => void;
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const showModal = () => {
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
  };

  return (
    <>
      <Button
        style={{ ...(value && { width: value.width, height: value.height }) }}
        onClick={showModal}
      >
        A sample {title}
      </Button>
      <Modal
        footer={null}
        title={`${title} Settings`}
        visible={modalVisible}
        onOk={hideModal}
        onCancel={hideModal}
      >
        {value ? (
          <div>
            width:
            <InputNumber
              style={{ marginRight: 100 }}
              value={value.width}
              onChange={num => onChange({ ...value, width: num })}
              step={20}
            />
            height:
            <InputNumber
              value={value.height}
              onChange={num => onChange({ ...value, height: num })}
              step={20}
            />
          </div>
        ) : (
          'Lorem ipsum...!'
        )}
      </Modal>
    </>
  );
};

type MyState = {
  [nodeId: string]: {
    targets: string[];
    type: 'decision' | 'action' | 'join';
    data?: any;
  };
};

const initialDecisionData = {
  width: 200,
  height: 40,
};

const MyFlow = () => {
  const [nodes, setNodes] = useState<MyState>({
    'root-node': {
      targets: ['join-root', 'node-1'], // decision always has 2 targets
      type: 'decision',
      data: initialDecisionData,
    },
    'node-1': {
      targets: ['join-root'], // always has 1 target
      type: 'action',
    },
    'join-root': {
      targets: [null], // always 1 target
      type: 'join',
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
          targets:
            nodeType === 'decision'
              ? [`join-${nodeId}`, `join-${nodeId}`]
              : [prevNodes[nodeId].targets[targetIdx]],
          ...(nodeType === 'decision' && {
            data: initialDecisionData,
          }),
        },
        ...(nodeType === 'decision' && {
          [`join-${nodeId}`]: {
            type: 'join',
            targets: [prevNodes[nodeId].targets[targetIdx]],
          },
        }),
      }));
    };

  const nodesToRender: NodesMap = Object.entries(nodes).reduce(
    (acc, [nodeId, { targets, type, data }]) => ({
      ...acc,
      ...(type === 'decision' && {
        [nodeId]: {
          jsx: (
            <NormalNode
              title="Decision"
              value={data}
              onChange={data =>
                setNodes({
                  ...nodes,
                  [nodeId]: {
                    ...nodes[nodeId],
                    data,
                  },
                })
              }
            />
          ),
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
      ...(type === 'join' && {
        [nodeId]: {
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
