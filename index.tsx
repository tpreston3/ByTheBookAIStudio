
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  GoogleGenAI, 
  Type, 
  GenerateContentResponse 
} from "@google/genai";
import { 
  ShieldCheck, 
  Search, 
  FileText, 
  Settings, 
  MessageSquare, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  History, 
  Upload, 
  Scale, 
  Plus, 
  ArrowRight, 
  Database, 
  Users, 
  X, 
  FileCode, 
  FileSearch, 
  Loader2, 
  FileDigit, 
  Filter, 
  Sparkles, 
  Info, 
  ExternalLink, 
  BookOpen, 
  Maximize2, 
  ChevronLeft, 
  Calendar, 
  Share2,
  DollarSign,
  Clock,
  MapPin,
  CreditCard,
  Building2,
  Activity
} from 'lucide-react';

// --- Types ---

export interface UploadedFile {
  name: string;
  type: string;
  content?: string; 
  base64?: string;  
  size: number;
}

export interface ProjectContext {
  name: string;
  productionType: string;
  budgetAmount: string;
  status: string;
  productionCompany: string;
  unions: string[];
  startDate: string;
  endDate: string;
  location: string;
  paymasterId: string;
  notes: string;
  documents: UploadedFile[];
}

export interface Citation {
  docId: string;
  page: number;
  textSnippet: string;
  sectionLabel: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  isLoading?: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  query: string;
  status: 'compliant' | 'violation' | 'info';
  citations?: Citation[];
}

export interface ValidationIssue {
  rule: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  source_reference?: Citation;
}

export interface ValidationResult {
  status: 'compliant' | 'warning' | 'violation';
  issues: ValidationIssue[];
  summary: string;
}

// --- Constants ---

const PRODUCTION_TYPES = [
  'Feature Film',
  'Television Series',
  'Commercial',
  'Documentary',
  'Short Film',
  'Music Video'
];

const STATUS_OPTIONS = [
  'Development',
  'Pre-Production',
  'Production',
  'Post-Production',
  'Distribution'
];

const UNION_OPTIONS = [
  { id: 'dga', name: 'DGA' },
  { id: 'sag-aftra', name: 'SAG-AFTRA' },
  { id: 'iatse', name: 'IATSE' },
  { id: 'teamsters', name: 'Teamsters' },
];

const STORAGE_KEY = 'bythebook_project_setup_v6';
// Max characters per document to prevent exceeding token limits. 
// 150k chars is approx 35k-40k tokens. 
const MAX_TEXT_TOKENS_CHARS = 150000; 

// --- Utilities ---

export const constructAuditPrompt = (context: any) => {
  return `
        PERFORM COMPLIANCE AUDIT ON THE ATTACHED DEAL MEMO.
        Context: ${context.name} in ${context.location} with a budget of $${context.budgetAmount}.
        Dates: ${context.startDate} to ${context.endDate}.
        Check against ${context.unions.join(', ')} master agreements.
        Identify:
        1. Meal Penalty violations.
        2. Rest period insufficiencies.
        3. Rate discrepancies.
        4. Health/Pension requirements.

        Return JSON ONLY:
        {
          "status": "compliant" | "warning" | "violation",
          "issues": [
            {
              "rule": "string",
              "description": "string",
              "severity": "high" | "medium" | "low",
              "source_reference": {
                "docId": "string",
                "page": "number",
                "textSnippet": "string",
                "sectionLabel": "string"
              }
            }
          ],
          "summary": "string"
        }
      `;
};

export const parseCitations = (text: string): { content: string, citations: Citation[] } => {
  const citations: Citation[] = [];
  const citationRegex = /<CITATION>([\s\S]*?)<\/CITATION>/g;
  
  const content = text.replace(citationRegex, (match, json) => {
    try {
      const citation = JSON.parse(json);
      citations.push(citation);
    } catch (e) {
      console.error('Failed to parse citation JSON', e);
    }
    return ''; // Remove the citation block from the content
  });

  return { content, citations };
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result?.toString().split(',')[1] || '');
    reader.onerror = error => reject(error);
  });
};

