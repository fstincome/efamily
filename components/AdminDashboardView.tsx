import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../src/supabaseClient';
import { 
  LayoutDashboard, Users, Wallet, HeartPulse, GraduationCap, 
  LogOut, Activity, BarChart3, TrendingUp, ArrowDownCircle, Flame, 
  ShieldCheck, Menu, X, ArrowUpCircle, History, PieChart, Search, Calendar,
  Briefcase, CalendarCheck, Contact2, CheckSquare, Newspaper
} from 'lucide-react';

// --- IMPORT DES COMPOSANTS ---
import { FamilyManager } from './FamilyManager'; 
import { FinanceManager } from './FinanceManager'; 
import { HealthForm } from './HealthForm'; 
import { EducationForm } from './EducationForm';
import { ExpenseForm } from './ExpenseForm';
import { ProjectManager } from './ProjectManager'; // Nouveau
import { TodoManager } from './TodoManager';       // Nouveau
import { AgendaManager } from './AgendaManager';   // Nouveau
import { ContactDirectory } from './ContactDirectory'; // Nouveau
import { AdminNewsManager } from './AdminNewsManager'; // Nouveau

const ADMIN_FAMILY_ID = '11111111-1111-1111-1111-111111111111';
export const AdminDashboardView = () => {
  // --- ÉTATS DE NAVIGATION ET UI ---
  const [activeTab, setActiveTab] = useState('home');
  const [budgetTab, setBudgetTab] = useState('essentiels');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  // --- ÉTATS DE DONNÉES ---
  const [stats, setStats] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- ÉTATS DE FILTRE (Barre de recherche et période) ---
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(2026);

  // --- RÉCUPÉRATION DES DONNÉES ---
// --- RÉCUPÉRATION DES DONNÉES ---
const fetchStats = async (isInitial = false) => {
  // On ne met 'loading' à true que si c'est le premier lancement
  if (isInitial) setLoading(true); 
  
  try {
    const { data: familyData } = await supabase.from('families').select('*').eq('id', ADMIN_FAMILY_ID).single();
    const { data: transData } = await supabase.from('finance_transactions')
      .select('*')
      .eq('family_id', ADMIN_FAMILY_ID)
      .order('created_at', { ascending: false });

    if (familyData) setStats(familyData);
    if (transData) setTransactions(transData);
  } catch (error) {
    console.error("Erreur de chargement:", error);
  } finally {
    if (isInitial) setLoading(false);
  }
};

// 1. Premier chargement au montage du composant
useEffect(() => { 
  fetchStats(true); 
}, []); 

// 2. Mise à jour silencieuse quand on change d'onglet (sans écran blanc)
useEffect(() => {
  if (activeTab === 'home' || activeTab === 'entries' || activeTab === 'finances') {
    fetchStats(false);
  }
}, [activeTab]);

  // --- LOGIQUE DE FILTRAGE CALCULÉE ---
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const date = new Date(t.created_at);
      const matchesSearch = t.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            t.category?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMonth = date.getMonth() === selectedMonth;
      const matchesYear = date.getFullYear() === selectedYear;
      return matchesSearch && matchesMonth && matchesYear;
    });
  }, [transactions, searchTerm, selectedMonth, selectedYear]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    window.location.reload(); 
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center font-black text-blue-600 animate-pulse bg-white uppercase tracking-widest">
      Initialisation du Node...
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#FDFDFF] font-sans text-slate-900 overflow-hidden">
      
      {/* HEADER MOBILE (Visible uniquement sur petits écrans) */}
      <div className="lg:hidden bg-white p-6 border-b flex justify-between items-center z-30 shadow-sm">
        <div className="text-2xl font-black  text-blue-600 tracking-tighter">HYADY<span className="text-slate-900">LEGACY OS</span></div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-slate-100 rounded-xl">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      /* {/* SIDEBAR (Menu de navigation gauche) */}
      {/* SIDEBAR */}
<aside
  className={`fixed lg:relative inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-100 flex flex-col transition-transform duration-300 transform ${
    isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
  }`}
