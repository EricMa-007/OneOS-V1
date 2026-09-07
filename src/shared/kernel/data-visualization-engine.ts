/**
 * OneOS 数据可视化引擎
 * 主引擎类，整合统计计算、数据处理、趋势分析、颜色方案
 * 
 * 由 A11 梅罗文加（首席算法科学家）+ A10 珀耳塞福涅（文档主管）联合设计
 * 
 * 核心功能：
 * - 图表数据处理（聚合/分组/归一化）
 * - 统计计算（均值/中位数/方差/标准差/百分位）
 * - 趋势分析（移动平均/增长率/预测）
 * - 颜色方案（分类/顺序/发散）
 * - 图表配置生成
 */

import {
  ChartDataPoint,
  ChartDataset,
  ChartConfig,
  StatisticsResult,
  TrendResult,
  AggregationResult,
  ColorPalette,
  COLOR_PALETTES,
} from './visualization/visualization-types';
import { Statistics, DataProcessor, TrendAnalyzer } from './visualization/visualization-core';

// 重新导出类型，保持向后兼容
export type {
  ChartDataPoint,
  ChartDataset,
  ChartConfig,
  StatisticsResult,
  TrendResult,
  AggregationResult,
  ColorPalette,
  ChartType,
  ColorScheme,
  AxisConfig,
  TooltipConfig,
} from './visualization/visualization-types';

// 重新导出颜色调色板
export { COLOR_PALETTES } from './visualization/visualization-types';

// 重新导出核心类
export { Statistics, DataProcessor, TrendAnalyzer } from './visualization/visualization-core';

/**
 * 数据可视化引擎
 */
export class DataVisualizationEngine {
  private defaultColorScheme: ColorPalette = COLOR_PALETTES[0];

  /**
   * 计算统计信息
   */
  calculateStatistics(data: ChartDataPoint[]): StatisticsResult {
    const values = data.map((d) => d.value);
    return Statistics.calculate(values);
  }

  /**
   * 按类别聚合
   */
  aggregateByCategory(
    data: ChartDataPoint[],
    categoryField: keyof ChartDataPoint = 'category'
  ): AggregationResult {
    return DataProcessor.aggregateByCategory(data, categoryField);
  }

  /**
   * 按时间分组
   */
  groupByTime(
    data: ChartDataPoint[],
    interval: 'hour' | 'day' | 'week' | 'month' | 'year' = 'day'
  ): ChartDataPoint[] {
    return DataProcessor.groupByTime(data, interval);
  }

  /**
   * 移动平均平滑
   */
  movingAverage(data: ChartDataPoint[], windowSize: number = 5): ChartDataPoint[] {
    return DataProcessor.movingAverage(data, windowSize);
  }

  /**
   * 去除异常值
   */
  removeOutliers(data: ChartDataPoint[], multiplier: number = 1.5): ChartDataPoint[] {
    return DataProcessor.removeOutliers(data, multiplier);
  }

  /**
   * 归一化数据
   */
  normalize(data: ChartDataPoint[]): ChartDataPoint[] {
    const values = data.map((d) => d.value);
    const normalized = Statistics.normalize(values);
    return data.map((d, i) => ({ ...d, value: normalized[i] }));
  }

  /**
   * 标准化数据（Z-score）
   */
  standardize(data: ChartDataPoint[]): ChartDataPoint[] {
    const values = data.map((d) => d.value);
    const standardized = Statistics.standardize(values);
    return data.map((d, i) => ({ ...d, value: standardized[i] }));
  }

  /**
   * 趋势分析
   */
  analyzeTrend(data: ChartDataPoint[], forecastSteps: number = 5): TrendResult {
    return TrendAnalyzer.analyzeTrend(data, forecastSteps);
  }

  /**
   * 线性回归
   */
  linearRegression(data: ChartDataPoint[]): {
    slope: number;
    intercept: number;
    rSquared: number;
  } {
    return TrendAnalyzer.linearRegression(data);
  }

  /**
   * 获取颜色方案
   */
  getColorPalette(name?: string): ColorPalette {
    if (!name) return this.defaultColorScheme;
    return COLOR_PALETTES.find((p) => p.name === name) || this.defaultColorScheme;
  }

  /**
   * 获取所有颜色方案
   */
  getAllColorPalettes(): ColorPalette[] {
    return COLOR_PALETTES;
  }

  /**
   * 设置默认颜色方案
   */
  setDefaultColorScheme(name: string): void {
    const palette = COLOR_PALETTES.find((p) => p.name === name);
    if (palette) {
      this.defaultColorScheme = palette;
    }
  }

  /**
   * 生成图表配置
   */
  generateChartConfig(
    type: ChartConfig['type'],
    title: string,
    data: ChartDataPoint[],
    options?: Partial<ChartConfig['options']>
  ): ChartConfig {
    const colors = this.defaultColorScheme.colors;

    const dataset: ChartDataset = {
      label: title,
      data,
      backgroundColor: type === 'pie' || type === 'doughnut'
        ? data.map((_, i) => colors[i % colors.length])
        : colors[0],
      borderColor: colors[0],
    };

    return {
      type,
      title,
      datasets: [dataset],
      options: {
        responsive: true,
        maintainAspectRatio: false,
        showLegend: type === 'pie' || type === 'doughnut',
        showGrid: true,
        showLabels: true,
        animation: true,
        colorScheme: this.defaultColorScheme.scheme,
        ...options,
      },
    };
  }

  /**
   * 生成多数据集图表配置
   */
  generateMultiDatasetChart(
    type: ChartConfig['type'],
    title: string,
    datasets: Array<{ label: string; data: ChartDataPoint[] }>,
    options?: Partial<ChartConfig['options']>
  ): ChartConfig {
    const colors = this.defaultColorScheme.colors;

    const chartDatasets: ChartDataset[] = datasets.map((ds, i) => ({
      label: ds.label,
      data: ds.data,
      backgroundColor: colors[i % colors.length],
      borderColor: colors[i % colors.length],
    }));

    return {
      type,
      title,
      datasets: chartDatasets,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        showLegend: true,
        showGrid: true,
        showLabels: true,
        animation: true,
        colorScheme: this.defaultColorScheme.scheme,
        ...options,
      },
    };
  }

  /**
   * 全量数据分析
   */
  fullAnalysis(data: ChartDataPoint[]): {
    statistics: StatisticsResult;
    trend: TrendResult;
    chartConfig: ChartConfig;
  } {
    const statistics = this.calculateStatistics(data);
    const trend = this.analyzeTrend(data);
    const chartConfig = this.generateChartConfig('line', '数据分析', data);

    return { statistics, trend, chartConfig };
  }
}

// 单例实例
export const dataVisualizationEngine = new DataVisualizationEngine();

export default DataVisualizationEngine;
