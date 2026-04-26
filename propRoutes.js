const express = require('express');
const {
    getProperties,
    getProperty,
    createProperty,
    updateProperty,
    deleteProperty
} = require('../controllers/propController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
    .get(getProperties)
    .post(protect, createProperty);

router.route('/:id')
    .get(getProperty)
    .put(protect, updateProperty)
    .delete(protect, deleteProperty);

module.exports = router;
