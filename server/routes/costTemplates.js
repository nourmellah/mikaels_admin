const express = require('express');
const router = express.Router();
const costTemplateService = require('../services/costTemplateService');

// GET /cost-templates
router.get('/', async (req, res, next) => {
  try {
    const templates = await costTemplateService.getAllTemplates();
    res.json(templates);
  } catch (err) {
    next(err);
  }
});

// GET /cost-templates/:id
router.get('/:id', async (req, res, next) => {
    try {
        const tmpl = await costTemplateService.getTemplateById(req.params.id);
        if (!tmpl) return res.status(404).json({ message: 'Template not found' });
        res.json(tmpl);
    } catch (err) {
        next(err);
    }
});

// POST /cost-templates
router.post('/', async (req, res, next) => {
    try {
        const newTmpl = await costTemplateService.createTemplate(req.body);
        res.status(201).json(newTmpl);
    } catch (err) {
        next(err);
    }
});

// PUT /cost-templates/:id
router.put('/:id', async (req, res, next) => {
    try {
        const updated = await costTemplateService.updateTemplate(req.params.id, req.body);
        if (!updated) return res.status(404).json({ message: 'Template not found' });
        res.json(updated);
    } catch (err) {
        next(err);
    }
});

// DELETE /cost-templates/:id
router.delete('/:id', async (req, res, next) => {
    try {
        await costTemplateService.deleteTemplate(req.params.id);
        res.status(204).end();
    } catch (err) {
        next(err);
    }
});

module.exports = router;