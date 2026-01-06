
import React, { useState, useEffect } from 'react';
import { X, Plus, Sparkles, Loader2, GripVertical, Trash2 } from 'lucide-react';
import { Discipline, Topic } from '../types';
import { generateTopicsForDiscipline } from '../services/gemini';

interface DisciplineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Discipline>) => void;
  initialData?: Discipline;
  planName: string;
}

const COLORS = [
  '#26C6A9', '#3B82F6', '#8B5CF6', '#EC4899', 
  '#F59E0B', '#EF4444', '#10B981', '#6366F1'
];

const DisciplineModal: React.FC<DisciplineModalProps> = ({ isOpen, onClose, onSave, initialData, planName }) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [newTopicName, setNewTopicName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setColor(initialData.color);
      setTopics(initialData.topics);
    } else {
      setName('');
      setColor(COLORS[0]);
      setTopics([]);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleAddTopic = () => {
    if (!newTopicName.trim()) return;
    const newTopic: Topic = {
      id: crypto.randomUUID(),
      name: newTopicName.trim(),
      isCompleted: false,
    };
    setTopics([...topics, newTopic]);
    setNewTopicName('');
  };

  const handleDeleteTopic = (id: string) => {
    setTopics(topics.filter(t => t.id !== id));
  };

  const handleGenerateWithAI = async () => {
    if (!name.trim()) {
      alert("Por favor, dê um nome à disciplina antes de usar a IA.");
      return;
    }
    setIsGenerating(true);
    try {
      const suggestedTopics = await generateTopicsForDiscipline(name, planName);
      if (suggestedTopics && suggestedTopics.length > 0) {
        const newTopics: Topic[] = suggestedTopics.map((t: string) => ({
          id: crypto.randomUUID(),
          name: t,
          isCompleted: false
        }));
        setTopics(prev => [...prev, ...newTopics]);
      }
    } catch (e) {
      console.error(e);
      alert("Houve um erro ao gerar tópicos. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name, color, topics });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <h2 className="text-2xl font-bold text-gray-800">{name || 'Nova Disciplina'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-3">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Nome</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Português, Direito Constitucional..."
                className="w-full text-lg font-medium border-b-2 border-gray-100 focus:border-[#26C6A9] outline-none py-1 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 text-right">Cor</label>
              <div className="flex flex-wrap gap-2 justify-end">
                {COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full transition-all ${color === c ? 'scale-125 ring-2 ring-offset-2 ring-[#26C6A9]' : 'hover:scale-110'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mb-6 flex items-center justify-between">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tópicos de Estudo</label>
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={handleGenerateWithAI}
                disabled={isGenerating}
                className="flex items-center gap-2 text-xs font-bold text-[#26C6A9] bg-[#26C6A9]/10 px-3 py-1.5 rounded-lg hover:bg-[#26C6A9]/20 transition-colors disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                SUGERIR COM IA
              </button>
              <button 
                type="button" 
                className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> NOVO TÓPICO
              </button>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <input 
              type="text" 
              value={newTopicName}
              onChange={(e) => setNewTopicName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTopic())}
              placeholder="Adicionar um novo tópico manual..."
              className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#26C6A9]"
            />
            <button 
              type="button"
              onClick={handleAddTopic}
              className="bg-gray-100 text-gray-600 px-4 rounded-xl hover:bg-gray-200 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2 mb-8 min-h-[100px] border rounded-xl p-4 bg-gray-50/50">
            {topics.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                <Plus className="w-8 h-8 opacity-20 mb-2" />
                <p className="text-sm font-medium">Nenhum tópico adicionado.</p>
              </div>
            ) : (
              topics.map((topic, index) => (
                <div key={topic.id} className="group flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                  <span className="text-xs font-bold text-gray-300 w-4">{index + 1}</span>
                  <p className="text-sm font-medium text-gray-700 flex-1">{topic.name}</p>
                  <button 
                    type="button"
                    onClick={() => handleDeleteTopic(topic.id)}
                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </form>

        <div className="p-8 border-t bg-gray-50 flex items-center justify-end gap-4">
          <button 
            type="button" 
            onClick={onClose}
            className="px-8 py-3 rounded-xl font-bold text-[#26C6A9] border-2 border-[#26C6A9] bg-white hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSubmit}
            className="px-12 py-3 rounded-xl font-bold text-white bg-[#26C6A9] hover:bg-[#1fb397] transition-all shadow-lg shadow-[#26C6A9]/20 active:scale-95"
          >
            Salvar Disciplina
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisciplineModal;
