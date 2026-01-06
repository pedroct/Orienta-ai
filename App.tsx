
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, BookOpen, ChevronLeft, Trash2, Edit3, Sparkles, CheckCircle2, 
  Circle, LayoutGrid, List, History, Clock, Menu, X, 
  Home, Folder, Layers, FileText, Calendar, RefreshCcw, PieChart, CheckSquare, Library
} from 'lucide-react';
import { StudyPlan, Discipline, Topic, View, StudyLog } from './types';
import PlanModal from './components/PlanModal';
import DisciplineModal from './components/DisciplineModal';
import StudyLogModal from './components/StudyLogModal';

const SidebarItem = ({ 
  icon: Icon, 
  label, 
  active = false, 
  collapsed = false, 
  onClick,
  tag
}: { 
  icon: any, 
  label: string, 
  active?: boolean, 
  collapsed?: boolean, 
  onClick?: () => void,
  tag?: string
}) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
      active 
        ? 'bg-[#26b19a] text-white shadow-sm' 
        : 'text-white/80 hover:bg-white/10 hover:text-white'
    }`}
  >
    <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-white' : 'text-white/70 group-hover:text-white'}`} />
    {!collapsed && (
      <span className="font-medium whitespace-nowrap overflow-hidden text-ellipsis flex-1 text-left">
        {label}
      </span>
    )}
    {!collapsed && tag && (
      <span className="bg-[#facc15] text-[#854d0e] text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">
        {tag}
      </span>
    )}
    {collapsed && (
      <div className="absolute left-full ml-4 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
        {label}
      </div>
    )}
  </button>
);

