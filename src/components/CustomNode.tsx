import React from 'react';
import { Handle, Position } from 'react-flow-renderer';

function CustomNode(props: { data: { jsx: React.ReactNode } }) {
  const { data } = props;
  return (
    <div style={{ pointerEvents: 'all' }}>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={false}
        style={{ top: 0, visibility: 'hidden' }}
      />
      {data.jsx}
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={false}
        style={{ bottom: 0, visibility: 'hidden' }}
      />
    </div>
  );
}

export default CustomNode;
