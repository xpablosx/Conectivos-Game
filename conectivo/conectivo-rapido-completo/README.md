# Jogo Conectivo Rápido - Versão Completa Final

## 🎮 Funcionalidades Implementadas
- ✅ Validação robusta de frases com PLN (spaCy, NLTK, LanguageTool)
- ✅ Modal de resultados interativo com feedback personalizado
- ✅ Botão 'Verificar' fixo que acompanha a rolagem da tela
- ✅ Botão 'Regras' no cabeçalho com modal explicativo completo
- ✅ Múltiplas configurações de tabela para variedade
- ✅ Efeitos visuais modernos (desfoque, animações, gradientes)
- ✅ Design responsivo para dispositivos móveis

## 📋 Regras de Validação de Frases
- Primeira letra maiúscula obrigatória
- Ponto final obrigatório
- Mínimo de 10 caracteres e 3 palavras
- Deve conter o conectivo da linha
- Gramática e coerência em português brasileiro

## 🚀 Instalação e Execução
1. pip install -r requirements.txt
2. python -m spacy download pt_core_news_sm
3. python src/main.py
4. Acesse: http://localhost:5000

## 🎯 Como Jogar
1. Preencha os campos vazios da tabela
2. Crie frases seguindo as regras
3. Use o botão 'Regras' para consultar instruções
4. Clique no botão 'Verificar' (fixo na tela)
5. Veja seus resultados no modal
6. Use 'Tentar Novamente' para nova tabela
