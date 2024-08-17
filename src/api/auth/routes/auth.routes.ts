import { Router } from 'express'
import {signInController,signOutController} from '../controllers/auth.controller'
import { forgotPasswordValidator, signinValidator, signoutValidator} from '../middlewares/auth.validator'
import { changePasswordController } from '../../user/controllers/user.controller'

export const router: Router = Router()
router.post('/signin', signinValidator, signInController)
router.put('/signout', signoutValidator, signOutController)
router.put('/change/password', forgotPasswordValidator, changePasswordController)
