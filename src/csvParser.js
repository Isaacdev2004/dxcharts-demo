import Papa from 'papaparse';

/**
 * Parse CSV data and format it for DXCharts time series visualization
 * @param {string} csvText - Raw CSV text content
 * @returns {Promise<Array>} - Formatted data array for DXCharts
 */
export const parseCSVForCharts = (csvText) => {
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          console.warn('CSV parsing warnings:', results.errors);
        }

        try {
          const formattedData = results.data
            .filter(row => row['Date'] && row['Time'] && row['23-27# Trmd Selected Ham'])
            .map(row => {
              // Combine date and time into a timestamp
              const dateTimeString = `${row['Date']}T${row['Time']}`;
              const timestamp = new Date(dateTimeString).getTime();

              // Extract the target column value
              const hamValue = parseFloat(row['23-27# Trmd Selected Ham']);

              // Additional data for context
              const volume = parseInt(row['Volume']) || 0;
              const open = parseFloat(row['Open']) || hamValue;
              const high = parseFloat(row['High']) || hamValue;
              const low = parseFloat(row['Low']) || hamValue;
              const close = parseFloat(row['Close']) || hamValue;

              return {
                timestamp,
                hamValue,
                volume,
                open,
                high,
                low,
                close,
                dateTime: dateTimeString
              };
            })
            .sort((a, b) => a.timestamp - b.timestamp); // Ensure chronological order

          resolve(formattedData);
        } catch (error) {
          reject(new Error(`Failed to format CSV data: ${error.message}`));
        }
      },
      error: (error) => {
        reject(new Error(`CSV parsing failed: ${error.message}`));
      }
    });
  });
};

/**
 * Calculate moving average for technical indicator
 * @param {Array} data - Time series data array
 * @param {number} period - Period for moving average calculation
 * @returns {Array} - Data with moving average added
 */
export const calculateMovingAverage = (data, period = 20) => {
  return data.map((item, index) => {
    if (index < period - 1) {
      return { ...item, movingAverage: null };
    }

    const sum = data
      .slice(index - period + 1, index + 1)
      .reduce((acc, curr) => acc + curr.hamValue, 0);

    const movingAverage = sum / period;

    return { ...item, movingAverage };
  });
};

/**
 * Load CSV file from public directory
 * @param {string} filename - CSV filename in public directory
 * @returns {Promise<string>} - CSV content as text
 */
export const loadCSVFile = async (filename) => {
  try {
    const response = await fetch(`/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to load CSV file: ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    throw new Error(`Error loading CSV file: ${error.message}`);
  }
};
