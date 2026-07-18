"use client";

import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowUpRight, Brain, CircleDot, Flame, Frown, Heart, Leaf, Search, Sparkles, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { ExplorerDataset, ExplorerItem, ClassificationGroup, ExplorerGroup } from '@/lib/types';
import { groupItems } from '@/lib/grouping';
import { getGroupVisual } from '@/lib/visual-config';

const SINGLE_COLUMN_CARD_LIMIT = 10;
const THREE_COLUMN_CARD_THRESHOLD = 40;
const HETUKA_CARDS = [
  { id: '탐욕', icon: Flame, className: 'hetuka-lobha' },
  { id: '성냄', icon: Frown, className: 'hetuka-dosa' },
  { id: '어리석음', icon: CircleDot, className: 'hetuka-moha' },
  { id: '탐욕없음', icon: Leaf, className: 'hetuka-alobha' },
  { id: '성냄없음', icon: Heart, className: 'hetuka-adosa' },
  { id: '어리석음없음', icon: Sparkles, className: 'hetuka-amoha' },
] as const;

function groupColumnClass(itemCount: number): string {
  if (itemCount <= SINGLE_COLUMN_CARD_LIMIT) return 'single-column';
  if (itemCount > THREE_COLUMN_CARD_THRESHOLD) return 'three-column';
  return '';
}

function groupColumnSpan(itemCount: number): number {
  const columnClass = groupColumnClass(itemCount);
  if (columnClass === 'single-column') return 1;
  if (columnClass === 'three-column') return 3;
  return 2;
}

