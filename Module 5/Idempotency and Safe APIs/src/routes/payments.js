'use strict';

// routes/payments.js

const router = require('express').Router();

const { charges, idempotency, nextChargeId } = require('../store');

router.post('/', (req, res) => {

  // 1. Get the Idempotency-Key from request headers
  const key = req.headers['idempotency-key'];

  // 2. If key is missing, return 400
  if (!key) {
    return res.status(400).json({
      error: {
        code: 'IDEMPOTENCY_KEY_REQUIRED',
        message: 'Idempotency-Key header is required'
      }
    });
  }

  // 3. If key already exists, return stored response
  if (idempotency.has(key)) {
    const saved = idempotency.get(key);

    return res.status(saved.status).json(saved.body);
  }

  // 4. Create a new charge
  const amount = req.body && req.body.amount;

  const charge = {
    id: nextChargeId(),
    amount,
    status: 'charged'
  };

  // 5. Add charge to charges array
  charges.push(charge);

  // 6. Store response in idempotency Map
  const body = {
    id: charge.id,
    amount: charge.amount,
    status: charge.status
  };

  idempotency.set(key, {
    status: 201,
    body: body
  });

  // 7. Return response
  return res.status(201).json(body);

});

module.exports = router;