const extractTextFromFile = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  
  if (file.name.endsWith('.docx')) {
    // @ts-ignore
    if (!window.mammoth) return "Mammoth library not loaded.";
    // @ts-ignore
    const result = await window.mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }

  if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
    try {
      // @ts-ignore
      const pdfjsLib = window['pdfjs-dist/build/pdf'];
      if (!pdfjsLib) return "PDF.js library not loaded.";
      
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      let fullText = '';
      
      // Limit to first 200 pages to prevent browser hang and token blowup
      const maxPages = Math.min(pdf.numPages, 200);
      for (let i = 1; i <= maxPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        // @ts-ignore
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
      }
      return fullText;
    } catch (err) {
      console.error("Error extracting PDF text:", err);
      return "Unable to extract text from this PDF.";
    }
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
};

// --- Components ---

export const CitationBadge = ({ citation, onClick }: { citation: Citation, onClick: (c: Citation) => void }) => (
  <button
    onClick={() => onClick(citation)}
    title={citation.docId} // Basic tooltip
    className="inline-flex items-center space-x-1 px-2.5 py-1 mx-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 rounded-lg text-[10px] font-black uppercase transition-all shadow-sm cursor-pointer"
  >
    <FileText size={10} className="mr-0.5" />
    <span>{citation.sectionLabel}</span>
  </button>
);

const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
      active 
        ? 'bg-amber-600/20 text-amber-400 border-l-4 border-amber-500' 
        : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </button>
);

