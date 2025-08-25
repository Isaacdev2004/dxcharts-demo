import React, { useEffect, useRef } from 'react';
import { createChart } from '@devexperts/dxcharts-lite';

/**
 * DXCharts Component for displaying time series data
 */
const DXChartComponent = ({ data, showMovingAverage = false }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0 || !chartRef.current) return;

    // Clean up previous instance
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    // Format data for DXCharts - convert to OHLC format for better compatibility
    const chartData = data.map(item => ({
      time: item.timestamp,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      volume: item.volume,
      hamValue: item.hamValue,
      movingAverage: item.movingAverage || null
    }));

    // Chart configuration for DXCharts
    const config = {
      width: 800,
      height: 400,
      data: chartData,
      timeFrame: '15m',
      timezone: 'UTC',
      layout: {
        background: { type: 'solid', color: 'white' },
        textColor: 'black',
      },
      grid: {
        vertLines: {
          color: 'rgba(197, 203, 206, 0.5)',
        },
        horzLines: {
          color: 'rgba(197, 203, 206, 0.5)',
        },
      },
      crosshair: {
        mode: 'normal',
      },
      rightPriceScale: {
        borderColor: 'rgba(197, 203, 206, 0.8)',
      },
      timeScale: {
        borderColor: 'rgba(197, 203, 206, 0.8)',
        timeVisible: true,
        secondsVisible: false,
      },
    };

    try {
      // Create chart instance using the correct API
      const chart = createChart(chartRef.current, config);
      chartInstanceRef.current = chart;

      // Add main line series using the specific column data
      const mainSeries = chart.addLineSeries({
        color: '#2196F3',
        lineWidth: 2,
        title: '23-27# Trmd Selected Ham',
      });

      // Set data for main series
      mainSeries.setData(chartData.map(item => ({
        time: Math.floor(item.time / 1000), // Convert to seconds
        value: item.hamValue
      })));

      // Add moving average series if enabled
      if (showMovingAverage) {
        const maSeries = chart.addLineSeries({
          color: '#FF9800',
          lineWidth: 2,
          lineStyle: 1, // Dashed line
          title: 'Moving Average (20)',
        });

        // Filter out null values for moving average
        const maData = chartData
          .filter(item => item.movingAverage !== null)
          .map(item => ({
            time: Math.floor(item.time / 1000),
            value: item.movingAverage
          }));

        maSeries.setData(maData);
      }

      // Add volume histogram
      const volumeSeries = chart.addHistogramSeries({
        color: '#26a69a',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: '',
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });

      volumeSeries.setData(chartData.map(item => ({
        time: Math.floor(item.time / 1000),
        value: item.volume,
        color: item.close > item.open ? '#26a69a' : '#ef5350'
      })));

      // Apply the chart to the container
      chart.timeScale().fitContent();

    } catch (error) {
      console.error('Error creating DXCharts instance:', error);
    }

    // Cleanup function
    return () => {
      if (chartInstanceRef.current) {
        try {
          chartInstanceRef.current.destroy();
        } catch (error) {
          console.warn('Error destroying chart:', error);
        }
        chartInstanceRef.current = null;
      }
    };
  }, [data, showMovingAverage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (chartInstanceRef.current) {
        try {
          chartInstanceRef.current.destroy();
        } catch (error) {
          console.warn('Error destroying chart on unmount:', error);
        }
        chartInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="dx-chart-container">
      <div
        ref={chartRef}
        style={{
          width: '100%',
          height: '400px',
          border: '1px solid #e0e0e0',
          borderRadius: '4px'
        }}
      />
    </div>
  );
};

export default DXChartComponent;
