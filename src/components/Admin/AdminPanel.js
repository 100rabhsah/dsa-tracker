import React, { useState, useEffect } from 'react';
import { getProblems, updateProblems } from '../../utils/firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faPlus, faTrash, faEdit, faTimes, faFileImport, faFilter, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { parseCSVData } from '../../utils/csvUtils';

const AdminPanel = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editIndex, setEditIndex] = useState(-1);
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [filteredProblems, setFilteredProblems] = useState([]);
  
  useEffect(() => {
    fetchProblems();
  }, []);
  
  useEffect(() => {
    if (problems.length > 0) {
      if (difficultyFilter === 'all') {
        setFilteredProblems(problems);
      } else {
        setFilteredProblems(problems.filter(problem => 
          problem.difficultyClass === difficultyFilter));
      }
    }
  }, [problems, difficultyFilter]);
  
  const fetchProblems = async () => {
    setLoading(true);
    try {
      const problemData = await getProblems();
      if (problemData && problemData.length > 0) {
        setProblems(problemData);
        setFilteredProblems(problemData);
      } else {
        // No problems found in the database, start with an empty array
        setProblems([]);
        setFilteredProblems([]);
      }
    } catch (err) {
      setError('Failed to load problems. Please try again.');
      console.error(err);
    }
    setLoading(false);
  };
  
  const getDifficultyClass = (category) => {
    const lowerCategory = category?.toLowerCase() || '';
    
    // Check for difficulty mentioned directly in the category
    if (lowerCategory.includes('very easy')) return 'very-easy';
    if (lowerCategory.includes('easy') && !lowerCategory.includes('very easy')) return 'easy';
    if (lowerCategory.includes('medium')) return 'medium';
    if (lowerCategory.includes('hard')) return 'hard';
    
    // Check for color/level indicators
    if (lowerCategory.includes('light blue') || lowerCategory.includes('level 1')) return 'very-easy';
    if (lowerCategory.includes('green') || lowerCategory.includes('level 2')) return 'easy';
    if (lowerCategory.includes('yellow') || lowerCategory.includes('level 3')) return 'medium';
    if (lowerCategory.includes('light red') || lowerCategory.includes('red') || lowerCategory.includes('level 4')) return 'hard';
    
    return 'medium'; // Default category
  };
  
  const handleSaveProblems = async () => {
    setError('');
    setSuccess('');
    try {
      // Add timestamp to all problems to force refresh on all clients
      const timestampedProblems = problems.map(problem => ({
        ...problem,
        lastUpdated: new Date().toISOString()
      }));
      
      // Update Firebase with timestamped problems
      await updateProblems(timestampedProblems);
      
      setSuccess('Problems saved successfully! All users will see the updated data.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save problems. Please try again.');
      console.error(err);
    }
  };
  
  const handleAddProblem = () => {
    const newProblem = {
      id: Date.now(),
      category: 'Medium: Yellow',
      name: 'New Problem',
      link: '',
      status: 'Not Started',
      notes: '',
      difficultyClass: 'medium'
    };
    
    setProblems([...problems, newProblem]);
    setEditIndex(problems.length);
  };
  
  const handleDeleteProblem = (index) => {
    if (window.confirm('Are you sure you want to delete this problem?')) {
      const updatedProblems = [...problems];
      const filteredIndex = filteredProblems.findIndex(
        p => p.id === filteredProblems[index].id
      );
      const problemToDelete = filteredProblems[index];
      
      // Remove from both arrays
      updatedProblems.splice(updatedProblems.findIndex(p => p.id === problemToDelete.id), 1);
      setProblems(updatedProblems);
      
      if (editIndex === filteredIndex) {
        setEditIndex(-1);
      } else if (editIndex > filteredIndex) {
        setEditIndex(editIndex - 1);
      }
    }
  };
  
  const handleDeleteAllProblems = () => {
    if (window.confirm('Are you sure you want to delete ALL problems? This action cannot be undone.')) {
      setProblems([]);
      setFilteredProblems([]);
      setEditIndex(-1);
      setSuccess('All problems have been deleted. Save changes to update the database.');
      setTimeout(() => setSuccess(''), 3000);
    }
  };
  
  const handleEditToggle = (index) => {
    const actualIndex = problems.findIndex(p => p.id === filteredProblems[index].id);
    setEditIndex(editIndex === actualIndex ? -1 : actualIndex);
  };
  
  const handleProblemChange = (index, field, value) => {
    const updatedProblems = [...problems];
    const actualIndex = problems.findIndex(p => p.id === filteredProblems[index].id);
    
    updatedProblems[actualIndex] = {
      ...updatedProblems[actualIndex],
      [field]: value
    };
    
    // Update difficulty class if category is changed
    if (field === 'category') {
      updatedProblems[actualIndex].difficultyClass = getDifficultyClass(value);
    }
    
    setProblems(updatedProblems);
  };
  
  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const csvData = event.target.result;
        
        // Log the first few lines of the CSV for debugging
        console.log("CSV Raw Data (first 300 chars):", csvData.substring(0, 300));
        
        const parsedData = parseCSVData(csvData);
        
        if (parsedData && parsedData.length > 0) {
          // Log difficulty distribution for debugging
          const difficulties = {
            'very-easy': 0,
            'easy': 0,
            'medium': 0,
            'hard': 0,
            'unknown': 0
          };
          
          parsedData.forEach(p => {
            if (difficulties[p.difficultyClass] !== undefined) {
              difficulties[p.difficultyClass]++;
            } else {
              difficulties['unknown']++;
              console.warn(`Unknown difficulty class: ${p.difficultyClass} for problem: ${p.name}`);
            }
          });
          
          console.log('CSV Import Difficulty Distribution:', difficulties);
          
          // If we have existing problems, assign unique IDs to new problems
          const startId = problems.length > 0 ? 
            Math.max(...problems.map(p => p.id || 0)) + 1 : 0;
          
          // Update IDs to ensure uniqueness and add timestamp
          const timestamp = new Date().toISOString();
          const newProblems = parsedData.map((problem, index) => ({
            ...problem,
            id: startId + index,
            lastUpdated: timestamp,
            // Ensure each problem has a valid difficulty class
            difficultyClass: problem.difficultyClass || 'medium'
          }));
          
          setProblems(newProblems);
          
          // Update filtered problems based on current filter
          if (difficultyFilter === 'all') {
            setFilteredProblems(newProblems);
          } else {
            setFilteredProblems(newProblems.filter(p => p.difficultyClass === difficultyFilter));
          }
          
          // Immediately save to Firebase to ensure all users get the updated data
          await updateProblems(newProblems);
          
          const difficultyStats = {
            'very-easy': newProblems.filter(p => p.difficultyClass === 'very-easy').length,
            'easy': newProblems.filter(p => p.difficultyClass === 'easy').length,
            'medium': newProblems.filter(p => p.difficultyClass === 'medium').length,
            'hard': newProblems.filter(p => p.difficultyClass === 'hard').length
          };
          
          setSuccess(`CSV imported successfully! 
            ${newProblems.length} problems loaded with the following distribution:
            Very Easy: ${difficultyStats['very-easy']}, 
            Easy: ${difficultyStats['easy']}, 
            Medium: ${difficultyStats['medium']}, 
            Hard: ${difficultyStats['hard']}`);
          setTimeout(() => setSuccess(''), 5000);
        } else {
          setError('No valid problems found in the CSV file.');
        }
      } catch (err) {
        setError('Failed to parse CSV file. Please check the format.');
        console.error(err);
      }
      setLoading(false);
    };
    
    reader.readAsText(file);
    
    // Reset the file input value so the same file can be selected again
    e.target.value = '';
  };
  
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading problems...</p>
      </div>
    );
  }
  
  return (
    <div className="admin-panel">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Problem Management</h2>
        <div>
          <label htmlFor="admin-csv-upload" className="btn btn-outline-primary me-2">
            <FontAwesomeIcon icon={faFileImport} className="me-2" />
            Import CSV
          </label>
          <input
            id="admin-csv-upload"
            type="file"
            accept=".csv"
            style={{ display: 'none' }}
            onChange={handleImportCSV}
          />
          
          <button
            className="btn btn-success me-2"
            onClick={handleSaveProblems}
          >
            <FontAwesomeIcon icon={faSave} className="me-2" />
            Save All Changes
          </button>
          <button
            className="btn btn-primary"
            onClick={handleAddProblem}
          >
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            Add Problem
          </button>
        </div>
      </div>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <div className="card mb-4">
        <div className="card-header bg-info text-white">
          <h5 className="mb-0">CSV Import Format</h5>
        </div>
        <div className="card-body">
          <p>Your CSV file should have the following columns in order:</p>
          <ol>
            <li><strong>Problem Category</strong> - The category of the problem</li>
            <li><strong>Problem Name</strong> - The name of the problem</li>
            <li><strong>Difficulty Level</strong> - One of: Very Easy, Easy, Medium, Hard</li>
            <li><strong>Problem Link</strong> - URL to the problem</li>
          </ol>
          <p>Example CSV format:</p>
          <pre className="bg-light p-2 border rounded">
            Problem Category,Problem Name,Difficulty Level,Problem Link<br/>
            Arrays,Two Sum,Easy,https://example.com/two-sum<br/>
            Strings,Valid Anagram,Medium,https://example.com/valid-anagram<br/>
            Graphs,Shortest Path,Hard,https://example.com/shortest-path<br/>
            Dynamic Programming,Fibonacci,Very Easy,https://example.com/fibonacci
          </pre>
        </div>
      </div>
      
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Problem Statistics</h5>
          <div className="row text-center mt-3">
            <div className="col">
              <h6>Total Problems</h6>
              <span className="fs-4">{problems.length}</span>
            </div>
            <div className="col">
              <h6 className="text-info">Very Easy</h6>
              <span className="fs-4">{problems.filter(p => p.difficultyClass === 'very-easy').length}</span>
            </div>
            <div className="col">
              <h6 className="text-success">Easy</h6>
              <span className="fs-4">{problems.filter(p => p.difficultyClass === 'easy').length}</span>
            </div>
            <div className="col">
              <h6 className="text-warning">Medium</h6>
              <span className="fs-4">{problems.filter(p => p.difficultyClass === 'medium').length}</span>
            </div>
            <div className="col">
              <h6 className="text-danger">Hard</h6>
              <span className="fs-4">{problems.filter(p => p.difficultyClass === 'hard').length}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="d-flex justify-content-between mb-3">
        <div className="input-group" style={{ maxWidth: '300px' }}>
          <span className="input-group-text">
            <FontAwesomeIcon icon={faFilter} />
          </span>
          <select
            className="form-select"
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            aria-label="Filter by difficulty"
          >
            <option value="all">All Difficulties</option>
            <option value="very-easy">Very Easy</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        
        <button
          className="btn btn-danger"
          onClick={handleDeleteAllProblems}
        >
          <FontAwesomeIcon icon={faTrashAlt} className="me-2" />
          Delete All Problems
        </button>
      </div>
      
      <div className="table-container">
        <table className="table table-hover">
          <thead>
            <tr>
              <th style={{ width: '25%' }}>Category</th>
              <th style={{ width: '15%' }}>Difficulty</th>
              <th style={{ width: '30%' }}>Problem Name</th>
              <th style={{ width: '15%' }}>Problem Link</th>
              <th style={{ width: '15%' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProblems.length > 0 ? (
              filteredProblems.map((problem, index) => (
                <tr key={problem.id} className={`category-${problem.difficultyClass}`}>
                  <td>
                    {editIndex === problems.findIndex(p => p.id === problem.id) ? (
                      <input
                        type="text"
                        className="form-control"
                        value={problem.category}
                        onChange={(e) => handleProblemChange(index, 'category', e.target.value)}
                      />
                    ) : (
                      problem.category
                    )}
                  </td>
                  <td>
                    <span className={`badge category-badge-${problem.difficultyClass}`}>
                      {problem.difficultyClass === 'very-easy' ? 'Very Easy' : 
                        problem.difficultyClass === 'easy' ? 'Easy' : 
                        problem.difficultyClass === 'medium' ? 'Medium' : 'Hard'}
                    </span>
                  </td>
                  <td>
                    {editIndex === problems.findIndex(p => p.id === problem.id) ? (
                      <input
                        type="text"
                        className="form-control"
                        value={problem.name}
                        onChange={(e) => handleProblemChange(index, 'name', e.target.value)}
                      />
                    ) : (
                      problem.name
                    )}
                  </td>
                  <td>
                    {editIndex === problems.findIndex(p => p.id === problem.id) ? (
                      <input
                        type="text"
                        className="form-control"
                        value={problem.link}
                        onChange={(e) => handleProblemChange(index, 'link', e.target.value)}
                        placeholder="https://..."
                      />
                    ) : (
                      problem.link ? (
                        <a href={problem.link} target="_blank" rel="noopener noreferrer">
                          {problem.link}
                        </a>
                      ) : (
                        <span className="text-muted">No link</span>
                      )
                    )}
                  </td>
                  <td>
                    {editIndex === problems.findIndex(p => p.id === problem.id) ? (
                      <button
                        className="btn btn-sm btn-secondary me-1"
                        onClick={() => handleEditToggle(index)}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    ) : (
                      <button
                        className="btn btn-sm btn-primary me-1"
                        onClick={() => handleEditToggle(index)}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                    )}
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteProblem(index)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  No problems found. Import a CSV file or add problems manually.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="mt-3 text-muted">
        Showing {filteredProblems.length} of {problems.length} problems
      </div>
    </div>
  );
};

export default AdminPanel; 