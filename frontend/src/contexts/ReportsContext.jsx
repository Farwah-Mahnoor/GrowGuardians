import React, { createContext, useContext, useState } from 'react';

const ReportsContext = createContext(undefined);

export const ReportsProvider = ({ children }) => {
  const [savedReports, setSavedReports] = useState([
    {
      id: '1',
      date: '2024-11-25',
      image: '/placeholder-plant.jpg',
      isHealthy: false,
      diseaseName: 'Tomato Leaf Disease',
      diagnosisPoints: [
        'Disease detected based on visual symptoms',
        'Analysis completed using AI model',
        'Confidence level: 85%'
      ],
      tipsPoints: [
        'Remove affected plant parts',
        'Apply appropriate treatment',
        'Monitor plant regularly'
      ]
    },
    {
      id: '2',
      date: '2024-11-20',
      image: '/placeholder-plant.jpg',
      isHealthy: true,
      diseaseName: 'Healthy Plant',
      diagnosisPoints: [
        'No disease symptoms detected',
        'Plant appears healthy',
        'Continue regular care'
      ],
      tipsPoints: [
        'Maintain current watering schedule',
        'Ensure adequate sunlight',
        'Apply organic fertilizer monthly'
      ]
    }
  ]);

  const addReport = (report) => {
    setSavedReports(prev => [report, ...prev]);
  };

  const removeReport = (id) => {
    setSavedReports(prev => prev.filter(report => report.id !== id));
  };

  const removeAllReports = () => {
    setSavedReports([]);
  };

  return (
    <ReportsContext.Provider value={{ savedReports, addReport, removeReport, removeAllReports }}>
      {children}
    </ReportsContext.Provider>
  );
};

export const useReports = () => {
  const context = useContext(ReportsContext);
  if (context === undefined) {
    throw new Error('useReports must be used within a ReportsProvider');
  }
  return context;
};
