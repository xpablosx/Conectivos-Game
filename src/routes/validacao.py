from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
import spacy
import language_tool_python
import re
from textblob import TextBlob

validacao_bp = Blueprint('validacao', __name__)

# Carregar modelo de português do spaCy
try:
    nlp = spacy.load('pt_core_news_sm')
except OSError:
    nlp = None

# Inicializar LanguageTool para português do Brasil
try:
    tool = language_tool_python.LanguageTool('pt-BR')
except:
    tool = None

def validar_estrutura_basica(frase):
    """Validações básicas de estrutura da frase"""
    if not frase or len(frase.strip()) < 3:
        return False, "Frase muito curta"
    
    # Verificar se tem pelo menos uma palavra
    palavras = frase.strip().split()
    if len(palavras) < 2:
        return False, "Frase deve ter pelo menos duas palavras"
    
    # Verificar se começa com letra maiúscula
    if not frase[0].isupper():
        return False, "Frase deve começar com letra maiúscula"
    
    # Verificar se termina com pontuação
    if not frase.strip().endswith(('.', '!', '?')):
        return False, "Frase deve terminar com pontuação"
    
    return True, "Estrutura básica válida"

def validar_conectivo_na_frase(frase, conectivo):
    """Verificar se o conectivo está presente na frase"""
    if not conectivo:
        return True, "Nenhum conectivo especificado"
    
    # Normalizar para comparação
    frase_lower = frase.lower()
    conectivo_lower = conectivo.lower()
    
    # Verificar se o conectivo está presente
    if conectivo_lower not in frase_lower:
        return False, f"O conectivo '{conectivo}' deve estar presente na frase"
    
    return True, "Conectivo presente na frase"

def validar_gramatica_languagetool(frase):
    """Usar LanguageTool para verificar gramática"""
    if not tool:
        return True, "LanguageTool não disponível"
    
    try:
        matches = tool.check(frase)
        
        # Filtrar apenas erros críticos (não sugestões de estilo)
        erros_criticos = [
            match for match in matches 
            if match.category in ['GRAMMAR', 'TYPOS', 'PUNCTUATION']
        ]
        
        if erros_criticos:
            primeiro_erro = erros_criticos[0]
            return False, f"Erro gramatical: {primeiro_erro.message}"
        
        return True, "Gramática válida"
    except Exception as e:
        return True, f"Erro na verificação gramatical: {str(e)}"

def validar_semantica_spacy(frase):
    """Usar spaCy para análise semântica básica"""
    if not nlp:
        return True, "spaCy não disponível"
    
    try:
        doc = nlp(frase)
        
        # Verificar se há pelo menos um verbo
        tem_verbo = any(token.pos_ == 'VERB' for token in doc)
        if not tem_verbo:
            return False, "Frase deve conter pelo menos um verbo"
        
        # Verificar se há pelo menos um substantivo
        tem_substantivo = any(token.pos_ in ['NOUN', 'PROPN'] for token in doc)
        if not tem_substantivo:
            return False, "Frase deve conter pelo menos um substantivo"
        
        # Verificar dependências sintáticas básicas
        tem_sujeito = any(token.dep_ in ['nsubj', 'nsubj:pass'] for token in doc)
        if not tem_sujeito:
            return False, "Frase deve ter uma estrutura sintática clara com sujeito"
        
        return True, "Estrutura semântica válida"
    except Exception as e:
        return True, f"Erro na análise semântica: {str(e)}"

def calcular_pontuacao_frase(frase, conectivo=""):
    """Calcular pontuação da frase baseada em múltiplos critérios"""
    pontuacao = 0
    feedback = []
    
    # Validação de estrutura básica (peso: 30%)
    valida_estrutura, msg_estrutura = validar_estrutura_basica(frase)
    if valida_estrutura:
        pontuacao += 0.3
        feedback.append("✓ Estrutura básica correta")
    else:
        feedback.append(f"✗ {msg_estrutura}")
    
    # Validação de conectivo (peso: 20%)
    valida_conectivo, msg_conectivo = validar_conectivo_na_frase(frase, conectivo)
    if valida_conectivo:
        pontuacao += 0.2
        feedback.append("✓ Conectivo usado corretamente")
    else:
        feedback.append(f"✗ {msg_conectivo}")
    
    # Validação gramatical (peso: 30%)
    valida_gramatica, msg_gramatica = validar_gramatica_languagetool(frase)
    if valida_gramatica:
        pontuacao += 0.3
        feedback.append("✓ Gramática correta")
    else:
        feedback.append(f"✗ {msg_gramatica}")
    
    # Validação semântica (peso: 20%)
    valida_semantica, msg_semantica = validar_semantica_spacy(frase)
    if valida_semantica:
        pontuacao += 0.2
        feedback.append("✓ Estrutura semântica válida")
    else:
        feedback.append(f"✗ {msg_semantica}")
    
    # Converter para pontuação de 0 a 1
    pontuacao_final = min(1.0, max(0.0, pontuacao))
    
    # Considerar válida se pontuação >= 0.7 (70%)
    eh_valida = pontuacao_final >= 0.7
    
    return {
        'valida': eh_valida,
        'pontuacao': pontuacao_final,
        'feedback': feedback,
        'pontos': 1 if eh_valida else 0
    }

@validacao_bp.route('/validar-frase', methods=['POST'])
@cross_origin()
def validar_frase():
    """Endpoint para validar uma frase"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'erro': 'Dados não fornecidos'}), 400
        
        frase = data.get('frase', '').strip()
        conectivo = data.get('conectivo', '').strip()
        
        if not frase:
            return jsonify({'erro': 'Frase não fornecida'}), 400
        
        resultado = calcular_pontuacao_frase(frase, conectivo)
        
        return jsonify({
            'sucesso': True,
            'resultado': resultado
        })
        
    except Exception as e:
        return jsonify({'erro': f'Erro interno: {str(e)}'}), 500

@validacao_bp.route('/status', methods=['GET'])
@cross_origin()
def status():
    """Endpoint para verificar status do serviço"""
    return jsonify({
        'status': 'ativo',
        'spacy_disponivel': nlp is not None,
        'languagetool_disponivel': tool is not None,
        'versao': '1.0.0'
    })

