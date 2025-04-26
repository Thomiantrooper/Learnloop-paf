import React from "react";

function ProgressGraph({ updates }) {
  // Group updates by month and type
  const updatesByMonth = updates.reduce((acc, update) => {
    const date = new Date(update.date);
    const month = date.toLocaleString("default", { month: "short" }); // Use short month names (e.g., Jan, Feb)
    if (!acc[month]) {
      acc[month] = { "Completed Tutorial": 0, "New Skill Learned": 0, "In Progress": 0 };
    }
    acc[month][update.type]++;
    return acc;
  }, {});

  // Get the months in order
  const months = Object.keys(updatesByMonth);

  // Calculate the maximum value for scaling the bars
  const maxValue = Math.max(
    ...Object.values(updatesByMonth).flatMap((month) => Object.values(month))
  );

  // Determine the scale (10, 20, 30, etc.)
  const scale = Math.ceil(maxValue / 10) * 10;

  // Generate scale labels (e.g., [0, 5, 10, 15, ...])
  const scaleLabels = Array.from({ length: scale / 5 + 1 }, (_, i) => i * 5);

  return (
    <div className="flex flex-col items-center w-full max-w-screen-md p-6 pb-6 bg-white rounded-lg shadow-xl sm:p-8">
      <h2 className="text-xl font-bold text-gray-800">Learning Progress</h2>
      <div className="flex w-full mt-4 justify-center">
        {/* Vertical Scale (reversed) */}
        <div className="flex flex-col-reverse justify-between h-40 mr-2 text-xs text-gray-500">
          {scaleLabels.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
        {/* Bars */}
        <div className="flex items-end flex-grow w-full space-x-2 sm:space-x-3">
          {months.map((month) => (
            <div key={month} className="relative flex flex-col items-center flex-grow pb-5">
              {/* Bars for each type */}
              <div className="flex items-end w-full h-40">
                {/* Completed Tutorials */}
                <div
                  className="relative flex justify-center flex-grow bg-blue-200 hover:bg-blue-300 transition-colors duration-200"
                  style={{
                    height: `${(updatesByMonth[month]["Completed Tutorial"] / scale) * 100}%`,
                  }}
                ></div>
                {/* New Skills Learned */}
                <div
                  className="relative flex justify-center flex-grow bg-green-200 hover:bg-green-300 transition-colors duration-200"
                  style={{
                    height: `${(updatesByMonth[month]["New Skill Learned"] / scale) * 100}%`,
                  }}
                ></div>
                {/* In Progress */}
                <div
                  className="relative flex justify-center flex-grow bg-orange-200 hover:bg-orange-300 transition-colors duration-200"
                  style={{
                    height: `${(updatesByMonth[month]["In Progress"] / scale) * 100}%`,
                  }}
                ></div>
              </div>
              {/* Month label */}
              <span className="absolute bottom-0 text-xs font-bold text-gray-700">{month}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Legend */}
      <div className="flex w-full mt-4 justify-center">
        <div className="flex items-center ml-4">
          <span className="block w-4 h-4 bg-blue-200"></span>
          <span className="ml-1 text-xs font-medium text-gray-700">Completed</span>
        </div>
        <div className="flex items-center ml-4">
          <span className="block w-4 h-4 bg-green-200"></span>
          <span className="ml-1 text-xs font-medium text-gray-700">New Skills</span>
        </div>
        <div className="flex items-center ml-4">
          <span className="block w-4 h-4 bg-orange-200"></span>
          <span className="ml-1 text-xs font-medium text-gray-700">In Progress</span>
        </div>
      </div>
    </div>
  );
}

export default ProgressGraph;