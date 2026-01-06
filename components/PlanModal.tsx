
import React, { useState, useEffect, useRef } from 'react';
import { X, Image as ImageIcon, Upload } from 'lucide-react';
import { StudyPlan } from '../types';

interface PlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<StudyPlan>) => void;
  initialData?: StudyPlan;
}

const CONCURSOS = [
  "Receita Federal - Auditor Fiscal",
  "Polícia Federal - Agente",
  "Polícia Rodoviária Federal",
  "INSS - Técnico do Seguro Social",
  "Tribunal de Justiça (TJ)",
  "Ministério Público (MPU)",
  "Carreiras Bancárias",
  "Carreiras Legislativas"
];

const ESTUDOS_PERSONALIZADOS = [
  "Exame da OAB",
  "Residência Médica",
  "Vestibular / ENEM",
  "Certificação Profissional (TI/Finanças)",
  "Pós-Graduação / Mestrado",
  "Idiomas"
];

const PlanModal: React.FC<PlanModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [name, setName] = useState('');
  const [observation, setObservation] = useState('');
  const [categoryType, setCategoryType] = useState<'concurso' | 'personalizado'>('concurso');
  const [selectedValue, setSelectedValue] = useState('');
  const [isGeneral, setIsGeneral] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setObservation(initialData.observation || '');
      
      // Determine category based on stored values
      if (initialData.editais) {
        setCategoryType('concurso');
        setSelectedValue(initialData.editais);
      } else if (initialData.cargos) {
        setCategoryType('personalizado');
        setSelectedValue(initialData.cargos);
      }
      
      setIsGeneral(initialData.isGeneral);
      setImageUrl(initialData.imageUrl || '');
    } else {
      setName('');
      setObservation('');
      setCategoryType('concurso');
      setSelectedValue('');
      setIsGeneral(false);
      setImageUrl('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    onSave({ 
      name, 
      observation, 
      editais: categoryType === 'concurso' && !isGeneral ? selectedValue : '', 
      cargos: categoryType === 'personalizado' && !isGeneral ? selectedValue : '', 
      isGeneral, 
      imageUrl 
    });
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("A imagem é muito grande. Por favor, escolha uma imagem com menos de 2MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCategoryChange = (type: 'concurso' | 'personalizado') => {
    setCategoryType(type);
    setSelectedValue('');
    if (isGeneral) setIsGeneral(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-700">
            {initialData ? 'Editar Plano de Estudos' : 'Novo Plano de Estudos'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors group">
            <X className="w-6 h-6 text-gray-300 group-hover:text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-8 custom-scrollbar">
          <p className="text-sm text-gray-400 mb-8 leading-relaxed">
            Dê um nome para o seu plano de estudos e, caso queira, adicione uma imagem para identificá-lo.
          </p>

          <div className="flex gap-8 mb-10">
            {/* Hidden File Input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />

            {/* Image Upload Area */}
            <div className="flex flex-col items-center gap-2">
              <div 
                onClick={handleImageClick}
                className="w-32 h-32 bg-white rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer hover:border-[#26C6A9] transition-all"
              >
                {imageUrl ? (
                  <>
                    <img src={imageUrl} alt="Icon" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Upload className="w-8 h-8 text-white" />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1.5">
                    <ImageIcon className="w-10 h-10 text-gray-200" />
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Adicionar</span>
                  </div>
                )}
              </div>
              <button 
                type="button" 
                onClick={handleImageClick}
                className="text-[11px] font-bold text-gray-400 hover:text-gray-600 transition-colors uppercase"
              >
                Alterar imagem
              </button>
            </div>

            {/* Basic Info */}
            <div className="flex-1 space-y-8">
              <div className="group">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 group-focus-within:text-[#26C6A9] transition-colors">Nome do Plano</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Auditor Fiscal"
                  className="w-full text-lg font-medium border-b border-gray-200 focus:border-[#26C6A9] outline-none py-1.5 transition-all"
                  required
                />
              </div>
              
              <div className="group">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 group-focus-within:text-[#26C6A9] transition-colors">Observações (Opcional)</label>
                <textarea 
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                  placeholder="Aqui você pode escrever alguma observação sobre o seu plano"
                  className="w-full border-b border-gray-200 focus:border-[#26C6A9] outline-none py-1.5 resize-none h-16 transition-all text-sm text-gray-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-800">Para o que você está estudando?</h3>
            
            <div className="flex flex-col gap-6">
              {/* Radio Selection */}
              <div className="flex gap-8 items-center">
                <label className={`flex items-center gap-2 cursor-pointer transition-opacity ${isGeneral ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                  <input 
                    type="radio" 
                    name="studyCategory" 
                    checked={categoryType === 'concurso'} 
                    onChange={() => handleCategoryChange('concurso')}
                    className="w-5 h-5 border-gray-300 text-[#26C6A9] focus:ring-[#26C6A9]"
                  />
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Concurso</span>
                </label>
                
                <label className={`flex items-center gap-2 cursor-pointer transition-opacity ${isGeneral ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                  <input 
                    type="radio" 
                    name="studyCategory" 
                    checked={categoryType === 'personalizado'} 
                    onChange={() => handleCategoryChange('personalizado')}
                    className="w-5 h-5 border-gray-300 text-[#26C6A9] focus:ring-[#26C6A9]"
                  />
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Estudo Personalizado</span>
                </label>
              </div>

              {/* Dynamic Select Field */}
              <div className={`group transition-all ${isGeneral ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 group-focus-within:text-[#26C6A9] transition-colors">
                  {categoryType === 'concurso' ? 'Selecione o Concurso' : 'Tipo de Estudo'}
                </label>
                <select 
                  value={selectedValue}
                  onChange={(e) => setSelectedValue(e.target.value)}
                  className="w-full border-b border-gray-200 focus:border-[#26C6A9] outline-none py-2 transition-all bg-transparent text-sm text-gray-600 h-10"
                >
                  <option value="">Selecione uma opção...</option>
                  {(categoryType === 'concurso' ? CONCURSOS : ESTUDOS_PERSONALIZADOS).map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer group w-fit mt-4">
              <input 
                type="checkbox" 
                checked={isGeneral}
                onChange={(e) => {
                  setIsGeneral(e.target.checked);
                  if (e.target.checked) setSelectedValue('');
                }}
                className="w-5 h-5 rounded border-gray-300 text-[#26C6A9] focus:ring-[#26C6A9]"
              />
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tight group-hover:text-gray-600 transition-colors">Não estou estudando para nenhuma prova específica</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-4 mt-12 pb-4">
            <button 
              type="button" 
              onClick={onClose}
              className="px-10 py-3 rounded-xl font-bold text-[#26C6A9] border-2 border-[#26C6A9] hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="px-10 py-3 rounded-xl font-bold text-white bg-[#26C6A9] hover:bg-[#1fb397] transition-all shadow-lg shadow-[#26C6A9]/20 active:scale-95"
            >
              {initialData ? 'Salvar Alterações' : 'Criar Plano'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlanModal;
