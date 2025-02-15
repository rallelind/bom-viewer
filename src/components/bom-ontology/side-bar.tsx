import { NetworkIcon } from "lucide-react";
import { BomNode, BomNodeTypeIcon } from "./bom-nodes/bom-nodes";
import { BillOfMaterialItem } from "@/app/api/bom/ontology/route";

interface OntologyViewSideBarProps {
  selectedBom: BillOfMaterialItem | null;
  ontologyNodes: BillOfMaterialItem[] | undefined;
  onDisplayConnectedNodes: (nodes: BillOfMaterialItem[]) => void;
}

export function OntologyViewSideBar({
  selectedBom,
  ontologyNodes,
  onDisplayConnectedNodes,
}: OntologyViewSideBarProps) {
  function getRelatedNodes(
    rootNode: BillOfMaterialItem,
    ontologyNodes: BillOfMaterialItem[] | undefined
  ): BillOfMaterialItem[] {
    if (!ontologyNodes) {
      return [];
    }
    // get slice of ontology nodes that are related to the selected bom, start at root node index and until next of type BOM is found
    let i = ontologyNodes.findIndex((node) => node.id === rootNode.id) + 1;
    const relatedNodes: BillOfMaterialItem[] = [];

    while (i < ontologyNodes.length) {
      if (
        ontologyNodes[i].type === "BOM" &&
        ontologyNodes[i].level === rootNode.level
      ) {
        break;
      }

      relatedNodes.push(ontologyNodes[i]);
      i++;
    }

    return relatedNodes;
  }

  const relatedNotes = selectedBom
    ? getRelatedNodes(selectedBom, ontologyNodes)
    : [];

  const onClickDisplay = () => {
    onDisplayConnectedNodes(relatedNotes);
  };

  return (
    <aside className="bg-white h-screen w-1/4 border-l border-gray-200 p-4 flex flex-col gap-4">
      <div>
        <h1 className="text-sm font-medium">Bill of Materials view</h1>
        <p className="text-xs text-gray-500">
          view and analyse how your bill of materials is constructured
        </p>
      </div>
      {/*<div>
        <div className="border w-full p-2 text-xs flex flex-col gap-2">
          <div className="flex gap-2">
            <div className="bg-green-200 h-fit w-fit p-2">
              <FileSpreadsheet className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="font-medium">Backing pricing data</p>
              <p className="text-gray-500">
                Manually upload data or add data connection
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button className="w-full text-black bg-zinc-100 font-medium p-1 flex items-center gap-2 justify-center">
              <UploadIcon className="h-3 w-3" /> Manual upload
            </button>
            <button className="w-full text-black bg-zinc-100 font-medium p-1 flex items-center gap-2 justify-center">
              <DatabaseZap className="h-3 w-3" /> Connect to source
            </button>
          </div>
        </div>
      </div>*/}
      {selectedBom && (
        <BomNode billOfMaterial={selectedBom} displayedInGraph={false}>
          <div className="mt-4">
            <button
              onClick={onClickDisplay}
              className="flex gap-2 text-xs items-center p-1 w-full justify-center bg-purple-600 text-white"
            >
              <NetworkIcon className="h-3 w-3" />
              <p>Display connected items</p>
            </button>
            <ul className="max-h-[70vh] overflow-y-auto gap-2 flex flex-col mt-4">
              {relatedNotes.map((node) => (
                <li key={node.id} className="flex gap-4 items-center">
                  <div className="bg-purple-200 h-fit w-fit p-1">
                    <BomNodeTypeIcon
                      type={node.type}
                      className="h-4 w-4 text-purple-600"
                    />
                  </div>
                  <div>
                    <p className="text-xs">{node.name}</p>
                    <p className="text-gray-500 text-xs">{`${node.quantity} ${node.unit}`}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </BomNode>
      )}
    </aside>
  );
}
