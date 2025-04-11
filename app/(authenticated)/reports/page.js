'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';

export default function Reports() {
  const { data: session } = useSession();
  const [selectedReportType, setSelectedReportType] = useState('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Reports</h2>
        <p>Generate and view activity reports.</p>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-bold">Report Generator</h3>
              <p className="text-gray-600 text-sm">Generate reports based on your criteria</p>
            </div>
            
            <div className="mt-4 md:mt-0 flex space-x-4">
              <select 
                value={selectedReportType}
                onChange={(e) => setSelectedReportType(e.target.value)}
                className="border rounded-md px-3 py-2"
              >
                <option value="daily">Daily Report</option>
                <option value="weekly">Weekly Report</option>
                <option value="monthly">Monthly Report</option>
              </select>
              
              <input 
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border rounded-md px-3 py-2"
              />
              
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Generate
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h4 className="font-medium text-lg mb-2">
              {selectedReportType.charAt(0).toUpperCase() + selectedReportType.slice(1)} Report
            </h4>
            <p>Date: {selectedDate}</p>
            <p>User: {session?.user?.name} ({session?.user?.employeeId})</p>
          </div>
          
          <div className="overflow-hidden bg-white shadow-md rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Spent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">Voice</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      work
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">02:30:15</td>
                  <td className="px-6 py-4 whitespace-nowrap">35%</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">Email</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      work
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">01:45:30</td>
                  <td className="px-6 py-4 whitespace-nowrap">25%</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">Break 1</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      auxiliary
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">00:15:00</td>
                  <td className="px-6 py-4 whitespace-nowrap">5%</td>
                </tr>
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" colSpan="2">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">07:15:45</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">100%</th>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 mr-2">
              Export PDF
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Export CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}