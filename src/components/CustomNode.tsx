import React from 'react';
import { Handle, Position } from 'react-flow-renderer';

function CustomNode(props: {
  data: { jsx: React.ReactNode; hidden?: boolean };
}) {
  const { data } = props;

  const bottomHandlePos = data.hidden
    ? { bottom: 'unset', top: 0, height: 0 }
    : { bottom: 0 };
  const topHandlePos = data.hidden
    ? { bottom: 'unset', top: 0, height: 0 }
    : { top: 0 };

  return (
    <div style={{ pointerEvents: 'all' }}>
      <Handle
        type="target"
        position={data.hidden ? Position.Bottom : Position.Top}
        isConnectable={false}
        style={{ visibility: 'hidden', ...topHandlePos }}
      />
      {data.jsx}
      <Handle
        type="source"
        position={data.hidden ? Position.Top : Position.Bottom}
        isConnectable={false}
        style={{ visibility: 'hidden', ...bottomHandlePos }}
      />
    </div>
  );
}

export default CustomNode;
