import React from 'react';

const calculateLevel = (totalPoints) => {
  let level = 0;
  let pointsNeeded = 20000; // Initial cost for level 1

  while (totalPoints >= pointsNeeded) {
    totalPoints -= pointsNeeded;
    level++;
    pointsNeeded += 10000; // Each level costs 10,000 more than the previous
  }

  const progress = (totalPoints / pointsNeeded) * 100; // Progress within the current level

  return { level, progress };
};

const LevelProgressBar = ({ totalPoints }) => {
  const { level, progress } = calculateLevel(totalPoints);

  return (
    <div className="level-progress">
      <p style={{ margin: '0px' }}><strong>Lvl:</strong> {level}</p>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>
      <style jsx>{`
        .level-progress {
          width: 100%;
          text-align: left;
        }
        .progress-bar {
          width: 100%;
          height: 8px;
          background: #2d0821;
          border-radius: 5px;
          border: 1px solid #d17eb5;
          overflow: hidden;
          margin-top: 5px;
        }
        .progress-fill {
          height: 100%;
          background: #d17eb5;
          transition: width 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default LevelProgressBar;
