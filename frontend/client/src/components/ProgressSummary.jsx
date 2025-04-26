import React from "react";

function ProgressSummary({ updates }) {
  const completedTutorials = updates.filter((update) => update.type === "Completed Tutorial").length;
  const newSkillsLearned = updates.filter((update) => update.type === "New Skill Learned").length;
  const inProgress = updates.filter((update) => update.type === "In Progress").length;

  const totalUpdates = updates.length || 1;
  const completedPercentage = Math.round((completedTutorials / totalUpdates) * 100);
  const newSkillsPercentage = Math.round((newSkillsLearned / totalUpdates) * 100);
  const inProgressPercentage = Math.round((inProgress / totalUpdates) * 100);

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Learning Journey</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Completed Tutorials */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Completed</h3>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>
          <div className="flex items-end space-x-2">
            <span className="text-3xl font-bold text-blue-600">{completedTutorials}</span>
            <span className="text-sm text-gray-500 mb-1">tutorials</span>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${completedPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>{completedPercentage}% of total</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* New Skills Learned */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">New Skills</h3>
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
          </div>
          <div className="flex items-end space-x-2">
            <span className="text-3xl font-bold text-emerald-600">{newSkillsLearned}</span>
            <span className="text-sm text-gray-500 mb-1">skills</span>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-emerald-600 h-2 rounded-full" 
                style={{ width: `${newSkillsPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>{newSkillsPercentage}% of total</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">In Progress</h3>
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
          <div className="flex items-end space-x-2">
            <span className="text-3xl font-bold text-amber-600">{inProgress}</span>
            <span className="text-sm text-gray-500 mb-1">items</span>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-amber-600 h-2 rounded-full" 
                style={{ width: `${inProgressPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>{inProgressPercentage}% of total</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProgressSummary;