"use client";
import "reactflow/dist/style.css";
import ReactFlow, { Controls, useEdgesState, useNodesState } from "reactflow";
import { useBOMOntologyView } from "@/hooks/bom-ontology-view";
import { ChangeEvent, useRef, useState } from "react";
import { BillOfMaterialItem } from "@/app/api/bom/ontology/route";
import { FileBoxIcon, PackageIcon } from "lucide-react";

export function getAllNodesAtLevel(
  nodes: BillOfMaterialItem[],
  level: number
): BillOfMaterialItem[] {
  return nodes.filter((node) => node.level === level);
}

function EmptyOntologyView() {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="w-1/3 h-1/3 bg-white border p-20 flex justify-center items-center text-center">
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
            <input ref={inputRef} type="file" className="hidden" />
          </div>
          <button className="text-xs text-white bg-purple-600 px-6 py-1">
            Upload
          </button>
        </div>
      </div>
    </div>
  );
}

export function OntologyView() {
  const { ontologizePDF, ontologyError, isMutating, ontologyNodes } =
    useBOMOntologyView();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      try {
        const file = e.target.files[0];
        const response = await ontologizePDF(file);
        const nodesAtTopLevel = getAllNodesAtLevel(response, 1);
        const nodes = nodesAtTopLevel.map((node, index) => ({
          id: String(node.id),
          data: { label: node.name },
          position: { x: index * 200, y: 0 },
        }));
        setNodes(nodes);
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
            proOptions={{
              hideAttribution: true,
            }}
          />
        ) : (
          <EmptyOntologyView />
        )}
      </div>
    </div>
  );
}
