import { Screen } from '@/components/screen';
import { getExplorerDatasets } from '@/lib/data';

export default function Home() {
  return <Screen datasets={getExplorerDatasets()} />;
}
