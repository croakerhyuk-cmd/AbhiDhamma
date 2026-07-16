"use client";

import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Brain, Circle, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Citta, ExplorerDataset } from '@/lib/types';
import { groupCittas } from '@/lib/grouping';

export function CittaExplorer({ datasets }: { datasets: ExplorerDataset[] }) {
  const [datasetId, setDatasetId] = useState(datasets[0]?.id ?? 'citta');
  const dataset = datasets.find((item) => item.id === datasetId) ?? datasets[0];
  const classifications = dataset?.classifications ?? [];
  const cittas = dataset?.items ?? [];
  const [classificationId, setClassificationId] = useState(classifications[0]?.id ?? 'ethical');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Citta | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const reduceMotion = useReducedMotion();
  const classification = classifications.find((item) => item.id === classificationId) ?? classifications[0];
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return cittas;
    return cittas.filter((citta) => `${citta.name.kor} ${citta.name.pli} ${citta.name.en}`.toLowerCase().includes(normalized));
  }, [cittas, query]);
  const groups = useMemo(() => groupCittas(filtered, classification), [filtered, classification]);

  function changeClassification(nextId: string) {
    if (nextId === classificationId) return;
    // Keep every card mounted while the groups change. Framer Motion can then
    // interpolate each card from its old grid position to its new one.
    setClassificationId(nextId);
  }

  function changeDataset(nextId: string) {
    setDatasetId(nextId);
    const nextDataset = datasets.find((item) => item.id === nextId);
    setClassificationId(nextDataset?.classifications[0]?.id ?? '');
    setSelected(null);
    setQuery('');
  }

  return (
    <div className="explorer-shell">
      <div className={`explorer-body ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
        <aside id="dataset-sidebar" className="dataset-sidebar" aria-label="탐색할 항목 선택">
          <span className="sidebar-label">탐색 대상</span>
          <div className="dataset-tabs">{datasets.map((item) => <button key={item.id} className={item.id === datasetId ? 'dataset-tab active' : 'dataset-tab'} onClick={() => changeDataset(item.id)}>{item.name.kor}</button>)}</div>
        </aside>
        <button className="sidebar-toggle" type="button" onClick={() => setSidebarOpen((open) => !open)} aria-expanded={sidebarOpen} aria-controls="dataset-sidebar">
          <span aria-hidden="true">{sidebarOpen ? '‹' : '›'}</span>
          <span>{sidebarOpen ? '숨기기' : '열기'}</span>
        </button>
      <main>
        <section className="controls" aria-label="마음 종류와 분류 및 검색">
          <div className="classification-row"><div><span className="control-label">분류기준</span><div className="classification-tabs">{classifications.map((item) => <button key={item.id} className={item.id === classificationId ? 'tab active' : 'tab'} onClick={() => changeClassification(item.id)}><span>{item.name.kor}</span>{item.id === classificationId && <ArrowUpRight size={15} />}</button>)}</div></div><label className="search-box"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`${dataset?.itemName.kor ?? '항목'} 이름을 검색해보세요`} aria-label={`${dataset?.itemName.kor ?? '항목'} 검색`} />{query && <button aria-label="검색어 지우기" onClick={() => setQuery('')}><X size={15} /></button>}</label></div>
        </section>

        <LayoutGroup id="citta-atlas">
          <motion.div className="groups-list" layout transition={{ layout: { duration: reduceMotion ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] } }}>
              {groups.map((group) => <motion.section key={group.index} layout className="group-section" transition={{ layout: { duration: reduceMotion ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] } }}>
                <div className="group-heading"><div className="group-title"><div><div className="group-label"><span>{group.name.kor}</span><span className="group-count">{group.items.length}</span></div></div></div><div className="group-rule" /></div>
                <motion.div layout className="citta-grid" transition={{ layout: { duration: reduceMotion ? 0 : 0.72, ease: [0.22, 1, 0.36, 1] } }}>{group.items.map((citta) => <motion.button layout="position" layoutId={`citta-${citta.id}`} key={citta.id} className={`citta-card ${selected?.id === citta.id ? 'selected' : ''}`} onClick={() => setSelected(citta)} whileHover={reduceMotion ? undefined : { y: -5 }} whileTap={reduceMotion ? undefined : { scale: 0.98 }} transition={{ layout: { duration: reduceMotion ? 0 : 0.72, ease: [0.22, 1, 0.36, 1] } }}><div className="card-top"><span className="number">{citta.number ? String(citta.number).padStart(2, '0') : citta.id}</span><span className="card-icon"><Circle size={20} /></span></div><span className="card-name">{citta.name.kor}</span><span className="card-pali">{citta.name.pli}</span><span className="card-arrow"><ArrowUpRight size={15} /></span></motion.button>)}</motion.div>
              </motion.section>)}
          </motion.div>
        </LayoutGroup>
      </main>
      </div>

      <AnimatePresence>{selected && <motion.div className="detail-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)}><motion.aside className="detail-panel" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 28 }} onClick={(event) => event.stopPropagation()}><button className="close-button" onClick={() => setSelected(null)} aria-label="상세 패널 닫기"><X size={19} /></button><div className="detail-number">CITTA / {selected.number ?? selected.id}</div><div className="detail-icon"><Circle size={34} /></div><h2>{selected.name.kor}</h2><p className="detail-pali">{selected.name.pli}</p><div className="detail-divider" /><h3>분류</h3><div className="attribute-list">{classifications.map((item) => { const groupName = selected.groups[item.id]; const group = item.groups.find((candidate) => candidate.name.en === groupName); return group ? <div key={item.id}><span>{item.name.kor}</span><strong>{group.name.kor}</strong></div> : null; })}</div><div className="detail-note"><Brain size={17} /> 분류 렌즈를 바꾸면 이 마음의 위치도 함께 달라집니다.</div></motion.aside></motion.div>}</AnimatePresence>
      <footer><span>아비담마</span><span>편집 가능한 YAML 데이터로 확장하세요</span></footer>
    </div>
  );
}
