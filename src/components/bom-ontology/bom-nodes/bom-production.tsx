import { Handle, NodeProps, Position } from "reactflow";

export function BomNode({ data, isConnectable }: NodeProps) {
  const bomType = data.billOfMaterial.type;

  return (
    <div>
      <h1>Welcome to BomProduction!</h1>
      {(bomType === "production" || bomType === "bom") && (
        <Handle
          type="source"
          position={Position.Bottom}
          isConnectable={isConnectable}
        />
      )}
    </div>
  );
}
