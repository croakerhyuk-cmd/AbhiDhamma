import { CittaExplorer } from '@/components/citta-explorer';
import { getExplorerDatasets } from '@/lib/data';

export default function Home() {
  return <CittaExplorer datasets={getExplorerDatasets()} />;
}
