import { BillOfMaterialItem } from "@/app/api/bom/ontology/route";
import { BoxesIcon, CogIcon, DollarSign, PackageIcon } from "lucide-react";
import { ReactNode } from "react";
import { Handle, NodeProps, Position } from "reactflow";

interface NodeData {
  billOfMaterial: BillOfMaterialItem;
}

function BomNodeTypeIcon({
  type,
  className,
}: {
  type: string;
  className: string;
}) {
  switch (type) {
    case "Production":
      return <BoxesIcon className={className} />;
    case "BOM":
      return <PackageIcon className={className} />;
    default:
      return <CogIcon className={className} />;
  }
}

interface BomNode {
  billOfMaterial: BillOfMaterialItem;
  children: ReactNode;
}

export function BomNode({ billOfMaterial, children }: BomNode) {
  const { type, name, quantity, unit } = billOfMaterial;

  return (
    <div className="flex flex-col bg-white border border-gray-200 p-4 w-[200px] h-[80px]">
      <div className="flex gap-4">
        <div className="bg-purple-200 h-fit w-fit p-2">
          <BomNodeTypeIcon type={type} className="w-4 h-4 text-purple-600" />
        </div>
        <div>
          <p className="text-gray-500 text-xs">{`${quantity} ${unit}`}</p>
          <p className="text-xs font-medium">{name}</p>
          <div className="flex gap-1 text-xs bg-gray-100 items-center px-2 rounded-sm mt-1 w-fit">
            <DollarSign className="w-3 h-3 text-gray-500" />
            <p>no price data</p>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}

export function BomNodeInputNode({ data }: NodeProps<NodeData>) {
  const { billOfMaterial } = data;

  return (
    <BomNode billOfMaterial={billOfMaterial}>
      <Handle type="source" position={Position.Bottom} />
    </BomNode>
  );
}

export function BomNodeOutputNode({ data }: NodeProps<NodeData>) {
  const { billOfMaterial } = data;

  return (
    <BomNode billOfMaterial={billOfMaterial}>
      <Handle type="target" position={Position.Top} />
    </BomNode>
  );
}
