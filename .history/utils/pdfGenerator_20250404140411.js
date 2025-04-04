const puppeteer = require('puppeteer');
const path = require('path');
const ejs = require('ejs');

const generatePage2PDF = async (templatePath, data, countries) => {
    try {
        const browser = await puppeteer.launch({ 
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox'] // For production environments
        });
        const page = await browser.newPage();
        
        // Render EJS template with data
        const html = await ejs.renderFile(templatePath, { 
            data: {
                destination: data.destination,
                visaType: data.visaType,
                citizenship: data.citizenship
            },
            countries 
        });
        
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

module.exports = { generatePage2PDF };