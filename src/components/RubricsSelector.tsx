/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Check, Info, ShieldAlert, Award, FileSpreadsheet, Calculator } from "lucide-react";
import { PerformanceLevel, RubricSelection } from "../types";

interface RubricsSelectorProps {
  maxGrade: number;
  initialSelection?: RubricSelection;
  initialFinalGrade: number | null;
  onChange: (selection: RubricSelection, finalGrade: number) => void;
}

export interface Criterion {
  id: keyof RubricSelection;
  title: string;
  descriptors: Record<PerformanceLevel, string>;
}

export const SENAI_CRITERIA: Criterion[] = [
  {
    id: "interpretarDesenho",
    title: "Interpretar desenho técnico de montagem de conjunto e subconjuntos",
    descriptors: {
      NSA: "Identifica os componentes apenas com auxílio constante e não consegue explicar a relação funcional entre eles.",
      APO: "Identifica a maioria dos componentes usando a lista de materiais, mas descreve suas funções de forma genérica.",
      PAR: "Identifica todos os componentes, relaciona-os com a lista de materiais e descreve suas funções de forma correta e autônoma.",
      AUT: "Além de interpretar o conjunto, antecipa possíveis dificuldades de montagem, demonstrando visão sistêmica do projeto.",
    },
  },
  {
    id: "elaborarCroquis",
    title: "Elaborar croquis de peças em projeção ortogonal e perspectiva",
    descriptors: {
      NSA: "O croqui não segue as normas de projeção e cotagem, necessitando de orientação constante.",
      APO: "O croqui apresenta as vistas corretas, mas contém erros nas normas de cotagem ou tipos de linha, que são corrigidos.",
      PAR: "Elabora croquis claros e proporcionais, aplicando corretamente as normas de projeção e cotagem.",
      AUT: "Elabora croquis com excelente qualidade gráfica, incluindo detalhes adicionais (como um corte) para melhor representar a peça.",
    },
  },
  {
    id: "interpretarTolerancia",
    title: "Interpretar tolerância dimensional, geométrica e de acabamento superficial",
    descriptors: {
      NSA: "Não consegue identificar os símbolos de tolerância e rugosidade no desenho ou confunde seus significados.",
      APO: "Identifica os símbolos, mas necessita de ajuda para interpretar seu significado ou para explicar sua importância funcional.",
      PAR: "Identifica e explica corretamente o significado das tolerâncias e acabamentos, relacionando-os com a função da peça.",
      AUT: "Além de interpretar, correlaciona as tolerâncias com os processos de fabricação necessários para atingi-las.",
    },
  },
  {
    id: "atencaoDetalhes",
    title: "Demonstrar atenção a detalhes",
    descriptors: {
      NSA: "Omite informações (cotas, símbolos, hachuras) no croqui e no relatório.",
      APO: "O trabalho apresenta algumas omissões ou erros de representação que necessitam de correção e revisão.",
      PAR: "O trabalho é entregue de forma completa e precisa, com pouquíssimos ou nenhum erro, demonstrando cuidado na execução.",
      AUT: "Além de entregar um trabalho preciso, identifica inconsistências ou informações faltantes no próprio desenho técnico fornecido.",
    },
  },
  {
    id: "sensoCritico",
    title: "Demonstrar senso crítico",
    descriptors: {
      NSA: "Aceita as informações do desenho sem questionar e preenche a ficha de forma mecânica, apenas reproduzindo definições.",
      APO: "Levanta dúvidas básicas sobre o projeto, mas sua análise é superficial e depende do estímulo do docente.",
      PAR: "Analisa as informações, questiona as implicações das especificações e elabora justificativas coerentes para a função das peças.",
      AUT: "Identifica potenciais inconsistências no projeto (ex: tolerância inadequada) e propõe discussões fundamentadas sobre o tema.",
    },
  },
];

// Valores sugeridos por nível para o cálculo estimativo de notas (NSA=30%, APO=60%, PAR=85%, AUT=100%)
const LEVEL_VALUES: Record<PerformanceLevel, number> = {
  NSA: 0.3,
  APO: 0.6,
  PAR: 0.85,
  AUT: 1.0,
};

