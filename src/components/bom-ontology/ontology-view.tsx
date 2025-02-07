"use client"
import 'reactflow/dist/style.css';
import ReactFlow, { Controls } from "reactflow";
import { useBOMOntologyView } from "@/hooks/bom-ontology-view";

export function OntologyView() {

    const { ontologyView } = useBOMOntologyView();

    console.log(ontologyView)

    return (
        <ReactFlow>
            <Controls />
        </ReactFlow>
    )
}