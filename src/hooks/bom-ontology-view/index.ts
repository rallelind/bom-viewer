import useSWR from "swr";
import useSWRMutation from "swr/mutation";

const postFile = async (url: string, { arg }: { arg: File }) => {
  // Prepare the file inside FormData (or adjust as needed by your API)
  const formData = new FormData();
  formData.append("file", arg);

  const res = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("File upload failed");
  }

  return res.json();
};

export function useBOMOntologyView() {
  const {
    trigger,
    isMutating,
    data: ontologyNodes,
    error: ontologyError,
  } = useSWRMutation("/api/bom/ontology", postFile);

  const ontologizePDF = async (file: File) => {
    try {
      const result = await trigger(file);
      return result;
    } catch (err) {
      console.error("Upload error:", err);
      throw err;
    }
  };

  return {
    ontologizePDF,
    isMutating,
    ontologyNodes,
    ontologyError,
  };
}
