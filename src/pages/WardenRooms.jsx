import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useApp, HOSTELS } from '../context/AppContext';
import { ArrowLeft, Search, X, User } from 'lucide-react';
import './WardenRooms.css';

export default function WardenRooms() {
  const { currentWarden } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Change Room State
  const [showChangeRoomModal, setShowChangeRoomModal] = useState(false);
  const [changingStudent, setChangingStudent] = useState(null);
  const [changingFromRoom, setChangingFromRoom] = useState(null);
  const [changingFromBed, setChangingFromBed] = useState(null);
  const [availableRoomsList, setAvailableRoomsList] = useState([]);
  const [selectedNewRoomId, setSelectedNewRoomId] = useState('');
  const [selectedNewBedId, setSelectedNewBedId] = useState('');
  const [changingStatus, setChangingStatus] = useState('');
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [floorFilter, setFloorFilter] = useState('All');
  const [occupancyFilter, setOccupancyFilter] = useState('All');

  const hostel = currentWarden ? HOSTELS.find(h => h.id === currentWarden.assignedHostel || h.id === currentWarden.hostelId) : null;
  const hostelName = hostel ? hostel.name : 'Assigned Hostel';

  useEffect(() => {
    fetchRooms();
  }, [currentWarden]);

  useEffect(() => {
    if (selectedRoom) {
      document.title = `Room ${selectedRoom.roomNumber} | Hostel Management System`;
    } else {
      document.title = 'Rooms & Beds | Hostel Management System';
    }
  }, [selectedRoom]);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('wardenToken');
      const res = await fetch('/api/warden/rooms', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRooms(data);
        
        // If a room is currently selected, update its data
        if (selectedRoom) {
          const updatedRoom = data.find(r => r._id === selectedRoom._id);
          if (updatedRoom) setSelectedRoom(updatedRoom);
        } else if (location.state?.selectedRoomId) {
          const initialRoom = data.find(r => r._id === location.state.selectedRoomId);
          if (initialRoom) setSelectedRoom(initialRoom);
        }
      }
    } catch (err) {
      console.error('Error fetching rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableRoomsForAllocation = async () => {
    try {
      const token = localStorage.getItem('wardenToken');
      const res = await fetch('/api/warden/rooms/available-for-allocation', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setAvailableRoomsList(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangeRoomInit = (student, room, bed) => {
    setChangingStudent(student);
    setChangingFromRoom(room);
    setChangingFromBed(bed);
    setSelectedNewRoomId('');
    setSelectedNewBedId('');
    setChangingStatus('');
    setShowChangeRoomModal(true);
    fetchAvailableRoomsForAllocation();
  };

  const submitChangeRoom = async () => {
    if (!selectedNewRoomId || !selectedNewBedId) return;
    try {
      setChangingStatus('Processing...');
      const token = localStorage.getItem('wardenToken');
      const payload = {
        studentId: changingStudent._id,
        oldRoomId: changingFromRoom._id,
        oldBedId: changingFromBed.bedId,
        newRoomId: selectedNewRoomId,
        newBedId: selectedNewBedId
      };
      const res = await fetch('/api/warden/change-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setChangingStatus('Success! Room changed.');
        setTimeout(() => {
          setShowChangeRoomModal(false);
          setChangingStatus('');
          fetchRooms();
        }, 1500);
      } else {
        const errData = await res.json();
        setChangingStatus(`Error: ${errData.message}`);
      }
    } catch (err) {
      setChangingStatus(`Error: ${err.message}`);
    }
  };

  // Compute Stats
  let totalRooms = rooms.length;
  let totalBeds = 0;
  let occupiedBeds = 0;
  let availableBeds = 0;
  let maintenanceBeds = 0;

  rooms.forEach(room => {
    totalBeds += room.capacity;
    room.beds.forEach(bed => {
      if (bed.status === 'OCCUPIED') occupiedBeds++;
      else if (bed.status === 'AVAILABLE') availableBeds++;
      else if (bed.status === 'MAINTENANCE') maintenanceBeds++;
    });
  });

  const occupancyPercentage = totalBeds > 0 ? ((occupiedBeds / totalBeds) * 100).toFixed(1) : 0;

  // Filter Data
  const floors = [...new Set(rooms.map(r => r.floor))].sort();
  
  const getRoomStatus = (room) => {
    const occupiedCount = room.beds.filter(b => b.status === 'OCCUPIED').length;
    const maintenanceCount = room.beds.filter(b => b.status === 'MAINTENANCE').length;
    
    if (maintenanceCount === room.capacity) return 'MAINTENANCE';
    if (occupiedCount === room.capacity) return 'FULL';
    if (occupiedCount > 0) return 'PARTIALLY_OCCUPIED';
    return 'AVAILABLE';
  };

  const filteredRooms = rooms.filter(room => {
    const status = getRoomStatus(room);
    
    // Search
    if (searchQuery && !room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    // Floor
    if (floorFilter !== 'All' && room.floor !== floorFilter) return false;
    
    // Occupancy
    if (occupancyFilter !== 'All') {
      if (occupancyFilter === 'Available' && status !== 'AVAILABLE') return false;
      if (occupancyFilter === 'Partially Occupied' && status !== 'PARTIALLY_OCCUPIED') return false;
      if (occupancyFilter === 'Full' && status !== 'FULL') return false;
      if (occupancyFilter === 'Maintenance' && status !== 'MAINTENANCE') return false;
    }
    
    return true;
  });

  // Group by floor
  const groupedByFloor = floors.reduce((acc, floor) => {
    const floorRooms = filteredRooms.filter(r => r.floor === floor);
    if (floorRooms.length > 0) {
      acc[floor] = floorRooms.sort((a, b) => a.roomNumber.localeCompare(b.roomNumber));
    }
    return acc;
  }, {});

  const getStatusClass = (status) => {
    switch (status) {
      case 'AVAILABLE': return 'status-available';
      case 'PARTIALLY_OCCUPIED': return 'status-partially-occupied';
      case 'FULL': return 'status-full';
      case 'MAINTENANCE': return 'status-maintenance';
      default: return '';
    }
  };

  const handleRoomClick = (room) => {
    setSelectedRoom(room);
  };

  const closeDrawer = () => {
    setSelectedRoom(null);
  };

  return (
    <DashboardLayout>
      <div className="warden-rooms-page">
        {/* Header */}
        <div className="rooms-header">
          <Link to="/warden" className="back-link"><ArrowLeft size={16}/> Dashboard</Link>
          <h1>Rooms & Beds</h1>
          <p>View room occupancy and manage student allocations for <strong>{hostelName}</strong>.</p>
        </div>

        {/* Stats */}
        <div className="rooms-stats">
          <div className="stat-box">
            <span className="stat-num">{totalRooms}</span>
            <span className="stat-label">Total Rooms</span>
          </div>
          <div className="stat-box">
            <span className="stat-num">{totalBeds}</span>
            <span className="stat-label">Total Beds</span>
          </div>
          <div className="stat-box">
            <span className="stat-num" style={{color: '#16a34a'}}>{occupiedBeds}</span>
            <span className="stat-label">Occupied</span>
          </div>
          <div className="stat-box">
            <span className="stat-num" style={{color: '#3b82f6'}}>{availableBeds}</span>
            <span className="stat-label">Available</span>
          </div>
          <div className="stat-box">
            <span className="stat-num" style={{color: '#9333ea'}}>{occupancyPercentage}%</span>
            <span className="stat-label">Occupancy</span>
          </div>
        </div>

        {/* Controls */}
        <div className="rooms-controls">
          <div style={{ display: 'flex', alignItems: 'center', position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '10px', color: '#94a3b8' }}/>
            <input 
              type="text" 
              placeholder="Search Room..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '35px', width: '100%' }}
            />
          </div>
          
          <select value={floorFilter} onChange={(e) => setFloorFilter(e.target.value)}>
            <option value="All">All Floors</option>
            {floors.map(f => <option key={f} value={f}>{f === 0 || f === '0' ? 'Ground' : f === 1 || f === '1' ? 'First' : f} Floor</option>)}
          </select>

          <select value={occupancyFilter} onChange={(e) => setOccupancyFilter(e.target.value)}>
            <option value="All">All Occupancy</option>
            <option value="Available">Available</option>
            <option value="Partially Occupied">Partially Occupied</option>
            <option value="Full">Full</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>

        {/* Legend */}
        <div className="rooms-legend">
          <div className="legend-item"><div className="legend-color" style={{background: '#22c55e'}}></div> Available</div>
          <div className="legend-item"><div className="legend-color" style={{background: '#eab308'}}></div> Partially Occupied</div>
          <div className="legend-item"><div className="legend-color" style={{background: '#ef4444'}}></div> Full</div>
          <div className="legend-item"><div className="legend-color" style={{background: '#94a3b8'}}></div> Maintenance</div>
        </div>

        {/* Main Grid Area */}
        <div className="rooms-main">
          
          {/* Grid Container */}
          <div className="rooms-grid-container">
            {loading ? (
              <p style={{textAlign: 'center', color: '#64748b'}}>Loading rooms...</p>
            ) : Object.keys(groupedByFloor).length === 0 ? (
              <p style={{textAlign: 'center', color: '#64748b', marginTop: '2rem'}}>No rooms found matching your criteria.</p>
            ) : (
              Object.entries(groupedByFloor).map(([floor, floorRooms]) => (
                <div key={floor} className="floor-section">
                  <h3>{floor === 0 || floor === '0' ? 'Ground' : floor === 1 || floor === '1' ? 'First' : floor} Floor</h3>
                  <div className="rooms-grid">
                    {floorRooms.map(room => {
                      const status = getRoomStatus(room);
                      const isSelected = selectedRoom?._id === room._id;
                      const occupiedCount = room.beds.filter(b => b.status === 'OCCUPIED').length;
                      
                      return (
                        <div 
                          key={room._id} 
                          className={`room-card ${getStatusClass(status)} ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleRoomClick(room)}
                        >
                          <div className="room-number">{room.roomNumber}</div>
                          <div className="room-occupancy">{occupiedCount} / {room.capacity}</div>
                          <div className="room-status-indicator"></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer / Panel */}
          {selectedRoom && (
            <div className="room-drawer">
              <div className="drawer-header">
                <div>
                  <h2>Room {selectedRoom.roomNumber}</h2>
                  <p style={{margin: 0, fontSize: '0.9rem', color: '#64748b'}}>Floor: {selectedRoom.floor} • Capacity: {selectedRoom.capacity} Beds</p>
                </div>
                <button className="close-btn" onClick={closeDrawer}><X size={20}/></button>
              </div>
              
              <div className="drawer-content">
                <div className="bed-list">
                  {selectedRoom.beds.map((bed, index) => {
                    const bedNum = index + 1;
                    
                    if (bed.status === 'AVAILABLE') {
                      return (
                        <div key={bed._id} className="bed-card available">
                          <h4 style={{margin: '0 0 0.5rem 0', color: '#16a34a'}}>Bed {bedNum} - Available</h4>
                          <button 
                            className="allocate-btn"
                            onClick={() => {
                              // We could open a modal or navigate to an allocation page here.
                              // For now, let's alert or integrate if an allocation page exists.
                              alert(`This would open the allocation workflow for Room ${selectedRoom.roomNumber}, Bed ${bedNum}.`);
                            }}
                          >
                            Allocate Student
                          </button>
                        </div>
                      );
                    }

                    if (bed.status === 'OCCUPIED') {
                      const student = bed.studentId;
                      return (
                        <div key={bed._id} className="bed-card">
                          <div className="bed-card-header">
                            <span>Bed {bedNum}</span>
                            <span style={{color: '#ef4444', fontSize: '0.85rem'}}>Occupied</span>
                          </div>
                          
                          {student ? (
                            <>
                              <div className="student-info">
                                <div className="student-avatar"><User size={20}/></div>
                                <div className="student-details-mini">
                                  <strong>{student.name}</strong>
                                  <p style={{color: '#64748b'}}>{student.enrollmentNo || 'N/A'}</p>
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                <button 
                                  className="view-profile-btn"
                                  style={{ flex: 1 }}
                                  onClick={() => navigate('/warden/students', { state: { selectedStudentId: student._id } })}
                                >
                                  View Profile
                                </button>
                                <button 
                                  className="view-profile-btn"
                                  style={{ flex: 1, backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1' }}
                                  onClick={() => handleChangeRoomInit(student, selectedRoom, bed)}
                                >
                                  Change Room
                                </button>
                              </div>
                            </>
                          ) : (
                            <p style={{color: '#64748b', fontSize: '0.9rem', margin: '0.5rem 0'}}>Student data not found.</p>
                          )}
                        </div>
                      );
                    }

                    return (
                      <div key={bed._id} className="bed-card" style={{opacity: 0.6}}>
                        <div className="bed-card-header">
                          <span>Bed {bedNum}</span>
                          <span style={{color: '#94a3b8', fontSize: '0.85rem'}}>{bed.status}</span>
                        </div>
                        <p style={{margin: '0.5rem 0', fontSize: '0.9rem', color: '#64748b'}}>This bed is currently unavailable.</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {showChangeRoomModal && changingStudent && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>Change Room</h2>
              <button className="close-btn" onClick={() => setShowChangeRoomModal(false)}><X size={20}/></button>
            </div>
            <div className="modal-body" style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 0.5rem 0' }}>Student: {changingStudent.name}</h4>
                <p style={{ margin: 0, color: '#64748b' }}>Current: Room {changingFromRoom.roomNumber} (Bed {changingFromBed.bedId.split('-').pop()})</p>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Select New Room</label>
                <select 
                  value={selectedNewRoomId} 
                  onChange={(e) => {
                    setSelectedNewRoomId(e.target.value);
                    setSelectedNewBedId('');
                  }}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                >
                  <option value="">-- Select Available Room --</option>
                  {availableRoomsList.map(r => (
                    <option key={r._id} value={r._id}>Room {r.roomNumber} (Floor {r.floor === 0 || r.floor === '0' ? 'Ground' : r.floor === 1 || r.floor === '1' ? 'First' : r.floor}) - {r.availableBeds.length} available beds</option>
                  ))}
                </select>
              </div>

              {selectedNewRoomId && (
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Select New Bed</label>
                  <select 
                    value={selectedNewBedId} 
                    onChange={(e) => setSelectedNewBedId(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="">-- Select Bed --</option>
                    {availableRoomsList.find(r => r._id === selectedNewRoomId)?.availableBeds.map(b => (
                      <option key={b.bedId} value={b.bedId}>Bed {b.bedId.split('-').pop()}</option>
                    ))}
                  </select>
                </div>
              )}

              {changingStatus && (
                <div style={{ padding: '0.75rem', backgroundColor: changingStatus.includes('Error') ? '#fef2f2' : '#f0fdf4', color: changingStatus.includes('Error') ? '#ef4444' : '#16a34a', borderRadius: '6px', marginBottom: '1rem' }}>
                  {changingStatus}
                </div>
              )}

              <button 
                onClick={submitChangeRoom}
                disabled={!selectedNewRoomId || !selectedNewBedId || changingStatus.includes('Processing') || changingStatus.includes('Success')}
                style={{ width: '100%', padding: '0.75rem', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: (!selectedNewRoomId || !selectedNewBedId || changingStatus.includes('Processing')) ? 'not-allowed' : 'pointer', opacity: (!selectedNewRoomId || !selectedNewBedId) ? 0.5 : 1 }}
              >
                Confirm Room Change
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
