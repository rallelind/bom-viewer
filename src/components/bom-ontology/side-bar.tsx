import { BillOfMaterialItem } from "@/app/api/bom/ontology/route";
import { DatabaseZap, FileSpreadsheet, NetworkIcon, UploadIcon } from "lucide-react";
import { BomNode } from "./bom-nodes/bom-nodes";

interface OntologyViewSideBarProps {
  selectedBom: BillOfMaterialItem | null;
}

export function OntologyViewSideBar({ selectedBom }: OntologyViewSideBarProps) {
  return (
    <aside className="bg-white h-screen w-1/4 border-l border-gray-200 p-4 flex flex-col gap-4">
      <div>
        <h1 className="text-sm font-medium">Bill of Materials view</h1>
        <p className="text-xs text-gray-500">
          view and analyse how your bill of materials is constructured
        </p>
      </div>
      <div>
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
      </div>
      {selectedBom && (
        <BomNode billOfMaterial={selectedBom} displayedInGraph={false}>
          <div className="mt-4">
            <button className="flex gap-2 text-xs items-center p-1 w-full justify-center bg-purple-600 text-white">
              <NetworkIcon className="h-3 w-3" />
              <p>Display connected items</p>
            </button>
          </div>
        </BomNode>
      )}
    </aside>
  );
}
