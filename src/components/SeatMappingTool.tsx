import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

// Define the Seat interface
interface Seat {
  id: string;
  row: number;
  column: number;
  label: string;
  status: 'VOID' | 'AVAILABLE' | 'UNAVAILABLE';
}

const SeatMappingTool = () => {
  const [rows, setRows] = useState(5);
  const [columns, setColumns] = useState(5);
  const [tempRows, setTempRows] = useState(5);  // Temporary input
  const [tempColumns, setTempColumns] = useState(5);  // Temporary input
  const [seats, setSeats] = useState<Seat[]>([]);
  
  const [editMode, setEditMode] = useState('status'); // 'status' or 'label'
  const [editingSeatId, setEditingSeatId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState('');

  // Initialize the seat grid when rows or columns change
  useEffect(() => {
    setSeats((prevSeats) => {
      const newSeats: Seat[] = [];
  
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
          const existingSeat = prevSeats.find(seat => seat.row === row && seat.column === col);
  
          newSeats.push(
            existingSeat
              ? existingSeat // Keep existing seat data
              : { id: `${row}-${col}`, row, column: col, label: '', status: 'VOID' } // Add new seats
          );
        }
      }
  
      return newSeats;
    });
  }, [rows, columns]);
    

  // Handle seat click based on edit mode
  const handleSeatClick = (seat: Seat) => {
    if (editMode === 'status') {
      // Cycle through statuses: VOID -> AVAILABLE -> UNAVAILABLE -> VOID
      const nextStatus: Record<'VOID' | 'AVAILABLE' | 'UNAVAILABLE', 'VOID' | 'AVAILABLE' | 'UNAVAILABLE'> = {
        'VOID': 'AVAILABLE',
        'AVAILABLE': 'UNAVAILABLE',
        'UNAVAILABLE': 'VOID',
      };
      
      const updatedSeats: Seat[] = seats.map(s => {
        if (s.id === seat.id) {
          return { ...s, status: nextStatus[s.status] }; // ✅ TypeScript now understands the type correctly
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
  const handleLabelSave = (e: React.KeyboardEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>) => {
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
  const getColorForStatus = (status: 'VOID' | 'AVAILABLE' | 'UNAVAILABLE') => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-200';
      case 'UNAVAILABLE': return 'bg-red-200';
      case 'VOID': return 'bg-gray-200';
      default: return 'bg-gray-200';
    }
  };

   // Function to handle file upload
   const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (result: Papa.ParseResult<string[]>) => {
        const data: string[][] = result.data;
        processCSVData(data);
      },
      skipEmptyLines: true,
    });
  };

  // Process CSV Data and update seats
  const processCSVData = (data: string[][]) => {
    let startRow = Infinity, endRow = -1;
    let startCol = Infinity, endCol = -1;

    // Detect grid bounds
    data.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell.trim() !== '') {
          if (rowIndex < startRow) startRow = rowIndex;
          if (rowIndex > endRow) endRow = rowIndex;
          if (colIndex < startCol) startCol = colIndex;
          if (colIndex > endCol) endCol = colIndex;
        }
      });
    });

    if (startRow === Infinity || startCol === Infinity) return;

    const seatList: Seat[] = [];
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const label = data[row]?.[col]?.trim() || '';
        seatList.push({
          id: `${row - startRow}-${col - startCol}`,
          row: row - startRow,
          column: col - startCol,
          label,
          status: label ? 'AVAILABLE' : 'VOID',
        });
      }
    }

    setRows(endRow - startRow + 1);
    setColumns(endCol - startCol + 1);
    setSeats(seatList);
  };
 
  // Make sure you have this return statement:
  return (
    <div className="flex flex-col items-center h-screen w-screen p-4 pr-4 overflow-hidden">
      
      {/* Title */}
      <h1 className="text-2xl font-bold mb-4">Event Seat Mapping Tool</h1>

      {/* Input controls */}
      <div className="mb-4 flex flex-wrap gap-4 items-end w-full justify-center">
        <div>
          <label className="block mb-1">Rows:</label>
          <input 
            type="number" 
            min="1"
            max="50"
            value={tempRows} 
            onChange={(e) => setTempRows(parseInt(e.target.value) || 1)} 
            className="border rounded p-2 w-24"
          />
        </div>
        <div>
          <label className="block mb-1">Columns:</label>
          <input 
            type="number" 
            min="1"
            max="50"
            value={tempColumns} 
            onChange={(e) => setTempColumns(parseInt(e.target.value) || 1)} 
            className="border rounded p-2 w-24"
          />
        </div>

        {/* Apply Button */}
        <button 
          onClick={() => {
            setRows(tempRows);
            setColumns(tempColumns);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded" >
          Apply
        </button>
  
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
          {/* <button 
            onClick={() => setEditMode('category')}
            className={`px-4 py-2 ${editMode === 'category' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
          >
            Category Editor
          </button> */}
        </div>
      
        <label className="cursor-pointer bg-blue-600 text-white py-2 px-6 rounded-lg shadow hover:bg-blue-700 ">
        Upload Seatmap CSV
        <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
        </label>

        <button 
          onClick={generateCSV}
          className="cursor-pointer bg-green-500 text-white py-2 px-6 rounded-lg ml-auto mr-8 shadow hover:bg-green-700">
          Generate CSV
        </button>
      </div>    

      <div className="mb-4 p-2 bg-gray-100 rounded text-center w-full max-w-3xl">
        <p className="text-sm">
          {editMode === 'status' 
            ? 'Click on seats to cycle through status: VOID → AVAILABLE → UNAVAILABLE → VOID' 
            : 'Click on seats to edit their labels (max 4 characters). Press Enter to save.'}
        </p>
      </div>
  
      {/* Scrollable Grid Container */}
      <div 
        className="flex-grow w-full max-w-screen-2xl overflow-auto border bg-white mb-0"
        style={{ height: 'calc(100vh - 180px)' }} // Adjusts grid height dynamically
      >

      <div className="bg-gray-100 place-self-auto text-center w-full max-w-screen-2xl pr-2 fixed z-10 border">
        <p className="text-2xl font-bold"> STAGE
        </p>
      </div>

        <div className="relative mx-auto w-max mt-14 z-0"> {/* Centers the grid */}
          {/* Column headers */}
          <div className="flex ml-8">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={`col-${colIndex}`} className="w-[50px] h-[30px] flex items-center justify-center text-sm font-medium">
                {colIndex}
              </div>
            ))}
          </div>
  
          {/* Rows with row headers */}
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={`row-${rowIndex}`} className="flex">
              {/* Row header */}
              <div className="w-[30px] h-[50px] flex items-center justify-center text-sm font-medium">
                {rowIndex}
              </div>
  
              {/* Seats */}
              {seats
                .filter(seat => seat.row === rowIndex)
                .map((seat) => (
                  <div
                    key={seat.id}
                    onClick={() => handleSeatClick(seat)}
                    className={`w-[50px] h-[50px] flex items-center justify-center cursor-pointer border rounded text-xs ${getColorForStatus(seat.status)}`}
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
      {/* Summary Section */}
      <div className="mt-0 mb-10 text-center text-lg font-semibold">
        <p>Total Grid : {seats.length}</p>
      </div>

      {/* Status Legend (Sticky at Bottom) */}
      <div className="mt-4 flex gap-4 bg-white py-2 px-4 shadow-md fixed bottom-0 w-full justify-center">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-200 mr-2"></div>
          <span className="text-xs">AVAILABLE : {seats.filter(seat => seat.status === 'AVAILABLE').length}</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-200 mr-2"></div>
          <span className="text-xs">UNAVAILABLE : {seats.filter(seat => seat.status === 'UNAVAILABLE').length}</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-200 mr-2"></div>
          <span className="text-xs">VOID : {seats.filter(seat => seat.status === 'VOID').length}</span>
        </div>
      </div>

    </div>
  );
  
};

export default SeatMappingTool;