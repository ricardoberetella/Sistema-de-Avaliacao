# Regras do Projeto - Mecânico de Usinagem (SENAI Monte Alto)

Este arquivo serve como instrução persistente para qualquer assistente de IA ou desenvolvedor que for modificar este repositório.

## 1. Escopo e Contexto
- **Curso Único**: O aplicativo deve focar **exclusivamente** no curso **Mecânico de Usinagem**. 
- **Unidade Escolar**: SENAI Monte Alto.
- **Identidade Visual**: Limpa e profissional utilizando o tom de azul oficial do SENAI (`#005DA5`) como destaque principal, tipografia robusta da família "Space Grotesk" e "Inter", e espaçamento arejado.

## 2. Padrão de Dados (Seeder)
- Mantenha sempre os dados iniciais do seeder em `src/utils.ts` condizentes com os nomes de unidades curriculares (UCs) e professores do curso de Usinagem Convencional/CNC (ex: Metrologia Dimensional, Torno Mecânico Convencional, Desenho Técnico Mecânico, Fresadora Convencional, CNC).
- O RA dos alunos cadastrados por padrão deve respeitar a sigla do curso `USI` (Ex: `2026-USI-05`).

## 3. Diretrizes de UI
- Não adicione barras de navegação adicionais, sistemas de logs, estatísticas de telemetria desnecessárias ou simuladores fora do contexto direto de boletim e gestão de notas, faltas e rubricas do próprio SENAI.
