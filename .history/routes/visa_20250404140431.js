const express = require('express');
const router = express.Router();
const { countries } = require('countries-list');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const { generatePage2PDF } = require('../utils/pdfGenerator');

// Models
const Application = require('../model/Application');

// Country data
const countryNames = Object.values(countries).map(c => c.name).sort();

// File upload setup
const upload = multer({ 
    dest: path.join(__dirname, '../uploads'),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Middleware to check session
const checkSessionData = (req, res, next) => {
    if (!req.session.page1 && req.path !== '/') return res.redirect('/');
    next();
};

// Add PDF download route
router.get('/download-page2-pdf', checkSessionData, async (req, res) => {
    try {
        const pdfBuffer = await generatePage2PDF(
            path.join(__dirname, '../views/page2.ejs'),
            req.session.page1,
            countryNames
        );

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename=application-preview.pdf'
        });
        res.send(pdfBuffer);
    } catch (error) {
        console.error('PDF generation error:', error);
        res.status(500).send('Error generating PDF');
    }
});

// Keep existing routes below (page1, page2, payment, submit) as they were...

// Update the final submission route
router.post('/submit', upload.single('receipt'), async (req, res) => {
    try {
        if (!req.file) throw new Error('No receipt uploaded');
        
        const applicationData = {
            ...req.session.application,
            paymentMethod: req.body.paymentMethod,
            receiptPath: req.file.path,
            submittedAt: new Date()
        };

        // Save to database
        const newApplication = new Application(applicationData);
        await newApplication.save();

        // Cleanup session
        req.session.destroy();

        res.render('success', {
            title: 'Application Submitted',
            message: "Your document has been successfully submitted. Our agent will reach out to you via email or WhatsApp."
        });

    } catch (error) {
        console.error('Submission error:', error);
        res.status(500).redirect('/payment?error=submission_failed');
    }
});

module.exports = router;