import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import VisitorCounterBanner from '../../components/common/VisitorCounter';
import {
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  Building,
  GraduationCap,
  Calendar,
  RefreshCw,
  ShieldCheck,
  Filter
} from 'lucide-react';
import './admin.css';

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Filler
} from 'chart.js';

// Register ChartJS modules
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Filler
);

const ReviewerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // States for stats
  const [summary, setSummary] = useState({
    totalStudents: 0,
    verifiedStudents: 0,
    pendingStudents: 0,
    joinedThisMonth: 0,
  });
  const [monthlyJoinings, setMonthlyJoinings] = useState([]);
  const [departmentStats, setDepartmentStats] = useState([]);
  const [batchStats, setBatchStats] = useState([]);
  const [courseStats, setCourseStats] = useState([]);
  const [recentJoinings, setRecentJoinings] = useState([]);
  const [error, setError] = useState('');

  // Department filter for deep dive
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');

  const fetchAllStats = useCallback(async () => {
    try {
      setError('');
      const [
        summaryRes,
        monthlyRes,
        deptRes,
        batchRes,
        courseRes
      ] = await Promise.all([
        api.get('/admin/stats/reviewer-summary'),
        api.get('/admin/users/registrations'),
        api.get('/admin/stats/by-department'),
        api.get('/admin/stats/by-batch'),
        api.get('/admin/stats/by-course'),
      ]);

      if (summaryRes.data) {
        setSummary(summaryRes.data.summary || {});
        setRecentJoinings(summaryRes.data.recentJoinings || []);
      }
      if (monthlyRes.data) {
        setMonthlyJoinings(monthlyRes.data.data || []);
      }
      if (deptRes.data) {
        setDepartmentStats(deptRes.data.data || []);
      }
      if (batchRes.data) {
        setBatchStats(batchRes.data.data || []);
      }
      if (courseRes.data) {
        setCourseStats(courseRes.data.data || []);
      }
    } catch (err) {
      console.error('Error loading reviewer dashboard stats:', err);
      setError('Failed to load some dashboard metrics. Please refresh.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAllStats();
  }, [fetchAllStats]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAllStats();
  };

  // 1. Student Joining Over Time (Monthly Trend)
  const monthlyChartData = {
    labels: monthlyJoinings.map((item) => item.month),
    datasets: [
      {
        label: 'Student Joinings',
        data: monthlyJoinings.map((item) => item.count),
        fill: true,
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        borderColor: '#2563eb',
        borderWidth: 2.5,
        tension: 0.35,
        pointBackgroundColor: '#2563eb',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  // 2. Department-Based Joining Graph (Verified vs Pending Breakdown)
  const filteredDepartments = selectedDeptFilter === 'ALL'
    ? departmentStats
    : departmentStats.filter((d) => d.department === selectedDeptFilter);

  const deptChartData = {
    labels: filteredDepartments.map((d) => d.department),
    datasets: [
      {
        label: 'Approved / Verified',
        data: filteredDepartments.map((d) => d.verifiedCount || 0),
        backgroundColor: '#10b981',
        borderRadius: 6,
      },
      {
        label: 'Pending Review',
        data: filteredDepartments.map((d) => d.pendingCount || 0),
        backgroundColor: '#f59e0b',
        borderRadius: 6,
      },
    ],
  };

  // 3. Batch-Wise Student Distribution
  const batchChartData = {
    labels: batchStats.map((b) => b.batch),
    datasets: [
      {
        label: 'Registered Students',
        data: batchStats.map((b) => b.count),
        backgroundColor: 'rgba(99, 102, 241, 0.75)',
        borderColor: '#4f46e5',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  // 4. Course / Programme Breakdown
  const courseChartData = {
    labels: courseStats.map((c) => c.course),
    datasets: [
      {
        label: 'Students Count',
        data: courseStats.map((c) => c.count),
        backgroundColor: [
          '#3b82f6',
          '#10b981',
          '#f59e0b',
          '#ec4899',
          '#8b5cf6',
          '#06b6d4',
          '#64748b',
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  // 5. Verification Status Doughnut
  const verificationChartData = {
    labels: ['Verified & Approved', 'Pending Review'],
    datasets: [
      {
        data: [summary.verifiedStudents || 0, summary.pendingStudents || 0],
        backgroundColor: ['#10b981', '#f59e0b'],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  return (
    <div className="dashboard-charts" style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        color: 'white',
        padding: '24px 30px',
        borderRadius: '12px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={28} color="#60a5fa" />
            <h1 style={{ margin: 0, fontSize: '1.85rem', fontWeight: '700' }}>Reviewer Analytics & Stats Dashboard</h1>
          </div>
          <p style={{ margin: '6px 0 0 0', color: '#94a3b8', fontSize: '14px' }}>
            Comprehensive analytics on student joinings, department distributions, batches, and review pipeline.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'background 0.2s'
            }}
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          padding: '12px 16px',
          marginBottom: '20px',
          backgroundColor: '#fee2e2',
          color: '#991b1b',
          borderRadius: '8px',
          fontWeight: '500'
        }}>
          {error}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
        marginBottom: '28px'
      }}>
        {/* Total Students */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          borderLeft: '5px solid #3b82f6',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ color: '#64748b', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>
              Total Students
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', marginTop: '4px' }}>
              {loading ? '...' : summary.totalStudents}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              Registered on GCU Alumni
            </div>
          </div>
          <div style={{ backgroundColor: '#eff6ff', padding: '14px', borderRadius: '50%', color: '#3b82f6' }}>
            <Users size={26} />
          </div>
        </div>

        {/* Verified Students */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          borderLeft: '5px solid #10b981',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ color: '#64748b', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>
              Approved Students
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#047857', marginTop: '4px' }}>
              {loading ? '...' : summary.verifiedStudents}
            </div>
            <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px', fontWeight: '500' }}>
              {summary.totalStudents > 0
                ? `${Math.round((summary.verifiedStudents / summary.totalStudents) * 100)}% Verified`
                : '0% Verified'}
            </div>
          </div>
          <div style={{ backgroundColor: '#ecfdf5', padding: '14px', borderRadius: '50%', color: '#10b981' }}>
            <UserCheck size={26} />
          </div>
        </div>

        {/* Pending Approval */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          borderLeft: '5px solid #f59e0b',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ color: '#64748b', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>
              Pending Review
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#b45309', marginTop: '4px' }}>
              {loading ? '...' : summary.pendingStudents}
            </div>
            <div style={{ fontSize: '12px', color: '#f59e0b', marginTop: '4px', fontWeight: '500' }}>
              Requires action
            </div>
          </div>
          <div style={{ backgroundColor: '#fffbeb', padding: '14px', borderRadius: '50%', color: '#f59e0b' }}>
            <UserX size={26} />
          </div>
        </div>

        {/* Joined This Month */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          borderLeft: '5px solid #8b5cf6',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ color: '#64748b', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>
              Joined This Month
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#6d28d9', marginTop: '4px' }}>
              {loading ? '...' : summary.joinedThisMonth}
            </div>
            <div style={{ fontSize: '12px', color: '#8b5cf6', marginTop: '4px', fontWeight: '500' }}>
              Recent growth
            </div>
          </div>
          <div style={{ backgroundColor: '#f5f3ff', padding: '14px', borderRadius: '50%', color: '#8b5cf6' }}>
            <TrendingUp size={26} />
          </div>
        </div>
      </div>

      <VisitorCounterBanner />

      {/* Row 1: Student Joining Growth & Verification Ratio */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '24px',
        marginBottom: '28px'
      }}>
        {/* Monthly Joining Growth */}
        <div className="chart-container" style={{ margin: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={20} color="#2563eb" /> Student Joining Trend Over Time
            </h3>
          </div>
          <div style={{ height: '320px' }}>
            <Line
              data={monthlyChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: true, position: 'top' },
                  tooltip: { mode: 'index', intersect: false }
                },
                scales: {
                  y: { beginAtZero: true, ticks: { precision: 0 } },
                },
              }}
            />
          </div>
        </div>

        {/* Verification Status Distribution */}
        <div className="chart-container" style={{ margin: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={20} color="#10b981" /> Verification Status Ratio
            </h3>
          </div>
          <div style={{ height: '320px', display: 'flex', justifyContent: 'center' }}>
            <Doughnut
              data={verificationChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'bottom' },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Row 2: Department-Based Joining Graph */}
      <div className="chart-container" style={{ margin: '0 0 28px 0' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '15px'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building size={20} color="#10b981" /> Department / Branch-Based Joining Graph
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              Shows approved vs pending student registrations across all departments and branches.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} color="#64748b" />
            <select
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              <option value="ALL">All Departments ({departmentStats.length})</option>
              {departmentStats.map((d) => (
                <option key={d.department} value={d.department}>
                  {d.department} ({d.count})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ height: '360px' }}>
          <Bar
            data={deptChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: 'top' },
                tooltip: { mode: 'index', intersect: false }
              },
              scales: {
                x: { stacked: true },
                y: { stacked: true, beginAtZero: true, ticks: { precision: 0 } },
              },
            }}
          />
        </div>
      </div>

      {/* Row 3: Batch-Wise Joining & Course Breakdown */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '24px',
        marginBottom: '28px'
      }}>
        {/* Batch-wise */}
        <div className="chart-container" style={{ margin: 0 }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '1.15rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={20} color="#4f46e5" /> Batch-Wise Joining Distribution
          </h3>
          <div style={{ height: '320px' }}>
            <Bar
              data={batchChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                },
                scales: {
                  y: { beginAtZero: true, ticks: { precision: 0 } },
                },
              }}
            />
          </div>
        </div>

        {/* Course / Programme */}
        <div className="chart-container" style={{ margin: 0 }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '1.15rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GraduationCap size={20} color="#8b5cf6" /> Course & Degree Breakdown
          </h3>
          <div style={{ height: '320px', display: 'flex', justifyContent: 'center' }}>
            <Doughnut
              data={courseChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'bottom' },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Recent Student Registrations Table */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '16px'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b' }}>Recent Student Joinings</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              Latest student registrations and verification status overview.
            </p>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="admin-dashboard-table" style={{ width: '100%', marginTop: '10px' }}>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Roll No</th>
                <th>Course / Degree</th>
                <th>Department / Branch</th>
                <th>Batch</th>
                <th>Date Joined</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentJoinings.length > 0 ? (
                recentJoinings.map((student) => (
                  <tr key={student._id}>
                    <td style={{ fontWeight: '500' }}>
                      {student.name}
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{student.email}</div>
                    </td>
                    <td>{student.roll_no || 'N/A'}</td>
                    <td>{student.course || student.programme || 'N/A'}</td>
                    <td>{student.branch || 'General'}</td>
                    <td>{student.batch ? `Batch ${student.batch}` : 'N/A'}</td>
                    <td>
                      {student.createdAt
                        ? new Date(student.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'N/A'}
                    </td>
                    <td>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: student.isVerified ? '#dcfce7' : '#fef3c7',
                          color: student.isVerified ? '#15803d' : '#b45309',
                        }}
                      >
                        {student.isVerified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                    No recent student joinings recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReviewerDashboard;
