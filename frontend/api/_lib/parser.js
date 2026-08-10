/**
 * parser.js - Extrai valor e estabelecimento de e-mails do Nubank
 */

function parseEmailBody(body) {
  let amount = 0.0;
  let merchant = 'Desconhecido';
  let category = 'Outros';

  // --- Nubank: Transferência Pix recebida ---
  // Ex: "R$ 150,00" ou "R$150,00"
  const amountMatch = body.match(/R\$\s*([\d.]+,\d{2})/);
  if (amountMatch) {
    // Converte "1.500,50" → 1500.50
    const cleaned = amountMatch[1].replace('.', '').replace(',', '.');
    amount = parseFloat(cleaned);
  }

  // --- Tenta identificar o remetente/estabelecimento ---
  // Padrão Nubank Pix: "de Nome da Pessoa"
  const pixSenderMatch = body.match(/de\s+([A-ZÀ-Ú][a-zà-ú]+(?:\s+[A-ZÀ-Ú][a-zà-ú]+){0,4})/);
  if (pixSenderMatch) {
    merchant = pixSenderMatch[1].trim();
  }

  // Padrão: "em Nome do Estabelecimento" (compras)
  const purchaseMatch = body.match(/em\s+([A-ZÀ-Ú][^\n]{2,40})/);
  if (purchaseMatch && merchant === 'Desconhecido') {
    merchant = purchaseMatch[1].trim();
  }

  // --- Categorização simples por palavras-chave ---
  const bodyLower = body.toLowerCase();
  if (bodyLower.includes('supermercado') || bodyLower.includes('mercado') || bodyLower.includes('ifood') || bodyLower.includes('restaurante')) {
    category = 'Alimentação';
  } else if (bodyLower.includes('uber') || bodyLower.includes('99') || bodyLower.includes('taxi') || bodyLower.includes('gasolina')) {
    category = 'Transporte';
  } else if (bodyLower.includes('netflix') || bodyLower.includes('spotify') || bodyLower.includes('amazon prime')) {
    category = 'Assinaturas';
  } else if (bodyLower.includes('farmácia') || bodyLower.includes('drogaria') || bodyLower.includes('hospital') || bodyLower.includes('médico')) {
    category = 'Saúde';
  } else if (bodyLower.includes('transferência') || bodyLower.includes('pix')) {
    category = 'Transferência';
  }

  return { amount, merchant, category };
}

module.exports = { parseEmailBody };