>
  {/* LOGO */}
  <div className="p-10 hidden lg:block">
    <div className="text-xl font-black tracking-tighter text-blue-600">
      HYADY<span className="text-slate-900">LEGACY OS</span>
    </div>
    <p className="text-[9px] font-black text-slate-300 mt-2 tracking-[0.4em]">
      Admin Panel 2026
    </p>
  </div>

  {/* NAVIGATION */}
  <nav className="flex-1 flex flex-col px-6 mt-4 lg:mt-0 overflow-y-auto no-scrollbar">
    {/* FINANCE */}
    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-5 mb-2">
      Finance
    </p>
    <MenuBtn icon={<LayoutDashboard />} label="Dashboard" active={activeTab === 'home'} onClick={() => { setActiveTab('home'); setIsMobileMenuOpen(false); }} />
    <MenuBtn icon={<History />} label="Entrées/Revenus" active={activeTab === 'entries'} onClick={() => { setActiveTab('entries'); setIsMobileMenuOpen(false); }} />
    <MenuBtn icon={<Wallet />} label="Gestion Budgets" active={activeTab === 'finances'} onClick={() => { setActiveTab('finances'); setIsMobileMenuOpen(false); }} />

    {/* FAMILLE */}
    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-5 mt-6 mb-2">
      Famille & Vie
    </p>
    <MenuBtn icon={<Users />} label="Membres" active={activeTab === 'family'} onClick={() => { setActiveTab('family'); setIsMobileMenuOpen(false); }} />
    <MenuBtn icon={<HeartPulse />} label="Santé" active={activeTab === 'health'} onClick={() => { setActiveTab('health'); setIsMobileMenuOpen(false); }} />
    <MenuBtn icon={<GraduationCap />} label="Éducation" active={activeTab === 'edu'} onClick={() => { setActiveTab('edu'); setIsMobileMenuOpen(false); }} />

    {/* PRO */}
    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-5 mt-6 mb-2">
      Projets & Pro
    </p>
    <MenuBtn icon={<Briefcase />} label="Projets Dev" active={activeTab === 'projects'} onClick={() => { setActiveTab('projects'); setIsMobileMenuOpen(false); }} />
    <MenuBtn icon={<CalendarCheck />} label="Planning" active={activeTab === 'agenda'} onClick={() => { setActiveTab('agenda'); setIsMobileMenuOpen(false); }} />
    <MenuBtn icon={<CheckSquare />} label="To-Do & Courses" active={activeTab === 'todo'} onClick={() => { setActiveTab('todo'); setIsMobileMenuOpen(false); }} />
    <MenuBtn icon={<Contact2 />} label="Annuaire" active={activeTab === 'contacts'} onClick={() => { setActiveTab('contacts'); setIsMobileMenuOpen(false); }} />

    <MenuBtn
      icon={<Newspaper />}
      label="Journal Hub"
      active={activeTab === 'news'}
      onClick={() => { setActiveTab('news'); setIsMobileMenuOpen(false); }}
    />

    {/* DÉCONNEXION — DANS LE NAVBAR */}
    <div className="mt-auto pt-6 pb-8">
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-3 p-4 bg-red-50 text-red-500 font-black uppercase text-[10px] rounded-2xl hover:bg-red-500 hover:text-white transition-all"
      >
        <LogOut size={16} /> Déconnexion
      </button>
    </div>
  </nav>