export default function RubricsSelector({
  maxGrade,
  initialSelection = {},
  initialFinalGrade,
  onChange,
}: RubricsSelectorProps) {
  const [selections, setSelections] = useState<RubricSelection>(initialSelection);
  const [finalGrade, setFinalGrade] = useState<string>(
    initialFinalGrade !== null ? initialFinalGrade.toString() : ""
  );

  // Calcula nota sugerida de acordo com as rubricas marcadas
  const calculateSuggestedGrade = (): number => {
    const keys = Object.keys(selections) as Array<keyof RubricSelection>;
    if (keys.length === 0) return 0;

    let totalScore = 0;
    keys.forEach((key) => {
      const level = selections[key];
      if (level) {
        totalScore += LEVEL_VALUES[level];
      }
    });

    const averageProgress = totalScore / SENAI_CRITERIA.length;
    return parseFloat((averageProgress * maxGrade).toFixed(1));
  };

  const suggestedGrade = calculateSuggestedGrade();

  // Aplica a nota ponderada sugerida ao campo de Nota Final
  const handleApplySuggested = () => {
    setFinalGrade(suggestedGrade.toString());
  };

  // Ao alterar seleções de rubricas ou nota final, dispara o callback para salvar no pai
  useEffect(() => {
    const gradeNum = finalGrade.trim() !== "" ? parseFloat(finalGrade) : suggestedGrade;
    const sanitizedGrade = Math.max(0, Math.min(maxGrade, isNaN(gradeNum) ? 0 : gradeNum));
    onChange(selections, sanitizedGrade);
  }, [selections, finalGrade]);

  const handleSelect = (criterionId: keyof RubricSelection, level: PerformanceLevel) => {
    setSelections((prev) => ({
      ...prev,
      [criterionId]: level,
    }));
  };

  return (
    <div id="rubrics-interactive-selector" className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
            <FileSpreadsheet size={18} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">Criteriória Rubricas do SENAI</h4>
            <p className="text-[11px] text-slate-500">Selecione o descritor correspondente ao desempenho do aluno em cada referência.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono bg-white px-2.5 py-1 rounded-lg border border-slate-200">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-slate-600">NSA, APO, PAR, AUT disponíveis</span>
        </div>
      </div>

      {/* Tabela de Rubricas Interativa */}
      <div className="overflow-x-auto rounded-xl border border-slate-150 shadow-xs">
        <table className="w-full text-left border-collapse bg-white">
          <thead>
            <tr className="bg-slate-900 text-white text-xs font-semibold">
              <th className="p-3 w-1/4 min-w-[180px] border-r border-slate-800">REFERÊNCIA</th>
              <th className="p-3 text-center border-r border-slate-800 w-1/5 min-w-[140px] bg-red-950/20">NSA</th>
              <th className="p-3 text-center border-r border-slate-800 w-1/5 min-w-[140px] bg-amber-950/10">APO</th>
              <th className="p-3 text-center border-r border-slate-800 w-1/5 min-w-[140px] bg-sky-950/10">PAR</th>
              <th className="p-3 text-center w-1/5 min-w-[140px] bg-purple-950/20">AUT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {SENAI_CRITERIA.map((criterion) => {
              const selectedLevel = selections[criterion.id];
              return (
                <tr key={criterion.id} className="hover:bg-slate-50/55 transition-colors">
                  {/* Nome da Referência */}
                  <td className="p-3.5 font-bold text-slate-800 border-r border-slate-100 bg-slate-50/20 self-center">
                    {criterion.title}
                  </td>

                  {/* Células de Níveis de Desempenho */}
                  {(["NSA", "APO", "PAR", "AUT"] as PerformanceLevel[]).map((level) => {
                    const isSelected = selectedLevel === level;
                    
                    // Cores temáticas para cada coluna/nível selecionado
                    let bgActiveClasses = "";
                    let ringClasses = "";
                    if (isSelected) {
                      if (level === "NSA") {
                        bgActiveClasses = "bg-rose-50 text-rose-800 border-rose-300 font-medium scale-[1.01] shadow-xs";
                        ringClasses = "border-2 border-rose-500 shadow-rose-100";
                      } else if (level === "APO") {
                        bgActiveClasses = "bg-amber-50 text-amber-800 border-amber-300 font-medium scale-[1.01] shadow-xs";
                        ringClasses = "border-2 border-amber-500 shadow-amber-100";
                      } else if (level === "PAR") {
                        bgActiveClasses = "bg-sky-50 text-sky-800 border-sky-300 font-medium scale-[1.01] shadow-xs";
                        ringClasses = "border-2 border-sky-500 shadow-sky-100";
                      } else if (level === "AUT") {
                        bgActiveClasses = "bg-purple-50 text-purple-800 border-purple-300 font-medium scale-[1.01] shadow-xs";
                        ringClasses = "border-2 border-purple-500 shadow-purple-100";
                      }
                    }

                    return (
                      <td 
                        key={level}
                        onClick={() => handleSelect(criterion.id, level)}
                        className={`p-3 border-r border-slate-100 cursor-pointer align-top transition-all duration-200 relative group select-none ${
                          isSelected 
                            ? `${bgActiveClasses} ${ringClasses}` 
                            : "hover:bg-slate-100/50"
                        }`}
                      >
                        <div className="flex flex-col h-full justify-between gap-2.5">
                          <p className="text-[11px] leading-relaxed text-slate-600 group-hover:text-slate-800">
                            {criterion.descriptors[level]}
                          </p>
                          
                          {/* Rodapé da célula indicadora de seleção */}
                          <div className="flex justify-between items-center mt-2 pt-1 border-t border-dotted border-slate-150/40">
                            <span className="text-[10px] font-mono font-bold tracking-wider opacity-60 text-slate-400">
                              {(LEVEL_VALUES[level] * 100)}%
                            </span>
                            {isSelected ? (
                              <div className={`p-0.5 rounded-full ${
                                level === "NSA" ? "bg-rose-500 text-white" :
                                level === "APO" ? "bg-amber-500 text-white" :
                                level === "PAR" ? "bg-sky-500 text-white" :
                                "bg-purple-500 text-white"
                              }`}>
                                <Check size={11} strokeWidth={3} />
                              </div>
                            ) : (
                              <div className="w-3.5 h-3.5 rounded-full border border-slate-200 bg-white group-hover:border-slate-400" />
                            )}
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Painel Final de Definição da Nota */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Calculator size={18} className="text-indigo-400" />
            <h5 className="font-bold text-sm">Nota Prometida pelas Rubricas</h5>
          </div>
          <p className="text-xs text-slate-300">
            Com base em sua avaliação descritiva, a nota de proficiência calculada é:
            <span className="block text-indigo-300 font-bold font-mono text-base mt-1">
              {suggestedGrade} de {maxGrade} pontos
            </span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto shrink-0">
          <button
            type="button"
            onClick={handleApplySuggested}
            className="w-full sm:w-auto px-3.5 py-2 font-semibold text-xs rounded-xl bg-slate-800 hover:bg-slate-750 text-indigo-300 border border-slate-700 cursor-pointer transition-colors"
            title="Preenche o campo abaixo com a nota sugerida automática"
          >
            Usar Nota Sugerida
          </button>

          <div className="h-px sm:h-8 w-full sm:w-px bg-slate-800"></div>

          {/* Campo onde o professor define explicitamente a nota final */}
          <div className="flex items-center gap-2 bg-slate-800 p-2.5 rounded-xl border border-slate-700 w-full sm:w-auto justify-center">
            <div className="text-right">
              <span className="block text-[9px] font-mono text-slate-400 uppercase tracking-widest leading-none">NOTA FINAL</span>
              <span className="text-[10px] text-indigo-400 lowercase italic">definida pelo prof.</span>
            </div>
            
            <input
              type="number"
              step="0.1"
              min={0}
              max={maxGrade}
              value={finalGrade}
              onChange={(e) => setFinalGrade(e.target.value)}
              placeholder={suggestedGrade.toString()}
              className="w-20 bg-slate-950 border border-slate-700 rounded-lg py-1 px-2.5 text-center text-base font-bold font-mono text-emerald-400 focus:outline-none focus:border-emerald-400"
            />
            <span className="text-xs text-slate-400 font-mono"> / {maxGrade}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
