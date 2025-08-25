import React, { useEffect, useRef, useState } from 'react';

/**
 * Simple HTML5 Canvas Chart Component
 * More reliable than external libraries for basic functionality
 */
const DXChartComponent = ({ data, showMovingAverage = false }) => {
  const canvasRef = useRef(null);
  const [chartStatus, setChartStatus] = useState('loading');
  const [hoveredData, setHoveredData] = useState(null);

  useEffect(() => {
    if (!data || data.length === 0) {
      setChartStatus('no-data');
      return;
    }

    setChartStatus('creating');

    try {
      drawChart(data);
      setChartStatus('ready');
      console.log('Chart drawn successfully with', data.length, 'data points');
    } catch (error) {
      console.error('Chart drawing error:', error);
      setChartStatus('error');
    }
  }, [data, showMovingAverage]);

  const drawChart = (chartData) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);

    // Chart margins
    const margin = { top: 20, right: 20, bottom: 40, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Get data range
    const values = chartData.map(d => Number(d.hamValue) || 0);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const valueRange = maxValue - minValue || 1;

    // Draw grid lines
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;

    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = margin.top + (chartHeight * i) / 5;
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(width - margin.right, y);
      ctx.stroke();

      // Y-axis labels
      const value = maxValue - (valueRange * i) / 5;
      ctx.fillStyle = '#666';
      ctx.font = '12px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(value.toFixed(2), margin.left - 10, y + 4);
    }

    // Vertical grid lines
    for (let i = 0; i <= chartData.length; i++) {
      const x = margin.left + (chartWidth * i) / Math.max(chartData.length - 1, 1);
      ctx.beginPath();
      ctx.moveTo(x, margin.top);
      ctx.lineTo(x, height - margin.bottom);
      ctx.stroke();

      // X-axis labels (time)
      if (i < chartData.length) {
        const time = new Date(chartData[i].timestamp);
        ctx.fillStyle = '#666';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                    x, height - margin.bottom + 15);
      }
    }

    // Draw data line
    if (chartData.length > 1) {
      ctx.strokeStyle = '#2196F3';
      ctx.lineWidth = 3;
      ctx.beginPath();

      chartData.forEach((point, index) => {
        const x = margin.left + (chartWidth * index) / (chartData.length - 1);
        const y = margin.top + chartHeight - ((Number(point.hamValue) - minValue) / valueRange) * chartHeight;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();
    }

    // Draw data points
    ctx.fillStyle = '#2196F3';
    chartData.forEach((point, index) => {
      const x = margin.left + (chartWidth * index) / (chartData.length - 1);
      const y = margin.top + chartHeight - ((Number(point.hamValue) - minValue) / valueRange) * chartHeight;

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw moving average if enabled
    if (showMovingAverage && chartData.length > 20) {
      ctx.strokeStyle = '#FF9800';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();

      let firstPoint = true;
      chartData.forEach((point, index) => {
        if (index >= 19) {
          const sum = chartData.slice(index - 19, index + 1)
            .reduce((acc, curr) => acc + (Number(curr.hamValue) || 0), 0);
          const avg = sum / 20;

          const x = margin.left + (chartWidth * index) / (chartData.length - 1);
          const y = margin.top + chartHeight - ((avg - minValue) / valueRange) * chartHeight;

          if (firstPoint) {
            ctx.moveTo(x, y);
            firstPoint = false;
          } else {
            ctx.lineTo(x, y);
          }
        }
      });

      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw axis labels
    ctx.fillStyle = '#333';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('23-27# Trmd Selected Ham Price Chart', width / 2, 15);

    // Y-axis title
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('Price ($)', 0, 0);
    ctx.restore();

    // X-axis title
    ctx.textAlign = 'center';
    ctx.fillText('Time', width / 2, height - 5);
  };

  const handleMouseMove = (event) => {
    if (!data || data.length === 0) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const margin = { top: 20, right: 20, bottom: 40, left: 60 };
    const chartWidth = canvas.width - margin.left - margin.right;
    const chartHeight = canvas.height - margin.top - margin.bottom;

    // Find closest data point
    const values = data.map(d => Number(d.hamValue) || 0);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const valueRange = maxValue - minValue || 1;

    let closestIndex = 0;
    let minDistance = Infinity;

    data.forEach((point, index) => {
      const dataX = margin.left + (chartWidth * index) / (data.length - 1);
      const dataY = margin.top + chartHeight - ((Number(point.hamValue) - minValue) / valueRange) * chartHeight;

      const distance = Math.sqrt(Math.pow(x - dataX, 2) + Math.pow(y - dataY, 2));

      if (distance < minDistance && distance < 20) { // 20px radius
        minDistance = distance;
        closestIndex = index;
      }
    });

    if (minDistance < 20) {
      setHoveredData(data[closestIndex]);
    } else {
      setHoveredData(null);
    }
  };

  // Show different states
  if (chartStatus === 'loading') {
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
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>📊</div>
          <div>Loading Chart...</div>
        </div>
      </div>
    );
  }

  if (chartStatus === 'no-data') {
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
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>📄</div>
          <div>No Data Available</div>
          <div style={{ fontSize: '12px', marginTop: '5px' }}>Please load CSV data first</div>
        </div>
      </div>
    );
  }

  if (chartStatus === 'error') {
    return (
      <div style={{
        width: '800px',
        height: '400px',
        border: '2px solid #dc3545',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8d7da',
        color: '#721c24'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>⚠️</div>
          <div>Chart Error</div>
          <div style={{ fontSize: '12px', marginTop: '5px' }}>Please check console for details</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', position: 'relative' }}>
      {/* Chart Status Indicator */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: '#28a745',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '11px',
        zIndex: 100
      }}>
        ✅ Chart Ready
      </div>

      {/* Main Chart Canvas */}
      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        onMouseMove={handleMouseMove}
        style={{
          border: '2px solid #28a745',
          borderRadius: '8px',
          backgroundColor: 'white',
          cursor: 'crosshair'
        }}
      />

      {/* Tooltip */}
      {hoveredData && (
        <div style={{
          position: 'absolute',
          top: '50px',
          left: '20px',
          background: 'rgba(0,0,0,0.9)',
          color: 'white',
          padding: '12px',
          borderRadius: '6px',
          fontSize: '13px',
          minWidth: '200px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          zIndex: 1000,
          pointerEvents: 'none'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>📊 Data Point</div>
          <div>⏰ Time: {new Date(hoveredData.timestamp).toLocaleString()}</div>
          <div>📈 Value: ${Number(hoveredData.hamValue).toFixed(2)}</div>
          <div>📦 Volume: {hoveredData.volume}</div>
          {showMovingAverage && <div>📊 MA(20): Available</div>}
        </div>
      )}

      {/* Chart Instructions */}
      <div style={{
        marginTop: '10px',
        textAlign: 'center',
        color: '#666',
        fontSize: '14px'
      }}>
        <div><strong>📈 Interactive Chart Features:</strong></div>
        <div style={{ fontSize: '12px', marginTop: '5px' }}>
          • Hover over data points for details<br/>
          • This is a simple HTML5 Canvas chart<br/>
          • Shows your 23-27# Trmd Selected Ham data
        </div>
      </div>
    </div>
  );
};

export default DXChartComponent;
