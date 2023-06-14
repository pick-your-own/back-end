const express = require('express');
const router = express.Router();
const characterController = require('./controllers/characterController');

router.post('/character', characterController.createCharacter);
router.get('/character/:id', characterController.getCharacter);
router.put('/character/:id', characterController.updateCharacter);
router.delete('/character/:id', characterController.deleteCharacter);

router.post('/character/:id/abilities', characterController.addAbility);
router.put('/character/:playerId/abilities/:abilityId', characterController.updateAbility);

router.post('/character/:id/inventory', characterController.addItem);
router.put('/character/:playerId/inventory/:itemId', characterController.updateItem);

router.put('/character/:id/finances', characterController.updateFinances);

// New routes
router.put('/character/:id/armor', characterController.updateArmor);
router.put('/character/:id/attackSpeed', characterController.updateAttackSpeed);
router.put('/character/:id/magicPoints', characterController.updateMagicPoints);
router.put('/character/:id/resistances', characterController.updateResistances);
router.post('/character/:id/statusEffects', characterController.addStatusEffect);
router.put('/character/:id/skillPoints', characterController.updateSkillPoints);

module.exports = router;
