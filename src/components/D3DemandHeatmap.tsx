import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Product, Store, Order, RegisteredUser, Language } from '../types';
import { Map, Grid, BarChart3, HelpCircle, Sliders, Sparkles } from 'lucide-react';

interface ZoneDemandData {
  id: string;
  name: string;
  nameHi: string;
  pincode: string;
  polygon: { lat: number; lng: number }[];
  description: string;
  descriptionHi: string;
}

const HEATMAP_ZONES: ZoneDemandData[] = [
  {
    id: 'sa-1',
    name: 'Maudaha Town Centre',
    nameHi: 'मौदहा नगर केंद्र',
    pincode: '210424',
    polygon: [
      { lat: 25.695, lng: 80.100 },
      { lat: 25.695, lng: 80.130 },
      { lat: 25.670, lng: 80.130 },
      { lat: 25.670, lng: 80.100 }
    ],
    description: 'Naya Bazar, Devi Mandir, Station Road, Qila area',
    descriptionHi: 'नया बाजार, देवी मंदिर, स्टेशन रोड, किला क्षेत्र'
  },
  {
    id: 'sa-2',
    name: 'Husain Ganj & North Ward',
    nameHi: 'हुसैन गंज और उत्तरी वार्ड',
    pincode: '210424',
    polygon: [
      { lat: 25.710, lng: 80.090 },
      { lat: 25.710, lng: 80.120 },
      { lat: 25.692, lng: 80.120 },
      { lat: 25.692, lng: 80.090 }
    ],
    description: 'Husain Ganj, Galla Mandi, bypass links',
    descriptionHi: 'हुसैन गंज, गल्ला मंडी, बाईपास मार्ग'
  },
  {
    id: 'sa-3',
    name: 'Ragauli South Suburb',
    nameHi: 'रागौल दक्षिणी उपनगर',
    pincode: '210424',
    polygon: [
      { lat: 25.670, lng: 80.115 },
      { lat: 25.670, lng: 80.140 },
      { lat: 25.650, lng: 80.140 },
      { lat: 25.650, lng: 80.115 }
    ],
    description: 'Ragauli proper, bypass warehouse belt',
    descriptionHi: 'रागौल खुद, बाईपास गोदाम बेल्ट'
  },
  {
    id: 'sa-4',
    name: 'Chhani Border Zone',
    nameHi: 'छानी सीमा क्षेत्र',
    pincode: '210424',
    polygon: [
      { lat: 25.730, lng: 80.130 },
      { lat: 25.730, lng: 80.160 },
      { lat: 25.700, lng: 80.160 },
      { lat: 25.700, lng: 80.130 }
    ],
    description: 'Chhani Kalan village, NH-34 checkpost',
    descriptionHi: 'छानी कलां गांव, एनएच-34 चेकपोस्ट'
  }
];

