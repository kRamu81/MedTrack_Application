import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAllEquipment } from '../../services/EquipmentService';
import { getAllTasks } from '../../services/MaintenanceService';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Home, LayoutGrid, CheckSquare, Users, Settings, HelpCircle, LogOut,
  ThumbsUp, Clock, Activity, Calendar, ChevronDown, MoreHorizontal,
  Phone, Video, Paperclip, Smile, Mic, CheckCircle2, CircleDashed, Download,
  Box, ClipboardList, MessageSquare, LineChart, Mail, Workflow, Puzzle, MessageCircle, ChevronsUpDown, Diamond,
  Bot, X, Bell, Search, Share, RefreshCw, Upload, TrendingUp, TrendingDown
} from 'lucide-react';
import MedTrackLogo from '../../components/common/MedTrackLogo';

export default function Dashboard({ onNavigate }) {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [equipmentList, setEquipmentList] = useState([]);
  const [tasksList, setTasksList] = useState([]);
  const [isBotOpen, setIsBotOpen] = useState(false);
  
  const data = [
    { name: '01', operational: 3500, maintenance: 2000 },
    { name: '02', operational: 3000, maintenance: 1500 },
    { name: '03', operational: 2000, maintenance: 9800 },
    { name: '04', operational: 8000, maintenance: 3908 },
    { name: '05', operational: 6000, maintenance: 4800 },
    { name: '06', operational: 5000, maintenance: 3800 },
    { name: '07', operational: 6500, maintenance: 4300 },
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      if (user?.id === 'demo-user') {
        setEquipmentList([
          { id: 1, name: 'MRI Machine', status: 'OPERATIONAL' },
          { id: 2, name: 'X-Ray Scanner', status: 'OPERATIONAL' },
          { id: 3, name: 'CT Scanner', status: 'NEEDS_MAINTENANCE' },
        ]);
        setTasksList([
          { id: 1, title: 'Product Review for UI8 Market', status: 'In progress', time: '4h', icon: <CheckCircle2 size={18} /> },
          { id: 2, title: 'UX Research for Product', status: 'On hold', time: '8h', icon: <CircleDashed size={18} /> },
          { id: 3, title: 'App design and development', status: 'Done', time: '32h', icon: <CheckSquare size={18} /> }
        ]);
        setLoading(false);
        return;
      }

      const [equipmentData, tasksData] = await Promise.all([
        getAllEquipment().catch(() => []),
        getAllTasks().catch(() => [])
      ]);
      setEquipmentList(equipmentData);
      setTasksList(tasksData.map(t => ({ id: t.id, title: t.description || 'Task', status: t.status, time: '2h', icon: <CheckCircle2 size={18}/> })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#e5e5e5] flex items-center justify-center font-sans">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-white font-sans text-gray-900 overflow-hidden">
        
        {/* COLUMN 1: LEFT SIDEBAR */}
        <aside className="w-[260px] flex flex-col justify-between p-6 border-r border-gray-100 shrink-0 bg-[#fbfbfb]">
          <div className="flex-1 overflow-y-auto pr-2">
            
            {/* Logo */}
            <div className="mb-10 px-2 pt-2">
              <MedTrackLogo size="text-2xl" />
            </div>

            <nav className="space-y-1">
              {/* Main Menu */}
              <button className="w-full flex items-center gap-4 px-4 py-3 text-sm font-bold text-gray-900 bg-white rounded-xl shadow-sm border border-gray-100 mb-1">
                <LayoutGrid size={18} className="text-gray-900" /> Dashboard
              </button>
              <button className="w-full flex items-center gap-4 px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors">
                <Box size={18} /> Equipment
              </button>
              <button className="w-full flex items-center gap-4 px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors">
                <ClipboardList size={18} /> Maintenance
              </button>
              <button className="w-full flex items-center gap-4 px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors">
                <Users size={18} /> Staff
              </button>
              <button className="w-full flex items-center gap-4 px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors">
                <MessageSquare size={18} /> Messages
              </button>
              <button className="w-full flex items-center gap-4 px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors">
                <LineChart size={18} /> Analytics
              </button>

              <div className="my-4 border-t border-gray-100"></div>

              {/* Secondary Menu */}
              <button className="w-full flex items-center gap-4 px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors">
                <Mail size={18} /> Notifications
              </button>
              <button className="w-full flex items-center gap-4 px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors">
                <Workflow size={18} /> Workflows
              </button>
              <button className="w-full flex items-center gap-4 px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors">
                <Puzzle size={18} /> Integrations
              </button>

              <div className="my-4 border-t border-gray-100"></div>

              {/* Bottom Menu */}
              <button className="w-full flex items-center gap-4 px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors">
                <HelpCircle size={18} /> Help Center
              </button>
              <button className="w-full flex items-center gap-4 px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors">
                <MessageCircle size={18} /> Feedback
              </button>
              <button className="w-full flex items-center gap-4 px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors">
                <Settings size={18} /> Settings
              </button>
            </nav>
          </div>

          {/* User Profile Widget */}
          <div className="mt-6">
            <button onClick={logout} className="w-full p-3 bg-white border border-gray-100 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || "Demo"}`} className="w-10 h-10 rounded-full bg-gray-50" alt="Avatar" />
                <div className="text-left">
                  <p className="text-xs font-bold text-gray-900">{user?.name || "Demo Admin"}</p>
                  <p className="text-[10px] text-gray-400 font-medium">{user?.email || "admin@medtrack.com"}</p>
                </div>
              </div>
              <ChevronsUpDown size={14} className="text-gray-400" />
            </button>
          </div>
        </aside>

        {/* COLUMN 2: MAIN CONTENT */}
        <main className="flex-1 flex flex-col overflow-y-auto px-10 py-10 min-w-0">
          
          <header className="mb-6 shrink-0">
            {/* Top Row */}
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <div className="flex items-center gap-4">
                <button className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                  <Bell size={18} className="text-gray-600" />
                </button>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Search something" className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-200 w-64 placeholder-gray-400" />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                  <Share size={16} /> Share
                </button>
              </div>
            </div>

            {/* Toolbar Row */}
            <div className="flex justify-between items-center pb-6 border-b border-gray-100">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                <LayoutGrid size={16} /> Customize Widget
              </button>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                  <RefreshCw size={14} /> Last update 24 minutes ago
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                  <Download size={16} /> Imports <ChevronDown size={14} />
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#1a1c1e] text-white rounded-xl text-sm font-bold hover:bg-black transition-colors">
                  <Upload size={16} /> Exports <ChevronDown size={14} />
                </button>
              </div>
            </div>
          </header>

          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-4 mb-10 shrink-0">
            {/* Card 1 */}
            <div className="border border-gray-100 rounded-2xl p-5 shadow-sm bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-gray-900">Operational Equip</h3>
                <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal size={16}/></button>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-3xl font-bold text-gray-900 leading-none mb-2">18</p>
                  <p className="text-[11px] font-medium text-gray-400">Than last week</p>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold">
                  <TrendingUp size={12} /> 2.8%
                </div>
              </div>
            </div>
            
            {/* Card 2 */}
            <div className="border border-gray-100 rounded-2xl p-5 shadow-sm bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-gray-900">Maintenance Tasks</h3>
                <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal size={16}/></button>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-3xl font-bold text-gray-900 leading-none mb-2">5</p>
                  <p className="text-[11px] font-medium text-gray-400">Than last week</p>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold">
                  <TrendingUp size={12} /> 1.2%
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="border border-gray-100 rounded-2xl p-5 shadow-sm bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-gray-900">Total Hours</h3>
                <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal size={16}/></button>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-3xl font-bold text-gray-900 leading-none mb-2">31h</p>
                  <p className="text-[11px] font-medium text-gray-400">Than last week</p>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-bold">
                  <TrendingDown size={12} /> 2.9%
                </div>
              </div>
            </div>

            {/* Card 4 */}
            <div className="border border-gray-100 rounded-2xl p-5 shadow-sm bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-gray-900">Total Staff</h3>
                <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal size={16}/></button>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-3xl font-bold text-gray-900 leading-none mb-2">1,273</p>
                  <p className="text-[11px] font-medium text-gray-400">Than last week</p>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold">
                  <TrendingUp size={12} /> 2.1%
                </div>
              </div>
            </div>
          </div>

          {/* Chart Area */}
          <div className="mb-10 shrink-0">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-bold text-xl tracking-tight">Performance</h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors">
                01-07 May <ChevronDown size={14}/>
              </button>
            </div>
            
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorOp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorMn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }} tickFormatter={(val) => `${val / 1000}h`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }}
                    itemStyle={{ color: '#fff', fontSize: '12px' }}
                    labelStyle={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}
                  />
                  <Area type="monotone" dataKey="operational" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorOp)" />
                  <Area type="monotone" dataKey="maintenance" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorMn)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Current Tasks List */}
          <div className="shrink-0 mb-8">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <h3 className="font-bold text-xl tracking-tight">Recent Equipment</h3>
                <div className="h-4 w-[1px] bg-gray-200"></div>
                <span className="text-xs text-gray-500 font-bold">Done 30%</span>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                Week <ChevronDown size={14}/>
              </button>
            </div>

            <div className="space-y-3">
              {tasksList.map((task, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-xl transition-colors group">
                  <div className="flex items-center gap-4 w-1/2">
                    <div className="w-10 h-10 rounded-full bg-[#f4f3ef] flex items-center justify-center text-gray-700">
                      {task.icon}
                    </div>
                    <span className="font-bold text-sm text-gray-900">{task.title}</span>
                  </div>
                  
                  <div className="w-1/4 flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${task.status === 'Done' ? 'bg-emerald-500' : task.status === 'In progress' ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
                    <span className="text-[11px] font-bold text-gray-700">{task.status}</span>
                  </div>

                  <div className="w-1/4 flex items-center justify-end gap-6 text-gray-400">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold">
                      <Clock size={12} /> {task.time}
                    </div>
                    <button className="p-1 hover:bg-gray-200 rounded-md transition-colors"><MoreHorizontal size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* COLUMN 3: RIGHT SIDEBAR */}
        {isBotOpen && (
          <aside className="w-[360px] flex flex-col p-8 border-l border-gray-100 shrink-0 bg-white relative animate-in slide-in-from-right duration-300">
            
            <button onClick={() => setIsBotOpen(false)} className="absolute top-4 left-4 p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors z-10">
              <X size={16} />
            </button>

            <div className="bg-[#f4f3ef] rounded-[32px] p-8 flex flex-col items-center text-center mb-8 shrink-0 relative mt-4">
              <div className="relative mb-4">
                <div className="w-[72px] h-[72px] rounded-full flex items-center justify-center border-4 border-[#f4f3ef] bg-blue-600 text-white shadow-sm">
                  <Bot size={36} />
                </div>
                <div className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-[#f4f3ef] rounded-full"></div>
              </div>
              <h3 className="font-bold text-lg mb-1">MedTrack Assistant</h3>
              <p className="text-xs text-gray-500 font-medium mb-6">@medtrackbot</p>
            <div className="flex gap-4">
              <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-700 hover:bg-gray-50 transition-colors"><Phone size={16}/></button>
              <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-700 hover:bg-gray-50 transition-colors"><Video size={16}/></button>
              <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-700 hover:bg-gray-50 transition-colors"><MoreHorizontal size={16}/></button>
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            <h3 className="text-center font-bold text-sm text-gray-900 mb-6 pb-4 border-b border-gray-100 shrink-0">Activity</h3>
            
            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
              
              {/* Activity Item 1 */}
              <div className="flex gap-4">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Floyd" className="w-8 h-8 rounded-full bg-blue-100" alt="Floyd" />
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-bold text-gray-900">Floyd Miles</p>
                    <span className="text-[10px] font-medium text-gray-400">10:15 AM</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">Commented on <span className="text-[#0ea5e9] font-bold cursor-pointer">Stark Project</span></p>
                  
                  <div className="bg-[#f0f7ff] p-3 rounded-2xl rounded-tl-none relative border border-blue-50">
                    <p className="text-xs text-gray-600 font-medium leading-relaxed">
                      Hi! Next week we'll start a new project. I'll tell you all the details later
                    </p>
                    <div className="absolute -bottom-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm text-[10px]">👍</div>
                  </div>
                </div>
              </div>

              {/* Activity Item 2 */}
              <div className="flex gap-4">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Guy" className="w-8 h-8 rounded-full bg-green-100" alt="Guy" />
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-bold text-gray-900 flex items-center gap-1.5">Guy Hawkins <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div></p>
                    <span className="text-[10px] font-medium text-gray-400">10:15 AM</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">Added a file to <span className="text-[#0ea5e9] font-bold cursor-pointer">7Heros Project</span></p>
                  
                  <div className="bg-[#f4f3ef] p-3 rounded-2xl flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-900 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-[10px]">fig</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-gray-900 mb-0.5">Homepage.fig</p>
                      <p className="text-[10px] text-gray-500 font-medium">13.4 Mb</p>
                    </div>
                    <button className="text-gray-400 p-1 hover:bg-gray-200 rounded-full transition-colors"><Download size={14}/></button>
                  </div>
                </div>
              </div>

              {/* Activity Item 3 */}
              <div className="flex gap-4">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Kristin" className="w-8 h-8 rounded-full bg-red-100" alt="Kristin" />
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-bold text-gray-900">Kristin Watson</p>
                    <span className="text-[10px] font-medium text-gray-400">10:15 AM</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">Commented on <span className="text-[#0ea5e9] font-bold cursor-pointer">7Heros Project</span></p>
                </div>
              </div>

            </div>
            
            {/* Chat Input */}
            <div className="mt-6 shrink-0 flex items-center gap-3 bg-[#f8f9fa] px-4 py-3.5 rounded-[20px] border border-gray-100">
              <button className="text-gray-400 hover:text-gray-600 transition-colors"><Paperclip size={16} /></button>
              <input type="text" placeholder="Write a message" className="flex-1 bg-transparent text-xs font-bold text-gray-900 focus:outline-none placeholder-gray-400" />
              <button className="text-gray-400 hover:text-gray-600 transition-colors"><Smile size={16} /></button>
              <button className="text-gray-400 hover:text-gray-600 transition-colors"><Mic size={16} /></button>
            </div>

          </div>

          </aside>
        )}

        {/* FLOATING BOT BUTTON */}
        {!isBotOpen && (
          <button 
            onClick={() => setIsBotOpen(true)}
            className="absolute bottom-8 right-8 w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 hover:scale-105 transition-all z-50 animate-in fade-in"
          >
            <Bot size={24} />
          </button>
        )}

    </div>
  );
}
