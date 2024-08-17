import { Router } from 'express'
import { addUserController, findUserByIdControllers, getUsersController, reportUserMoneyController, routerRoleController, toggleUserStatusController, updateUserController } from '../controllers/user.controller'
import { UserIdValidation, addUserValidation, listValidation, updateUserValidation } from '../middlewares/user.validator'
import { allValidator } from '../../../shared/express.validator'

export const router: Router = Router()
console.log("7");

router.post('/', addUserValidation, allValidator, addUserController)
router.put('/:user_id', UserIdValidation, updateUserValidation, allValidator, updateUserController)
router.delete('/:user_id', UserIdValidation, updateUserValidation, allValidator, toggleUserStatusController)
router.get('/:user_id', UserIdValidation, allValidator, findUserByIdControllers)
router.get('/', listValidation, allValidator, getUsersController)
router.get('/routes/rol',  routerRoleController)
router.get('/report/money/amount', reportUserMoneyController)