</aside>


      {/* ZONE DE CONTENU PRINCIPAL */}
      <main className="flex-1 p-6 lg:p-12 overflow-y-auto bg-slate-50/20 w-full">
        
        {/* HEADER DE PAGE (Titre + Recherche + Bouton Action) */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <h2 className="text-4xl lg:text-5xl font-black italic uppercase tracking-tighter">
            {activeTab === 'home' ? 'Dashboard' : 
             activeTab === 'projects' ? 'Projets' :
             activeTab === 'agenda' ? 'Agenda' :
             activeTab === 'todo' ? 'Tâches' :
             activeTab === 'contacts' ? 'Annuaire' : 
             activeTab === 'entries' ? 'Revenus' : 
             activeTab === 'finances' ? 'Budgets' : activeTab}
          </h2>
          
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                    type="text" 
                    placeholder="Chercher partout..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border-none shadow-sm text-xs font-bold focus:ring-2 ring-blue-500 transition-all outline-none"
                />
            </div>
            
            <button onClick={() => setShowExpenseModal(true)} className="bg-slate-900 text-white px-8 py-4 rounded-[25px] font-black uppercase text-[10px] tracking-widest flex justify-center items-center gap-3 hover:bg-red-600 transition-all shadow-xl">
              <ArrowDownCircle size={18} className="text-red-400"/> Sortie de fonds
            </button>
          </div>
        </header>

        {/* --- ROUTAGE DES VUES --- */}
        <div className="max-w-7xl mx-auto">
            
            {/* VUE : DASHBOARD (HOME) */}
            {activeTab === 'home' && (
              <div className="space-y-10 pb-20 animate-in fade-in">
                {/* Sélecteur de période */}
                <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm w-fit">
                    <div className="flex items-center gap-3 px-4 border-r border-slate-100">
                        <Calendar size={18} className="text-blue-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Période :</span>
                    </div>
                    <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} className="bg-transparent text-xs font-black uppercase border-none focus:ring-0 cursor-pointer">
                        {["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"].map((m, i) => (
                            <option key={i} value={i}>{m}</option>
                        ))}
                    </select>
                    <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="bg-transparent text-xs font-black border-none focus:ring-0 cursor-pointer">
                        {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>

                <BudgetAlerts stats={stats} />

                {/* Carte de Solde Principal */}
                <div className="bg-slate-900 p-10 lg:p-14 rounded-[50px] text-white relative overflow-hidden shadow-2xl border-b-[8px] border-blue-600">
                  <p className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-400 mb-2 opacity-70">Solde Centralisé Node</p>
                  <h3 className="text-5xl lg:text-7xl font-black italic tracking-tighter">
                    {(stats?.total_balance || 0).toLocaleString()} <span className="text-lg text-slate-500 not-italic uppercase">fbu</span>
                  </h3>
                  <BarChart3 size={150} className="absolute -right-10 -bottom-10 opacity-5" />
                </div>

                <KPIMonthlyReport transactions={filteredTransactions} />

                {/* Liste des Budgets par Enveloppe */}
                <div className="bg-white p-10 rounded-[50px] shadow-sm border border-slate-100">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                        <p className="text-3xl font-black italic uppercase tracking-tighter"> Budgets</p>
                        <div className="flex flex-wrap gap-2">
                            <TabBtn label="Essentiels" active={budgetTab === 'essentiels'} color="blue" onClick={() => setBudgetTab('essentiels')} />
                            <TabBtn label="Développement" active={budgetTab === 'dev'} color="purple" onClick={() => setBudgetTab('dev')} />
                            <TabBtn label="Épargne" active={budgetTab === 'epargne'} color="emerald" onClick={() => setBudgetTab('epargne')} />
                        </div>
                    </div>
                    <BudgetListGrid color={budgetTab === 'essentiels' ? 'blue' : budgetTab === 'dev' ? 'purple' : 'emerald'} items={getBudgetItems(budgetTab, stats)} />
                </div>
                
                <MonthlyFluxChart transactions={filteredTransactions} />
              </div>
            )}

            {/* VUES : MODULES FINANCIERS */}
            {activeTab === 'entries' && <EntriesHistory transactions={filteredTransactions} />}
            {/* {activeTab === 'finances' && <FinanceManager familyId={ADMIN_FAMILY_ID} onSuccess={fetchStats} />} */}
            {activeTab === 'finances' && (<FinanceManager familyId={ADMIN_FAMILY_ID} onSuccess={() => {setTimeout(() => fetchStats(false), 500);
    }} 
  />
)}
            

            {/* VUES : FAMILLE & VIE */}
            {activeTab === 'family' && <FamilyManager familyId={ADMIN_FAMILY_ID} />}
            {activeTab === 'health' && <HealthForm familyId={ADMIN_FAMILY_ID} />}
            {activeTab === 'edu' && <EducationForm familyId={ADMIN_FAMILY_ID} />}

            {/* VUES : NOUVEAUX MODULES PRO ET PROJETS */}
            {activeTab === 'projects' && <ProjectManager familyId={ADMIN_FAMILY_ID} />}
            {activeTab === 'agenda' && <AgendaManager familyId={ADMIN_FAMILY_ID} />}
            {activeTab === 'todo' && <TodoManager familyId={ADMIN_FAMILY_ID} />}
            {activeTab === 'contacts' && <ContactDirectory familyId={ADMIN_FAMILY_ID} />}

            {/* FUTURS MODULES : Rajouter les conditions activeTab ici */}
            {activeTab === 'news' && (
  <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
    {/* Optionnel : Tu peux aussi afficher la liste en dessous pour voir le résultat en direct */}
    <div className="mt-12">
       <h3 className="text-xl font-black italic uppercase mb-6 ml-4">Articles Publiés</h3>
       <AdminNewsManager showFilter={true} />
    </div>
  </div>
)}
        </div>

        {/* MODAL DE DÉPENSE (Générique pour tout le dashboard) */}
        {showExpenseModal && (
          <ExpenseForm familyId={ADMIN_FAMILY_ID} onClose={() => setShowExpenseModal(false)} onSuccess={() => { setShowExpenseModal(false); fetchStats(); }} />
        )}
      </main>
    </div>
  );
};

