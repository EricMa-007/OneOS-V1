/**
 * OneOS 数据可视化核心
 * 从data-visualization-engine提取
 * 包含统计计算、数据处理、趋势分析
 * 
 * 作者：A07 梅罗文加（算法工程师）+ A09 珀耳塞福涅（文档主管）
 */

import {
  ChartDataPoint,
  StatisticsResult,
  TrendResult,
  AggregationResult,
} from './visualization-types';

/**
 * 统计计算
 */
export class Statistics {
  /**
   * 计算完整统计信息
   */
  static calculate(data: number[]): StatisticsResult {
    if (data.length === 0) {
      return {
        count: 0, sum: 0, mean: 0, median: 0, mode: [],
        variance: 0, standardDeviation: 0, min: 0, max: 0,
        range: 0, q1: 0, q3: 0, iqr: 0, skewness: 0, kurtosis: 0,
      };
    }

    const sorted = [...data].sort((a, b) => a - b);
    const count = data.length;
    const sum = data.reduce((a, b) => a + b, 0);
    const mean = sum / count;
    const min = sorted[0];
    const max = sorted[count - 1];
    const range = max - min;

    // 中位数
    const median = count % 2 === 0
      ? (sorted[count / 2 - 1] + sorted[count / 2]) / 2
      : sorted[Math.floor(count / 2)];

    // 众数
    const frequency = new Map<number, number>();
    for (const value of data) {
      frequency.set(value, (frequency.get(value) || 0) + 1);
    }
    const maxFreq = Math.max(...frequency.values());
    const mode = Array.from(frequency.entries())
      .filter(([, freq]) => freq === maxFreq)
      .map(([value]) => value);

    // 方差和标准差
    const variance = data.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / count;
    const standardDeviation = Math.sqrt(variance);

    // 四分位数
    const q1 = Statistics.percentile(sorted, 25);
    const q3 = Statistics.percentile(sorted, 75);
    const iqr = q3 - q1;

    // 偏度
    const skewness = count > 2
      ? (count / ((count - 1) * (count - 2))) *
        data.reduce((sum, value) => sum + Math.pow((value - mean) / standardDeviation, 3), 0)
      : 0;

    // 峰度
    const kurtosis = count > 3
      ? ((count * (count + 1)) / ((count - 1) * (count - 2) * (count - 3))) *
          data.reduce((sum, value) => sum + Math.pow((value - mean) / standardDeviation, 4), 0) -
        (3 * Math.pow(count - 1, 2)) / ((count - 2) * (count - 3))
      : 0;

    return {
      count, sum, mean, median, mode,
      variance, standardDeviation, min, max, range,
      q1, q3, iqr, skewness, kurtosis,
    };
  }

  /**
   * 计算百分位数
   */
  static percentile(sortedData: number[], percentile: number): number {
    if (sortedData.length === 0) return 0;
    const index = (percentile / 100) * (sortedData.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    if (lower === upper) return sortedData[lower];
    const weight = index - lower;
    return sortedData[lower] * (1 - weight) + sortedData[upper] * weight;
  }

  /**
   * 归一化数据（0-1范围）
   */
  static normalize(data: number[]): number[] {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;
    if (range === 0) return data.map(() => 0.5);
    return data.map((value) => (value - min) / range);
  }

  /**
   * 标准化数据（Z-score）
   */
  static standardize(data: number[]): number[] {
    const stats = Statistics.calculate(data);
    if (stats.standardDeviation === 0) return data.map(() => 0);
    return data.map((value) => (value - stats.mean) / stats.standardDeviation);
  }
}

/**
 * 数据处理
 */
export class DataProcessor {
  /**
   * 按类别分组聚合
   */
  static aggregateByCategory(
    data: ChartDataPoint[],
    categoryField: keyof ChartDataPoint = 'category'
  ): AggregationResult {
    const groups = new Map<string, ChartDataPoint[]>();

    for (const point of data) {
      const key = String(point[categoryField] || '未分类');
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(point);
    }

    const result: AggregationResult['groups'] = [];
    let grandTotal = 0;

    for (const [key, groupData] of groups) {
      const values = groupData.map((d) => d.value);
      const stats = Statistics.calculate(values);
      grandTotal += stats.sum;

      result.push({
        key,
        label: key,
        count: stats.count,
        sum: stats.sum,
        mean: stats.mean,
        min: stats.min,
        max: stats.max,
        data: groupData,
      });
    }

    result.sort((a, b) => b.sum - a.sum);

    return {
      groups: result,
      total: result.length,
      grandTotal,
    };
  }

