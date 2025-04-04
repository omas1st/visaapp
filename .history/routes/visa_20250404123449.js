const express = require('express');
const router = express.Router();
const Application = require('../model/Application');
const pdfkit = require('pdfkit');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Page 1
router.get('/', (req, res) => res.render('page1'));
router.post('/page1', (req, res) => {
  req.session.page1 = req.body;
  res.redirect('/page2');
});

// Page 2
router.get('/page2', (req, res) => res.render('page2', { data: req.session.page1 }));
router.post('/page2', (req, res) => {
  req.session.application = { ...req.session.page1, ...req.body };
  res.redirect('/payment');
});

// Payment Page
router.get('/payment', (req, res) => res.render('payment'));
router.post('/submit', upload.single('receipt'), async (req, res) => {
  const application = new Application({
    ...req.session.application,
    receiptPath: req.file.path,
    paymentMethod: req.body.paymentMethod
  });
  
  await application.save();
  
  // Generate PDF
  const doc = new pdfkit();
  doc.text(`Visa Application\n\n${JSON.stringify(req.session.application, null, 2)}`);
  const pdfPath = `receipts/${Date.now()}.pdf`;
  doc.pipe(fs.createWriteStream(pdfPath));
  doc.end();
  
  res.render('success', { pdfPath });
});

module.exports = router;