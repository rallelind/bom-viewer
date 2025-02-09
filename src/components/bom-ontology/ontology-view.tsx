"use client";
import "reactflow/dist/style.css";
import ReactFlow, {
  Controls,
  Edge,
  useEdgesState,
  useNodesState,
} from "reactflow";
import { useBOMOntologyView } from "@/hooks/bom-ontology-view";
import { ChangeEvent, useCallback } from "react";
import { BillOfMaterialItem } from "@/app/api/bom/ontology/route";


export function OntologyView() {
  const { ontologizePDF, ontologyError, isMutating } = useBOMOntologyView();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      try {
        const file = e.target.files[0];
        const response = await ontologizePDF(file);
        const nodes = response.map((node, index) => ({
          id: String(node.id),
          data: { label: node.name },
          position: { x: index * 100, y: index * 100 },
        }));
        setNodes(nodes);

      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }
  };

  return (
    <div>
      <h2>Upload BOM PDF</h2>
      <input type="file" onChange={handleFileUpload} />
      {isMutating && <p>Uploading file...</p>}
      {ontologyError && <p>Error uploading file: {ontologyError.message}</p>}

      <div style={{ width: "100%", height: "500px", border: "1px solid #ccc" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}        
          proOptions={{
            hideAttribution: true
          }}  
        >
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}
