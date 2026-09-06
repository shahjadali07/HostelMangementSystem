import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Download, CreditCard, Clock } from 'lucide-react';
import './StudentPages.css';

export default function StudentFees() {
  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>Fees Overview</h1>
        <p>Manage and track your hostel fee payments.</p>
      </div>

      <div className="form-grid" style={{ marginBottom: '24px' }}>
        <div className="page-card" style={{ marginBottom: 0 }}>
          <p style={{ color: '#646473', fontSize: '13px', marginBottom: '8px' }}>Total Fees (Yearly)</p>
          <h2 style={{ border: 'none', padding: 0, margin: 0, fontSize: '28px' }}>₹40,000</h2>
        </div>
        <div className="page-card" style={{ marginBottom: 0 }}>
          <p style={{ color: '#646473', fontSize: '13px', marginBottom: '8px' }}>Total Paid</p>
          <h2 style={{ border: 'none', padding: 0, margin: 0, fontSize: '28px', color: '#22c55e' }}>₹36,000</h2>
        </div>
        <div className="page-card" style={{ marginBottom: 0, backgroundColor: '#fff2f2', borderColor: '#ffd5d5' }}>
          <p style={{ color: '#cc3333', fontSize: '13px', marginBottom: '8px' }}>Pending Amount</p>
          <h2 style={{ border: 'none', padding: 0, margin: 0, fontSize: '28px', color: '#8b0000' }}>₹4,000</h2>
          <button className="btn-primary" style={{ marginTop: '16px', width: '100%', justifyContent: 'center', backgroundColor: '#8b0000' }}>
            <CreditCard size={16} /> Pay Now
          </button>
        </div>
      </div>

      <div className="page-card">
        <h2>Payment History</h2>
        <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #eaeaef', color: '#646473', fontSize: '12px' }}>
              <th style={{ padding: '12px 8px' }}>TRANSACTION ID</th>
              <th style={{ padding: '12px 8px' }}>DATE</th>
              <th style={{ padding: '12px 8px' }}>AMOUNT</th>
              <th style={{ padding: '12px 8px' }}>STATUS</th>
              <th style={{ padding: '12px 8px', textAlign: 'right' }}>RECEIPT</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #f0f0f4' }}>
              <td style={{ padding: '16px 8px', fontSize: '14px', fontWeight: '500' }}>#TXN-847291</td>
              <td style={{ padding: '16px 8px', fontSize: '14px', color: '#646473' }}>15 Jan 2024</td>
              <td style={{ padding: '16px 8px', fontSize: '14px', fontWeight: '600' }}>₹18,000</td>
              <td style={{ padding: '16px 8px' }}><span style={{ backgroundColor: '#e5ffe8', color: '#22c55e', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>Success</span></td>
              <td style={{ padding: '16px 8px', textAlign: 'right' }}>
                <button style={{ background: 'none', border: 'none', color: '#5142f5', cursor: 'pointer' }}><Download size={18} /></button>
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #f0f0f4' }}>
              <td style={{ padding: '16px 8px', fontSize: '14px', fontWeight: '500' }}>#TXN-552109</td>
              <td style={{ padding: '16px 8px', fontSize: '14px', color: '#646473' }}>10 Aug 2023</td>
              <td style={{ padding: '16px 8px', fontSize: '14px', fontWeight: '600' }}>₹18,000</td>
              <td style={{ padding: '16px 8px' }}><span style={{ backgroundColor: '#e5ffe8', color: '#22c55e', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>Success</span></td>
              <td style={{ padding: '16px 8px', textAlign: 'right' }}>
                <button style={{ background: 'none', border: 'none', color: '#5142f5', cursor: 'pointer' }}><Download size={18} /></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
