import SearchResultsClientPage from "./SearchResultsClientPage"

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const resolvedSearchParams = await searchParams
  return <SearchResultsClientPage searchParams={resolvedSearchParams} />
}