export function Explorer({ datasets }: { datasets: ExplorerDataset[] }) {
  const [datasetId, setDatasetId] = useState(datasets[0]?.id ?? 'citta');
  const dataset = datasets.find((item) => item.id === datasetId) ?? datasets[0];
  const [groupId, setGroupId] = useState(dataset?.dhammaGroups?.[0]?.id ?? '');
  const [groupHistory, setGroupHistory] = useState<string[]>([]);
  const dhammaGroup = dataset?.dhammaGroups?.find((group) => group.id === groupId) ?? dataset?.dhammaGroups?.[0] ?? dataset;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function changeDataset(nextId: string) {
    setDatasetId(nextId);
    const nextDataset = datasets.find((item) => item.id === nextId);
    setGroupId(nextDataset?.dhammaGroups?.[0]?.id ?? '');
    setGroupHistory([]);
  }

  function openDhammaGroup(nextGroupId: string) {
    if (nextGroupId !== groupId && dataset?.dhammaGroups?.some((group) => group.id === nextGroupId)) {
      setGroupHistory((history) => [...history, groupId]);
      setGroupId(nextGroupId);
    }
  }

  function returnToParentGroup() {
    setGroupHistory((history) => {
      const parentId = history.at(-1);
      if (parentId) setGroupId(parentId);
      return history.slice(0, -1);
    });
  }

  return (
    <div className="explorer-shell">
      <div className={`explorer-body ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
        <aside id="dataset-sidebar" className="dataset-sidebar" aria-label="탐색할 항목 선택">
          <span className="sidebar-label">탐색 대상</span>
          <div className="dataset-tabs">{datasets.filter((item) => !item.parentId).map((item) => <button key={item.id} className={item.id === datasetId ? 'dataset-tab active' : 'dataset-tab'} onClick={() => changeDataset(item.id)}>{item.name.kor}</button>)}</div>
        </aside>
        <button className="sidebar-toggle" type="button" onClick={() => setSidebarOpen((open) => !open)} aria-expanded={sidebarOpen} aria-controls="dataset-sidebar">
          <span aria-hidden="true">{sidebarOpen ? '‹' : '›'}</span>
          <span>{sidebarOpen ? '숨기기' : '열기'}</span>
        </button>
      <Screen
        dhammaGroup={dhammaGroup}
        onOpenGroup={openDhammaGroup}
        onReturnToParent={groupHistory.length ? returnToParentGroup : undefined}
      />
      </div>
      <footer><span>아비담마</span><span>편집 가능한 YAML 데이터로 확장하세요</span></footer>
    </div>
  );
}

export function Screen({ dhammaGroup, onOpenGroup, onReturnToParent }: { dhammaGroup?: ExplorerDataset; onOpenGroup?: (groupId: string) => void; onReturnToParent?: () => void }) {
  const classifications = dhammaGroup?.classifications ?? [];
  const cittas = dhammaGroup?.items ?? [];
  const [classificationId, setClassificationId] = useState(classifications[0]?.id ?? '');
  const [verticalClassificationId, setVerticalClassificationId] = useState('');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<ExplorerItem | null>(null);
  const reduceMotion = useReducedMotion();
  const classification = classifications.find((item) => item.id === classificationId) ?? classifications[0];

  useEffect(() => {
    setClassificationId(classifications[0]?.id ?? '');
    setVerticalClassificationId('');
    setQuery('');
    setSelected(null);
  }, [dhammaGroup?.id]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return cittas;
    return cittas.filter((citta) => `${citta.name.kor} ${citta.name.pli} ${citta.name.en}`.toLowerCase().includes(normalized));
  }, [cittas, query]);
  const horizontalGroups = useMemo(() => classification ? groupItems(filtered, classification) : [], [filtered, classification]);
  const verticalClassification = classifications.find((item) => item.id === verticalClassificationId);
  const verticalGroups = useMemo(() => verticalClassification ? groupItems(filtered, verticalClassification) : [], [filtered, verticalClassification]);

  function groupForItem(item: ExplorerItem, classification: typeof classifications[number]): ClassificationGroup | undefined {
    const groupId = item.groups[classification.id];
    const findMatchingGroup = (groups: ClassificationGroup[]): ClassificationGroup | undefined => {
      for (const group of groups) {
        const childMatch = group.groups && findMatchingGroup(group.groups);
        if (childMatch) return childMatch;
        if (group.id === groupId || item.groupIds.includes(group.id)) return group;
      }
      return undefined;
    };
    return findMatchingGroup(classification.groups);
  }

  function changeHorizontalClassification(nextId: string) {
    setClassificationId(nextId);
    setVerticalClassificationId((currentId) => currentId === nextId ? '' : currentId);
  }

  function cardsForCell(horizontalGroup: ExplorerGroup, verticalGroup?: ExplorerGroup): ExplorerItem[] {
    if (!verticalGroup) return horizontalGroup.items;
    const verticalItemKeys = new Set(verticalGroup.items.map((item) => item.key));
    return horizontalGroup.items.filter((item) => verticalItemKeys.has(item.key));
  }

  function formatCardName(name: string) {
    return name.split(/(함께하고|함께하는|결합한|결합하지 않은)/).map((part, index) => {
      if (part === '함께하고'|| part === '함께하는' || part === '결합한'|| part ==='결합하지 않은') return <span key={`${part}-${index}`}>{part}<br /></span>;
      return <span key={index}>{part.trimStart()}</span>;
    });
  }

  function renderCards(items: ExplorerItem[]) {
    return <AnimatePresence initial={false}>{items.map((item) => <motion.button key={item.key} layoutId={reduceMotion ? undefined : item.key} className={`citta-card ${selected?.key === item.key ? 'selected' : ''}`} onClick={() => setSelected(item)} initial={reduceMotion ? undefined : { opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={reduceMotion ? undefined : { opacity: 0, scale: 0.9 }} transition={{ type: 'spring', damping: 26, stiffness: 300 }} whileHover={reduceMotion ? undefined : { y: -5 }} whileTap={reduceMotion ? undefined : { scale: 0.98 }}><div className="card-top"><span className="number">{item.key.replace('citta-', '').padStart(2, '0')}</span></div><span className="card-name">{formatCardName(item.name.kor)}</span><span className="card-pali">{item.name.pli}</span><span className="card-arrow"><ArrowUpRight size={15} /></span></motion.button>)}</AnimatePresence>;
  }

  return (
    <>
      <main>
        <section className="controls" aria-label="마음 종류와 분류 및 검색">
          {onReturnToParent && <div className="group-navigation"><button className="parent-group-button" type="button" onClick={onReturnToParent}><ArrowLeft size={15} /> 상위 그룹으로</button></div>}
          <div className="classification-row"><div className="classification-selectors"><div><span className="control-label">열 분류기준</span><div className="classification-tabs">{classifications.map((item) => <button key={item.id} className={item.id === classificationId ? 'tab active' : 'tab'} onClick={() => changeHorizontalClassification(item.id)}><span>{item.name.kor}</span><ArrowUpRight size={15} className="tab-arrow" style={{ opacity: item.id === classificationId ? 1 : 0 }} /></button>)}</div></div><div><span className="control-label">행 분류기준 <small>(선택)</small></span><div className="classification-tabs"><button className={!verticalClassificationId ? 'tab active' : 'tab'} onClick={() => setVerticalClassificationId('')}>적용 안 함</button>{classifications.filter((item) => item.id !== classificationId).map((item) => <button key={item.id} className={item.id === verticalClassificationId ? 'tab active' : 'tab'} onClick={() => setVerticalClassificationId(item.id)}>{item.name.kor}</button>)}</div></div></div><div className="classification-side"><p className="source-credit">한국마하시 사야도와 담마간다 사야도의 아비담마 강설에서 번역어를 주로 가져왔습니다.</p><label className="search-box"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`${dhammaGroup?.itemName.kor ?? '항목'} 이름을 검색해보세요`} aria-label={`${dhammaGroup?.itemName.kor ?? '항목'} 검색`} />{query && <button aria-label="검색어 지우기" onClick={() => setQuery('')}><X size={15} /></button>}</label></div></div>
        </section>

        <LayoutGroup>
          <div className={`groups-list ${verticalClassification ? 'has-vertical-classification' : ''}`}>
            {verticalClassification && <div className="matrix-corner"><span>세로</span><ArrowUpRight size={13} /><span>가로</span></div>}
            <div className="matrix-heading-area"><div className="matrix-columns">{horizontalGroups.map((group) => <button key={group.id} type="button" className={`group-heading ${groupColumnClass(group.items.length)}`} onClick={() => onOpenGroup?.(group.id)} disabled={!onOpenGroup}><div className="group-title"><div className="group-label"><span>{group.name.kor}</span><span className="group-count">{group.items.length}</span></div></div><div className="group-rule" /></button>)}</div>{horizontalGroups.reduce<number[]>((starts, group, index) => { const columnStart = horizontalGroups.slice(0, index).reduce((total, item) => total + groupColumnSpan(item.items.length), 0); if (columnStart > 0 && columnStart < 8) starts.push(columnStart); return starts; }, []).map((columnStart) => <span key={columnStart} className={`matrix-column-divider matrix-divider-start-${columnStart}`} aria-hidden="true" />)}</div>
            {(verticalClassification ? verticalGroups : [undefined]).map((verticalGroup) => <section key={verticalGroup?.id ?? 'all-items'} className="matrix-row">
              {verticalClassification && verticalGroup && <div className="vertical-group-heading"><span>{verticalGroup.name.kor}</span><span className="group-count">{verticalGroup.items.length}</span></div>}
              <div className="matrix-cell-area">
                <div className="matrix-columns matrix-cells">{horizontalGroups.map((horizontalGroup) => { const items = cardsForCell(horizontalGroup, verticalGroup); const sizeClass = groupColumnClass(horizontalGroup.items.length); return <div key={horizontalGroup.id} className={`matrix-cell ${sizeClass}`}><div className={`citta-grid ${sizeClass}`}>{renderCards(items)}</div></div>; })}</div>
                {horizontalGroups.reduce<number[]>((starts, group, index) => {
                  const columnStart = horizontalGroups.slice(0, index).reduce((total, item) => total + groupColumnSpan(item.items.length), 0);
                  if (columnStart > 0 && columnStart < 8) starts.push(columnStart);
                  return starts;
                }, []).map((columnStart) => <span key={columnStart} className={`matrix-column-divider matrix-divider-start-${columnStart}`} aria-hidden="true" />)}
              </div>
            </section>)}
          </div>
        </LayoutGroup>
      </main>

      <AnimatePresence>{selected && <motion.div className="detail-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} onClick={() => setSelected(null)}><motion.aside className="detail-panel" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 32, stiffness: 480, mass: 0.65 }} onClick={(event) => event.stopPropagation()}><button className="close-button" onClick={() => setSelected(null)} aria-label="상세 패널 닫기"><X size={19} /></button><div className="detail-number">{dhammaGroup?.itemName.en.toUpperCase()} / {selected.key.replace('citta-', '').padStart(2, '0')}</div><h2>{selected.name.kor}</h2><p className="detail-pali">{selected.name.pli}</p><div className="detail-divider" /><h3>원인 (hetuka)</h3><div className="hetuka-icon-grid">{HETUKA_CARDS.map(({ id, icon: HetukaIcon, className }) => { const active = selected.hetuka.includes(id); return <div key={id} className={`hetuka-icon-item ${active ? `is-active ${className}` : 'is-inactive'}`} title={active ? `${id} 있음` : `${id} 없음`}><HetukaIcon aria-hidden="true" /><span>{id}</span></div>; })}</div><h3 className="classification-heading">분류</h3><div className="attribute-icon-grid">{classifications.map((item) => { const group = groupForItem(selected, item); if (!group) return null; const { icon: GroupIcon, className } = getGroupVisual(item.id, group.id); return <div key={item.id} className="attribute-icon-item" title={`${item.name.kor}: ${group.name.kor}`}><span className={`attribute-group-icon ${className}`}><GroupIcon aria-hidden="true" /></span><strong>{group.name.kor}</strong><span>{item.name.kor}</span></div>; })}</div><div className="detail-note"><Brain size={17} /> 분류 렌즈를 바꾸면 이 항목의 위치도 함께 달라집니다.</div></motion.aside></motion.div>}</AnimatePresence>
    </>
  );
}
