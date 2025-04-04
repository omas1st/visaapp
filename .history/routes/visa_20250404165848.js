const express = require('express');
const router = express.Router();
const { countries } = require('countries-list');
const mongoose = require('mongoose');
const multer = require('multer');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

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

// Page 1 - Initial application
router.get('/', (req, res) => {
    res.render('page1', { 
        countries: countryNames,
        title: 'Step 1: Application Details' 
    });
});

router.post('/page1', (req, res) => {
    req.session.page1 = {
        destination: req.bod.destination,
        visaType: req.body.visaType,
        citizenship: req.body.citizenship
    };
    
    // Force-save session before redirect
    req.session.save((err) => {
        if (err) {
            console.error('Session save error:', err);
            return res.status(500).redirect('/?error=session_failed');
        }
        res.redirect('/page2');
    });
});

// Page 2 - Personal details
router.get('/page2', checkSessionData, (req, res) => {
    res.render('page2', {
        data: req.session.page1,
        countries: countryNames,
        title: 'Step 2: Personal Details'
    });
});

router.post('/page2', (req, res) => {
    req.session.application = {
        ...req.session.page1,
        email: req.body.email,
        phone: req.body.phone,
        passportCitizenship: req.body.passportCitizenship,
        firstName: req.body.firstName,
        lastName: req.body.lastName
    };
    res.redirect('/payment');
});

// Payment Page
router.get('/payment', checkSessionData, (req, res) => {
    res.render('payment', {
        title: 'Step 3: Payment Details',
        application: req.session.application
    });
});

// Final Submission
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

        // Generate PDF
        const doc = new PDFDocument();
        const pdfPath = path.join(__dirname, `../receipts/visa-application-${Date.now()}.pdf`);
        const writeStream = fs.createWriteStream(pdfPath);
        
        doc.pipe(writeStream);
        doc.fontSize(18).text('Visa Application Summary', { align: 'center' });
        doc.moveDown();
        
        // Add application data
        Object.entries(req.session.application).forEach(([key, value]) => {
            doc.fontSize(12).text(`${key}: ${value}`);
        });
        
        doc.end();

        // Cleanup session
        req.session.destroy();

        res.render('success', {
            title: 'Application Submitted',
            pdfPath: `/receipts/${path.basename(pdfPath)}`
        });

    } catch (error) {
        console.error('Submission error:', error);
        res.status(500).redirect('/payment?error=submission_failed');
    }
});

module.exports = router;