  /**
   * 按时间范围分组
   */
  static groupByTime(
    data: ChartDataPoint[],
    interval: 'hour' | 'day' | 'week' | 'month' | 'year' = 'day'
  ): ChartDataPoint[] {
    const groups = new Map<string, number>();

    for (const point of data) {
      if (!point.timestamp) continue;
      const date = new Date(point.timestamp);
      let key: string;

      switch (interval) {
        case 'hour':
          key = date.toISOString().slice(0, 13);
          break;
        case 'day':
          key = date.toISOString().slice(0, 10);
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().slice(0, 10);
          break;
        case 'month':
          key = date.toISOString().slice(0, 7);
          break;
        case 'year':
          key = date.toISOString().slice(0, 4);
          break;
      }

      groups.set(key, (groups.get(key) || 0) + point.value);
    }

    return Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([label, value]) => ({ label, value }));
  }

  /**
   * 数据平滑（移动平均）
   */
  static movingAverage(data: ChartDataPoint[], windowSize: number = 5): ChartDataPoint[] {
    if (data.length < windowSize) return data;

    const result: ChartDataPoint[] = [];
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - Math.floor(windowSize / 2));
      const end = Math.min(data.length, i + Math.ceil(windowSize / 2));
      const window = data.slice(start, end);
      const avg = window.reduce((sum, d) => sum + d.value, 0) / window.length;

      result.push({
        ...data[i],
        value: avg,
      });
    }

    return result;
  }

  /**
   * 去除异常值（基于IQR）
   */
  static removeOutliers(data: ChartDataPoint[], multiplier: number = 1.5): ChartDataPoint[] {
    const values = data.map((d) => d.value);
    const stats = Statistics.calculate(values);
    const lowerBound = stats.q1 - multiplier * stats.iqr;
    const upperBound = stats.q3 + multiplier * stats.iqr;

    return data.filter((d) => d.value >= lowerBound && d.value <= upperBound);
  }
}

/**
 * 趋势分析
 */
export class TrendAnalyzer {
  /**
   * 线性回归
   */
  static linearRegression(data: ChartDataPoint[]): {
    slope: number;
    intercept: number;
    rSquared: number;
  } {
    if (data.length < 2) return { slope: 0, intercept: 0, rSquared: 0 };

    const n = data.length;
    const xValues = data.map((_, i) => i);
    const yValues = data.map((d) => d.value);

    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
    const sumX2 = xValues.reduce((sum, x) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // R²
    const meanY = sumY / n;
    const ssTotal = yValues.reduce((sum, y) => sum + Math.pow(y - meanY, 2), 0);
    const ssResidual = yValues.reduce(
      (sum, y, i) => sum + Math.pow(y - (slope * xValues[i] + intercept), 2),
      0
    );
    const rSquared = ssTotal > 0 ? 1 - ssResidual / ssTotal : 0;

    return { slope, intercept, rSquared };
  }

  /**
   * 分析趋势
   */
  static analyzeTrend(data: ChartDataPoint[], forecastSteps: number = 5): TrendResult {
    if (data.length < 2) {
      return {
        data,
        trend: 'stable',
        slope: 0,
        intercept: 0,
        rSquared: 0,
        growthRate: 0,
        forecast: [],
      };
    }

    const regression = TrendAnalyzer.linearRegression(data);
    const values = data.map((d) => d.value);

    // 增长率
    const firstValue = values[0] || 1;
    const lastValue = values[values.length - 1];
    const growthRate = firstValue !== 0 ? ((lastValue - firstValue) / Math.abs(firstValue)) * 100 : 0;

    // 趋势判断
    let trend: TrendResult['trend'] = 'stable';
    if (Math.abs(regression.slope) < 0.01) {
      trend = 'stable';
    } else if (regression.slope > 0) {
      trend = 'increasing';
    } else {
      trend = 'decreasing';
    }

    // 波动性检测
    const stats = Statistics.calculate(values);
    if (stats.standardDeviation / Math.abs(stats.mean) > 0.5) {
      trend = 'volatile';
    }

    // 预测
    const forecast: ChartDataPoint[] = [];
    const lastLabel = data[data.length - 1]?.label || '';
    for (let i = 1; i <= forecastSteps; i++) {
      const predictedValue = regression.slope * (data.length + i - 1) + regression.intercept;
      forecast.push({
        label: `${lastLabel}+${i}`,
        value: Math.max(0, predictedValue),
      });
    }

    return {
      data,
      trend,
      slope: regression.slope,
      intercept: regression.intercept,
      rSquared: regression.rSquared,
      growthRate,
      forecast,
    };
  }

  /**
   * 计算同比增长率
   */
  static calculateYoYGrowth(current: ChartDataPoint[], previous: ChartDataPoint[]): number {
    const currentSum = current.reduce((sum, d) => sum + d.value, 0);
    const previousSum = previous.reduce((sum, d) => sum + d.value, 0);
    if (previousSum === 0) return 0;
    return ((currentSum - previousSum) / previousSum) * 100;
  }
}
