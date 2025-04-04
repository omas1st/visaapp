const express = require('express');
const router = express.Router();
const { countries } = require('countries-list');
const countryNames = Object.values(countries).map(c => c.name);

// Page 1
router.get('/', (req, res) => {
    res.render('page1', { countries: countryNames });
});

router.post('/page1', (req, res) => {
    req.session.page1 = req.body;
    res.redirect('/page2');
});

// Page 2
router.get('/page2', (req, res) => {
    if (!req.session.page1) return res.redirect('/');
    res.render('page2', { 
        data: req.session.page1,
        countries: countryNames
    });
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