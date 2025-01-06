function toggleInvoiceNumber() {
    const type = document.getElementById("document_type").value;
    document.getElementById("invoice_number_section").style.display = type === "Facture" ? "block" : "none";
}

function addArticle() {
    const articlesDiv = document.getElementById("articles");
    const newArticle = document.createElement("div");
    newArticle.classList.add("article");
    newArticle.innerHTML = `
        <label>Description:</label>
        <input type="text" class="description">
        <label>Quantité:</label>
        <input type="number" class="quantity" onchange="updateTotals()">
        <label>Prix HT:</label>
        <input type="number" step="0.01" class="price_ht" onchange="updateTotals()">
        <label>TVA (%):</label>
        <input type="number" step="0.01" class="tva" value="20" onchange="updateTotals()">
        <label>Montant HT:</label>
        <input type="number" step="0.01" class="amount_ht" readonly>
        <label>Montant TTC:</label>
        <input type="number" step="0.01" class="amount_ttc" readonly>
    `;
    articlesDiv.appendChild(newArticle);
}

function updateTotals() {
    const articles = document.querySelectorAll('.article');
    let totalHT = 0;
    let totalTTC = 0;

    articles.forEach(article => {
        const quantity = parseFloat(article.querySelector('.quantity').value) || 0;
        const priceHT = parseFloat(article.querySelector('.price_ht').value) || 0;
        const tvaRate = parseFloat(article.querySelector('.tva').value) || 0;

        const amountHT = quantity * priceHT;
        const amountTTC = amountHT * (1 + tvaRate / 100);
        article.querySelector('.amount_ht').value = amountHT.toFixed(2);
        article.querySelector('.amount_ttc').value = amountTTC.toFixed(2);

        totalHT += amountHT;
        totalTTC += amountTTC;
    });

    document.getElementById("total_ht").innerText = totalHT.toFixed(2);
    document.getElementById("total_ttc").innerText = totalTTC.toFixed(2);
}

function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Ligne supérieure et inférieure
    doc.setDrawColor(31, 75, 153);
    doc.setLineWidth(1);
    doc.line(10, 10, 200, 10); // Ligne en haut
    doc.line(10, 287, 200, 287); // Ligne en bas

    // Date actuelle
    const currentDate = new Date().toLocaleDateString("fr-FR");
    doc.setFontSize(10);
    doc.text(`Date: ${currentDate}`, 160, 15);

    // Titre du document : "Devis" ou "Facture" + numéro de facture (si ajouté)
    const documentType = document.getElementById("document_type").value; // Type du document
    const documentName = document.getElementById("document_name").value; // Nom ou description du document
    const documentNumber = document.getElementById("document_number").value; // Numéro de facture ou devis

    // Titre principal du document, incluant le type, numéro et nom si spécifiés
    let titleText = documentNumber 
        ? `${documentType} N° ${documentNumber}` 
        : documentType;
    titleText += documentName ? ` - ${documentName}` : "";

    // Afficher le titre principal avec taille de police réduite si documentName est fourni
    doc.setFontSize(14);
    doc.setFont("Helvetica", "bold");
    doc.text(titleText, 10, 20);

    const maxWidth = 80; // Largeur maximale pour les adresses longues
    doc.setFontSize(12);
    doc.setFont("Helvetica", "bold");

    // Informations de l'entreprise
    const userName = document.getElementById("user_name").value;
    doc.text(userName, 10, 30);

    const userAddress = document.getElementById("user_address").value;
    const userPhone = document.getElementById("user_phone").value;
    const userEmail = document.getElementById("user_email").value;
    const userSiret = document.getElementById("user_siret").value;

    // Adresses avec mise en forme
    const addressLines = userAddress.split(", ");
    let yPosition = 35;
    addressLines.forEach(line => {
        if (yPosition < 255) {
            doc.text(line, 10, yPosition);
            yPosition += 5;
        }
    });

    // Numéro de téléphone et autres informations
    doc.text(`Tél : ${userPhone}`, 10, yPosition);
    yPosition += 5;
    doc.text(`Email : ${userEmail}`, 10, yPosition);
    yPosition += 5;
    doc.text(`SIRET : ${userSiret}`, 10, yPosition);

    // Informations du client
    const clientName = document.getElementById("client_name").value;
    const clientAddress = document.getElementById("client_address").value;
    const clientEmail = document.getElementById("client_email").value;
    const clientPhone = document.getElementById("client_phone").value;

    // Infos client
    doc.setFontSize(12);
    doc.setFont("Helvetica", "normal");
    doc.text(`Client: ${clientName}`, 100, 30);
    doc.text(`Adresse: ${clientAddress}`, 100, 40);
    doc.text(`Email: ${clientEmail}`, 100, 50);
    doc.text(`Téléphone: ${clientPhone}`, 100, 60);

    // Articles
    const articles = document.querySelectorAll('.article');
    let yPositionArticles = 70;

    // Entêtes des colonnes
    doc.setFontSize(10);
    doc.text('Description', 10, yPositionArticles);
    doc.text('Quantité', 80, yPositionArticles);
    doc.text('Prix HT', 110, yPositionArticles);
    doc.text('TVA', 150, yPositionArticles);
    doc.text('Montant HT', 180, yPositionArticles);
    doc.text('Montant TTC', 220, yPositionArticles);
    
    yPositionArticles += 10;

    articles.forEach(article => {
        const description = article.querySelector('.description').value;
        const quantity = article.querySelector('.quantity').value;
        const priceHT = article.querySelector('.price_ht').value;
        const tva = article.querySelector('.tva').value;
        const amountHT = article.querySelector('.amount_ht').value;
        const amountTTC = article.querySelector('.amount_ttc').value;

        doc.text(description, 10, yPositionArticles);
        doc.text(quantity, 80, yPositionArticles);
        doc.text(priceHT, 110, yPositionArticles);
        doc.text(tva, 150, yPositionArticles);
        doc.text(amountHT, 180, yPositionArticles);
        doc.text(amountTTC, 220, yPositionArticles);

        yPositionArticles += 10;
    });

    // Totaux
    doc.setFontSize(12);
    doc.text(`Total HT : ${document.getElementById('total_ht').innerText} €`, 150, yPositionArticles);
    doc.text(`Total TTC : ${document.getElementById('total_ttc').innerText} €`, 150, yPositionArticles + 10);

    // Sauvegarder le PDF
    doc.save(`${documentType} - ${clientName}.pdf`);
}
