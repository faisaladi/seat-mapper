// src/components/SeatMappingTool.tsx
import React, { useState, useEffect } from 'react';

// Define the Seat interface
interface Seat {
  id: string;
  row: number;
  column: number;
  label: string;
  status: string;
}

const SeatMappingTool: React.FC = () => {  // Add the React.FC type
  const [rows, setRows] = useState(5);
  const [columns, setColumns] = useState(5);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [editMode, setEditMode] = useState('status');
  const [editingSeatId, setEditingSeatId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState('');

  // Initialize the seat grid when rows or columns change
  useEffect(() => {
    const initialSeats: Seat[] = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        initialSeats.push({
          id: `${row}-${col}`,
          row,
          column: col,
          label: '',
          status: 'VOID'
        });
      }
    }
    setSeats(initialSeats);
  }, [rows, columns]);

  // Handle seat click based on edit mode
  const handleSeatClick = (seat: Seat) => {
    if (editMode === 'status') {
      // Cycle through statuses: VOID -> AVAILABLE -> UNAVAILABLE -> VOID
      const nextStatus: {[key: string]: string} = {
        'VOID': 'AVAILABLE',
        'AVAILABLE': 'UNAVAILABLE',
        'UNAVAILABLE': 'VOID'
      };
      
      const updatedSeats = seats.map(s => {
        if (s.id === seat.id) {
          return { ...s, status: nextStatus[s.status] };
        }
        return s;
      });
      setSeats(updatedSeats);
    } else if (editMode === 'label') {
      // Start editing label
      setEditingSeatId(seat.id);
      setEditingLabel(seat.label);
    }
  };

  // Save label after editing
  const handleLabelSave = (e: React.KeyboardEvent | React.FocusEvent) => {
    if ((e as React.KeyboardEvent).key === 'Enter' || e.type === 'blur') {
      const updatedSeats = seats.map(seat => {
        if (seat.id === editingSeatId) {
          return { ...seat, label: editingLabel.substring(0, 4) }; // Limit to 4 characters
        }
        return seat;
      });
      
      setSeats(updatedSeats);
      setEditingSeatId(null);
      setEditingLabel('');
    }
  };

  // Generate and download CSV
  const generateCSV = () => {
    const headers = 'Row,Column,Label,Status\n';
    const csvContent = seats.map(seat => 
      `${seat.row},${seat.column},${seat.label},${seat.status}`
    ).join('\n');
    
    const blob = new Blob([headers + csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    // Create a download link and trigger it
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'seat_map.csv');
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Get color based on status
  const getColorForStatus = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-200';
      case 'UNAVAILABLE': return 'bg-red-200';
      case 'VOID': return 'bg-gray-200';
      default: return 'bg-gray-200';
    }
  };

  // Make sure you have this return statement:
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Event Seat Mapping Tool</h1>
      
      {/* Input controls */}
      <div className="mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block mb-1">Rows:</label>
          <input 
            type="number" 
            min="1"
            max="20"
            value={rows} 
            onChange={(e) => setRows(parseInt(e.target.value) || 1)} 
            className="border rounded p-2 w-24"
          />
        </div>
        <div>
          <label className="block mb-1">Columns:</label>
          <input 
            type="number" 
            min="1"
            max="20"
            value={columns} 
            onChange={(e) => setColumns(parseInt(e.target.value) || 1)} 
            className="border rounded p-2 w-24"
          />
        </div>
        
        {/* Edit mode toggle */}
        <div className="flex border rounded overflow-hidden">
          <button 
            onClick={() => setEditMode('status')}
            className={`px-4 py-2 ${editMode === 'status' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
          >
            Status Editor
          </button>
          <button 
            onClick={() => setEditMode('label')}
            className={`px-4 py-2 ${editMode === 'label' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
          >
            Label Editor
          </button>
        </div>
        
        <button 
          onClick={generateCSV}
          className="bg-green-500 text-white px-4 py-2 rounded ml-auto"
        >
          Generate CSV
        </button>
      </div>
      
      {/* Mode instructions */}
      <div className="mb-4 p-2 bg-gray-100 rounded">
        <p className="text-sm">
          {editMode === 'status' 
            ? 'Click on seats to cycle through status: VOID → AVAILABLE → UNAVAILABLE → VOID' 
            : 'Click on seats to edit their labels (max 4 characters). Press Enter to save.'}
        </p>
      </div>
      
      {/* Seat grid */}
      <div className="overflow-auto">
        <div className="relative">
          {/* Column headers */}
          <div className="flex ml-8">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={`col-${colIndex}`} className="w-12 h-8 flex items-center justify-center text-sm font-medium">
                {colIndex}
              </div>
            ))}
          </div>
          
          {/* Rows with row headers */}
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={`row-${rowIndex}`} className="flex">
              {/* Row header */}
              <div className="w-8 h-12 flex items-center justify-center text-sm font-medium">
                {rowIndex}
              </div>
              
              {/* Seats in this row */}
              {seats
                .filter(seat => seat.row === rowIndex)
                .map((seat) => (
                  <div
                    key={seat.id}
                    onClick={() => handleSeatClick(seat)}
                    className={`w-12 h-12 m-0.5 flex items-center justify-center cursor-pointer border rounded text-xs ${getColorForStatus(seat.status)}`}
                  >
                    {editingSeatId === seat.id ? (
                      <input
                        type="text"
                        value={editingLabel}
                        onChange={(e) => setEditingLabel(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleLabelSave(e)}
                        onBlur={handleLabelSave}
                        maxLength={4}
                        className="w-full h-full text-center bg-transparent focus:outline-none"
                        autoFocus
                      />
                    ) : (
                      seat.label
                    )}
                  </div>
                ))
              }
            </div>
          ))}
        </div>
      </div>
      
      {/* Status legend */}
      <div className="mt-4 flex gap-4">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-200 mr-2"></div>
          <span className="text-xs">AVAILABLE</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-200 mr-2"></div>
          <span className="text-xs">UNAVAILABLE</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-200 mr-2"></div>
          <span className="text-xs">VOID</span>
        </div>
      </div>
    </div>
  );
};

export default SeatMappingTool;