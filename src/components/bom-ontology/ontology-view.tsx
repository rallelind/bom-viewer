"use client";
import "reactflow/dist/style.css";
import ReactFlow, {
  Edge,
  useEdgesState,
  useNodesState,
  Node,
  Position,
} from "reactflow";
import { useBOMOntologyView } from "@/hooks/bom-ontology-view";
import { ChangeEvent, MouseEvent, useRef, useState } from "react";
import { BillOfMaterialItem } from "@/app/api/bom/ontology/route";
import { FileBoxIcon } from "lucide-react";
import { OntologyViewSideBar } from "./side-bar";
import { BomNodeInputNode, BomNodeOutputNode } from "./bom-nodes/bom-nodes";

const nodeWidth = 172;
const nodeHeight = 80;

export const getRadialLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  center = { x: 0, y: 0 },
  minRadiusStep = 200
) => {
  // Group nodes by level
  const levels: Record<number, Node[]> = {};
  nodes.forEach((node) => {
    const level = node.data?.billOfMaterial?.level;
    if (level === undefined) return;
    if (!levels[level]) {
      levels[level] = [];
    }
    levels[level].push(node);
  });

  // Find the minimum and maximum levels
  const levelKeys = Object.keys(levels).map(Number);
  const minLevel = Math.min(...levelKeys);

  levelKeys.forEach((level) => {
    const levelNodes = levels[level];
    const nodeCount = levelNodes.length;

    // --- DYNAMIC RADIUS CALCULATION ---
    // 1) Figure out how big a circle we need if we place nodes side by side.
    //    We multiply nodeWidth by some spacing factor (e.g., 1.2 or 1.5) to leave gaps.
    const spacingFactor = 1.3;
    const circumferenceNeeded = nodeCount * nodeWidth * spacingFactor;
    // 2) Convert circumference to radius: circumference = 2 * π * r => r = circumference / (2π)
    const dynamicRadius = circumferenceNeeded / (2 * Math.PI);

    // 3) Optionally combine with a "base" radius step, so deeper levels move outward
    //    at least minRadiusStep from the center:
    //    i.e., radius based on level + ensuring we meet the dynamic requirement
    const levelDistance = (level - minLevel) * minRadiusStep;
    const radius = Math.max(levelDistance, dynamicRadius);

    // Distribute nodes evenly around the circle
    const angleStep = (2 * Math.PI) / nodeCount;
    levelNodes.forEach((node, i) => {
      const angle = i * angleStep;
      const x = center.x + radius * Math.cos(angle);
      const y = center.y + radius * Math.sin(angle);
      node.position = {
        x: x - nodeWidth / 2,
        y: y - nodeHeight / 2, // if your nodeHeight is 80
      };

      // Adjust source/target positions if you like
      node.targetPosition = Position.Top;
      node.sourcePosition = Position.Bottom;
    });
  });

  return { nodes, edges };
};

export function getAllNodesAtLevel(
  nodes: BillOfMaterialItem[],
  level: number
): BillOfMaterialItem[] {
  return nodes.filter((node) => node.level === level);
}

interface InitialOntologyData {
  nodes: Node[];
  edges: Edge[];
}

export function getInitialOntologyData(
  billOfMaterialNodes: BillOfMaterialItem[]
): InitialOntologyData {
  const lowestLevel = Math.min(
    ...billOfMaterialNodes.map((node) => node.level)
  );

  // get the root node at the lowest level and the nodes on the next level
  const root = billOfMaterialNodes.find((node) => node.level === lowestLevel);

  if (!root) {
    return { nodes: [], edges: [] };
  }

  const nodesAtTopLevel = getAllNodesAtLevel(
    billOfMaterialNodes,
    lowestLevel + 1
  );

  const rootNode: Node = {
    id: String(root.id),
    data: { billOfMaterial: root },
    type: "BomNodeInputNode",
    position: { x: 0, y: 0 },
  };

  const childNodes: Node[] = nodesAtTopLevel.map((node) => ({
    id: String(node.id),
    type: "BomNodeOutputNode",
    data: {
      billOfMaterial: node,
    },
    position: { x: 0, y: 0 },
  }));

  const nodes = [rootNode, ...childNodes];

  const edges = getInitialEdges(nodes.slice(1), root);

  const { nodes: layoutedNodes, edges: layoutedEdges } =
    getRadialLayoutedElements(nodes, edges);

  return { nodes: layoutedNodes, edges: layoutedEdges };
}

export function getInitialEdges(
  nodes: Node[],
  root: BillOfMaterialItem
): Edge[] {
  return nodes.map((node) => ({
    id: `${root.id}-${node.id}`,
    source: root.id,
    target: node.id,
    animated: true,
  }));
}

function EmptyOntologyView({
  handleFileUpload,
}: {
  handleFileUpload: (e: ChangeEvent<HTMLInputElement>) => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClickOnUpload = () => {
    inputRef.current?.click();
  };

  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="w-1/3 h-1/3 bg-white border border-gray-200 p-12 flex justify-center items-center text-center">
        <div className="flex flex-col gap-4 items-center">
          <div className="bg-purple-100 w-fit h-fit p-2">
            <FileBoxIcon className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-sm font-medium">Upload BOM</h2>
            <p className="text-xs text-gray-500">
              Upload din bill of material her lige nu kan du kun upload i PDF
              format, men snart kan du også CSV, XLSX
            </p>
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
          <button
            onClick={handleClickOnUpload}
            className="text-xs text-white bg-purple-600 px-6 py-1 hover:opacity-80 disabled:opacity-50"
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
}

const nodeTypes = {
  BomNodeOutputNode: BomNodeOutputNode,
  BomNodeInputNode: BomNodeInputNode,
};

export function OntologyView() {
  const { ontologizePDF, ontologyNodes } = useBOMOntologyView();
  const [selectedBom, setSelectedBom] = useState<BillOfMaterialItem | null>(
    null
  );

  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      try {
        const file = e.target.files[0];
        const response = await ontologizePDF(file);
        const { nodes: initialNodes, edges: initialEdges } =
          getInitialOntologyData(response);
        setNodes(initialNodes);
        setEdges(initialEdges);
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }
  };

  const onNodeClick = (event: MouseEvent, node: Node) => {
    if (selectedBom?.id === node.data?.billOfMaterial.id) {
      setSelectedBom(null);
      return;
    }

    setSelectedBom(node.data?.billOfMaterial);
  };

  const onDisplayConnectedNodes = (nodes: BillOfMaterialItem[]) => {
    const { nodes: newNodes, edges: newEdges } = getInitialOntologyData(nodes);
    setNodes(newNodes);
    setEdges(newEdges);
  };

  return (
    <div className="h-screen w-screen bg-zinc-50 flex">
      <div className="h-full w-full">
        {ontologyNodes ? (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodeClick={onNodeClick}
            fitView
            proOptions={{
              hideAttribution: true,
            }}
            nodeTypes={nodeTypes}
          />
        ) : (
          <EmptyOntologyView handleFileUpload={handleFileUpload} />
        )}
      </div>
      <OntologyViewSideBar
        selectedBom={selectedBom}
        ontologyNodes={ontologyNodes}
        onDisplayConnectedNodes={onDisplayConnectedNodes}
      />
    </div>
  );
}