// --- COMPOSANTS INTERNES DE RENDU ---

const KPIMonthlyReport = ({ transactions }: any) => {
    // Calcul automatique basé sur les pourcentages définis au Burundi
    const budgetMap: any = { "Alimentation": 0.267, "Loyer": 0.133, "Eau/Electricité": 0.042, "Transport": 0.042, "Communication": 0.016, "Scolarité": 0.133, "Santé": 0.067, "Aide Familiale": 0.050, "Vêtements": 0.050, "Epargne": 0.117, "Projets": 0.083 };
    const categories = [ { label: "Alimentation", value: "Alimentation" }, { label: "Logement", value: "Loyer" }, { label: "Utilités", value: "Eau/Electricité" }, { label: "Santé", value: "Santé" }, { label: "Projets", value: "Projets" } ];
    const totalIncome = transactions.filter((t: any) => t.type === 'revenu').reduce((acc: number, t: any) => acc + t.amount, 0);

    return (
        <div className="bg-slate-900 p-8 lg:p-12 rounded-[50px] text-white shadow-2xl overflow-hidden">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 italic mb-10 flex items-center gap-3">
                <TrendingUp size={16}/> Consommation des Enveloppes
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-8">
                {categories.map(cat => {
                    const allocated = totalIncome * (budgetMap[cat.value] || 0.1);
                    const spent = transactions.filter((t: any) => t.type === 'depense' && t.category === cat.value).reduce((acc: number, t: any) => acc + t.amount, 0);
                    const pc = allocated > 0 ? Math.min(Math.round((spent / allocated) * 100), 100) : 0;
                    return (
                        <div key={cat.value} className="space-y-3">
                            <div className="flex justify-between items-end">
                                <p className="text-[10px] font-black uppercase">{cat.label}</p>
                                <span className={`text-xs font-black italic ${spent > allocated ? 'text-red-400' : 'text-blue-400'}`}>{pc}%</span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div className={`h-full transition-all duration-1000 ${spent > allocated ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${pc}%` }}></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const BudgetListGrid = ({ items, color }: any) => {
    const bgColors: any = { blue: 'bg-blue-600', purple: 'bg-purple-600', emerald: 'bg-emerald-600' };
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item: any, idx: number) => (
                <div key={idx} className={`p-6 rounded-[35px] border transition-all ${item.val < 0 ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-transparent hover:bg-white hover:shadow-xl hover:shadow-slate-200/50'}`}>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-[10px] font-black text-slate-800 uppercase tracking-tighter">{item.label}</p>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{item.p} alloué</p>
                        </div>
                        <span className={`text-base font-black italic ${item.val < 0 ? 'text-red-600' : 'text-slate-900'}`}>
                            {Math.floor(item.val || 0).toLocaleString()} <span className="text-[9px] not-italic opacity-30">FBU</span>
                        </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div className={`h-full ${item.val < 0 ? 'bg-red-500' : bgColors[color]}`} style={{ width: item.val > 0 ? '100%' : '0%' }}></div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const MonthlyFluxChart = ({ transactions }: any) => {
    const months = ["JAN", "FÉV", "MAR", "AVR", "MAI", "JUN", "JUL", "AOU"];
    return (
        <div className="bg-white p-10 rounded-[50px] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-10">
              <p className="text-3xl font-black italic uppercase tracking-tighter">Flux de Trésorerie</p>
            <Activity className="text-blue-600" size={30} />
          </div>
          <div className="h-64 flex items-end justify-between gap-4 px-4">
              {months.map((m, i) => (
                  <div key={m} className="flex-1 flex flex-col items-center gap-4 group h-full justify-end">
                      <div className="w-full flex gap-1.5 items-end max-h-48">
                          <div className="w-full bg-blue-50 group-hover:bg-blue-600 rounded-t-xl transition-all duration-500" style={{height: `${30 + i*7}%`}}></div>
                          <div className="w-full bg-red-50 group-hover:bg-red-400 rounded-t-xl transition-all duration-500" style={{height: `${15 + i*5}%`}}></div>
                      </div>
                      <span className="text-[10px] font-black text-slate-300 uppercase">{m}</span>
                  </div>
              ))}
          </div>
        </div>
    );
};

const BudgetAlerts = ({ stats }: any) => {
    const criticals = [ { name: "Alimentation", val: stats?.bal_alimentation }, { name: "Santé", val: stats?.bal_sante }, { name: "Loyer", val: stats?.bal_logement } ];
    const overspent = criticals.find(c => c.val < 0);
    return overspent ? (
        <div className="bg-red-600 text-white p-8 rounded-[35px] flex items-center gap-6 animate-pulse shadow-xl shadow-red-200">
            <Flame size={40} className="shrink-0" />
            <p className="text-lg font-black italic uppercase">Alerte : Budget {overspent.name} épuisé !</p>
        </div>
    ) : (
        <div className="bg-emerald-500 text-white p-6 rounded-[30px] flex items-center gap-4 shadow-lg shadow-emerald-100">
            <ShieldCheck size={32} />
            <p className="text-[10px] font-black uppercase tracking-widest">Santé financière : Nominale</p>
        </div>
    );
};

const EntriesHistory = ({ transactions }: any) => {
  const incomes = transactions.filter((t: any) => t.type === 'revenu');
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-blue-600 p-10 rounded-[40px] text-white shadow-xl">
        <ArrowUpCircle size={40} className="mb-4 text-blue-200"/>
        <h3 className="text-3xl font-black italic uppercase">Historique des Revenus</h3>
      </div>
      <div className="space-y-4">
        {incomes.map((inc: any) => (
          <div key={inc.id} className="bg-white p-6 rounded-[30px] border border-slate-100 flex justify-between items-center hover:scale-[1.02] transition-transform">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl font-black text-xs">+{inc.amount.toLocaleString()}</div>
              <div>
                <p className="font-black text-slate-800 text-sm">{inc.description}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase">{new Date(inc.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- LOGIQUE MÉTIER ---

const getBudgetItems = (tab: string, stats: any) => {
    if (!stats) return [];
    if (tab === 'essentiels') return [ 
        { label: "Alimentation", p: "26.7%", val: stats.bal_alimentation }, 
        { label: "Logement", p: "13.3%", val: stats.bal_logement }, 
        { label: "Eau + Elec", p: "4.2%", val: stats.bal_utilites }, 
        { label: "Transport", p: "4.2%", val: stats.bal_transport }, 
        { label: "Communication", p: "1.6%", val: stats.bal_communication } 
    ];
    if (tab === 'dev') return [ 
        { label: "Scolarité", p: "13.3%", val: stats.bal_scolarite }, 
        { label: "Santé", p: "6.7%", val: stats.bal_sante }, 
        { label: "Aide Familiale", p: "5.0%", val: stats.bal_aide_familiale }, 
        { label: "Vêtements", p: "5.0%", val: stats.bal_vetements } 
    ];
    return [ 
        { label: "Sécurité", p: "11.7%", val: stats.bal_epargne_secu }, 
        { label: "Projets Business", p: "8.3%", val: stats.bal_projets } 
    ];
};

const MenuBtn = ({ icon, label, active, onClick }: any) => (
    <button onClick={onClick} className={`w-full flex items-center gap-4 p-5 rounded-3xl font-black uppercase text-[10px] tracking-widest transition-all ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 translate-x-2' : 'text-slate-400 hover:bg-slate-50'}`}>
      {React.cloneElement(icon, { size: 18 })} {label}
    </button>
);

const TabBtn = ({ label, active, color, onClick }: any) => {
    const colors: any = { blue: "bg-blue-600", purple: "bg-purple-600", emerald: "bg-emerald-600" };
    return (
      <button onClick={onClick} className={`px-6 py-4 rounded-2xl font-black uppercase text-[9px] tracking-widest transition-all ${active ? `${colors[color]} text-white shadow-lg` : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
        {label}
      </button>
    );
};