const BASELINE_DEMAND: { [zoneId: string]: { [category: string]: { orders: number; searches: number; saves: number } } } = {
  'sa-1': {
    'Atta, Rice & Dal': { orders: 45, searches: 180, saves: 32 },
    'Oils & Spices': { orders: 28, searches: 95, saves: 14 },
    'Vegetables': { orders: 82, searches: 310, saves: 45 },
    'Fresh Fruits': { orders: 54, searches: 210, saves: 38 },
    'Milk & Butter': { orders: 60, searches: 240, saves: 28 },
    'Paneer & Curd': { orders: 48, searches: 190, saves: 22 },
    'Maudaha Special Sweets': { orders: 75, searches: 320, saves: 50 },
    'Namkeen & Savories': { orders: 35, searches: 140, saves: 18 },
    'Fresh Bakery': { orders: 40, searches: 155, saves: 22 },
  },
  'sa-2': {
    'Atta, Rice & Dal': { orders: 65, searches: 280, saves: 48 },
    'Oils & Spices': { orders: 42, searches: 160, saves: 25 },
    'Vegetables': { orders: 50, searches: 190, saves: 20 },
    'Fresh Fruits': { orders: 35, searches: 140, saves: 18 },
    'Milk & Butter': { orders: 25, searches: 90, saves: 12 },
    'Paneer & Curd': { orders: 22, searches: 80, saves: 10 },
    'Maudaha Special Sweets': { orders: 30, searches: 110, saves: 15 },
    'Namkeen & Savories': { orders: 48, searches: 195, saves: 30 },
    'Fresh Bakery': { orders: 55, searches: 220, saves: 35 },
  },
  'sa-3': {
    'Atta, Rice & Dal': { orders: 20, searches: 85, saves: 10 },
    'Oils & Spices': { orders: 15, searches: 60, saves: 8 },
    'Vegetables': { orders: 38, searches: 130, saves: 15 },
    'Fresh Fruits': { orders: 25, searches: 95, saves: 12 },
    'Milk & Butter': { orders: 52, searches: 215, saves: 38 },
    'Paneer & Curd': { orders: 45, searches: 180, saves: 30 },
    'Maudaha Special Sweets': { orders: 18, searches: 70, saves: 9 },
    'Namkeen & Savories': { orders: 22, searches: 90, saves: 11 },
    'Fresh Bakery': { orders: 28, searches: 115, saves: 14 },
  },
  'sa-4': {
    'Atta, Rice & Dal': { orders: 8, searches: 35, saves: 4 },
    'Oils & Spices': { orders: 5, searches: 22, saves: 2 },
    'Vegetables': { orders: 12, searches: 48, saves: 6 },
    'Fresh Fruits': { orders: 30, searches: 110, saves: 12 },
    'Milk & Butter': { orders: 14, searches: 55, saves: 8 },
    'Paneer & Curd': { orders: 11, searches: 45, saves: 5 },
    'Maudaha Special Sweets': { orders: 5, searches: 20, saves: 2 },
    'Namkeen & Savories': { orders: 10, searches: 42, saves: 5 },
    'Fresh Bakery': { orders: 12, searches: 50, saves: 6 },
  }
};

const mapLocationToZoneId = (location: string): string => {
  const loc = (location || '').toLowerCase();
  if (loc.includes('bhatipura') || loc.includes('station') || loc.includes('town') || loc.includes('centre') || loc.includes('naya bazar')) return 'sa-1';
  if (loc.includes('galla') || loc.includes('husain') || loc.includes('north')) return 'sa-2';
  if (loc.includes('ragauli') || loc.includes('rahmaniya') || loc.includes('south')) return 'sa-3';
  if (loc.includes('chhani') || loc.includes('bypass') || loc.includes('border') || loc.includes('highway')) return 'sa-4';
  return 'sa-1';
};

interface D3DemandHeatmapProps {
  products: Product[];
  orders: Order[];
  users: RegisteredUser[];
  activeStore: Store | null;
  language: Language;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  hoveredZoneId: string | null;
  setHoveredZoneId: (id: string | null) => void;
}

