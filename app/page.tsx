import { Explorer } from '@/components/screen';
import { getExplorerDatasets } from '@/lib/data';

export default function Home() {
  return <Explorer datasets={getExplorerDatasets()} />;
}
