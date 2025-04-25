import Papa from 'papaparse';

// Function to determine difficulty category based on problem category
export const getDifficultyCategory = (category) => {
  const lowerCategory = category?.toLowerCase() || '';
  
  // Check for difficulty mentioned directly in the category
  if (lowerCategory.includes('very easy')) return 'very-easy';
  if (lowerCategory.includes('easy') && !lowerCategory.includes('very easy')) return 'easy';
  if (lowerCategory.includes('medium')) return 'medium';
  if (lowerCategory.includes('hard')) return 'hard';
  
  // If category doesn't explicitly mention difficulty, look for color indicators
  if (lowerCategory.includes('light blue')) return 'very-easy';
  if (lowerCategory.includes('green')) return 'easy';
  if (lowerCategory.includes('yellow')) return 'medium';
  if (lowerCategory.includes('light red') || lowerCategory.includes('red')) return 'hard';
  
  return 'medium'; // Default category
};

// Function to parse CSV data to our required format
export const parseCSVData = (csvData) => {
  try {
    const parsedData = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true
    });
    
    console.log("CSV Headers:", parsedData.meta.fields);
    console.log("Sample Row:", parsedData.data[0]);
    
    // Check if CSV has fixed columns without headers
    const hasNoHeaders = !parsedData.meta.fields.some(field => 
      field.toLowerCase().includes('problem') || 
      field.toLowerCase().includes('difficulty') ||
      field.toLowerCase().includes('category') ||
      field.toLowerCase().includes('link')
    );
    
    if (hasNoHeaders && parsedData.data.length > 0 && parsedData.data[0] && Object.keys(parsedData.data[0]).length >= 4) {
      // Handle CSV without proper headers (assumes fixed column order)
      console.log("Processing CSV without proper headers, using fixed column order");
      
      // Map column indices to expected names
      const columns = Object.keys(parsedData.data[0]);
      const mappedData = parsedData.data.map((row, index) => {
        const category = row[columns[0]] || '';
        const name = row[columns[1]] || '';
        const difficultyRaw = row[columns[2]] || '';
        const link = row[columns[3]] || '';
        
        // Normalize the difficulty value
        let difficultyClass = '';
        const difficultyLower = difficultyRaw.toLowerCase();
        
        if (difficultyLower.includes('very') || difficultyLower.includes('very-easy')) {
          difficultyClass = 'very-easy';
        } else if (difficultyLower.includes('easy')) {
          difficultyClass = 'easy';
        } else if (difficultyLower.includes('medium')) {
          difficultyClass = 'medium';
        } else if (difficultyLower.includes('hard')) {
          difficultyClass = 'hard';
        } else {
          // If difficulty isn't explicitly provided, derive from category
          difficultyClass = getDifficultyCategory(category);
        }
        
        console.log(`[Fixed Format] Problem: ${name}, Difficulty Raw: ${difficultyRaw}, Mapped: ${difficultyClass}`);
        
        return {
          id: index,
          category,
          name,
          link,
          status: 'Not Started',
          notes: '',
          difficultyClass
        };
      });
      
      return mappedData.filter(item => item.name && item.name.trim() !== '');
    }
    
    // Standard processing for CSV with headers
    return parsedData.data
      .filter(row => row['Problem Name'] && row['Problem Name'].trim() !== '')
      .map((row, index) => {
        // Extract all the relevant fields
        const category = row['Problem Category'] || '';
        const name = row['Problem Name'] || '';
        const link = row['Problem Link'] || '';
        
        // Check for difficulty in any column
        let difficultyClass = '';
        
        // First try explicit Difficulty column
        if (row['Difficulty'] || row['Difficulty Level']) {
          const difficultyValue = row['Difficulty'] || row['Difficulty Level'];
          const difficultyLower = difficultyValue.toLowerCase();
          
          if (difficultyLower.includes('very') || difficultyLower.includes('very-easy')) {
            difficultyClass = 'very-easy';
          } else if (difficultyLower.includes('easy')) {
            difficultyClass = 'easy';
          } else if (difficultyLower.includes('medium')) {
            difficultyClass = 'medium';
          } else if (difficultyLower.includes('hard')) {
            difficultyClass = 'hard';
          }
        }
        
        // If no dedicated difficulty column, try to find difficulty markers in other columns
        if (!difficultyClass) {
          // Check for any column that has 'difficulty' in its name
          Object.keys(row).forEach(key => {
            if (key.toLowerCase().includes('difficult') && row[key]) {
              const difficultyValue = row[key].toLowerCase();
              if (difficultyValue.includes('very') || difficultyValue.includes('very-easy')) {
                difficultyClass = 'very-easy';
              } else if (difficultyValue.includes('easy')) {
                difficultyClass = 'easy';
              } else if (difficultyValue.includes('medium')) {
                difficultyClass = 'medium';
              } else if (difficultyValue.includes('hard')) {
                difficultyClass = 'hard';
              }
            }
          });
          
          // If still no difficulty found, derive from category
          if (!difficultyClass) {
            difficultyClass = getDifficultyCategory(category);
          }
        }
        
        console.log(`[Header Format] Problem: ${name}, Difficulty: ${difficultyClass}`);
        
        return {
          id: index,
          category,
          name,
          link,
          status: 'Not Started',
          notes: '',
          difficultyClass
        };
      });
  } catch (error) {
    console.error("Error parsing CSV data:", error);
    console.error(error.stack);
    return [];
  }
};

// Helper function to extract difficulty from any field
function getDifficultyFromField(value) {
  if (!value) return '';
  
  const lowerValue = value.toLowerCase();
  
  // Check for explicit difficulty mentions
  if (lowerValue.includes('very easy')) return 'very-easy';
  if (lowerValue.includes('easy') && !lowerValue.includes('very easy')) return 'easy';
  if (lowerValue.includes('medium')) return 'medium';
  if (lowerValue.includes('hard')) return 'hard';
  
  // Check for color/level indicators
  if (lowerValue.includes('light blue') || lowerValue.includes('level 1')) return 'very-easy';
  if (lowerValue.includes('green') || lowerValue.includes('level 2')) return 'easy';
  if (lowerValue.includes('yellow') || lowerValue.includes('level 3')) return 'medium';
  if (lowerValue.includes('light red') || lowerValue.includes('red') || lowerValue.includes('level 4')) return 'hard';
  
  return '';
}

// Function to save data to local storage
export const saveToLocalStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Function to load data from local storage
export const loadFromLocalStorage = (key) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

// Function to export data as CSV
export const exportToCSV = (data) => {
  const csvRows = [];
  
  // Add header row
  csvRows.push(['Problem Category', 'Problem Name', 'Problem Link', 'Status', 'Notes']);
  
  // Add data rows
  data.forEach(item => {
    csvRows.push([
      item.category,
      item.name,
      item.link,
      item.status,
      item.notes
    ]);
  });
  
  // Convert to CSV string
  const csvContent = csvRows.map(row => row.map(cell => 
    typeof cell === 'string' ? `"${cell.replace(/"/g, '""')}"` : cell
  ).join(',')).join('\n');
  
  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'dsa_tracker.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}; 