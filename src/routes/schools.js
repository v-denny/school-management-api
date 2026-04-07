const express = require('express');
const { body, query, validationResult } = require('express-validator');
const db = require('../config/db');
const { haversineDistance } = require('../utils/distance');

const router = express.Router();

// ─────────────────────────────────────────────
// Validation rules
// ─────────────────────────────────────────────

const addSchoolValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('School name is required')
    .isLength({ max: 255 }).withMessage('Name must not exceed 255 characters'),

  body('address')
    .trim()
    .notEmpty().withMessage('Address is required')
    .isLength({ max: 500 }).withMessage('Address must not exceed 500 characters'),

  body('latitude')
    .notEmpty().withMessage('Latitude is required')
    .isFloat({ min: -90, max: 90 }).withMessage('Latitude must be a number between -90 and 90'),

  body('longitude')
    .notEmpty().withMessage('Longitude is required')
    .isFloat({ min: -180, max: 180 }).withMessage('Longitude must be a number between -180 and 180'),
];

const listSchoolsValidation = [
  query('latitude')
    .notEmpty().withMessage('Query parameter "latitude" is required')
    .isFloat({ min: -90, max: 90 }).withMessage('Latitude must be a number between -90 and 90'),

  query('longitude')
    .notEmpty().withMessage('Query parameter "longitude" is required')
    .isFloat({ min: -180, max: 180 }).withMessage('Longitude must be a number between -180 and 180'),
];

// ─────────────────────────────────────────────
// Helper: extract validation errors
// ─────────────────────────────────────────────

function getValidationErrors(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errors.array().map((e) => ({ field: e.path, message: e.msg }));
  }
  return null;
}

// ─────────────────────────────────────────────
// POST /addSchool
// ─────────────────────────────────────────────

/**
 * @route   POST /addSchool
 * @desc    Add a new school to the database
 * @access  Public
 *
 * Request body (JSON):
 *   { name, address, latitude, longitude }
 *
 * Response 201:
 *   { success: true, message, data: { id, name, address, latitude, longitude, created_at } }
 */
router.post('/addSchool', addSchoolValidation, async (req, res, next) => {
  try {
    // Validate input
    const errors = getValidationErrors(req);
    if (errors) {
      return res.status(422).json({ success: false, message: 'Validation failed', errors });
    }

    const { name, address, latitude, longitude } = req.body;

    // Insert into DB
    const [result] = await db.query(
      'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)',
      [name.trim(), address.trim(), parseFloat(latitude), parseFloat(longitude)]
    );

    // Fetch the newly created record to return it
    const [rows] = await db.query('SELECT * FROM schools WHERE id = ?', [result.insertId]);

    return res.status(201).json({
      success: true,
      message: 'School added successfully',
      data: rows[0],
    });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────
// GET /listSchools
// ─────────────────────────────────────────────

/**
 * @route   GET /listSchools
 * @desc    List all schools sorted by distance from the user's location
 * @access  Public
 *
 * Query params:
 *   latitude  — user's current latitude
 *   longitude — user's current longitude
 *
 * Response 200:
 *   { success: true, count, userLocation: { latitude, longitude }, data: [...schools with distance_km] }
 */
router.get('/listSchools', listSchoolsValidation, async (req, res, next) => {
  try {
    // Validate query params
    const errors = getValidationErrors(req);
    if (errors) {
      return res.status(422).json({ success: false, message: 'Validation failed', errors });
    }

    const userLat = parseFloat(req.query.latitude);
    const userLng = parseFloat(req.query.longitude);

    // Fetch all schools
    const [schools] = await db.query('SELECT * FROM schools ORDER BY id');

    // Compute distance for each and sort ascending
    const sorted = schools
      .map((school) => ({
        ...school,
        distance_km: haversineDistance(userLat, userLng, school.latitude, school.longitude),
      }))
      .sort((a, b) => a.distance_km - b.distance_km);

    return res.status(200).json({
      success: true,
      count: sorted.length,
      userLocation: { latitude: userLat, longitude: userLng },
      data: sorted,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
