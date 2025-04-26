import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faSave, faTimes, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../contexts/AuthContext';

const ProblemRow = ({ problem, onUpdate, showDifficultyColumn = false }) => {
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(problem.notes || '');

  const getStatusClass = (status) => {
    if (status === 'Completed') return 'status-completed';
    if (status === 'Review') return 'status-review';
    return 'status-not-started';
  };

  const handleStatusChange = (e) => {
    onUpdate({
      ...problem,
      status: e.target.value
    });
  };

  const handleSaveNotes = () => {
    onUpdate({
      ...problem,
      notes: notes
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setNotes(problem.notes || '');
    setIsEditing(false);
  };

  return (
    <tr className={`category-${problem.difficultyClass}`}>
      <td className="d-none d-md-table-cell">
        {problem.category}
      </td>
      <td>{problem.name}</td>
      <td>
        {problem.link ? (
          <a href={problem.link} target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faExternalLinkAlt} /> Link
          </a>
        ) : (
          <span className="text-muted">No link</span>
        )}
      </td>
      <td>
        <select 
          className="form-select form-select-sm"
          value={problem.status}
          onChange={handleStatusChange}
          disabled={!currentUser}
        >
          <option value="Not Started">Not Started</option>
          <option value="Review">Review</option>
          <option value="Completed">Completed</option>
        </select>
      </td>
      <td className="notes-column">
        {isEditing ? (
          <div>
            <textarea
              className="notes-textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your notes here..."
            />
            <div className="mt-2">
              <button 
                className="btn btn-sm btn-success me-2"
                onClick={handleSaveNotes}
              >
                <FontAwesomeIcon icon={faSave} /> Save
              </button>
              <button 
                className="btn btn-sm btn-secondary"
                onClick={handleCancelEdit}
              >
                <FontAwesomeIcon icon={faTimes} /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="notes-text mb-2">{problem.notes || 'No notes yet'}</div>
            {currentUser && (
              <button 
                className="btn btn-sm btn-outline-primary"
                onClick={() => setIsEditing(true)}
              >
                <FontAwesomeIcon icon={faEdit} /> Edit Notes
              </button>
            )}
          </div>
        )}
      </td>
    </tr>
  );
};

export default ProblemRow; 