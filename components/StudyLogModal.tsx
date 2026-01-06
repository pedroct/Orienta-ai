
import React, { useState, useEffect } from 'react';
import { X, Calendar, HelpCircle, Plus, Clock } from 'lucide-react';
import { StudyPlan, Discipline, StudyLog } from '../types';

interface StudyLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (log: StudyLog, createAnother: boolean) => void;
  plan: StudyPlan;
}

const CATEGORIES = ['Teoria', 'Exercícios', 'Revisão', 'Simulado', 'Outros'];

const StudyLogModal: React.FC<StudyLogModalProps> = ({ isOpen, onClose, onSave, plan }) => {
  const [dateType, setDateType] = useState<'today' | 'yesterday' | 'other'>('today');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [disciplineId, setDisciplineId] = useState('');
  const [topicId, setTopicId] = useState('');
  const [duration, setDuration] = useState('00:00:00');
  const [material, setMaterial] = useState('');
  const [isTheoryFinished, setIsTheoryFinished] = useState(false);
  const [countInPlanning, setCountInPlanning] = useState(true);
  const [scheduleRevision, setScheduleRevision] = useState(false);
  const [questions, setQuestions] = useState({ correct: 0, wrong: 0 });
  const [pages, setPages] = useState({ start: 0, end: 0 });
  const [video, setVideo] = useState({ title: '', start: '00:00:00', end: '00:00:00' });
  const [comments, setComments] = useState('');
  const [createAnother, setCreateAnother] = useState(false);

  useEffect(() => {
    if (plan.disciplines.length > 0) {
      setDisciplineId(plan.disciplines[0].id);
      if (plan.disciplines[0].topics.length > 0) {
        setTopicId(plan.disciplines[0].topics[0].id);
      }
    }
  }, [plan, isOpen]);

  const selectedDiscipline = plan.disciplines.find(d => d.id === disciplineId);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    let timestamp = Date.now();
    if (dateType === 'yesterday') timestamp -= 86400000;

    const log: StudyLog = {
      id: crypto.randomUUID(),
      date: timestamp,
      category,
      disciplineId,
      topicId,
      duration,
      material,
      isTheoryFinished,
      countInPlanning,
      scheduleRevision,
      questions,
      pages,
      video,
      comments
    };
    onSave(log, createAnother);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="px-8 py-6 flex items-center justify-between border-b border-gray-100">
          <h2 className="text-3xl font-semibold text-gray-700">Registro de Estudo</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-8 h-8 text-[#26C6A9]" />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {/* Date Selector */}
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-gray-600" />
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button 
                type="button"
                onClick={() => setDateType('today')}
                className={`px-6 py-1.5 rounded-lg text-xs font-bold transition-all ${dateType === 'today' ? 'bg-[#26C6A9] text-white shadow-sm' : 'text-gray-400'}`}
              >
                HOJE
              </button>
              <button 
                type="button"
                onClick={() => setDateType('yesterday')}
                className={`px-6 py-1.5 rounded-lg text-xs font-bold transition-all ${dateType === 'yesterday' ? 'bg-[#26C6A9] text-white shadow-sm' : 'text-gray-400'}`}
              >
                ONTEM
              </button>
              <button 
                type="button"
                onClick={() => setDateType('other')}
                className={`px-6 py-1.5 rounded-lg text-xs font-bold transition-all ${dateType === 'other' ? 'bg-[#26C6A9] text-white shadow-sm' : 'text-gray-400'}`}
              >
                OUTRO
              </button>
            </div>
          </div>

          {/* Main Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
            <div className="group">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Categoria</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border-b border-gray-300 focus:border-[#26C6A9] outline-none py-1.5 bg-transparent appearance-none transition-colors"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="group">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Disciplina</label>
              <select 
                value={disciplineId}
                onChange={(e) => setDisciplineId(e.target.value)}
                className="w-full border-b border-gray-300 focus:border-[#26C6A9] outline-none py-1.5 bg-transparent appearance-none transition-colors"
              >
                <option value="">Selecione ou crie uma nova</option>
                {plan.disciplines.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>

            <div className="group">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tempo de Estudo</label>
              <input 
                type="text" 
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="00:00:00"
                className="w-full border-b border-gray-300 focus:border-[#26C6A9] outline-none py-1.5 transition-colors"
              />
            </div>

            <div className="md:col-span-2 group">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tópico</label>
              <select 
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                className="w-full border-b border-gray-300 focus:border-[#26C6A9] outline-none py-1.5 bg-transparent appearance-none transition-colors"
              >
                <option value="">Selecione ou crie um novo</option>
                {selectedDiscipline?.topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>

            <div className="group">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Material</label>
              <input 
                type="text" 
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                placeholder="Ex.: Aula 01"
                className="w-full border-b border-gray-300 focus:border-[#26C6A9] outline-none py-1.5 transition-colors"
              />
            </div>
          </div>

          {/* Checkboxes Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer group w-fit">
                <input 
                  type="checkbox" 
                  checked={isTheoryFinished}
                  onChange={(e) => setIsTheoryFinished(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-[#26C6A9] focus:ring-[#26C6A9]"
                />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-gray-600 transition-colors">Teoria Finalizada</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group w-fit">
                <input 
                  type="checkbox" 
                  checked={scheduleRevision}
                  onChange={(e) => setScheduleRevision(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-[#26C6A9] focus:ring-[#26C6A9]"
                />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-gray-600 transition-colors">Programar Revisões</span>
              </label>
            </div>

            <div>
              <label className="flex items-center gap-3 cursor-pointer group w-fit">
                <input 
                  type="checkbox" 
                  checked={countInPlanning}
                  onChange={(e) => setCountInPlanning(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-[#26C6A9] focus:ring-[#26C6A9]"
                />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-gray-600 transition-colors inline-flex items-center gap-1.5">
                  Contabilizar no Planejamento <HelpCircle className="w-3.5 h-3.5" />
                </span>
              </label>
            </div>
          </div>

          {/* Summary Boxes */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Questões */}
            <div className="bg-[#26C6A9]/5 border-2 border-[#26C6A9]/30 rounded-2xl p-4 relative">
              <div className="absolute -top-3 left-4 bg-white px-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Questões</span>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="text-center">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Acertos</label>
                  <input 
                    type="number"
                    value={questions.correct}
                    onChange={(e) => setQuestions({ ...questions, correct: parseInt(e.target.value) || 0 })}
                    className="w-full text-center text-xl font-bold bg-transparent border-b border-[#26C6A9] outline-none"
                  />
                </div>
                <div className="text-center">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Erros</label>
                  <input 
                    type="number"
                    value={questions.wrong}
                    onChange={(e) => setQuestions({ ...questions, wrong: parseInt(e.target.value) || 0 })}
                    className="w-full text-center text-xl font-bold bg-transparent border-b border-[#26C6A9] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Páginas */}
            <div className="bg-[#26C6A9]/5 border-2 border-[#26C6A9]/30 rounded-2xl p-4 relative">
              <div className="absolute -top-3 left-4 bg-white px-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Páginas</span>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="text-center">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Início</label>
                  <input 
                    type="number"
                    value={pages.start}
                    onChange={(e) => setPages({ ...pages, start: parseInt(e.target.value) || 0 })}
                    className="w-full text-center text-xl font-bold bg-transparent border-b border-[#26C6A9] outline-none"
                  />
                </div>
                <div className="text-center">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Fim</label>
                  <input 
                    type="number"
                    value={pages.end}
                    onChange={(e) => setPages({ ...pages, end: parseInt(e.target.value) || 0 })}
                    className="w-full text-center text-xl font-bold bg-transparent border-b border-[#26C6A9] outline-none"
                  />
                </div>
              </div>
              <button type="button" className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#26C6A9] text-white p-1 rounded-full shadow-md">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Videoaulas */}
            <div className="bg-[#26C6A9]/5 border-2 border-[#26C6A9]/30 rounded-2xl p-4 relative">
              <div className="absolute -top-3 left-4 bg-white px-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Videoaulas</span>
              </div>
              <div className="space-y-3 pt-2">
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <label className="block text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Título / Início / Fim</label>
                    <input 
                      type="text"
                      value={video.title}
                      onChange={(e) => setVideo({ ...video, title: e.target.value })}
                      placeholder="Vídeo 01"
                      className="w-full text-sm font-medium bg-transparent border-b border-[#26C6A9] outline-none"
                    />
                  </div>
                  <input 
                    type="text"
                    value={video.start}
                    onChange={(e) => setVideo({ ...video, start: e.target.value })}
                    className="w-20 text-xs text-center bg-transparent border-b border-[#26C6A9] outline-none"
                  />
                  <input 
                    type="text"
                    value={video.end}
                    onChange={(e) => setVideo({ ...video, end: e.target.value })}
                    className="w-20 text-xs text-center bg-transparent border-b border-[#26C6A9] outline-none"
                  />
                </div>
              </div>
              <button type="button" className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#26C6A9] text-white p-1 rounded-full shadow-md">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Comments */}
          <div className="group">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Comentários</label>
            <textarea 
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full border-b border-gray-300 focus:border-[#26C6A9] outline-none py-1.5 min-h-[60px] resize-none transition-colors"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-gray-100 flex items-center justify-between bg-white">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={createAnother}
              onChange={(e) => setCreateAnother(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-[#26C6A9] focus:ring-[#26C6A9]"
            />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-gray-600 transition-colors">Salvar e criar novo</span>
          </label>

          <div className="flex items-center gap-4">
            <button 
              type="button" 
              onClick={onClose}
              className="px-10 py-2.5 rounded-xl font-bold text-[#26C6A9] border-2 border-[#26C6A9] hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={handleSave}
              className="px-12 py-2.5 rounded-xl font-bold text-white bg-[#26C6A9] hover:bg-[#1fb397] transition-all shadow-lg shadow-[#26C6A9]/20 active:scale-95"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyLogModal;
