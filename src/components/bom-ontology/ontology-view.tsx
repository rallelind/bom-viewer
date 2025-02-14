"use client";
import "reactflow/dist/style.css";
import ReactFlow, { Edge, useEdgesState, useNodesState, Node } from "reactflow";
import { useBOMOntologyView } from "@/hooks/bom-ontology-view";
import { ChangeEvent, useRef } from "react";
import { BillOfMaterialItem } from "@/app/api/bom/ontology/route";
import { FileBoxIcon } from "lucide-react";
import dagre from "@dagrejs/dagre";

const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 36;

const getLayoutedElements = (nodes, edges, direction = "TB") => {
  const isHorizontal = direction === "LR";
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const newNode = {
      ...node,
      targetPosition: isHorizontal ? "left" : "top",
      sourcePosition: isHorizontal ? "right" : "bottom",
      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };

    return newNode;
  });

  return { nodes: newNodes, edges };
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

  const initialNodes = [root, ...nodesAtTopLevel];

  const nodes = initialNodes.map((node) => ({
    id: String(node.id),
    data: { label: node.name },
    position: { x: 0, y: 0 },
  }));

  const edges = getInitialEdges(nodes.slice(1), root);

  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
    nodes,
    edges,
  );

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
    type: "smoothstep"
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
      <div className="w-1/3 h-1/3 bg-white border border-gray-200 p-20 flex justify-center items-center text-center">
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
            className="text-xs text-white bg-purple-600 px-6 py-1 disabled:opacity-50"
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
}

export function OntologyView() {
  const { ontologizePDF, ontologyNodes } = useBOMOntologyView();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

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

  return (
    <div className="h-screen w-screen bg-zinc-50">
      <div className="h-full w-full">
        {ontologyNodes ? (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            proOptions={{
              hideAttribution: true,
            }}
          />
        ) : (
          <EmptyOntologyView handleFileUpload={handleFileUpload} />
        )}
      </div>
    </div>
  );
}
