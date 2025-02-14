import { BillOfMaterialItem } from "@/app/api/bom/ontology/route";
import { Handle, Node, NodeProps, Position } from "reactflow";

interface NodeData {
    billOfMaterialItem: BillOfMaterialItem;
}

export function BomNode({
  data,
  isConnectable,
}: NodeProps<NodeData>) {
  const bomType = data.billOfMaterialItem.type;

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
