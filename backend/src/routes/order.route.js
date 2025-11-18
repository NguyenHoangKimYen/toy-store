const router = require('express').Router();
const ctrl = require('../controllers/order.controller');
const auth = require('../middlewares/auth.middleware');

// Customer
router.post('/', auth, ctrl.create);
router.post('/guest', ctrl.create);
router.get('/me', auth, ctrl.getMyOrders);

// Admin
router.get('/', auth, ctrl.adminGetAll);
router.patch('/:id/status', auth, ctrl.updateStatus);

// Detail
router.get('/:id', auth, ctrl.getDetail);

module.exports = router;
