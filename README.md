# DXCharts Integration Demo

A professional React application demonstrating the integration of **Devexperts DXCharts** with CSV data visualization for financial time series data.

## 🚀 Live Demo

**Access the application at:** [http://localhost:5173](http://localhost:5173)

## 📊 Features

### Core Functionality
- ✅ **Official DXCharts Integration** - Using Devexperts DXCharts Lite library
- ✅ **CSV Data Processing** - Automated parsing and formatting of financial data
- ✅ **Interactive Time Series Chart** - Professional financial charting capabilities
- ✅ **Real-time Data Visualization** - Dynamic chart updates with data changes

### Chart Features
- 📈 **Price Line Series** - Main data visualization for 23-27# Trmd Selected Ham
- 📊 **Moving Average (20)** - Optional technical indicator (toggleable)
- 📦 **Volume Histogram** - Trading volume visualization with color coding
- 🎯 **Interactive Legend** - Price, MA(20), and Volume series identification
- 💬 **Hover Tooltips** - Detailed data information on mouse hover

### User Interactions
- **Zoom Control** - Mouse wheel zoom in/out functionality
- **Pan Navigation** - Click and drag to navigate through time periods
- **Crosshair Mode** - Precise data point targeting
- **Responsive Design** - Optimized for desktop and mobile viewing

## 🛠️ Technical Implementation

### Dependencies

#### Core Libraries
```json
{
  "@devexperts/dxcharts-lite": "^2.7.15",
  "papaparse": "^5.5.3",
  "react": "^19.1.1",
  "react-dom": "^19.1.1"
}
```

#### Development Tools
```json
{
  "vite": "^7.1.2"
}
```

### DXCharts Integration Code

#### 1. Chart Initialization
```javascript
import { createChart } from '@devexperts/dxcharts-lite';

// Create DXCharts instance
const chart = createChart(containerElement, {
  width: 800,
  height: 400,
  layout: {
    background: { type: 'solid', color: 'white' },
    textColor: 'black',
  },
  grid: {
    vertLines: { color: 'rgba(197, 203, 206, 0.5)' },
    horzLines: { color: 'rgba(197, 203, 206, 0.5)' },
  },
  crosshair: { mode: 'normal' },
  rightPriceScale: {
    borderColor: 'rgba(197, 203, 206, 0.8)',
    visible: true,
  },
  timeScale: {
    borderColor: 'rgba(197, 203, 206, 0.8)',
    timeVisible: true,
    secondsVisible: false,
  },
});
```

#### 2. Adding Series
```javascript
// Main price series
const mainSeries = chart.addLineSeries({
  color: '#2196F3',
  lineWidth: 3,
  title: '23-27# Trmd Selected Ham',
  priceFormat: {
    type: 'price',
    precision: 2,
    minMove: 0.01,
  },
});

// Moving average series
const maSeries = chart.addLineSeries({
  color: '#FF9800',
  lineWidth: 2,
  lineStyle: 1, // Dashed line
  title: 'Moving Average (20)',
});

// Volume histogram series
const volumeSeries = chart.addHistogramSeries({
  color: '#26a69a',
  title: 'Volume',
  priceScaleId: '',
  scaleMargins: {
    top: 0.8,
    bottom: 0,
  },
});
```

#### 3. Data Formatting
```javascript
// Format data for DXCharts
const chartData = data.map(item => ({
  time: Math.floor(item.timestamp / 1000), // Unix timestamp in seconds
  value: Number(item.hamValue) || 0,
  volume: Number(item.volume) || 0,
  open: Number(item.open) || Number(item.hamValue) || 0,
  high: Number(item.high) || Number(item.hamValue) || 0,
  low: Number(item.low) || Number(item.hamValue) || 0,
  close: Number(item.close) || Number(item.hamValue) || 0,
}));

// Set data to series
mainSeries.setData(chartData);
```

#### 4. Interactive Features
```javascript
// Crosshair interaction for tooltips
chart.subscribeCrosshairMove((param) => {
  if (param.time) {
    const dataPoint = data.find(item =>
      Math.abs(Math.floor(item.timestamp / 1000) - param.time) < 300
    );

    if (dataPoint) {
      // Update tooltip with data point information
      updateTooltip(dataPoint);
    }
  }
});

// Fit chart content
chart.timeScale().fitContent();
```

## 📁 Project Structure

```
dxcharts-demo/
├── public/
│   └── sample-data.csv          # Financial data sample
├── src/
│   ├── App.jsx                  # Main application component
│   ├── DXChartComponent.jsx     # Official DXCharts integration
│   ├── csvParser.js            # CSV processing utilities
│   ├── main.jsx                # React application entry point
│   └── style.css               # Professional styling
├── package.json                 # Dependencies and scripts
├── vite.config.js              # Vite configuration
└── README.md                   # This documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm installed
- Modern web browser with JavaScript enabled

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Isaacdev2004/dxcharts-demo.git
cd dxcharts-demo
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Open in browser**
```
http://localhost:5173
```

### Build for Production

```bash
npm run build
npm run preview
```

## 🎯 Usage Guide

### Data Requirements
The application expects CSV data with the following structure:
```csv
Date,Time,23-27# Trmd Selected Ham,Volume,Open,High,Low,Close
2024-01-01,09:00:00,122.19,600397,120.00,126.00,120.00,122.19
2024-01-01,09:30:00,122.25,600397,121.00,126.50,121.00,122.25
```

### Interactive Features

1. **Hover Interaction**
   - Move mouse cursor over the chart
   - View detailed tooltip with price, volume, and timestamp information

2. **Zoom Control**
   - Use mouse wheel to zoom in/out
   - Focus on specific time periods for detailed analysis

3. **Pan Navigation**
   - Click and drag on the chart area
   - Navigate through different time periods

4. **Moving Average Toggle**
   - Use the control button to show/hide 20-period moving average
   - Orange dashed line indicates trend direction

## 🏗️ Architecture

### Component Structure

#### App.jsx
- Main application container
- Data loading and state management
- Statistics calculation and display
- Control panel for user interactions

#### DXChartComponent.jsx
- Official DXCharts integration
- Chart initialization and configuration
- Series management (price, volume, moving average)
- Interactive features implementation
- Error handling and loading states

#### csvParser.js
- CSV file processing utilities
- Data validation and formatting
- Moving average calculations
- Error handling for malformed data

### State Management
- React hooks for local state management
- Chart instance lifecycle management
- Data loading and processing states
- Error handling and user feedback

## 🎨 Styling

### Design Principles
- **Professional Appearance** - Clean, modern financial chart design
- **Responsive Layout** - Optimized for various screen sizes
- **Accessibility** - Proper contrast and readable fonts
- **User Feedback** - Loading states and status indicators

### Color Scheme
- **Primary Blue (#2196F3)** - Main price data series
- **Orange (#FF9800)** - Moving average indicator
- **Green (#26a69a)** - Volume histogram
- **Gray Scale** - Professional background and text colors

## 🔧 Configuration

### DXCharts Options
The chart can be customized through the configuration object:

```javascript
const chartConfig = {
  width: 800,              // Chart width in pixels
  height: 400,             // Chart height in pixels
  layout: {                // Chart layout settings
    background: { type: 'solid', color: 'white' },
    textColor: 'black',
  },
  grid: {                  // Grid line configuration
    vertLines: { color: 'rgba(197, 203, 206, 0.5)' },
    horzLines: { color: 'rgba(197, 203, 206, 0.5)' },
  },
  crosshair: { mode: 'normal' },  // Crosshair behavior
  rightPriceScale: {       // Price axis configuration
    borderColor: 'rgba(197, 203, 206, 0.8)',
    visible: true,
  },
  timeScale: {             // Time axis configuration
    borderColor: 'rgba(197, 203, 206, 0.8)',
    timeVisible: true,
    secondsVisible: false,
  },
};
```

## 📊 Data Processing

### CSV Parsing
- Automatic header detection
- Data type conversion (strings to numbers)
- Timestamp parsing and validation
- Error handling for malformed data

### Moving Average Calculation
- 20-period simple moving average
- Null value filtering
- Proper timestamp alignment
- Performance optimized calculation

## 🎥 Video Demonstration

A 2-3 minute screen recording demonstrating:
1. **Application Loading** - Data parsing and chart initialization
2. **Interactive Features** - Zoom, pan, and hover functionality
3. **Legend & Tooltips** - Data visualization and information display
4. **Moving Average Toggle** - Technical indicator demonstration
5. **Professional Presentation** - Clean UI and user experience

## 🔗 Resources

- **Devexperts DXCharts Documentation:** https://devexperts.com/dxcharts/documentation-for-developers/
- **React Documentation:** https://react.dev/
- **PapaParse CSV Library:** https://www.papaparse.com/
- **Vite Build Tool:** https://vitejs.dev/

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project demonstrates the integration of Devexperts DXCharts with React for educational and demonstration purposes.

---

**Built with:** React 19, DXCharts Lite, PapaParse, Vite
**Demo Data:** 23-27# Trmd Selected Ham pricing from financial dataset
**Status:** ✅ Production Ready - Professional DXCharts Implementation