const App: React.FC = () => {
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isDisciplineModalOpen, setIsDisciplineModalOpen] = useState(false);
  const [isStudyLogModalOpen, setIsStudyLogModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<StudyPlan | undefined>(undefined);
  const [editingDiscipline, setEditingDiscipline] = useState<Discipline | undefined>(undefined);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('concurseiro_plans');
    if (saved) {
      try {
        setPlans(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved plans");
      }
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('concurseiro_plans', JSON.stringify(plans));
  }, [plans]);

  const activePlan = useMemo(() => 
    plans.find(p => p.id === selectedPlanId), 
    [plans, selectedPlanId]
  );

  const handleSavePlan = (planData: Partial<StudyPlan>) => {
    if (editingPlan) {
      setPlans(prev => prev.map(p => p.id === editingPlan.id ? { ...p, ...planData } as StudyPlan : p));
    } else {
      const newPlan: StudyPlan = {
        id: crypto.randomUUID(),
        name: planData.name || 'Novo Plano',
        observation: planData.observation,
        imageUrl: planData.imageUrl,
        editais: planData.editais,
        cargos: planData.cargos,
        isGeneral: !!planData.isGeneral,
        disciplines: [],
        logs: [],
        createdAt: Date.now(),
      };
      setPlans(prev => [newPlan, ...prev]);
    }
    setIsPlanModalOpen(false);
    setEditingPlan(undefined);
  };

  const handleDeletePlan = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Deseja realmente excluir este plano de estudos?')) {
      setPlans(prev => prev.filter(p => p.id !== id));
      if (selectedPlanId === id) {
        setActiveView('dashboard');
        setSelectedPlanId(null);
      }
    }
  };

  const handleSaveDiscipline = (disciplineData: Partial<Discipline>) => {
    if (!selectedPlanId) return;

    setPlans(prev => prev.map(p => {
      if (p.id !== selectedPlanId) return p;
      
      let updatedDisciplines = [...p.disciplines];
      if (editingDiscipline) {
        updatedDisciplines = updatedDisciplines.map(d => 
          d.id === editingDiscipline.id ? { ...d, ...disciplineData } as Discipline : d
        );
      } else {
        const newDiscipline: Discipline = {
          id: crypto.randomUUID(),
          name: disciplineData.name || 'Nova Disciplina',
          color: disciplineData.color || '#26C6A9',
          topics: disciplineData.topics || [],
        };
        updatedDisciplines.push(newDiscipline);
      }
      return { ...p, disciplines: updatedDisciplines };
    }));

    setIsDisciplineModalOpen(false);
    setEditingDiscipline(undefined);
  };

  const handleSaveStudyLog = (log: StudyLog, createAnother: boolean) => {
    if (!selectedPlanId) return;

    setPlans(prev => prev.map(p => {
      if (p.id !== selectedPlanId) return p;
      
      let updatedDisciplines = p.disciplines;
      
      if (log.countInPlanning) {
        updatedDisciplines = p.disciplines.map(d => {
          if (d.id !== log.disciplineId) return d;
          return {
            ...d,
            topics: d.topics.map(t => t.id === log.topicId ? { ...t, isCompleted: true } : t)
          };
        });
      }

      return {
        ...p,
        disciplines: updatedDisciplines,
        logs: [log, ...(p.logs || [])]
      };
    }));

    if (!createAnother) {
      setIsStudyLogModalOpen(false);
    }
  };

  const toggleTopicCompletion = (disciplineId: string, topicId: string) => {
    setPlans(prev => prev.map(p => {
      if (p.id !== selectedPlanId) return p;
      return {
        ...p,
        disciplines: p.disciplines.map(d => {
          if (d.id !== disciplineId) return d;
          return {
            ...d,
            topics: d.topics.map(t => t.id === topicId ? { ...t, isCompleted: !t.isCompleted } : t)
          };
        })
      };
    }));
  };

  const calculateProgress = (plan: StudyPlan) => {
    const allTopics = plan.disciplines.flatMap(d => d.topics);
    if (allTopics.length === 0) return 0;
    const completed = allTopics.filter(t => t.isCompleted).length;
    return Math.round((completed / allTopics.length) * 100);
  };

  return (
    <div className="min-h-screen flex bg-[#f8fafc] overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`bg-[#2ebfa5] flex flex-col transition-all duration-300 relative z-50 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/10">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Orienta aí!</span>
            </div>
          )}
          {sidebarCollapsed && (
             <BookOpen className="w-8 h-8 text-white mx-auto" />
          )}
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`p-1.5 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors ${sidebarCollapsed ? 'hidden' : 'block'}`}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {sidebarCollapsed && (
           <button 
             onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
             className="mx-auto mt-4 p-2 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors"
           >
             <Menu className="w-6 h-6" />
           </button>
        )}

        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          <SidebarItem icon={Home} label="Home" active={activeView === 'dashboard'} collapsed={sidebarCollapsed} onClick={() => { setActiveView('dashboard'); setSelectedPlanId(null); }} />
          <SidebarItem icon={Folder} label="Planos" active={activeView === 'plan-details'} collapsed={sidebarCollapsed} onClick={() => { if(plans.length > 0 && !selectedPlanId) { setSelectedPlanId(plans[0].id); setActiveView('plan-details'); } }} />
          <SidebarItem icon={Layers} label="Disciplinas" collapsed={sidebarCollapsed} />
          <SidebarItem icon={FileText} label="Edital" collapsed={sidebarCollapsed} />
          <SidebarItem icon={Calendar} label="Planejamento" collapsed={sidebarCollapsed} />
          <SidebarItem icon={RefreshCcw} label="Revisões" collapsed={sidebarCollapsed} />
          <SidebarItem icon={History} label="Histórico" collapsed={sidebarCollapsed} />
          <SidebarItem icon={PieChart} label="Estatísticas" collapsed={sidebarCollapsed} />
          <SidebarItem icon={CheckSquare} label="Simulados" collapsed={sidebarCollapsed} />
          <SidebarItem icon={Library} label="Biblioteca" tag="NOVO" collapsed={sidebarCollapsed} />
        </nav>

        <div className="p-4 border-t border-white/10">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3 px-2 py-1">
              <div className="w-8 h-8 rounded-full bg-white/20 border border-white/20 overflow-hidden">
                <img src="https://ui-avatars.com/api/?name=Estudante&background=ffffff&color=2ebfa5" alt="Profile" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-bold text-white truncate">Estudante Pro</p>
                <p className="text-[10px] text-white/60 truncate">premium@concurso.com</p>
              </div>
            </div>
          )}
          {sidebarCollapsed && (
            <div className="w-8 h-8 rounded-full bg-white/20 border border-white/20 overflow-hidden mx-auto">
              <img src="https://ui-avatars.com/api/?name=Estudante&background=ffffff&color=2ebfa5" alt="Profile" />
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 flex-shrink-0 z-40">
          <div>
            {activeView === 'plan-details' && (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setActiveView('dashboard')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-bold text-gray-800">{activePlan?.name || 'Detalhes do Plano'}</h2>
              </div>
            )}
            {activeView === 'dashboard' && (
              <h2 className="text-lg font-bold text-gray-800">Dashboard</h2>
            )}
          </div>

          <div className="flex items-center gap-4">
            {activeView === 'dashboard' ? (
              <button 
                onClick={() => {
                  setEditingPlan(undefined);
                  setIsPlanModalOpen(true);
                }}
                className="bg-[#26C6A9] hover:bg-[#1fb397] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all shadow-sm active:scale-95"
              >
                <Plus className="w-5 h-5" />
                Novo Plano
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsStudyLogModalOpen(true)}
                  className="bg-[#26C6A9] hover:bg-[#1fb397] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all shadow-sm active:scale-95"
                >
                  <Clock className="w-5 h-5" />
                  Registrar Estudo
                </button>
                <button 
                  onClick={() => {
                    setEditingDiscipline(undefined);
                    setIsDisciplineModalOpen(true);
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                  Nova Disciplina
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {activeView === 'dashboard' ? (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800">Seus Planos</h2>
                  <p className="text-gray-500">Selecione um plano para continuar seus estudos.</p>
                </div>

                {plans.length === 0 ? (
                  <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
                    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <LayoutGrid className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Nenhum plano ainda</h3>
                    <p className="text-gray-500 mb-6">Comece criando seu primeiro plano de estudos para um concurso.</p>
                    <button 
                      onClick={() => setIsPlanModalOpen(true)}
                      className="text-[#26C6A9] font-medium hover:underline"
                    >
                      Criar plano agora
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.map(plan => (
                      <div 
                        key={plan.id}
                        onClick={() => {
                          setSelectedPlanId(plan.id);
                          setActiveView('plan-details');
                        }}
                        className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group flex flex-col"
                      >
                        <div className="h-44 bg-gray-50 flex items-center justify-center relative p-6">
                          {plan.imageUrl ? (
                            <div className="w-full h-full flex items-center justify-center">
                              <img 
                                src={plan.imageUrl} 
                                alt={plan.name} 
                                className="max-w-full max-h-full object-contain" 
                              />
                            </div>
                          ) : (
                            <div className="w-20 h-20 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center text-gray-300">
                              <BookOpen className="w-10 h-10" />
                            </div>
                          )}
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingPlan(plan);
                                setIsPlanModalOpen(true);
                              }}
                              className="p-2 bg-white rounded-full shadow-md text-gray-600 hover:text-[#26C6A9] mr-2 transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={(e) => handleDeletePlan(plan.id, e)}
                              className="p-2 bg-white rounded-full shadow-md text-gray-600 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                          <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-1">{plan.name}</h3>
                          <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">{plan.observation || 'Sem observações.'}</p>
                          
                          <div className="mt-auto">
                            <div className="flex justify-between text-xs font-medium text-gray-600 mb-1.5">
                              <span>Progresso Geral</span>
                              <span>{calculateProgress(plan)}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                              <div 
                                className="bg-[#26C6A9] h-2 rounded-full transition-all duration-500" 
                                style={{ width: `${calculateProgress(plan)}%` }}
                              />
                            </div>
                            <div className="flex items-center gap-3 mt-4 text-xs text-gray-400">
                              <span className="flex items-center gap-1">
                                <List className="w-3.5 h-3.5" />
                                {plan.disciplines.length} Disciplinas
                              </span>
                              <span className="flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {plan.disciplines.flatMap(d => d.topics).filter(t => t.isCompleted).length} Tópicos
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
                {activePlan && (
                  <>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                      <div className="flex items-center gap-4">
                        {activePlan.imageUrl && (
                          <div className="w-16 h-16 bg-white rounded-xl shadow-sm p-2 flex items-center justify-center border border-gray-100 overflow-hidden">
                            <img src={activePlan.imageUrl} alt="" className="max-w-full max-h-full object-contain" />
                          </div>
                        )}
                        <div>
                          <h2 className="text-3xl font-bold text-gray-900">{activePlan.name}</h2>
                          <div className="flex flex-wrap items-center gap-3 mt-2">
                            {(activePlan.editais || activePlan.cargos) && (
                              <span className="bg-[#26C6A9]/10 text-[#26C6A9] text-xs font-semibold px-2.5 py-1 rounded-md">
                                {activePlan.editais || activePlan.cargos}
                              </span>
                            )}
                            <span className="text-gray-400 text-xs">•</span>
                            <span className="text-gray-500 text-sm">Criado em {new Date(activePlan.createdAt).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm min-w-[200px]">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-semibold text-gray-700">Meta Concluída</span>
                          <span className="text-lg font-bold text-[#26C6A9]">{calculateProgress(activePlan)}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5">
                          <div 
                            className="bg-[#26C6A9] h-2.5 rounded-full" 
                            style={{ width: `${calculateProgress(activePlan)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-8">
                      {activePlan.disciplines.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
                          <Sparkles className="w-12 h-12 text-[#26C6A9] mx-auto mb-4" />
                          <h3 className="text-xl font-bold text-gray-800 mb-2">Sua jornada começa aqui</h3>
                          <p className="text-gray-500 max-w-md mx-auto mb-8">Adicione sua primeira disciplina para começar a organizar seus tópicos de estudo.</p>
                          <button 
                            onClick={() => setIsDisciplineModalOpen(true)}
                            className="bg-[#26C6A9] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#1fb397] transition-colors shadow-lg shadow-[#26C6A9]/20"
                          >
                            Adicionar Disciplina
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {activePlan.disciplines.map(discipline => {
                            const completedCount = discipline.topics.filter(t => t.isCompleted).length;
                            const totalCount = discipline.topics.length;
                            const questionsResolved = activePlan.logs
                              .filter(log => log.disciplineId === discipline.id)
                              .reduce((sum, log) => sum + (log.questions?.correct || 0) + (log.questions?.wrong || 0), 0);

                            return (
                              <div 
                                key={discipline.id} 
                                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group relative"
                              >
                                {/* Color accent on the left */}
                                <div 
                                  className="absolute left-0 top-0 bottom-0 w-1.5" 
                                  style={{ backgroundColor: discipline.color }}
                                />
                                
                                <div className="p-6">
                                  <div className="flex items-center justify-between mb-8">
                                    <h3 className="font-semibold text-gray-700 text-lg truncate pr-12">{discipline.name}</h3>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button 
                                        onClick={() => {
                                          setEditingDiscipline(discipline);
                                          setIsDisciplineModalOpen(true);
                                        }}
                                        className="p-1.5 hover:bg-gray-100 rounded-md text-gray-400 hover:text-gray-600 transition-colors"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>
                                      <button 
                                        onClick={() => {
                                          if (confirm('Excluir esta disciplina?')) {
                                            setPlans(prev => prev.map(p => p.id === selectedPlanId ? {
                                              ...p,
                                              disciplines: p.disciplines.filter(d => d.id !== discipline.id)
                                            } : p));
                                          }
                                        }}
                                        className="p-1.5 hover:bg-gray-100 rounded-md text-gray-400 hover:text-red-500 transition-colors"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-3 gap-2">
                                    <div className="text-center">
                                      <div className="text-2xl font-bold text-gray-800">{completedCount}</div>
                                      <div className="text-[10px] leading-tight font-bold text-gray-400 uppercase tracking-tight">
                                        Tópicos<br />Estudados
                                      </div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-2xl font-bold text-gray-800">{totalCount}</div>
                                      <div className="text-[10px] leading-tight font-bold text-gray-400 uppercase tracking-tight">
                                        Tópicos<br />Totais
                                      </div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-2xl font-bold text-gray-800">{questionsResolved}</div>
                                      <div className="text-[10px] leading-tight font-bold text-gray-400 uppercase tracking-tight">
                                        Questões<br />Resolvidas
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* History Section below the grid if desired, or keep as is */}
                      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mt-12">
                        <div className="flex items-center gap-2 mb-6 text-gray-700">
                          <History className="w-5 h-5 text-[#26C6A9]" />
                          <h3 className="font-bold text-xl">Histórico Recente</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                          {!activePlan.logs || activePlan.logs.length === 0 ? (
                            <div className="col-span-full text-center py-12 px-4 border-2 border-dashed rounded-2xl border-gray-50">
                              <p className="text-gray-400">Nenhum registro de estudo ainda. Comece a estudar!</p>
                            </div>
                          ) : (
                            activePlan.logs.slice(0, 6).map(log => {
                              const disc = activePlan.disciplines.find(d => d.id === log.disciplineId);
                              const topic = disc?.topics.find(t => t.id === log.topicId);
                              return (
                                <div key={log.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(log.date).toLocaleDateString()}</span>
                                    <span className="text-[10px] font-bold text-[#26C6A9] uppercase bg-[#26C6A9]/10 px-2 py-0.5 rounded">{log.category}</span>
                                  </div>
                                  <h4 className="font-bold text-gray-800 line-clamp-1">{disc?.name}</h4>
                                  <p className="text-xs text-gray-500 line-clamp-1 mb-3">{topic?.name || 'Tópico Geral'}</p>
                                  <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase">
                                      <Clock className="w-3.5 h-3.5" /> {log.duration}
                                    </span>
                                    {log.questions && (log.questions.correct > 0 || log.questions.wrong > 0) && (
                                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#26C6A9] uppercase">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> {log.questions.correct} acertos
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <PlanModal 
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        onSave={handleSavePlan}
        initialData={editingPlan}
      />

      <DisciplineModal 
        isOpen={isDisciplineModalOpen}
        onClose={() => setIsDisciplineModalOpen(false)}
        onSave={handleSaveDiscipline}
        initialData={editingDiscipline}
        planName={activePlan?.name || ''}
      />

      {activePlan && (
        <StudyLogModal 
          isOpen={isStudyLogModalOpen}
          onClose={() => setIsStudyLogModalOpen(false)}
          onSave={handleSaveStudyLog}
          plan={activePlan}
        />
      )}
    </div>
  );
};

export default App;