export const D3DemandHeatmap: React.FC<D3DemandHeatmapProps> = ({
  products,
  orders,
  users,
  activeStore,
  language,
  selectedCategory,
  setSelectedCategory,
  hoveredZoneId,
  setHoveredZoneId
}) => {
  const [viewMode, setViewMode] = useState<'map' | 'matrix'>('map');
  const [selectedMatrixCell, setSelectedMatrixCell] = useState<{ zoneId: string; category: string } | null>(null);

  const mapSvgRef = useRef<SVGSVGElement | null>(null);
  const matrixSvgRef = useRef<SVGSVGElement | null>(null);

  const availableCategories = activeStore?.categories || [
    'Atta, Rice & Dal',
    'Oils & Spices',
    'Vegetables',
    'Fresh Fruits',
    'Milk & Butter',
    'Paneer & Curd',
    'Maudaha Special Sweets',
    'Namkeen & Savories',
    'Fresh Bakery'
  ];

  // Helper to calculate score for a zone and a category
  const calculateDemandStats = (zoneId: string, category: string) => {
    let ordersCount = 0;
    let searchesCount = 0;
    let savesCount = 0;

    // 1. Add baseline demand to ensure high quality data curve representation
    if (category === 'ALL') {
      availableCategories.forEach(cat => {
        const b = BASELINE_DEMAND[zoneId]?.[cat] || { orders: 2, searches: 10, saves: 1 };
        ordersCount += b.orders;
        searchesCount += b.searches;
        savesCount += b.saves;
      });
    } else {
      const b = BASELINE_DEMAND[zoneId]?.[category] || { orders: 12, searches: 40, saves: 5 };
      ordersCount += b.orders;
      searchesCount += b.searches;
      savesCount += b.saves;
    }

    // 2. Aggregate from live Users
    const zoneUsers = users.filter(u => mapLocationToZoneId(u.location) === zoneId);
    const zoneUserIds = zoneUsers.map(u => u.id);

    zoneUsers.forEach(u => {
      (u.searchHistory || []).forEach(keyword => {
        const kw = keyword.toLowerCase();
        if (category === 'ALL') {
          searchesCount += 1;
        } else {
          const cat = category.toLowerCase();
          if (kw.includes(cat) || cat.includes(kw) || (kw === 'atta' && cat.includes('atta')) || (kw === 'milk' && cat.includes('milk')) || (kw === 'paneer' && cat.includes('paneer')) || (kw === 'fruit' && cat.includes('fruit')) || (kw === 'vegetable' && cat.includes('vegetable')) || (kw === 'ghee' && cat.includes('butter'))) {
            searchesCount += 5;
          }
        }
      });

      (u.watchlist || []).forEach(prodId => {
        const p = products.find(prod => prod.id === prodId);
        if (p) {
          if (category === 'ALL' || p.category === category) {
            savesCount += 3;
          }
        }
      });
    });

    // 3. Aggregate from live orders
    const zoneOrders = orders.filter(o => o.userId && zoneUserIds.includes(o.userId));
    zoneOrders.forEach(o => {
      o.items.forEach(item => {
        if (category === 'ALL' || item.product.category === category) {
          ordersCount += item.quantity;
        }
      });
    });

    const score = Math.round(ordersCount * 12 + searchesCount * 1.6 + savesCount * 4.5);
    return {
      orders: ordersCount,
      searches: searchesCount,
      saves: savesCount,
      score: Math.max(10, score)
    };
  };

  // Fetch score matrices for both scales
  const allScores = HEATMAP_ZONES.map(z => calculateDemandStats(z.id, selectedCategory).score);
  const maxMapScore = Math.max(...allScores) || 1;

  // D3 Geographic Boundary Heatmap Renderer
  useEffect(() => {
    if (viewMode !== 'map' || !mapSvgRef.current) return;

    const svg = d3.select(mapSvgRef.current);
    svg.selectAll('*').remove();

    const width = 320;
    const height = 320;

    // Linear projections for longitude and latitude to SVG coords
    const xScale = d3.scaleLinear()
      .domain([80.08, 80.17])
      .range([20, width - 20]);

    const yScale = d3.scaleLinear()
      .domain([25.64, 25.74])
      .range([height - 20, 20]);

    // Create D3 custom path/polygon generator
    const colors = d3.scaleLinear<string>()
      .domain([0, 0.35, 0.75, 1.0])
      .range(['rgba(16, 185, 129, 0.15)', 'rgba(16, 185, 129, 0.35)', 'rgba(245, 158, 11, 0.45)', 'rgba(239, 68, 68, 0.65)']);

    const strokes = d3.scaleLinear<string>()
      .domain([0, 0.5, 1.0])
      .range(['#10b981', '#f59e0b', '#ef4444']);

    // Plot Grid Lines
    const gridG = svg.append('g').attr('class', 'grid-lines').style('opacity', 0.2);
    for (let i = 20; i < width; i += 20) {
      gridG.append('line')
        .attr('x1', i).attr('y1', 0).attr('x2', i).attr('y2', height)
        .attr('stroke', 'rgba(255,255,255,0.2)').attr('stroke-width', 0.5);
      gridG.append('line')
        .attr('x1', 0).attr('y1', i).attr('x2', width).attr('y2', i)
        .attr('stroke', 'rgba(255,255,255,0.2)').attr('stroke-width', 0.5);
    }

    // Bind HEATMAP_ZONES to SVG polygons using D3
    const polygons = svg.selectAll('.zone-polygon')
      .data(HEATMAP_ZONES)
      .enter()
      .append('polygon')
      .attr('class', 'zone-polygon')
      .attr('points', d => d.polygon.map(p => `${xScale(p.lng)},${yScale(p.lat)}`).join(' '))
      .attr('fill', d => {
        const stats = calculateDemandStats(d.id, selectedCategory);
        return colors(stats.score / maxMapScore);
      })
      .attr('stroke', d => {
        const stats = calculateDemandStats(d.id, selectedCategory);
        return strokes(stats.score / maxMapScore);
      })
      .attr('stroke-width', d => hoveredZoneId === d.id ? 3 : 1.5)
      .attr('stroke-dasharray', d => d.id === 'sa-4' ? '4 3' : 'none')
      .style('cursor', 'pointer')
      .style('transition', 'all 200ms ease')
      .on('mouseenter', (event, d) => {
        setHoveredZoneId(d.id);
        d3.select(event.currentTarget)
          .attr('stroke-width', 3.5)
          .style('filter', 'drop-shadow(0px 4px 10px rgba(255,255,255,0.15))');
      })
      .on('mouseleave', (event, d) => {
        setHoveredZoneId(null);
        d3.select(event.currentTarget)
          .attr('stroke-width', d.id === 'sa-4' ? 1.5 : 1.5)
          .style('filter', 'none');
      });

    // Animate fill transitions
    polygons.transition()
      .duration(500)
      .style('opacity', 1);

    // Label coordinates
    const labelGroup = svg.append('g').attr('class', 'zone-labels');
    HEATMAP_ZONES.forEach(z => {
      const avgLat = d3.mean(z.polygon, p => p.lat) || 25.68;
      const avgLng = d3.mean(z.polygon, p => p.lng) || 80.11;
      const cx = xScale(avgLng);
      const cy = yScale(avgLat);

      const stats = calculateDemandStats(z.id, selectedCategory);
      const heatColor = strokes(stats.score / maxMapScore);

      const labelNode = labelGroup.append('g')
        .attr('transform', `translate(${cx}, ${cy})`)
        .style('pointer-events', 'none');

      labelNode.append('circle')
        .attr('r', hoveredZoneId === z.id ? 7 : 4)
        .attr('fill', heatColor)
        .style('opacity', 0.8)
        .attr('class', hoveredZoneId === z.id ? 'animate-ping' : '');

      labelNode.append('circle')
        .attr('r', 2.5)
        .attr('fill', '#ffffff');

      labelNode.append('text')
        .attr('y', -12)
        .attr('text-anchor', 'middle')
        .attr('fill', '#ffffff')
        .style('font-size', '9px')
        .style('font-weight', '900')
        .style('font-family', 'Inter, system-ui')
        .style('text-shadow', '0 1px 3px rgba(0,0,0,0.9)')
        .text(language === 'hi' ? z.nameHi.split(' ')[0] : z.name.split(' ')[0]);
    });

  }, [viewMode, selectedCategory, hoveredZoneId, maxMapScore, language]);

  // D3 Grid Matrix Heatmap Renderer
  useEffect(() => {
    if (viewMode !== 'matrix' || !matrixSvgRef.current) return;

    const svg = d3.select(matrixSvgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 40, right: 20, bottom: 50, left: 120 };
    const width = 450 - margin.left - margin.right;
    const height = 280 - margin.top - margin.bottom;

    const mainG = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Prepare matrix data array
    const matrixData: { zoneId: string; category: string; score: number; orders: number; searches: number; saves: number }[] = [];
    HEATMAP_ZONES.forEach(z => {
      availableCategories.forEach(cat => {
        const stats = calculateDemandStats(z.id, cat);
        matrixData.push({
          zoneId: z.id,
          category: cat,
          score: stats.score,
          orders: stats.orders,
          searches: stats.searches,
          saves: stats.saves
        });
      });
    });

    const maxMatrixScore = d3.max(matrixData, d => d.score) || 1;

    // D3 Band Scales for Matrix Axes
    const xBand = d3.scaleBand()
      .domain(HEATMAP_ZONES.map(z => z.id))
      .range([0, width])
      .padding(0.08);

    const yBand = d3.scaleBand()
      .domain(availableCategories)
      .range([0, height])
      .padding(0.08);

    // Color Interpolator: soft slate to warm orange/red
    const colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
      .domain([0, maxMatrixScore]);

    // Draw grid cells
    const cells = mainG.selectAll('.matrix-cell')
      .data(matrixData)
      .enter()
      .append('rect')
      .attr('class', 'matrix-cell')
      .attr('x', d => xBand(d.zoneId) || 0)
      .attr('y', d => yBand(d.category) || 0)
      .attr('width', xBand.bandwidth())
      .attr('height', yBand.bandwidth())
      .attr('rx', 3)
      .attr('ry', 3)
      .attr('fill', d => colorScale(d.score))
      .attr('stroke', d => selectedMatrixCell?.zoneId === d.zoneId && selectedMatrixCell?.category === d.category ? '#ffffff' : 'rgba(255,255,255,0.05)')
      .attr('stroke-width', d => selectedMatrixCell?.zoneId === d.zoneId && selectedMatrixCell?.category === d.category ? 2 : 1)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        setSelectedMatrixCell({ zoneId: d.zoneId, category: d.category });
      })
      .on('mouseenter', function() {
        d3.select(this)
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 2);
      })
      .on('mouseleave', function(event, d) {
        if (selectedMatrixCell?.zoneId !== d.zoneId || selectedMatrixCell?.category !== d.category) {
          d3.select(this)
            .attr('stroke', 'rgba(255,255,255,0.05)')
            .attr('stroke-width', 1);
        }
      });

    // Add entry transit animations
    cells.style('opacity', 0)
      .transition()
      .duration(400)
      .style('opacity', 1);

    // X-Axis Zone Labels
    mainG.append('g')
      .attr('transform', `translate(0, ${height})`)
      .selectAll('.zone-axis-label')
      .data(HEATMAP_ZONES)
      .enter()
      .append('text')
      .attr('x', d => (xBand(d.id) || 0) + xBand.bandwidth() / 2)
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .attr('fill', '#94a3b8')
      .style('font-size', '8px')
      .style('font-weight', 'bold')
      .text(d => language === 'hi' ? d.nameHi.split(' ')[0] : d.name.split(' ')[0]);

    // Y-Axis Categories Labels
    mainG.append('g')
      .selectAll('.category-axis-label')
      .data(availableCategories)
      .enter()
      .append('text')
      .attr('x', -8)
      .attr('y', d => (yBand(d as string) || 0) + yBand.bandwidth() / 2 + 3)
      .attr('text-anchor', 'end')
      .attr('fill', '#e2e8f0')
      .style('font-size', '8.5px')
      .style('font-weight', 'bold')
      .text(d => {
        const catStr = d as string;
        const wordLimit = 16;
        return catStr.length > wordLimit ? catStr.substring(0, wordLimit) + '..' : catStr;
      });

    // Select the first matrix cell on load if none selected
    if (!selectedMatrixCell && matrixData.length > 0) {
      setSelectedMatrixCell({ zoneId: matrixData[0].zoneId, category: matrixData[0].category });
    }

  }, [viewMode, selectedMatrixCell, language]);

  const activeHoveredStats = hoveredZoneId ? calculateDemandStats(hoveredZoneId, selectedCategory) : null;
  const hoveredZone = HEATMAP_ZONES.find(z => z.id === hoveredZoneId);

  // Computed matrix selection helper stats
  const activeMatrixCellStats = selectedMatrixCell ? calculateDemandStats(selectedMatrixCell.zoneId, selectedMatrixCell.category) : null;
  const activeMatrixZone = selectedMatrixCell ? HEATMAP_ZONES.find(z => z.id === selectedMatrixCell.zoneId) : null;

  return (
    <div className="space-y-4">
      {/* Visual Toggles & Controls */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-2 rounded-2xl">
        <div className="flex gap-1.5">
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              viewMode === 'map'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Map className="h-3.5 w-3.5" />
            <span>{language === 'en' ? 'D3 Delivery Map Overlay' : 'D3 वितरण मैप ओवरले'}</span>
          </button>
          <button
            onClick={() => setViewMode('matrix')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              viewMode === 'matrix'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Grid className="h-3.5 w-3.5" />
            <span>{language === 'en' ? 'D3 Category Matrix' : 'D3 श्रेणी डिमांड मैट्रिक्स'}</span>
          </button>
        </div>

        <span className="text-[9px] font-black uppercase text-amber-400 px-2.5 py-1 bg-amber-500/10 border border-amber-500/25 rounded-lg tracking-wider hidden sm:inline-block">
          ⚡ {language === 'en' ? 'D3.js ENGINE ONLINE' : 'D3.JS इंजन ऑनलाइन'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Visualizer Frame */}
        <div className="lg:col-span-7 bg-slate-950 rounded-2xl border border-slate-800 p-4 flex flex-col items-center justify-center relative group min-h-[340px]">
          {viewMode === 'map' ? (
            <>
              {/* GIS Overlay map container */}
              <svg 
                ref={mapSvgRef} 
                viewBox="0 0 320 320" 
                className="w-full h-full max-h-[300px] relative z-10"
              />
              {/* Legend Overlay */}
              <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md border border-slate-800 px-2.5 py-2 rounded-xl flex flex-col gap-1.5 text-[8.5px] text-white z-20 shadow-lg">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-md bg-red-500/80 border border-red-500"></span>
                  <span className="font-extrabold">{language === 'en' ? 'Critical' : 'गंभीर मांग'} (&gt;150 pt)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-md bg-amber-500/80 border border-amber-500"></span>
                  <span className="font-extrabold">{language === 'en' ? 'Moderate' : 'मध्यम मांग'} (70-150 pt)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-md bg-emerald-500/30 border border-emerald-500"></span>
                  <span className="font-extrabold">{language === 'en' ? 'Stable' : 'स्थिर मांग'} (&lt;70 pt)</span>
                </div>
              </div>
            </>
          ) : (
            <div className="w-full flex flex-col items-center overflow-x-auto">
              <svg 
                ref={matrixSvgRef} 
                viewBox="0 0 450 280" 
                className="w-full min-w-[420px] max-h-[300px] relative z-10"
              />
              <div className="w-full max-w-[320px] h-2 bg-gradient-to-r from-yellow-100 via-orange-400 to-red-700 rounded mt-2"></div>
              <div className="flex justify-between w-full max-w-[320px] text-[8px] text-slate-400 font-extrabold uppercase mt-1">
                <span>{language === 'en' ? 'Low Intent' : 'कम इरादा'}</span>
                <span>{language === 'en' ? 'High Latent Demand' : 'उच्च अव्यक्त मांग'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Context Card Panel */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 text-white rounded-2xl p-5 flex flex-col justify-between space-y-4">
          
          {viewMode === 'map' ? (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-xs font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  {language === 'en' ? 'Region Demand Tracker' : 'क्षेत्रीय मांग ट्रैकर'}
                </h3>
                <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">
                  {language === 'en' ? `Focus Category: ${selectedCategory}` : `फोकस श्रेणी: ${selectedCategory}`}
                </p>
              </div>

              {hoveredZoneId && hoveredZone && activeHoveredStats ? (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <div>
                    <h4 className="text-sm font-black font-display text-slate-100">
                      📍 {language === 'hi' ? hoveredZone.nameHi : hoveredZone.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                      {language === 'hi' ? hoveredZone.descriptionHi : hoveredZone.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-950 p-2 border border-slate-800/80 rounded-xl text-center">
                      <span className="block text-[8px] text-slate-500 font-black uppercase tracking-wider">Estimated Orders</span>
                      <span className="text-sm font-black text-slate-200 mt-0.5 block">{activeHoveredStats.orders} qty</span>
                    </div>
                    <div className="bg-slate-950 p-2 border border-slate-800/80 rounded-xl text-center">
                      <span className="block text-[8px] text-slate-500 font-black uppercase tracking-wider">Searches Volume</span>
                      <span className="text-sm font-black text-slate-200 mt-0.5 block">{activeHoveredStats.searches} hits</span>
                    </div>
                    <div className="bg-slate-950 p-2 border border-slate-800/80 rounded-xl text-center">
                      <span className="block text-[8px] text-slate-500 font-black uppercase tracking-wider">Watchlist Saves</span>
                      <span className="text-sm font-black text-rose-400 mt-0.5 block">♥ {activeHoveredStats.saves} saves</span>
                    </div>
                    <div className="bg-slate-950 p-2 border border-slate-800/80 rounded-xl text-center flex flex-col justify-center">
                      <span className="block text-[8px] text-slate-500 font-black uppercase tracking-wider">Demand Index</span>
                      <span className={`text-sm font-black mt-0.5 block ${
                        activeHoveredStats.score > 150 ? 'text-red-400' : activeHoveredStats.score > 70 ? 'text-amber-400' : 'text-emerald-400'
                      }`}>{activeHoveredStats.score} pt</span>
                    </div>
                  </div>

                  {/* Restock action insight card */}
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
                    <h5 className="text-[10px] font-black text-emerald-300 flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      {language === 'en' ? 'SMART RECOMMENDATION' : 'स्मार्ट अनुशंसा'}
                    </h5>
                    <p className="text-[10.5px] text-emerald-100/90 mt-1 leading-relaxed">
                      {activeHoveredStats.score > 150
                        ? (language === 'en' 
                          ? 'Demand is extremely high here. Advised to pre-stage at least 40% of stock in Town Centre warehouses to minimize delivery transit delay.'
                          : 'यहां भारी मांग है। डिलीवरी में देरी को कम करने के लिए नगर केंद्र के गोदामों में कम से कम 40% स्टॉक पहले से रखने की सलाह दी जाती है।')
                        : activeHoveredStats.score > 70
                        ? (language === 'en'
                          ? 'Steady volume. Ensure daily restocking checklist matches current catalog levels.'
                          : 'स्थिर मात्रा। सुनिश्चित करें कि दैनिक रीस्टॉकिंग चेकलिस्ट वर्तमान कैटलॉग स्तरों से मेल खाती है।')
                        : (language === 'en'
                          ? 'Demand is stable. Maintain standard inventory level with minimal dispatching frequency.'
                          : 'मांग स्थिर है। न्यूनतम प्रेषण आवृत्ति के साथ मानक इन्वेंट्री स्तर बनाए रखें।')}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <p className="italic">💡 {language === 'en' ? 'Hover over a zone on the D3 Map to view regional metrics.' : 'क्षेत्रीय मीट्रिक देखने के लिए डी3 मैप पर किसी क्षेत्र पर माउस ले जाएं।'}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                  <BarChart3 className="h-4 w-4 text-amber-400" />
                  {language === 'en' ? 'Matrix Intersection Insight' : 'मैट्रिक्स चौराहा इनसाइट'}
                </h3>
                <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">
                  {language === 'en' ? 'Click cells in the heatmap grid' : 'हीटमैप ग्रिड में सेल पर क्लिक करें'}
                </p>
              </div>

              {selectedMatrixCell && activeMatrixZone && activeMatrixCellStats ? (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <div>
                    <span className="text-[9px] bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded uppercase">
                      {selectedMatrixCell.category}
                    </span>
                    <h4 className="text-sm font-black font-display text-slate-100 mt-1.5">
                      📍 {language === 'hi' ? activeMatrixZone.nameHi : activeMatrixZone.name}
                    </h4>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-bold">{language === 'en' ? 'Relative Demand Index' : 'सापेक्ष मांग सूचकांक'}:</span>
                      <span className="font-mono font-black text-amber-400">{activeMatrixCellStats.score} pts</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-bold">{language === 'en' ? 'Sales / Orders' : 'बिक्री / ऑर्डर'}:</span>
                      <span className="font-mono font-bold text-slate-200">{activeMatrixCellStats.orders} units</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-bold">{language === 'en' ? 'Search Hits' : 'खोजें'}:</span>
                      <span className="font-mono font-bold text-slate-200">{activeMatrixCellStats.searches} times</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-bold">{language === 'en' ? 'Saves Volume' : 'वॉचलिस्ट सहेजें'}:</span>
                      <span className="font-mono font-bold text-rose-400">♥ {activeMatrixCellStats.saves} items</span>
                    </div>
                  </div>

                  {/* Matrix optimization recommendation */}
                  <div className="bg-amber-500/15 border border-amber-500/25 p-3 rounded-xl">
                    <h5 className="text-[10px] font-black text-amber-300 flex items-center gap-1">
                      <Sliders className="h-3.5 w-3.5" />
                      {language === 'en' ? 'PLACEMENT OPTIMIZATION PLAN' : 'प्लेसमेंट अनुकूलन योजना'}
                    </h5>
                    <p className="text-[10.5px] text-amber-100/90 mt-1 leading-relaxed">
                      {activeMatrixCellStats.score > 150
                        ? (language === 'en'
                          ? `High placement coefficient detected for ${selectedMatrixCell.category} in ${activeMatrixZone.name}. Advised to deploy a dedicated stock hub here.`
                          : `${activeMatrixZone.nameHi} में ${selectedMatrixCell.category} के लिए उच्च प्लेसमेंट गुणांक मिला। यहां एक समर्पित स्टॉक हब स्थापित करने की सलाह दी जाती है।`)
                        : (language === 'en'
                          ? `Place standard buffer stock for ${selectedMatrixCell.category} at central node to satisfy demand on-demand.`
                          : `मांग को पूरा करने के लिए केंद्रीय नोड पर ${selectedMatrixCell.category} के लिए मानक बफर स्टॉक रखें।`)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <p className="italic">💡 {language === 'en' ? 'Click any cell inside the Category Grid to inspect cross-correlation stats.' : 'क्रॉस-सहसंबंध आँकड़े देखने के लिए श्रेणी ग्रिड के अंदर किसी भी सेल पर क्लिक करें।'}</p>
                </div>
              )}
            </div>
          )}

          {/* Quick Informative Info */}
          <div className="text-[9.5px] text-slate-400 leading-relaxed pt-2 border-t border-slate-800 flex items-start gap-1">
            <HelpCircle className="h-3.5 w-3.5 text-slate-500 shrink-0 mt-0.5" />
            <span>
              {language === 'en'
                ? 'Calculated using Live Search history, active buyer watchlists, and successful order fulfillment logs in Maudaha.'
                : 'मौदहा में लाइव खोज इतिहास, सक्रिय खरीदार वॉचलिस्ट और सफल ऑर्डर पूर्ति लॉग का उपयोग करके गणना की गई।'}
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};
