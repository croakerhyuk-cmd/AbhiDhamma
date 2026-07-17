"use client";

import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Brain, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ExplorerDataset, ExplorerItem, ClassificationGroup } from '@/lib/types';
import { groupItems } from '@/lib/grouping';
import { getBhumiVisual, getJatiVisual } from '@/lib/visual-config';

export function Screen({ datasets }: { datasets: ExplorerDataset[] }) {
  const [datasetId, setDatasetId] = useState(datasets[0]?.id ?? 'citta');
  const dataset = datasets.find((item) => item.id === datasetId) ?? datasets[0];
  const [groupId, setGroupId] = useState(dataset?.dhammaGroups?.[0]?.id ?? '');
  const dhammaGroup = dataset?.dhammaGroups?.find((group) => group.id === groupId) ?? dataset?.dhammaGroups?.[0] ?? dataset;
  const classifications = dhammaGroup?.classifications ?? [];
  const cittas = dhammaGroup?.items ?? [];
  const [classificationId, setClassificationId] = useState(classifications[0]?.id ?? '');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<ExplorerItem | null>(null);
  const [scopeId, setScopeId] = useState<string | undefined>();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const classification = classifications.find((item) => item.id === classificationId) ?? classifications[0];
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return cittas;
    return cittas.filter((citta) => `${citta.name.kor} ${citta.name.pli} ${citta.name.en}`.toLowerCase().includes(normalized));
  }, [cittas, query]);
  const groups = useMemo(() => classification ? groupItems(filtered, classification, scopeId).filter((group) => group.items.length > 0) : [], [filtered, classification, scopeId]);

  function cardVisual(item: ExplorerItem) {
    const primary = Object.values(item.groups)[0];
    const bhumiVisual = getBhumiVisual(item.groups.bhumi ?? primary);
    return { BhumiIcon: bhumiVisual.icon, bhumiClassName: bhumiVisual.className, jatiColor: getJatiVisual(item.groups.jati) };
  }

  function changeClassification(nextId: string) {
    if (nextId === classificationId) return;
    // Keep every card mounted while the groups change. Framer Motion can then
    // interpolate each card from its old grid position to its new one.
    setClassificationId(nextId);
    setScopeId(undefined);
  }

  function changeGroup(nextId: string) {
    const nextGroup = dataset?.dhammaGroups?.find((group) => group.id === nextId);
    setGroupId(nextId);
    setClassificationId(nextGroup?.classifications[0]?.id ?? '');
    setScopeId(undefined);
    setSelected(null);
  }

  function changeDataset(nextId: string) {
    setDatasetId(nextId);
    const nextDataset = datasets.find((item) => item.id === nextId);
    setGroupId(nextDataset?.dhammaGroups?.[0]?.id ?? '');
    setClassificationId(nextDataset?.dhammaGroups?.[0]?.classifications[0]?.id ?? '');
    setSelected(null);
    setQuery('');
    setScopeId(undefined);
  }

  function openGroup(groupId: string) {
    const childId = dataset?.groupDatasets?.[groupId];
    if (childId) changeDataset(childId);
    else setScopeId(scopeId === groupId ? undefined : groupId);
  }

  function findGroup(groups: ClassificationGroup[], id: string): ClassificationGroup | undefined {
    for (const group of groups) {
      if (group.id === id) return group;
      const found = group.groups && findGroup(group.groups, id);
      if (found) return found;
    }
    return undefined;
  }

  return (
    <div className="explorer-shell">
      <div className={`explorer-body ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
        <aside id="dataset-sidebar" className="dataset-sidebar" aria-label="탐색할 항목 선택">
          <span className="sidebar-label">탐색 대상</span>
          <div className="dataset-tabs">{datasets.filter((item) => !item.parentId).map((item) => <div key={item.id}><button className={item.id === datasetId ? 'dataset-tab active' : 'dataset-tab'} onClick={() => changeDataset(item.id)}>{item.name.kor}</button>{item.id === datasetId ? item.dhammaGroups?.map((group) => <button key={group.id} className={group.id === groupId ? 'dataset-child active' : 'dataset-child'} onClick={() => changeGroup(group.id)}>{group.name.kor}</button>) : null}</div>)}</div>
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
              {groups.map((group) => <motion.section key={group.id} layout className="group-section" transition={{ layout: { duration: reduceMotion ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] } }}>
                <button type="button" className={`group-heading ${scopeId === group.id ? 'active' : ''}`} onClick={() => openGroup(group.id)} aria-pressed={scopeId === group.id}><div className="group-title"><div><div className="group-label"><span>{group.name.kor}</span><span className="group-count">{group.items.length}</span></div></div></div><div className="group-rule" /></button>
                <motion.div layout className="citta-grid" transition={{ layout: { duration: reduceMotion ? 0 : 0.72, ease: [0.22, 1, 0.36, 1] } }}>{group.items.map((item) => { const { BhumiIcon, bhumiClassName, jatiColor } = cardVisual(item); return <motion.button layout="position" layoutId={`${dataset.id}-${item.key}`} key={item.key} className={`citta-card ${selected?.key === item.key ? 'selected' : ''}`} style={{ borderColor: jatiColor }} onClick={() => setSelected(item)} whileHover={reduceMotion ? undefined : { y: -5 }} whileTap={reduceMotion ? undefined : { scale: 0.98 }} transition={{ layout: { duration: reduceMotion ? 0 : 0.72, ease: [0.22, 1, 0.36, 1] } }}><div className="card-top"><span className="number">{item.key.replace(`${dataset.id}-`, '').replace('citta-', '').padStart(2, '0')}</span><span className={`card-icon ${bhumiClassName}`}><BhumiIcon size={20} /></span></div><span className="card-name">{item.name.kor}</span><span className="card-pali">{item.name.pli}</span><span className="card-arrow"><ArrowUpRight size={15} /></span></motion.button>; })}</motion.div>
              </motion.section>)}
          </motion.div>
        </LayoutGroup>
      </main>
      </div>

      <AnimatePresence>{selected && <motion.div className="detail-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)}><motion.aside className="detail-panel" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 28 }} onClick={(event) => event.stopPropagation()}><button className="close-button" onClick={() => setSelected(null)} aria-label="상세 패널 닫기"><X size={19} /></button><div className="detail-number">{dataset.itemName.en.toUpperCase()} / {selected.key.replace(`${dataset.id}-`, '').replace('citta-', '').padStart(2, '0')}</div><div className="detail-icon" style={{ color: getJatiVisual(selected.groups.jati) }}>{(() => { const Icon = getBhumiVisual(selected.groups.bhumi).icon; return <Icon size={34} />; })()}</div><h2>{selected.name.kor}</h2><p className="detail-pali">{selected.name.pli}</p><div className="detail-divider" /><h3>분류</h3><div className="attribute-list">{classifications.map((item) => { const group = findGroup(item.groups, selected.groups[item.id]); return group ? <div key={item.id}><span>{item.name.kor}</span><strong>{group.name.kor}</strong></div> : null; })}</div><div className="detail-note"><Brain size={17} /> 분류 렌즈를 바꾸면 이 항목의 위치도 함께 달라집니다.</div></motion.aside></motion.div>}</AnimatePresence>
      <footer><span>아비담마</span><span>편집 가능한 YAML 데이터로 확장하세요</span></footer>
    </div>
  );
}
