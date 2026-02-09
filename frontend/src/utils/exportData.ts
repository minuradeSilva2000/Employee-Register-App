/**
 * Data Export Utilities
 * Export employee data to various formats
 */

import { Employee } from '../models/Employee.model';
import { formatDate, formatCurrency } from './validation';

/**
 * Export employees to CSV
 */
export function exportToCSV(employees: Employee[], filename: string = 'employees.csv'): void {
  const headers = [
    'ID',
    'Full Name',
    'Email',
    'Phone',
    'Department',
    'Position',
    'Salary',
    'Status',
    'Date Joined',
    'Address'
  ];

  const rows = employees.map(emp => [
    emp.id,
    emp.fullName,
    emp.email,
    emp.phone,
    emp.department,
    emp.position,
    emp.salary.toString(),
    emp.status,
    formatDate(emp.dateJoined),
    emp.address || ''
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  downloadFile(csvContent, filename, 'text/csv');
}

/**
 * Export employees to JSON
 */
export function exportToJSON(employees: Employee[], filename: string = 'employees.json'): void {
  const jsonContent = JSON.stringify(employees, null, 2);
  downloadFile(jsonContent, filename, 'application/json');
}

/**
 * Export employees to formatted text
 */
export function exportToText(employees: Employee[], filename: string = 'employees.txt'): void {
  const textContent = employees.map(emp => `
Employee ID: ${emp.id}
Name: ${emp.fullName}
Email: ${emp.email}
Phone: ${emp.phone}
Department: ${emp.department}
Position: ${emp.position}
Salary: ${formatCurrency(emp.salary)}
Status: ${emp.status}
Date Joined: ${formatDate(emp.dateJoined)}
Address: ${emp.address || 'N/A'}
${'='.repeat(50)}
  `).join('\n');

  downloadFile(textContent, filename, 'text/plain');
}

/**
 * Helper function to download file
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Print employee list
 */
export function printEmployeeList(employees: Employee[]): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to print');
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Employee List</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
        }
        h1 {
          color: #333;
          border-bottom: 2px solid #333;
          padding-bottom: 10px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #4CAF50;
          color: white;
        }
        tr:nth-child(even) {
          background-color: #f2f2f2;
        }
        @media print {
          button {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <h1>Employee List</h1>
      <p>Generated on: ${new Date().toLocaleString()}</p>
      <p>Total Employees: ${employees.length}</p>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Department</th>
            <th>Position</th>
            <th>Status</th>
            <th>Salary</th>
          </tr>
        </thead>
        <tbody>
          ${employees.map(emp => `
            <tr>
              <td>${emp.id}</td>
              <td>${emp.fullName}</td>
              <td>${emp.email}</td>
              <td>${emp.department}</td>
              <td>${emp.position}</td>
              <td>${emp.status}</td>
              <td>${formatCurrency(emp.salary)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <button onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; background: #4CAF50; color: white; border: none; cursor: pointer;">
        Print
      </button>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
