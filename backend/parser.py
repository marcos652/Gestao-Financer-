import re

def parse_email_body(body: str):
    """
    Tenta extrair o valor (R$) e o estabelecimento (merchant) de um texto de e-mail do Nubank.
    Exemplos de texto:
    - "Você fez uma compra de R$ 150,00 em Supermercado ABC no dia..."
    - "Compra no crédito aprovada! R$ 45,90 em Uber"
    """
    amount = 0.0
    merchant = "Desconhecido"
    category = "Outros"

    # Regex para capturar valor e estabelecimento (focado no padrão Nubank)
    # Padrão mais comum: "R$ 150,00 em Estabelecimento" ou "R$ 15,00 para Fulano"
    nubank_pattern = re.search(r'R\$\s*(\d{1,3}(?:\.\d{3})*,\d{2})\s+(?:em|para)\s+([^.\n]+)', body, re.IGNORECASE)
    
    if nubank_pattern:
        amount_str = nubank_pattern.group(1).replace('.', '').replace(',', '.')
        try:
            amount = float(amount_str)
        except ValueError:
            pass
        merchant = nubank_pattern.group(2).strip()
    else:
        # Fallback genérico caso o e-mail não siga o formato exato acima
        amount_match = re.search(r'R\$\s*(\d{1,3}(?:\.\d{3})*,\d{2})', body, re.IGNORECASE)
        if amount_match:
            amount_str = amount_match.group(1).replace('.', '').replace(',', '.')
            try:
                amount = float(amount_str)
            except ValueError:
                pass
        
        merchant_match = re.search(r'(?:em|para)\s+([A-Za-z0-9\s]+?)(?:\.|\n|$)', body, re.IGNORECASE)
        if merchant_match:
            merchant = merchant_match.group(1).strip()
    
    # Inferência bem simples de categoria
    lower_merchant = merchant.lower()
    if 'ifood' in lower_merchant or 'mcdonald' in lower_merchant or 'restaurante' in lower_merchant or 'padaria' in lower_merchant:
        category = 'Alimentação'
    elif 'uber' in lower_merchant or '99' in lower_merchant or 'posto' in lower_merchant:
        category = 'Transporte'
    elif 'netflix' in lower_merchant or 'spotify' in lower_merchant or 'amazon' in lower_merchant:
        category = 'Assinaturas'
    elif 'farmacia' in lower_merchant or 'drogaria' in lower_merchant:
        category = 'Saúde'
        
    return {
        "amount": amount,
        "merchant": merchant,
        "category": category
    }
