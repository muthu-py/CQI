import { useEffect, useState, useMemo } from 'react';
import { FilterPanel, FilterSelect } from '../../components/ui/FilterSelect';
import { CoPoMatrix } from './CoPoMatrix';
import { AttainmentCharts, type CoData, type PoData } from './AttainmentCharts';
import { InsightPanel, type InsightItem } from '../../components/ui/InsightPanel';
import { analyticsService, type Filters } from '../../services/api';

export function SubjectAnalysisPage() {
  const [filters, setFilters] = useState<Filters>({});
  const [filterOptions, setFilterOptions] = useState<any>({ regulations: [], subjects: [], batches: [] });
  
  const [loading, setLoading] = useState(false);
  const [coData, setCoData] = useState<CoData[]>([]);
  const [poData, setPoData] = useState<PoData[]>([]);
  const [mappings, setMappings] = useState<any[]>([]);

  useEffect(() => {
    analyticsService.getFilterOptions({}).then(res => setFilterOptions(res.data)).catch(console.error);
  }, []);

  const fetchData = async () => {
    if (!filters.regulation_id || !filters.subject_id) return;
    setLoading(true);
    try {
      const [coRes, poRes, mapRes] = await Promise.all([
        analyticsService.getCoAttainment(filters),
        analyticsService.getPoAttainment(filters),
        analyticsService.getCoPoMapping(filters),
      ]);
      
      // Adapt backend data to frontend charts
      // Co Attainment mapping
      const coRows = Array.isArray(coRes.data)
        ? coRes.data
        : Array.isArray(coRes.data?.co_attainment)
          ? coRes.data.co_attainment
          : [];
      if (coRows.length > 0) {
        const coBuckets = new Map<string, { sum: number; count: number }>();

        coRows.forEach((co: any) => {
          const coId = String(co?.co_number ?? '').trim();
          if (!coId) return;

          const attainment = Number(co?.attainment_percentage ?? 0);
          const current = coBuckets.get(coId) ?? { sum: 0, count: 0 };
          coBuckets.set(coId, {
            sum: current.sum + (Number.isFinite(attainment) ? attainment : 0),
            count: current.count + 1
          });
        });

        const normalizedCoData: CoData[] = Array.from(coBuckets.entries()).map(([co, stats]) => ({
          co,
          attainment: stats.count ? stats.sum / stats.count : 0
        }));

        setCoData(normalizedCoData);
      } else {
        setCoData([]);
      }

      // PO Attainment mapping
      const poRows = Array.isArray(poRes.data)
        ? poRes.data
        : Array.isArray(poRes.data?.po_attainment)
          ? poRes.data.po_attainment
          : [];
      if (poRows.length > 0) {
        const poBuckets = new Map<string, { sum: number; count: number; name: string }>();

        poRows.forEach((po: any) => {
          const poId = String(po?.po_number ?? '').trim();
          if (!poId) return;

          const attainment = Number(po?.attainment_percentage ?? 0);
          const current = poBuckets.get(poId) ?? {
            sum: 0,
            count: 0,
            name: po?.description || 'Program Outcome'
          };
          poBuckets.set(poId, {
            sum: current.sum + (Number.isFinite(attainment) ? attainment : 0),
            count: current.count + 1,
            name: current.name
          });
        });

        const normalizedPoData: PoData[] = Array.from(poBuckets.entries()).map(([po, stats]) => ({
          po,
          name: stats.name,
          attainment: stats.count ? stats.sum / stats.count : 0
        }));

        setPoData(normalizedPoData);
      } else {
        setPoData([]);
      }

      // Mapping table
      if (mapRes.data && Array.isArray(mapRes.data)) {
        // Normalize and merge by CO to avoid duplicate matrix rows.
        const mappingByCo = new Map<string, Record<string, number>>();

        mapRes.data.forEach((item: any) => {
          const coId = String(item?.co_number ?? '').trim();
          if (!coId) return;

          const poMappings = Array.isArray(item?.po_mappings) ? item.po_mappings : [];
          const poWeightsFromObject =
            item?.po_weights && typeof item.po_weights === 'object' ? item.po_weights : {};

          const mergedWeights: Record<string, number> = { ...(mappingByCo.get(coId) ?? {}) };

          Object.entries(poWeightsFromObject).forEach(([poKey, value]) => {
            const weight = Number(value ?? 0);
            if (poKey) {
              mergedWeights[poKey] = Number.isFinite(weight)
                ? Math.max(mergedWeights[poKey] ?? 0, weight)
                : mergedWeights[poKey] ?? 0;
            }
          });

          poMappings.forEach((mapping: any) => {
            const poKey = String(mapping?.po_number ?? '').trim();
            const weight = Number(mapping?.weightage ?? 0);
            if (poKey) {
              mergedWeights[poKey] = Number.isFinite(weight)
                ? Math.max(mergedWeights[poKey] ?? 0, weight)
                : mergedWeights[poKey] ?? 0;
            }
          });

          const flatPoKey = String(item?.po_number ?? '').trim();
          const flatWeight = Number(item?.weightage ?? 0);
          if (flatPoKey) {
            mergedWeights[flatPoKey] = Number.isFinite(flatWeight)
              ? Math.max(mergedWeights[flatPoKey] ?? 0, flatWeight)
              : mergedWeights[flatPoKey] ?? 0;
          }

          mappingByCo.set(coId, mergedWeights);
        });

        const formattedMappings = Array.from(mappingByCo.entries()).map(([co_id, po_weights]) => ({
          co_id,
          po_weights
        }));

        setMappings(formattedMappings);
      } else {
        setMappings([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const avgCoAttainment = useMemo(() => {
    if (!coData || coData.length === 0) return 0;
    return coData.reduce((acc, c) => acc + c.attainment, 0) / coData.length;
  }, [coData]);

  const avgPoAttainment = useMemo(() => {
    if (!poData || poData.length === 0) return 0;
    return poData.reduce((acc, p) => acc + p.attainment, 0) / poData.length;
  }, [poData]);

  const mappingLinksCount = useMemo(() => {
    return mappings.reduce((acc, row) => {
      const count = Object.values(row?.po_weights || {}).filter((weight: any) => Number(weight) > 0).length;
      return acc + count;
    }, 0);
  }, [mappings]);

  const scopeLabel = filters.batch_id ? `Batch ${filters.batch_id}` : 'All Batches (Overall)';

  const derivedInsights = useMemo<InsightItem[]>(() => {
    if (coData.length === 0 && poData.length === 0) return [];

    const insights: InsightItem[] = [];
    const sortedCo = [...coData].sort((a, b) => a.attainment - b.attainment);
    const sortedPo = [...poData].sort((a, b) => b.attainment - a.attainment);

    if (sortedCo.length > 0) {
      const weakestCo = sortedCo[0];
      insights.push({
        id: `weak-${weakestCo.co}`,
        type: 'weakness',
        title: `${weakestCo.co} needs reinforcement`,
        reason: `${weakestCo.co} has the lowest attainment in ${scopeLabel} at ${weakestCo.attainment.toFixed(1)}%.`,
        action: 'Prioritize remediation on this CO in upcoming internal assessments and tutorial hours.'
      });
    }

    if (sortedPo.length > 0) {
      const strongestPo = sortedPo[0];
      insights.push({
        id: `strong-${strongestPo.po}`,
        type: 'strength',
        title: `${strongestPo.po} is a current strength`,
        reason: `${strongestPo.po} has the highest attainment in ${scopeLabel} at ${strongestPo.attainment.toFixed(1)}%.`,
        action: 'Replicate the same assessment design patterns in lower-performing outcome areas.'
      });
    }

    if (coData.length > 0) {
      const expectedMaxLinks = coData.length * 12;
      const coverage = expectedMaxLinks > 0 ? (mappingLinksCount / expectedMaxLinks) * 100 : 0;
      insights.push({
        id: 'map-coverage',
        type: 'alert',
        title: 'CO-PO mapping coverage check',
        reason: `${mappingLinksCount} non-zero links are active across ${coData.length} COs (${coverage.toFixed(1)}% of possible links).`,
        action: coverage < 20
          ? 'Review mapping completeness to ensure each CO contributes meaningfully to program outcomes.'
          : 'Coverage is reasonable; verify whether link strengths align with the latest syllabus intent.'
      });
    }

    return insights.slice(0, 3);
  }, [coData, poData, mappingLinksCount, scopeLabel]);

  return (
    <div className="space-y-8 animate-fade-in">
      <FilterPanel 
        actions={
          <button 
            onClick={fetchData}
            disabled={!filters.regulation_id || !filters.subject_id || loading}
            className="px-6 py-2 bg-gradient-to-br from-primary to-primary-dim text-white rounded-lg font-medium shadow-sm hover:opacity-95 disabled:opacity-50"
          >
            {loading ? 'Crunching...' : 'Generate Analysis'}
          </button>
        }
      >
        <FilterSelect 
          label="Regulation" 
          value={filters.regulation_id || ''} 
          onChange={e => setFilters(f => ({ ...f, regulation_id: e.target.value }))}
          options={filterOptions.regulations?.map((r: any) => ({ value: r.regulation_id, label: r.label })) || []}
        />
        <FilterSelect 
          label="Academic Batch (Optional)" 
          value={filters.batch_id || ''} 
          onChange={e => setFilters(f => ({ ...f, batch_id: e.target.value }))}
          options={filterOptions.batches?.map((b: any) => ({ value: b.batch_id, label: b.batch_id })) || []}
        />
        <FilterSelect 
          label="Subject" widthClass="w-56"
          value={filters.subject_id || ''} 
          onChange={e => setFilters(f => ({ ...f, subject_id: e.target.value }))}
          options={filterOptions.subjects?.map((s: any) => ({ value: s.subject_id, label: s.subject_name })) || []}
        />
      </FilterPanel>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-4 rounded-xl">
          <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-1">Scope</p>
          <p className="text-sm font-semibold text-on-surface">{scopeLabel}</p>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl">
          <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-1">Average CO</p>
          <p className="text-2xl font-black text-primary">{avgCoAttainment.toFixed(1)}%</p>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl">
          <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-1">Average PO</p>
          <p className="text-2xl font-black text-primary">{avgPoAttainment.toFixed(1)}%</p>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl">
          <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-1">Active CO-PO Links</p>
          <p className="text-2xl font-black text-primary">{mappingLinksCount}</p>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
         <div className="bg-surface-container-lowest p-6 rounded-xl relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">description</span>
                Course Outcomes (CO)
            </h3>
            {coData.length === 0 ? (
               <p className="text-sm text-on-surface-variant italic">No CO data available for this scope.</p>
            ) : (
               <div className="space-y-4">
                 {[...coData]
                   .sort((a, b) => b.attainment - a.attainment)
                   .map((co, idx) => (
                     <div key={`${co.co}-${idx}`} className="p-3 bg-surface rounded-lg">
                       <div className="flex items-center justify-between mb-1">
                         <span className="text-xs font-bold text-primary block">{co.co}</span>
                         <span className="text-xs font-black text-on-surface">{co.attainment.toFixed(1)}%</span>
                       </div>
                       <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                         <div className="h-full bg-primary" style={{ width: `${Math.max(0, Math.min(co.attainment, 100))}%` }}></div>
                       </div>
                     </div>
                 ))}
               </div>
            )}
         </div>

         <CoPoMatrix mappings={mappings} />
      </div>

      <AttainmentCharts coData={coData} poData={poData} avgCoAttainment={avgCoAttainment} />

      {derivedInsights.length > 0 && (
        <InsightPanel
          title="Data-Driven Insights"
          subtitle={`Auto-generated from ${scopeLabel} attainment patterns`}
          insights={derivedInsights}
        />
      )}
    </div>
  );
}
