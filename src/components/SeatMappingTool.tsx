"use client";

import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { usePathname } from "next/navigation"; // ✅ Import Next.js hook

// Define the Seat interface
interface Seat {
  id: string;
  row: number;
  column: number;
  label: string;
  status: 'VOID' | 'AVAILABLE' | 'UNAVAILABLE';
}

const SeatMappingTool = () => {
  const pathname = usePathname(); // ✅ Get the current route
  const isLabelMode = pathname === "/label"; // ✅ Check if user is in Label Mode

  const [rows, setRows] = useState(5);
  const [columns, setColumns] = useState(5);
  const [tempRows, setTempRows] = useState(5);  // Temporary input
  const [tempColumns, setTempColumns] = useState(5);  // Temporary input
  const [seats, setSeats] = useState<Seat[]>([]);
  
  const [isDragging, setIsDragging] = useState(false);
  const [targetStatus, setTargetStatus] = useState<Seat["status"] | null>(null);
  const [changedSeats, setChangedSeats] = useState(new Set<string>()); // Track updated seats
  const ENABLE_LABEL_EDITING = true; // Label editing Feature Flag, Change to true to enable

  const [editMode, setEditMode] = useState<"status" | "label">("status");
  const [editingSeatId, setEditingSeatId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState("");  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null); // ✅ Fixed Type

  const openModal = () => {
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
  };
  
  // Initialize the seat grid when rows or columns change
  useEffect(() => {
    setSeats((prevSeats) => {
      const newSeats: Seat[] = [];
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
          const existingSeat = prevSeats.find(seat => seat.row === row && seat.column === col);
          newSeats.push(
            existingSeat || { id: `${row}-${col}`, row, column: col, label: '', status: 'VOID' }
          );
        }
      }
      return newSeats;
    });
  }, [rows, columns]);
  
  useEffect(() => {
    if (typeof window === "undefined") return; // ✅ Prevents server execution
  
    if (editingSeatId) {
      console.log("🔍 DEBUG: Looking for Input ID:", `seat-input-${editingSeatId}`);
  
      let attempts = 0;
      const interval = setInterval(() => {
        const inputElement = document.getElementById(`seat-input-${editingSeatId}`) as HTMLInputElement;
  
        if (inputElement) {
          console.log("✅ SUCCESS: Found Input, Trying to Focus:", editingSeatId);
          inputElement.focus();
          clearInterval(interval);
        } else {
          console.log(`⚠️ Retry #${attempts + 1}: Input Not Found Yet`);
        }
  
        if (++attempts > 5) {
          clearInterval(interval);
          console.log("❌ ERROR: Input Still Not Found After Multiple Attempts");
        }
      }, 50); // ✅ Check every 50ms, up to 5 times
    }
  }, [editingSeatId]);
  
  useEffect(() => {
    if (!isLabelMode) return; // ✅ Prevents running in Status Mode

    console.log("🚀 Running Label Mode functions...");

    // Example: Auto-focus logic only for Label Mode
    if (editingSeatId) {
      setTimeout(() => {
        const inputElement = document.getElementById(`seat-input-${editingSeatId}`) as HTMLInputElement;
        if (inputElement) {
          console.log("✅ Focused on Label Input:", editingSeatId);
          inputElement.focus();
        }
      }, 100);
    }
  }, [editingSeatId, isLabelMode]); // ✅ Only triggers in Label Mode


  // const [isDragging, setIsDragging] = useState(false);
  // const [targetStatus, setTargetStatus] = useState<Seat["status"] | null>(null);
  // const [changedSeats, setChangedSeats] = useState(new Set<string>()); // Track updated seats
  
  // const toggleSeatStatus = (currentStatus: Seat["status"], target: Seat["status"]) => {
  //   return target; // Instead of cycling, we apply the target status directly
  // };

  const handleEditModeToggle = (mode: "status" | "label") => {
    setEditMode(mode);
    setEditingSeatId(null); // ✅ Reset any currently edited seat
  };
  
  // const toggleSeatStatus = (seat: Seat): Seat => {
  //   const nextStatus: Record<Seat["status"], Seat["status"]> = {
  //     VOID: "AVAILABLE",
  //     AVAILABLE: "UNAVAILABLE",
  //     UNAVAILABLE: "VOID",
  //   };
  //   return { ...seat, status: nextStatus[seat.status] };
  // };
  const handleMouseDown = (seat: Seat, event: React.MouseEvent) => {
    console.log("Mouse Down Event Triggered");
    console.log("Current Edit Mode:", editMode);
  
    if (editMode === "status") {
      event.preventDefault();
      const newStatus = seat.status === "VOID" ? "AVAILABLE" : seat.status === "AVAILABLE" ? "UNAVAILABLE" : "VOID";
  
      setIsDragging(true);
      setTargetStatus(newStatus);
      setChangedSeats(new Set([seat.id]));
      setSeats(seats.map(s => (s.id === seat.id ? { ...s, status: newStatus } : s)));
  
      console.log("Status Changed for Seat:", seat.id);
    } else if (editMode === "label") {
      event.stopPropagation(); // ✅ Prevents interference
      console.log("Switching to Label Edit Mode for Seat:", seat.id);
  
      if (editingSeatId === seat.id) {
        console.log("🟡 DEBUG: Already Editing This Seat, Ignoring Click:", seat.id);
        return;
      }
  
      setEditingSeatId(seat.id);
      setEditingLabel(seat.label || "");
    }
  };
        
  const handleMouseEnter = (seat: Seat) => {
    if (isDragging && editMode === "status" && !changedSeats.has(seat.id)) {
      setChangedSeats(prev => new Set(prev).add(seat.id)); // Track changed seats
      setSeats(seats.map(s => (s.id === seat.id ? { ...s, status: targetStatus! } : s)));
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
    setChangedSeats(new Set()); // Reset changed seats tracking
  };
  
  const handleLabelSave = (e: React.KeyboardEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>) => {
    if ((e as React.KeyboardEvent).key === "Enter" || e.type === "blur") {
      setSeats(seats.map(seat => 
        seat.id === editingSeatId ? { ...seat, label: editingLabel.substring(0, 4) } : seat
      ));
      setEditingSeatId(null);
      setEditingLabel("");
    }
  };
  
  const saveGridToLocalStorage = () => {
    localStorage.setItem("seatGrid", JSON.stringify(seats));
  };
  
  useEffect(() => {
    const savedGrid = localStorage.getItem("seatGrid");
    if (savedGrid) {
      setSeats(JSON.parse(savedGrid));
    }
  }, []);
  
  // Generate and download CSV
  const generateCSV = () => {
    if (typeof window === "undefined") return; // ✅ Prevents execution on the server
  
    const headers = 'Row,Column,Label,Status\n';
    const csvContent = seats.map(seat => 
      `${seat.row},${seat.column},${seat.label},${seat.status}`
    ).join('\n');
    
    const blob = new Blob([headers + csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    // ✅ Ensure this only runs in the browser
    if (typeof document !== "undefined") {
      const a = document.createElement('a');
      a.setAttribute('href', url);
      a.setAttribute('download', 'seat_map.csv');
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };
  

    // Check if the user already has data
  const confirmAction = (action: () => void) => {
    if (seats.length > 0) {
      setShowConfirmation(true);
      setPendingAction(() => action); // Save action to run after confirmation
    } else {
      action();
    }
  };

  const executePendingAction = () => {
    if (pendingAction) {
      pendingAction();
      setShowConfirmation(false);
      closeModal();
    }
  };

  // Create a blank seat map
  const createBlankSeatMap = () => {
    const newRows = 5; // Default grid size
    const newColumns = 5;
  
    setRows(newRows);
    setColumns(newColumns);
  
    // Generate empty seat map
    const newSeats: Seat[] = [];
    for (let row = 0; row < newRows; row++) {
      for (let col = 0; col < newColumns; col++) {
        newSeats.push({
          id: `${row}-${col}`,
          row,
          column: col,
          label: "",
          status: "VOID",
        });
      }
    }
  
    setSeats(newSeats);
    closeModal();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, restore: boolean = false) => { // ✅ Fixed function signature
    const file = event.target.files?.[0];
    if (!file) return;
  
    Papa.parse(file, {
      complete: (result: Papa.ParseResult<string[]>) => {
        const data = result.data as string[][];
        if (data.length < 2) return;
  
        if (restore) {
          // Restore Seat Map (Adjust Grid Size)
          let maxRow = 0;
          let maxCol = 0;
          const newSeats = data.slice(1).map(row => {
            const rowNum = Number(row[0]);
            const colNum = Number(row[1]);
            if (rowNum > maxRow) maxRow = rowNum;
            if (colNum > maxCol) maxCol = colNum;
            return { row: rowNum, column: colNum, label: row[2] || "", status: row[3] as "VOID" | "AVAILABLE" | "UNAVAILABLE", id: `${rowNum}-${colNum}` };
          });
          const newRows = maxRow + 1;
          const newColumns = maxCol + 1;
          setRows(newRows);
          setColumns(newColumns);
          setTempRows(newRows);
          setTempColumns(newColumns);
          setSeats(newSeats);
        } else {
          // Upload Grid Format
          processCSVData(data);
        }
        closeModal();
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
    const newRows = endRow + 1;
    const newColumns = endCol + 1;
    setRows(endRow - startRow + 1);
    setColumns(endCol - startCol + 1);
    setTempRows(newRows); // ✅ Sync input value with new row size
    setTempColumns(newColumns); // ✅ Sync input value with new column size
    setSeats(seatList);
  };
 
  // Make sure you have this return statement:
  return (
    <div className="flex flex-col items-center h-screen w-screen p-4 pr-4 overflow-hidden" onMouseUp={handleMouseUp}>
      
      {/* Title */}
      <h1 className="text-2xl font-bold mb-4">Event Seat Mapping Tool</h1>
      <p className="text-sm text-gray-600 mb-0 text-left">Create a new seat map or upload an existing one.</p>

      <h1>{isLabelMode ? "Label Mode" : "Status Mode"}</h1>
      <p>
        {isLabelMode ? "✏️ Click on a seat to edit labels." : "✅ Click on a seat to change its status."}
        </p>

      {/* Input controls */}
      <div className="mb-4 flex flex-wrap gap-4 items-end w-full justify-center">
      <div>
      {/* Button to Open Modal */}
      <button onClick={openModal} className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 ">
      Create New Seat Map
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"> 
          <div className="bg-white p-6 rounded-lg shadow-lg text-center relative z-50">
            <h2 className="text-xl font-bold mb-4">Create New Seat Map</h2>
            <p className="text-sm text-gray-600 mb-4">This action will replace your current seat map.</p>


            {/* Buttons Inside Modal */}
            <button onClick={() => confirmAction(createBlankSeatMap)} className="block w-full bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded my-2">
              Create Blank Seat Map
            </button>
            
            <label className="block w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded my-2 cursor-pointer">
              Upload Seat Map (Grid Format)
              <input type="file" accept=".csv" onChange={(e) => confirmAction(() => handleFileUpload(e, false))} className="hidden" />
            </label>

            <label className="block w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded my-2 cursor-pointer">
              Restore Seat Map (CSV Format)
              <input type="file" accept=".csv" onChange={(e) => confirmAction(() => handleFileUpload(e, true))} className="hidden" />
            </label>

            {/* Close Button */}
            <button onClick={closeModal} className="mt-4 text-gray-600 hover:text-gray-900">Cancel</button>
          </div>
        </div>
      )}

    {/* Confirmation Modal */}
    {showConfirmation && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <h2 className="text-xl font-bold mb-4">Are you sure?</h2>
          <p className="text-sm text-gray-600 mb-4">This will remove all current changes.</p>

          <button onClick={executePendingAction} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded mr-2">
            Yes, Continue
          </button>
          <button onClick={() => setShowConfirmation(false)} className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded">
            Cancel
          </button>
        </div>
      </div>
    )}
    </div>
        
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
            onClick={() => handleEditModeToggle("status")}
            className={`px-4 py-2 ${editMode === "status" ? "bg-blue-500 text-white" : "bg-gray-100"}`}
          >
            Status Editor
          </button>
          {ENABLE_LABEL_EDITING && (
          <button 
            onClick={() => handleEditModeToggle("label")}
            className={`px-4 py-2 ${editMode === "label" ? "bg-blue-500 text-white" : "bg-gray-100"}`}
          >
            Label Editor
          </button>
          )}
      </div>
          
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
        className={`flex-grow w-full max-w-screen-2xl overflow-auto border bg-white mb-0 ${
          editMode === "status" ? "select-none" : "select-text"
        }`} 
        style={{ height: 'calc(100vh - 180px)' }} 
        onMouseUp={handleMouseUp}
      >
    <div className="bg-gray-100 place-self-auto text-center w-full max-w-screen-2xl pr-2 fixed z-10 border">
      <p className="text-2xl font-bold">STAGE</p>
    </div>

    <div className="relative mx-auto w-max mt-14 z-0">
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

          <div 
            className="grid" 
            style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 50px)`, gap: '0px' }}
          >
            {seats.filter(seat => seat.row === rowIndex).map(seat => (

              // seats rendering
              <div
              key={seat.id}
              onMouseDown={(event) => !isLabelMode && handleMouseDown(seat, event)} // ✅ Status change only in `/status`
              onMouseEnter={() => !isLabelMode && handleMouseEnter(seat)} // ✅ Hover only in `/status`
              className={`w-[50px] h-[50px] flex items-center justify-center cursor-${isLabelMode ? "text" : "pointer"} border ${
                seat.status === "AVAILABLE" ? "bg-green-200" 
                : seat.status === "UNAVAILABLE" ? "bg-red-200" 
                : "bg-gray-200"
              } ${isLabelMode ? "select-text" : "select-none"}`} // ✅ Prevent text selection in Status mode
            >
              {isLabelMode && editingSeatId === seat.id ? (
                <>
                  {console.log("🔥 DEBUG: React is Rendering Input for Seat:", seat.id)}
                  <input
                    id={`seat-input-${seat.id}`} 
                    type="text"
                    value={editingLabel}
                    onChange={(e) => setEditingLabel(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        console.log("🔵 Saving Label:", editingLabel);
                        setEditingSeatId(null); // Save label and exit edit mode
                      }
                    }}
                    onBlur={() => setEditingSeatId(null)} // Exit edit mode when clicking outside
                    maxLength={4}
                    className="w-full h-full text-center bg-white border-2 border-black z-50 relative focus:outline-none"
                    autoFocus
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      width: "100%",
                      height: "100%",
                      zIndex: 1000, // ✅ Ensure it’s on top
                    }}
                  />
                </>
              ) : (
                <span 
                  onClick={(e) => { 
                    if (!isLabelMode) return; // ✅ Prevent editing outside `/label`
                    e.stopPropagation(); // ✅ Prevents conflicts with drag events
                    console.log("🟢 DEBUG: Clicked Span, Setting `editingSeatId` to:", seat.id);
                    setEditingSeatId(seat.id); 
                    setEditingLabel(seat.label || "");
                  }} 
                >
                  {seat.label || " "}
                </span>
              )}
            </div>
  

            ))}
          </div>
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