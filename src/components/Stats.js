import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle, 
  faExclamationTriangle, 
  faHourglassHalf, 
  faListAlt 
} from '@fortawesome/free-solid-svg-icons';

const Stats = ({ problems }) => {
  // Calculate statistics
  const total = problems.length;
  const completed = problems.filter(p => p.status === 'Completed').length;
  const review = problems.filter(p => p.status === 'Review').length;
  const notStarted = problems.filter(p => p.status === 'Not Started').length;
  
  // Calculate completion percentage
  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return (
    <div className="row mt-4 mb-4">
      <div className="col-md-3 col-6 mb-3">
        <div className="card h-100">
          <div className="card-body text-center">
            <FontAwesomeIcon icon={faListAlt} size="2x" className="mb-2 text-primary" />
            <h3>{total}</h3>
            <p className="card-text">Total Problems</p>
          </div>
        </div>
      </div>
      
      <div className="col-md-3 col-6 mb-3">
        <div className="card h-100">
          <div className="card-body text-center">
            <FontAwesomeIcon icon={faCheckCircle} size="2x" className="mb-2 text-success" />
            <h3>{completed}</h3>
            <p className="card-text">Completed</p>
          </div>
        </div>
      </div>
      
      <div className="col-md-3 col-6 mb-3">
        <div className="card h-100">
          <div className="card-body text-center">
            <FontAwesomeIcon icon={faExclamationTriangle} size="2x" className="mb-2 text-warning" />
            <h3>{review}</h3>
            <p className="card-text">For Review</p>
          </div>
        </div>
      </div>
      
      <div className="col-md-3 col-6 mb-3">
        <div className="card h-100">
          <div className="card-body text-center">
            <FontAwesomeIcon icon={faHourglassHalf} size="2x" className="mb-2 text-secondary" />
            <h3>{notStarted}</h3>
            <p className="card-text">Not Started</p>
          </div>
        </div>
      </div>
      
      <div className="col-12 mt-3">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Progress</h5>
            <div className="progress">
              <div 
                className="progress-bar bg-success" 
                role="progressbar" 
                style={{ width: `${completionPercentage}%` }}
                aria-valuenow={completionPercentage} 
                aria-valuemin="0" 
                aria-valuemax="100"
              >
                {completionPercentage}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats; 