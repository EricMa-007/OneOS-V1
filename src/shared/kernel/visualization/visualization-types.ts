/**
 * OneOS 数据可视化类型定义
 * 从data-visualization-engine提取
 * 
 * 作者：A07 梅罗文加（算法工程师）+ A09 珀耳塞福涅（文档主管）
 */

export type ChartType = 'bar' | 'line' | 'pie' | 'doughnut' | 'area' | 'scatter' | 'radar' | 'heatmap';
export type ColorScheme = 'categorical' | 'sequential' | 'diverging' | 'qualitative' | 'monochrome';

export interface ChartDataPoint {
  label: string;
  value: number;
  category?: string;
  timestamp?: number;
  metadata?: Record<string, unknown>;
}

export interface ChartDataset {
  label: string;
  data: ChartDataPoint[];
  color?: string;
  borderColor?: string;
  backgroundColor?: string;
}

export interface AxisConfig {
  title?: string;
  min?: number;
  max?: number;
  tickCount?: number;
  format?: 'number' | 'percentage' | 'currency' | 'date' | 'time';
  gridLines?: boolean;
}

export interface TooltipConfig {
  enabled?: boolean;
  format?: string;
  callbacks?: {
    label?: (data: ChartDataPoint) => string;
    title?: (data: ChartDataPoint[]) => string;
  };
}

export interface ChartConfig {
  type: ChartType;
  title: string;
  subtitle?: string;
  datasets: ChartDataset[];
  options: {
    responsive?: boolean;
    maintainAspectRatio?: boolean;
    showLegend?: boolean;
    showGrid?: boolean;
    showLabels?: boolean;
    animation?: boolean;
    colorScheme?: ColorScheme;
    xAxis?: AxisConfig;
    yAxis?: AxisConfig;
    tooltip?: TooltipConfig;
  };
}

export interface StatisticsResult {
  count: number;
  sum: number;
  mean: number;
  median: number;
  mode: number[];
  variance: number;
  standardDeviation: number;
  min: number;
  max: number;
  range: number;
  q1: number;
  q3: number;
  iqr: number;
  skewness: number;
  kurtosis: number;
}

export interface TrendResult {
  data: ChartDataPoint[];
  trend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  slope: number;
  intercept: number;
  rSquared: number;
  growthRate: number;
  forecast: ChartDataPoint[];
}

export interface ColorPalette {
  name: string;
  scheme: ColorScheme;
  colors: string[];
  description: string;
}

export interface AggregationResult {
  groups: Array<{
    key: string;
    label: string;
    count: number;
    sum: number;
    mean: number;
    min: number;
    max: number;
    data: ChartDataPoint[];
  }>;
  total: number;
  grandTotal: number;
}

// 预设颜色调色板
export const COLOR_PALETTES: ColorPalette[] = [
  {
    name: 'OneOS 默认',
    scheme: 'categorical',
    colors: ['#8B5CF6', '#00CEC9', '#FD79A8', '#FDCB6E', '#0984E3', '#00B894', '#E17055', '#6C5CE7'],
    description: 'OneOS品牌色系，适合分类数据',
  },
  {
    name: '柔和渐变',
    scheme: 'sequential',
    colors: ['#E0E7FF', '#C7D2FE', '#A5B4FC', '#818CF8', '#6366F1', '#4F46E5', '#4338CA', '#3730A3'],
    description: '蓝紫色渐变，适合顺序数据',
  },
  {
    name: '冷暖发散',
    scheme: 'diverging',
    colors: ['#DC2626', '#EF4444', '#F87171', '#FCA5A5', '#FECACA', '#DBEAFE', '#93C5FD', '#60A5FA', '#3B82F6', '#2563EB', '#1D4ED8'],
    description: '红蓝发散，适合对比数据',
  },
  {
    name: '自然清新',
    scheme: 'qualitative',
    colors: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#FCD34D', '#FBBF24', '#F59E0B', '#D97706'],
    description: '绿黄渐变，适合自然主题',
  },
  {
    name: '单色蓝',
    scheme: 'monochrome',
    colors: ['#EFF6FF', '#DBEAFE', '#BFDBFE', '#93C5FD', '#60A5FA', '#3B82F6', '#2563EB', '#1D4ED8', '#1E40AF', '#1E3A8A'],
    description: '蓝色单色渐变，适合专业场景',
  },
];