const FileUploadZone = ({ onFilesAdded, acceptedTypes }: { onFilesAdded: (files: File[]) => void, acceptedTypes: string }) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files) as File[];
    onFilesAdded(files);
  };

  return (
    <div 
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer flex flex-col items-center justify-center space-y-3 ${
        isDragging ? 'border-amber-500 bg-amber-500/10' : 'border-gray-800 bg-gray-900/50 hover:border-gray-600'
      }`}
    >
      <input 
        type="file" 
        ref={inputRef} 
        multiple 
        accept={acceptedTypes} 
        className="hidden" 
        onChange={(e) => e.target.files && onFilesAdded(Array.from(e.target.files) as File[])}
      />
      <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-gray-400">
        <Upload size={24} />
      </div>
      <div className="text-center">
        <p className="text-gray-200 font-medium">Click to upload or drag and drop</p>
        <p className="text-gray-500 text-xs mt-1">PDF, DOCX, TXT, MD (max 10MB)</p>
      </div>
    </div>
  );
};

// --- App ---

const App = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'wizard' | 'chat' | 'validator' | 'logs'>('dashboard');
  const [project, setProject] = useState<ProjectContext>({
    name: '',
    productionType: '',
    budgetAmount: '',
    status: 'Development',
    productionCompany: '',
    unions: [],
    startDate: '',
    endDate: '',
    location: '',
    paymasterId: '',
    notes: '',
    documents: []
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validatorInput, setValidatorInput] = useState('');
  const [selectedValidatorFile, setSelectedValidatorFile] = useState<UploadedFile | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  const [viewingDoc, setViewingDoc] = useState<UploadedFile | null>(null);
  const [highlightTerm, setHighlightTerm] = useState<string>('');

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Persistence: Load
  useEffect(() => {
    const savedSetup = localStorage.getItem(STORAGE_KEY);
    if (savedSetup) {
      try {
        const parsed = JSON.parse(savedSetup);
        setProject(prev => ({
          ...prev,
          ...parsed,
          documents: prev.documents || []
        }));
      } catch (err) {
        console.error("Error loading project setup:", err);
      }
    }
  }, []);

  // Persistence: Save
  useEffect(() => {
    const { documents, ...setupToSave } = project;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(setupToSave));
  }, [project]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTab]);

  const handleFilesAdded = async (files: File[]) => {
    setIsProcessing(true);
    const newDocs: UploadedFile[] = [];
    
    for (const file of files) {
      try {
        const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
        const content = await extractTextFromFile(file);
        
        if (isPdf) {
          const base64 = await fileToBase64(file);
          newDocs.push({ 
            name: file.name, 
            type: file.type, 
            base64, 
            content, 
            size: file.size
          });
        } else {
          newDocs.push({ 
            name: file.name, 
            type: file.type, 
            content, 
            size: file.size
          });
        }
      } catch (err) {
        console.error(`Error processing file ${file.name}:`, err);
      }
    }
    
    setProject(prev => ({ ...prev, documents: [...prev.documents, ...newDocs] }));
    setIsProcessing(false);
  };

  const removeDoc = (name: string) => {
    setProject(prev => ({
      ...prev,
      documents: prev.documents.filter((doc) => doc.name !== name)
    }));
  };

  const quickAction = (query: string) => {
    setActiveTab('chat');
    setInputValue(query);
    setTimeout(() => handleSendMessage(query), 100);
  };

  const handleSendMessage = async (customQuery?: string) => {
    const query = customQuery || inputValue;
    if (!query.trim() || !project.name) return;

    if (!customQuery) {
      const userMsg: Message = { role: 'user', content: query };
      setMessages(prev => [...prev, userMsg]);
      setInputValue('');
    }
    
    setIsProcessing(true);

    const loadingMsg: Message = { role: 'assistant', content: 'Analyzing project contracts...', isLoading: true };
    setMessages(prev => [...prev, loadingMsg]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const docList = project.documents.map(d => `[${d.name}]`).join(', ');

      const systemInstruction = `
        You are "ByTheBook", an AI specialized in Labor Compliance for the film and television industry.
        You have access to union agreements and production context provided in the conversation parts.
        
        PRODUCTION PARAMETERS:
        - Project: ${project.name}
        - Type: ${project.productionType}
        - Location: ${project.location}
        - Budget: $${project.budgetAmount}
        - Status: ${project.status}
        - Company: ${project.productionCompany}
        - Unions: ${project.unions.join(', ') || 'N/A'}
        - Timeline: ${project.startDate || 'Unknown'} to ${project.endDate || 'Unknown'}
        
        INGESTED DOCUMENTS: ${docList}

        GOAL:
        Analyze the query and find specific answers within the provided contracts. 
        Always provide section-level citations and mention document names in brackets like [DocumentName.pdf].
        Use a professional, legal, and compliance-oriented tone.

        CITATION FORMAT:
        When you find a specific clause or rule, you MUST include a machine-readable citation block at the end of your response (or after the relevant paragraph) in the following format:
        <CITATION>
        {
          "docId": "exact_document_name.pdf",
          "page": 12,
          "textSnippet": "exact text from document",
          "sectionLabel": "Article 12.A"
        }
        </CITATION>
      `;

      // CRITICAL: We prioritize text content to avoid token overflow. 
      // Binary (inlineData) is avoided for background knowledge documents.
      const parts: any[] = [];
      project.documents.forEach(d => {
        if (d.content) {
          const truncatedContent = d.content.slice(0, MAX_TEXT_TOKENS_CHARS);
          parts.push({ text: `REFERENCE DOCUMENT: ${d.name}\n---\n${truncatedContent}\n---\n` });
        } else if (d.base64 && !d.content) {
          // Fallback only if no text was extracted
          parts.push({ inlineData: { data: d.base64, mimeType: 'application/pdf' } });
        }
      });

      parts.push({ text: `User Query: ${query}` });

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [{ parts }],
        config: { systemInstruction, temperature: 0.15 }
      });

      const rawText = response.text || "I was unable to retrieve a definitive answer from the current documents.";
      const { content, citations } = parseCitations(rawText);
      
      setMessages(prev => [...prev.slice(0, -1), { role: 'assistant', content, citations }]);
      setLogs(prev => [{ id: Math.random().toString(36).substr(2, 9), timestamp: new Date().toLocaleTimeString(), query, status: 'info' }, ...prev]);
    } catch (error: any) {
      console.error(error);
      const errorMsg = error.message?.includes('token') 
        ? "The total volume of document text exceeds the model's capacity. Please remove some documents or provide more specific queries."
        : "An error occurred while processing your request. The documents may be too complex or there's a connectivity issue.";
      setMessages(prev => [...prev.slice(0, -1), { role: 'assistant', content: errorMsg }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleValidateDealMemo = async () => {
    const contentToValidate = selectedValidatorFile?.content || validatorInput;
    if (!contentToValidate && !selectedValidatorFile?.base64) return;
    
    setIsProcessing(true);
    setValidationResult(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = constructAuditPrompt(project);

      const parts: any[] = [];
      // Use text only for reference docs
      project.documents.forEach(d => {
        if (d.content) {
          parts.push({ text: `Reference Document [${d.name}]:\n${d.content.slice(0, 100000)}` });
        }
      });

      // For the target document, we can afford binary if text isn't enough, 
      // but text is still safer for large memos.
      if (selectedValidatorFile?.content) {
        parts.push({ text: `Deal Memo Content to Audit:\n${selectedValidatorFile.content.slice(0, MAX_TEXT_TOKENS_CHARS)}` });
      } else if (selectedValidatorFile?.base64) {
        parts.push({ inlineData: { data: selectedValidatorFile.base64, mimeType: 'application/pdf' } });
      } else if (contentToValidate) {
        parts.push({ text: `Deal Memo Content to Audit:\n${contentToValidate.slice(0, MAX_TEXT_TOKENS_CHARS)}` });
      }

      parts.push({ text: prompt });

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [{ parts }],
        config: { responseMimeType: "application/json", temperature: 0.1 }
      });

      const result = JSON.parse(response.text || '{}');
      setValidationResult(result);
      setLogs(prev => [{ id: Math.random().toString(36).substr(2, 9), timestamp: new Date().toLocaleTimeString(), query: "Audit: " + (selectedValidatorFile?.name || "Text Segment"), status: result.status === 'violation' ? 'violation' : 'compliant' }, ...prev]);
    } catch (error: any) {
      console.error(error);
      setValidationResult({ 
        status: 'warning', 
        issues: [{ rule: 'System Error', description: error.message || 'The context provided was too large for the audit engine.', severity: 'high' }], 
        summary: 'The audit failed to complete due to document complexity.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleUnion = (id: string) => {
    setProject(prev => {
      const unions = prev.unions.includes(id) 
        ? prev.unions.filter(u => u !== id) 
        : [...prev.unions, id];
      return { ...prev, unions };
    });
  };

  const renderMessageContent = (content: string) => {
    const docNames = project.documents.map(d => d.name);
    if (docNames.length === 0) return content;

    const parts = content.split(/(\[.*?\])/g);
    return parts.map((part, i) => {
      const match = part.match(/^\[(.*?)\]$/);
      if (match) {
        const docName = match[1];
        const foundDoc = project.documents.find(d => d.name === docName);
        if (foundDoc) {
          return (
            <button
              key={i}
              onClick={() => {
                setViewingDoc(foundDoc);
                const contentIndex = content.indexOf(part);
                const start = Math.max(0, contentIndex - 100);
                const end = Math.min(content.length, contentIndex + part.length + 100);
                const context = content.slice(start, end).replace(/\[.*?\]/g, '').trim();
                setHighlightTerm(context);
              }}
              className="inline-flex items-center space-x-1 px-2.5 py-1 mx-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 rounded-lg text-[10px] font-black uppercase transition-all shadow-sm"
            >
              <FileText size={10} className="mr-0.5" />
              <span>{docName}</span>
            </button>
          );
        }
      }
      return part;
    });
  };

  const HighlightedDocument = ({ doc, term }: { doc: UploadedFile, term: string }) => {
    if (!doc.content) return <div className="p-12 text-center text-gray-700"><p>Binary preview unavailable.</p></div>;
    const text = doc.content;
    const termWords = term.split(/[\s,.;:]+/).filter(w => w.length > 4).slice(0, 4);
    const highlightPattern = termWords.length > 0 ? termWords.join('.*?') : term.split(' ').slice(0, 3).join('.*?');
    
    let segments: string[] = [text];
    let matchedText = "";
    if (highlightPattern) {
      try {
        const regex = new RegExp(`(${highlightPattern})`, 'gi');
        segments = text.split(regex);
        const match = text.match(regex);
        if (match) matchedText = match[0];
      } catch (e) { segments = [text]; }
    }

    return (
      <div className="bg-[#0c0c0c] p-10 rounded-[2.5rem] border border-gray-800/50 font-serif text-sm leading-relaxed text-gray-400 overflow-y-auto max-h-full shadow-2xl">
        <div className="flex justify-between items-center mb-10 border-b border-gray-800 pb-6">
           <div className="flex items-center space-x-3">
              <Scale size={16} className="text-amber-500" />
              <div>
                 <h4 className="text-xs font-black text-white uppercase tracking-widest">{doc.name}</h4>
                 <p className="text-[9px] text-gray-600 font-mono uppercase">Master Audit Copy</p>
              </div>
           </div>
        </div>
        <div className="whitespace-pre-wrap">
          {segments.map((part, i) => (
            part === matchedText ? 
              <span key={i} className="bg-amber-500/30 text-amber-100 border-b-2 border-amber-500 font-bold px-1.5 py-0.5 rounded animate-pulse">{part}</span> : 
              part
          ))}
        </div>
      </div>
    );
  };

  // --- Views ---

  const renderWizard = () => (
    <div className="max-w-4xl mx-auto py-12 px-6 h-full overflow-y-auto custom-scrollbar">
      <div className="bg-gray-900/60 border border-gray-800 rounded-[2.5rem] shadow-2xl overflow-hidden backdrop-blur-3xl">
        <div className="px-10 py-8 border-b border-gray-800 flex justify-between items-center">
          <h1 className="text-2xl font-black text-white tracking-tighter italic">Production Setup</h1>
          <button onClick={() => setActiveTab('dashboard')} className="text-gray-600 hover:text-white"><X size={24} /></button>
        </div>

        <div className="p-10 space-y-8">
          {/* Production Title */}
          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2">Production Title *</label>
            <input 
              type="text" placeholder="Enter production title"
              className="w-full bg-gray-950/80 border border-gray-800 rounded-xl px-5 py-4 text-white font-medium focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
              value={project.name}
              onChange={(e) => setProject(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          {/* Row 2: Type & Budget */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Production Type *</label>
              <select 
                className="w-full bg-gray-950/80 border border-gray-800 rounded-xl px-5 py-4 text-white font-medium focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                value={project.productionType}
                onChange={(e) => setProject(prev => ({ ...prev, productionType: e.target.value }))}
              >
                <option value="">Select type</option>
                {PRODUCTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Budget</label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 font-bold">$</span>
                <input 
                  type="text" 
                  placeholder="e.g. 5,000,000"
                  className="w-full bg-gray-950/80 border border-gray-800 rounded-xl pl-10 pr-5 py-4 text-white font-medium focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                  value={project.budgetAmount}
                  onChange={(e) => setProject(prev => ({ ...prev, budgetAmount: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Row 3: Status & Company */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Status</label>
              <select 
                className="w-full bg-gray-950/80 border border-gray-800 rounded-xl px-5 py-4 text-white font-medium focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                value={project.status}
                onChange={(e) => setProject(prev => ({ ...prev, status: e.target.value }))}
              >
                {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Production Company</label>
              <div className="relative">
                <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                <input 
                  type="text" 
                  placeholder="Company name"
                  className="w-full bg-gray-950/80 border border-gray-800 rounded-xl pl-12 pr-5 py-4 text-white font-medium focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                  value={project.productionCompany}
                  onChange={(e) => setProject(prev => ({ ...prev, productionCompany: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Row 4: Unions */}
          <div>
            <label className="block text-sm font-bold text-gray-400 mb-4">Applicable Unions & Contracts</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {UNION_OPTIONS.map(union => (
                <label key={union.id} className="flex items-center space-x-3 cursor-pointer group">
                  <div 
                    onClick={() => toggleUnion(union.id)}
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                      project.unions.includes(union.id) 
                        ? 'bg-amber-500 border-amber-500 text-gray-950' 
                        : 'bg-gray-950 border-gray-800 group-hover:border-gray-600'
                    }`}
                  >
                    {project.unions.includes(union.id) && <CheckCircle2 size={16} />}
                  </div>
                  <span className={`text-sm font-bold transition-colors ${project.unions.includes(union.id) ? 'text-amber-500' : 'text-gray-500'}`}>
                    {union.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Row 5: Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Start Date</label>
              <div className="relative">
                <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                <input 
                  type="date" 
                  className="w-full bg-gray-950/80 border border-gray-800 rounded-xl pl-12 pr-5 py-4 text-white font-medium focus:ring-2 focus:ring-amber-500/20 outline-none transition-all [color-scheme:dark]"
                  value={project.startDate}
                  onChange={(e) => setProject(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">End Date</label>
              <div className="relative">
                <Clock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                <input 
                  type="date" 
                  className="w-full bg-gray-950/80 border border-gray-800 rounded-xl pl-12 pr-5 py-4 text-white font-medium focus:ring-2 focus:ring-amber-500/20 outline-none transition-all [color-scheme:dark]"
                  value={project.endDate}
                  onChange={(e) => setProject(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Row 6: Location & Paymaster */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Primary Location (State)</label>
              <div className="relative">
                <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                <input 
                  type="text" 
                  placeholder="e.g., California"
                  className="w-full bg-gray-950/80 border border-gray-800 rounded-xl pl-12 pr-5 py-4 text-white font-medium focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                  value={project.location}
                  onChange={(e) => setProject(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">EP Paymaster ID</label>
              <div className="relative">
                <CreditCard className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                <input 
                  type="text" 
                  placeholder="Project ID"
                  className="w-full bg-gray-950/80 border border-gray-800 rounded-xl pl-12 pr-5 py-4 text-white font-medium focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                  value={project.paymasterId}
                  onChange={(e) => setProject(prev => ({ ...prev, paymasterId: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800">
            <h3 className="text-lg font-black text-blue-500 mb-6 uppercase tracking-widest flex items-center space-x-3">
              <Database size={22} />
              <span>Knowledge Ingest</span>
            </h3>
            
            <div className="grid grid-cols-1 gap-6">
              <FileUploadZone onFilesAdded={handleFilesAdded} acceptedTypes=".pdf,.docx,.txt,.md" />
            </div>

            <div className="mt-8 space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
              {project.documents.map((doc, i) => (
                <div key={`${doc.name}-${i}`} className="flex justify-between items-center bg-gray-950/40 p-4 rounded-xl border border-gray-800 hover:border-amber-500/20 transition-all">
                  <div className="flex items-center space-x-4">
                    <FileText className="text-amber-500" size={18} />
                    <span className="text-sm font-bold text-gray-300 truncate">{doc.name}</span>
                  </div>
                  <button onClick={() => removeDoc(doc.name)} className="text-gray-600 hover:text-red-500 transition-colors"><X size={16} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-10 py-8 bg-gray-950/50 border-t border-gray-800 flex justify-end space-x-4">
          <button onClick={() => setActiveTab('dashboard')} className="px-8 py-3 bg-white text-gray-950 font-black rounded-xl uppercase tracking-widest text-xs hover:bg-gray-200 transition-all">Cancel</button>
          <button 
            disabled={!project.name}
            onClick={() => setActiveTab('dashboard')}
            className="px-8 py-3 bg-amber-500 text-gray-950 font-black rounded-xl uppercase tracking-widest text-xs shadow-xl shadow-amber-500/10 hover:bg-amber-400 transition-all disabled:opacity-30"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="p-10 max-w-6xl mx-auto h-full overflow-y-auto custom-scrollbar">
      <div className="flex justify-between items-start mb-12">
        <div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tighter">Production Pulse</h1>
          <div className="flex items-center space-x-4">
            <span className="text-green-500 flex items-center space-x-2 bg-green-500/5 border border-green-500/10 px-3 py-1 rounded-full text-[10px] font-black uppercase">
               <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
               <span>LIVE AUDIT ACTIVE</span>
            </span>
            {project.startDate && project.endDate && (
              <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">
                {project.startDate} — {project.endDate}
              </span>
            )}
            {project.location && (
               <span className="text-gray-600 text-[10px] font-black uppercase flex items-center space-x-1">
                 <MapPin size={12} />
                 <span>{project.location}</span>
               </span>
            )}
          </div>
        </div>
        <div className="flex space-x-4">
            <div className="bg-gray-900/60 border border-gray-800 px-8 py-5 rounded-[2rem] backdrop-blur-xl shadow-xl flex flex-col justify-center">
              <p className="text-[10px] text-gray-700 uppercase font-black tracking-[0.3em] mb-1">Production Budget</p>
              <div className="flex items-center space-x-2">
                <DollarSign size={18} className="text-amber-500" />
                <p className="text-3xl font-black text-white">{project.budgetAmount || '0.00'}</p>
              </div>
            </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-amber-600/10 to-transparent border border-amber-600/20 rounded-[3rem] p-10 mb-10 flex flex-col md:flex-row items-center justify-between shadow-2xl relative overflow-hidden group">
        <div className="mb-6 md:mb-0 md:mr-10 relative z-10">
          <h3 className="text-2xl font-black text-amber-500 mb-2 italic tracking-tighter">Global Clause Search</h3>
          <p className="text-gray-500 text-sm max-w-md leading-relaxed">Search across all project contracts to instantly verify rules.</p>
        </div>
        <div className="w-full md:w-[28rem] relative z-10">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" size={20} />
          <input 
            type="text"
            onKeyDown={(e) => e.key === 'Enter' && quickAction((e.target as HTMLInputElement).value)}
            placeholder="e.g. SAG-AFTRA overtime triggers..."
            className="w-full bg-gray-950/80 border border-amber-600/20 rounded-[1.5rem] pl-14 pr-6 py-5 text-white font-bold"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: MessageSquare, label: 'Advisor Q & A', desc: 'Ask specific questions and get instant, cited compliance answers.', tab: 'chat', color: 'amber' },
          { icon: ShieldCheck, label: 'Audit Engine', desc: 'Batch-scan deal memos for high-risk labor violations.', tab: 'validator', color: 'blue' },
          { icon: History, label: 'Audit Vault', desc: 'Permanent log of all compliance decisions and queries.', tab: 'logs', color: 'purple' },
        ].map(item => (
          <div key={item.tab} onClick={() => setActiveTab(item.tab as any)} className="bg-gray-900/40 p-10 rounded-[3rem] border border-gray-800 hover:border-amber-500/40 cursor-pointer shadow-2xl transition-all">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-10 ${
              item.color === 'amber' ? 'bg-amber-600/10 text-amber-500 border border-amber-500/20' : 
              item.color === 'blue' ? 'bg-blue-600/10 text-blue-500 border border-blue-500/20' : 'bg-purple-600/10 text-purple-500 border border-purple-500/20'
            }`}>
              <item.icon size={32} />
            </div>
            <h3 className="text-2xl font-black text-white mb-4 tracking-tighter">{item.label}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderChat = () => (
    <div className="flex flex-row h-full bg-[#050505] relative overflow-hidden">
      <div className={`flex flex-col transition-all duration-700 ${viewingDoc ? 'w-1/2 opacity-60 scale-95 origin-left' : 'w-full'} h-full border-r border-gray-800`}>
        <div className="px-10 py-6 border-b border-gray-800 bg-gray-950/90 backdrop-blur-2xl flex justify-between items-center shrink-0 z-10">
          <h2 className="text-2xl font-black text-white tracking-tighter italic">Advisor Q & A</h2>
          <button onClick={() => setMessages([])} className="text-[10px] font-black text-gray-700 hover:text-white uppercase tracking-[0.3em] px-5 py-2.5 border border-gray-800 rounded-2xl">Reset Link</button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-[2.5rem] p-8 shadow-2xl ${
                msg.role === 'user' ? 'bg-amber-600 text-white font-black text-sm' : 'bg-gray-900/80 border border-gray-800 text-gray-200'
              }`}>
                {msg.isLoading ? <Loader2 className="animate-spin text-amber-500" size={24} /> : renderMessageContent(msg.content)}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="p-10 bg-gray-950/80 border-t border-gray-800">
          <div className="max-w-4xl mx-auto flex space-x-5">
            <input 
              type="text" value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask a compliance question..."
              className="flex-1 bg-gray-900 border border-gray-800 rounded-2xl px-8 py-6 text-white font-bold"
            />
            <button 
              disabled={isProcessing || !inputValue.trim()}
              onClick={() => handleSendMessage()}
              className="bg-amber-600 text-white w-20 h-20 rounded-[1.8rem] flex items-center justify-center transition-all shadow-2xl"
            >
              <ArrowRight size={32} />
            </button>
          </div>
        </div>
      </div>

      <div className={`fixed top-0 right-0 h-full bg-[#080808] border-l border-gray-800/50 shadow-2xl z-50 transition-all duration-700 ${viewingDoc ? 'w-1/2 translate-x-0' : 'w-1/2 translate-x-full'}`}>
        {viewingDoc && (
          <div className="flex flex-col h-full">
            <div className="px-10 py-8 border-b border-gray-800 bg-gray-950 flex justify-between items-center shrink-0">
               <div className="flex items-center space-x-4">
                  <BookOpen size={24} className="text-amber-500" />
                  <h3 className="text-lg font-black text-white truncate max-w-sm">{viewingDoc.name}</h3>
               </div>
               <button onClick={() => setViewingDoc(null)} className="text-gray-600 hover:text-white"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
               <HighlightedDocument doc={viewingDoc} term={highlightTerm} />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderValidator = () => (
    <div className="p-10 max-w-6xl mx-auto h-full flex flex-col overflow-y-auto custom-scrollbar">
      <h1 className="text-4xl font-black text-white mb-8 tracking-tighter italic">Audit Engine</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 flex-1 min-h-0">
        <div className="flex flex-col space-y-6">
          <FileUploadZone 
            onFilesAdded={async (files) => {
              const file = files[0];
              const content = await extractTextFromFile(file);
              const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
              if (isPdf) {
                const base64 = await fileToBase64(file);
                setSelectedValidatorFile({ name: file.name, type: file.type, base64, content, size: file.size });
              } else {
                setSelectedValidatorFile({ name: file.name, type: file.type, content, size: file.size });
              }
            }} 
            acceptedTypes=".pdf,.docx,.txt"
          />
          <textarea 
            value={validatorInput}
            onChange={(e) => { setValidatorInput(e.target.value); setSelectedValidatorFile(null); }}
            placeholder="Paste contract language..."
            className="flex-1 bg-gray-900/40 border border-gray-800 rounded-[2.5rem] p-10 text-gray-300 font-serif text-sm"
          ></textarea>
          <button 
            disabled={isProcessing || (!validatorInput && !selectedValidatorFile)}
            onClick={handleValidateDealMemo}
            className="bg-blue-600 text-white font-black py-6 rounded-[2rem] uppercase tracking-[0.3em] text-xs shadow-2xl"
          >
            {isProcessing ? <Loader2 className="animate-spin inline-block mr-3" /> : 'Authorize Scan'}
          </button>
        </div>
        <div className="bg-gray-900/40 border border-gray-800 rounded-[3rem] p-12 overflow-y-auto custom-scrollbar">
          {validationResult ? (
            <div className="space-y-8">
              <div className={`p-10 rounded-[2rem] border-2 font-black italic text-4xl ${
                validationResult.status === 'compliant' ? 'border-green-500/20 text-green-500 bg-green-500/5' : 'border-red-500/20 text-red-500 bg-red-500/5'
              }`}>
                {validationResult.status.toUpperCase()}
              </div>
              <div className="space-y-4">
                {validationResult.issues.map((issue: any, i: number) => (
                  <div key={i} className="bg-gray-950 p-6 rounded-2xl border border-gray-800">
                    <p className="text-blue-400 text-xs font-black uppercase mb-2">{issue.rule}</p>
                    <p className="text-gray-400 text-sm">{issue.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : <p className="text-gray-600 text-center py-20 uppercase font-black tracking-widest">Awaiting Analysis</p>}
        </div>
      </div>
    </div>
  );

  const renderLogs = () => (
    <div className="p-10 max-w-6xl mx-auto h-full overflow-y-auto custom-scrollbar">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-black text-white tracking-tighter italic">Audit Vault</h1>
      </div>
      
      <div className="bg-gray-900/40 border border-gray-800 rounded-[3rem] overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-950/80 text-gray-700 text-[11px] uppercase font-black tracking-[0.5em] border-b border-gray-800">
              <th className="px-12 py-8">Status</th>
              <th className="px-12 py-8">Event</th>
              <th className="px-12 py-8">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/40">
            {logs.map(log => (
              <tr key={log.id} className="hover:bg-gray-800/20 transition-all">
                <td className={`px-12 py-8 font-black uppercase text-[10px] ${log.status === 'compliant' ? 'text-green-500' : log.status === 'violation' ? 'text-red-500' : 'text-blue-500'}`}>{log.status}</td>
                <td className="px-12 py-8 text-gray-300 font-bold">{log.query}</td>
                <td className="px-12 py-8 text-gray-600 text-[10px]">{log.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#050505] text-gray-100 font-sans selection:bg-amber-500/40 relative">
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] z-0"></div>
      
      <div className="w-80 bg-gray-950 border-r border-gray-800/50 flex flex-col shrink-0 z-30 shadow-2xl">
        <div className="p-12 flex items-center space-x-5 mb-8">
          <div className="bg-gradient-to-br from-amber-500 to-amber-700 p-3 rounded-2xl shadow-2xl border border-amber-500/20">
            <BookOpen className="text-white" size={28} strokeWidth={3} />
          </div>
          <div className="flex flex-col">
             <span className="text-3xl font-black tracking-tighter text-white leading-none italic">ByTheBook</span>
             <span className="text-[9px] font-black text-amber-500/60 uppercase tracking-[0.6em] leading-none mt-2">Contracts Compliance OS</span>
          </div>
        </div>

        <nav className="flex-1 px-8 space-y-3">
          <p className="text-[10px] text-gray-800 font-black uppercase tracking-[0.5em] px-5 mb-8 opacity-50">Operation Hub</p>
          <SidebarItem icon={Scale} label="Overview" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={MessageSquare} label="Advisor Q & A" active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} />
          <SidebarItem icon={ShieldCheck} label="Audit Engine" active={activeTab === 'validator'} onClick={() => setActiveTab('validator')} />
          <SidebarItem icon={History} label="Vault Logs" active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} />
          <div className="pt-20">
             <SidebarItem icon={Settings} label="Project Setup" active={activeTab === 'wizard'} onClick={() => setActiveTab('wizard')} />
          </div>
        </nav>
      </div>

      <main className="flex-1 relative overflow-hidden z-10">
        {activeTab === 'wizard' && renderWizard()}
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'chat' && renderChat()}
        {activeTab === 'validator' && renderValidator()}
        {activeTab === 'logs' && renderLogs()}
      </main>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}
