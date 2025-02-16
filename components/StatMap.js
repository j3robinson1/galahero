import React from 'react';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const classStats = {
  "Prisoner": [30, 40, 20, 80, 50],
  "Disgraced Noble": [50, 60, 70, 40, 30],
  "Sheriff": [60, 50, 40, 70, 60],
  "Alchemist": [40, 80, 60, 50, 90],
  "Reveler": [70, 40, 30, 90, 50],
  "Red Hat": [80, 50, 40, 70, 60],
  "Shaman": [60, 70, 80, 40, 90],
  "Hacker": [90, 80, 50, 40, 70],
  "Proto Fuzzle": [85, 70, 60, 50, 75],
  "Zookeeper": [50, 60, 70, 40, 50],
  "Forester": [40, 50, 60, 70, 40],
  "Noble": [70, 80, 60, 50, 40],
  "Farmer": [60, 50, 40, 70, 30],
  "Monk": [50, 70, 80, 60, 90],
  "Technologist": [80, 90, 50, 40, 60],
  "Transdimensional Explorer": [90, 80, 70, 60, 50],
  "Galactic Trader": [70, 60, 50, 80, 40],
  "Interplanetary Pioneer": [80, 70, 60, 50, 90],
  "Space Marine": [90, 80, 70, 60, 50],
  "Abnormal Astrologer": [15, 20, 10, 40, 25],
  "Mad Scientist": [25, 30, 35, 20, 15],
  "King Crimson": [30, 25, 20, 35, 30],
  "Fred the Friendless": [20, 40, 30, 25, 45],
  "Court of the Crimson King": [35, 25, 20, 45, 25],
  "Lord Hydra of Pluton": [40, 25, 20, 35, 30],
  "Mutated Mourner": [30, 35, 40, 20, 45],
  "Wooly Linguist": [45, 40, 25, 20, 35],
  "Shifty Smuggler": [42, 35, 30, 25, 37],
  "Peculiar Pathfinder": [25, 30, 35, 20, 25],
  "Kinky Courtesan": [20, 25, 30, 35, 20],
  "Exiled Noble": [35, 40, 30, 25, 20],
  "Negligent Navigator": [30, 25, 20, 35, 15],
  "Funky Diplomat": [25, 35, 40, 30, 45],
  "Galactic Hero": [40, 45, 25, 20, 30],
  "Mystical Medic": [45, 40, 35, 25, 30],
  "Crimson Guard": [45, 40, 35, 30, 25],
  "Hirsute Herald": [35, 25, 30, 40, 20],
  "Caravan Leader": [40, 30, 25, 35, 45],
  "Aberrant Ranger": [45, 40, 30, 25, 20],
  "Forgotten Freight Hauler": [30, 20, 25, 40, 15],
  "Shaggy Scullion": [25, 30, 35, 40, 20],
  "Errant Explorer": [35, 40, 30, 25, 20],
  "Eccentric Technologist": [40, 45, 25, 20, 30],
  "Trippy Trader": [45, 40, 30, 25, 20],
  "Spaced-Out Marine": [50, 40, 30, 20, 25]
};

const personalityModifiers = {
  "Stix": .8,
  "Banna": .65,
  "Correnta": .5,
  "Baskita": .45,
  "Tempra": .45,
  "Mantra": .4,
  "Callista": .3,
  "Centra": .3,
  "Moga": .3
};

const calculateLevel = (totalPoints) => {
  let level = 0;
  let pointsNeeded = 20000; 

  while (totalPoints >= pointsNeeded) {
    totalPoints -= pointsNeeded;
    level++;
    pointsNeeded += 10000; 
  }

  return level;
};

const StatMap = ({ attributes, totalPoints }) => {
  let selectedClass = "Prisoner";
  let selectedPersonality = "Stix";

  attributes.forEach(attr => {
    if (classStats[attr.value]) {
      selectedClass = attr.value;
    }
    if (personalityModifiers[attr.value]) {
      selectedPersonality = attr.value;
    }
  });

  const baseStats = classStats[selectedClass] || [50, 50, 50, 50, 50];
  const modifier = personalityModifiers[selectedPersonality] || 1;
  
  const level = calculateLevel(totalPoints); // Get user level based on points

  // Increase each stat by +1 per level
  const adjustedStats = baseStats.map(stat => Math.round(stat * modifier) + level);

  const data = {
    labels: ["Rhythm", "Melody", "Harmony", "Energy", "Complexity"],
    datasets: [
      {
        data: adjustedStats,
        backgroundColor: 'rgba(209, 126, 180, 0.2)',
        borderColor: 'rgba(209, 126, 180, 1)',
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      r: {
        suggestedMin: 1,
        suggestedMax: 100,
        pointLabels: { display: true, color: 'white' },
        grid: {
          color: 'rgba(255, 255, 255, 0.3)'
        },
        ticks: { display: false }
      }
    },
    maintainAspectRatio: false
  };

  return (
    <div className="stat-map" style={{ height: '193px' }}>
      <Radar data={data} options={options} />
      <style jsx>{`
        .stat-map {
          text-align: center;
          padding: 10px;
          border-radius: 10px;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default StatMap;