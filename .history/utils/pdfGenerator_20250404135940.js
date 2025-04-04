const puppeteer = require('puppeteer');
const path = require('path');
const ejs = require('ejs');

const generatePDF = async (templatePath, data, countries) => {
    try {
        const browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();
        
        // Render EJS template with data
        const html = await ejs.renderFile(templatePath, { data, countries });
        
        // Set HTML content and generate PDF
        await page.setContent(html);
        const pdfBuffer = await page.pdf({ 
            format: 'A4',
            printBackground: true,
            margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
        });

        await browser.close();
        return pdfBuffer;
    } catch (error) {
        throw new Error(`PDF generation failed: ${error.message}`);
    }
};

module.exports = { generatePDF };