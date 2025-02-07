import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useBOMOntologyView() {
  const { data, error } = useSWR("/api/bom/ontology", fetcher);

  console.log(data);

  return {
    ontologyView: data,
    isLoading: !error && !data,
    isError: error,
  };
}