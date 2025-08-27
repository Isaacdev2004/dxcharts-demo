import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

/**
 * Professional Chart Component using Chart.js
 */
const DXChartComponent = ({ data, showMovingAverage = false }) => {
  const [chartStatus, setChartStatus] = useState('ready');

  if (!data || data.length === 0) {
    return (
      <div style={{
        width: '800px',
        height: '400px',
        border: '2px solid #e0e0e0',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa',
        color: '#666'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '15px' }}>📄</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold' }}>No Data Available</div>
          <div style={{ fontSize: '12px', marginTop: '5px' }}>Please load CSV data first</div>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const labels = data.map(item => {
    const date = new Date(item.timestamp);
    return date.toLocaleTimeString();
  });

  const priceData = data.map(item => Number(item.hamValue) || 0);

  // Calculate moving average
  const calculateMovingAverage = (values, period = 20) => {
    const result = [];
    for (let i = 0; i < values.length; i++) {
      if (i < period - 1) {
        result.push(null);
      } else {
        const sum = values.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
        result.push(sum / period);
      }
    }
    return result;
  };

  const maData = showMovingAverage ? calculateMovingAverage(priceData, 20) : [];

  const chartData = {
    labels,
    datasets: [
      {
        label: '23-27# Trmd Selected Ham ($)',
        data: priceData,
        borderColor: '#2196F3',
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        borderWidth: 3,
        tension: 0.1,
        pointRadius: 2,
        pointHoverRadius: 6,
      },
      ...(showMovingAverage ? [{
        label: 'Moving Average (20)',
        data: maData,
        borderColor: '#FF9800',
        backgroundColor: 'rgba(255, 152, 0, 0.1)',
        borderWidth: 2,
        borderDash: [5, 5],
        tension: 0.1,
        pointRadius: 1,
        pointHoverRadius: 4,
      }] : []),
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        display: true,
        labels: {
          padding: 20,
          usePointStyle: true,
        }
      },
      title: {
        display: true,
        text: '23-27# Trmd Selected Ham - Price Chart',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            const time = data[context.dataIndex] ? new Date(data[context.dataIndex].timestamp).toLocaleString() : '';
            const volume = data[context.dataIndex] ? data[context.dataIndex].volume : 0;
            
            if (label.includes('Moving Average')) {
              return `${label}: $${value?.toFixed(2) || 'N/A'}`;
            }
            
            return [
              `${label}: $${value?.toFixed(2)}`,
              `Time: ${time}`,
              `Volume: ${volume?.toLocaleString()} lbs`
            ];
          }
        }
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time'
        },
        ticks: {
          maxTicksLimit: 10
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Price ($)'
        },
        beginAtZero: false
      },
    },
  };

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', position: 'relative' }}>
      {/* Chart Status Indicator */}
      <div style={{
        position: 'absolute',
        top: '15px',
        right: '15px',
        background: '#28a745',
        color: 'white',
        padding: '6px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: 'bold',
        zIndex: 100,
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }}>
        ✅ Chart Ready
      </div>

      {/* Main Chart Container */}
      <div style={{
        width: '800px',
        height: '400px',
        border: '2px solid #28a745',
        borderRadius: '8px',
        backgroundColor: 'white',
        position: 'relative',
        padding: '10px'
      }}>
        <Line data={chartData} options={options} />
      </div>

      {/* Chart Instructions */}
      <div style={{
        marginTop: '15px',
        textAlign: 'center',
        color: '#666',
        fontSize: '14px',
        padding: '10px'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>🎯 Chart Features:</div>
        <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
          • <strong>Hover:</strong> Move mouse over chart for detailed tooltips<br/>
          • <strong>Zoom:</strong> Interactive data visualization<br/>
          • <strong>Legend:</strong> Shows Price and Moving Average series<br/>
          • <strong>Professional:</strong> Chart.js powered visualization
        </div>
      </div>
    </div>
  );
};

export default DXChartComponent;