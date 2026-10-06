import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { ArrowLeft, Search, X, User } from 'lucide-react';
import './WardenRooms.css'; // Reusing the exact same CSS

export default function AdminRooms() {
  const navigate = useNavigate();
  
  const [hostels, setHostels] = useState([]);
  const [selectedHostelId, setSelectedHostelId] = useState('');
  const [rooms, setRooms] = useState([]);
  
  const [loadingHostels, setLoadingHostels] = useState(true);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [floorFilter, setFloorFilter] = useState('All');
  const [occupancyFilter, setOccupancyFilter] = useState('All');

  useEffect(() => {
    fetchHostels();
  }, []);

  useEffect(() => {
    if (selectedHostelId) {
      fetchRooms(selectedHostelId);
    } else {
      setRooms([]);
      setSelectedRoom(null);
    }
  }, [selectedHostelId]);

  useEffect(() => {
    if (selectedRoom) {
      document.title = `Room ${selectedRoom.roomNumber} | Hostel Management System`;
    } else {
      document.title = 'Rooms & Beds | Hostel Management System';
    }
  }, [selectedRoom]);

  const fetchHostels = async () => {
    try {
      const res = await fetch('/api/hostels');
      if (res.ok) {
        const data = await res.json();
        setHostels(data);
        if (data.length > 0) {
          setSelectedHostelId(data[0]._id);
        }
      }
    } catch (err) {
      console.error('Error fetching hostels:', err);
    } finally {
      setLoadingHostels(false);
    }
  };

  const fetchRooms = async (hostelId) => {
    setLoadingRooms(true);
    try {
      const res = await fetch(`/api/rooms/hostel/${hostelId}`);
      if (res.ok) {
        const data = await res.json();
        setRooms(data);
        
        // Update selected room if it's still present in new data (e.g. after refresh)
        if (selectedRoom) {
          const updatedRoom = data.find(r => r._id === selectedRoom._id);
          if (updatedRoom) {
            setSelectedRoom(updatedRoom);
          } else {
            setSelectedRoom(null);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching rooms:', err);
    } finally {
      setLoadingRooms(false);
    }
  };

  const selectedHostel = hostels.find(h => h._id === selectedHostelId);
  const hostelName = selectedHostel ? selectedHostel.name : '';

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
          <Link to="/admin" className="back-link"><ArrowLeft size={16}/> Dashboard</Link>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1>Rooms & Beds</h1>
              <p>View room occupancy, bed availability and allotted students across all hostels.</p>
            </div>
            
            {/* Hostel Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold' }}>Select Hostel</label>
              <select 
                value={selectedHostelId} 
                onChange={(e) => setSelectedHostelId(e.target.value)}
                style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem', background: 'white', minWidth: '200px' }}
                disabled={loadingHostels}
              >
                {loadingHostels ? <option>Loading...</option> : hostels.map(h => (
                  <option key={h._id} value={h._id}>{h.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {selectedHostelId && !loadingRooms && (
          <>
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
                {floors.map(f => <option key={f} value={f}>Floor {f}</option>)}
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
                {Object.keys(groupedByFloor).length === 0 ? (
                  <p style={{textAlign: 'center', color: '#64748b', marginTop: '2rem'}}>
                    {rooms.length === 0 ? 'No rooms have been configured for this hostel yet.' : 'No rooms found matching your criteria.'}
                  </p>
                ) : (
                  Object.entries(groupedByFloor).map(([floor, floorRooms]) => (
                    <div key={floor} className="floor-section">
                      <h3>Floor {floor}</h3>
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
                      <p style={{margin: 0, fontSize: '0.9rem', color: '#64748b'}}>Hostel: {hostelName} • Floor: {selectedRoom.floor} • Capacity: {selectedRoom.capacity} Beds</p>
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
                                  <button 
                                    className="view-profile-btn"
                                    onClick={() => alert('This would navigate to the full student profile page in a real app.')}
                                  >
                                    View Full Profile
                                  </button>
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
          </>
        )}
        
        {loadingRooms && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: '#64748b' }}>Loading {hostelName} rooms...</p>
          </div>
        )}
        
      </div>
    </DashboardLayout>
  );
}
