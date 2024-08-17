import { allValidator } from '../../../shared/express.validator'
import { body, header } from 'express-validator'
import {validateToken } from '../validator/auth.custom'

export const signinValidator = [
  body('email')
    .isEmail()
    .withMessage('Ingrese su correo.'),
  body('password')
    .isString()
    .withMessage('Ingrese su contraseña.'),
  allValidator,
]

export const signoutValidator = [
  header('authorization')
    .isString()
    .withMessage('Se require un string')
    .bail()
    .not()
    .isEmpty()
    .withMessage('No puede ser vacio')
    .bail()
    .custom(validateToken),
  allValidator,
]



export const forgotPasswordValidator = [
  // Validación del correo electrónico
  body('email')
    .isEmail()
    .withMessage('Debe proporcionar un correo electrónico válido.')
    .bail()
    .normalizeEmail(),

  // Validación del código de verificación
  body('code')
    .isString()
    .withMessage('El código de verificación debe ser una cadena de texto.')
    .bail()
    .isLength({ min: 4, max: 4 })
    .withMessage('El código de verificación debe tener exactamente 4 dígitos.'),

  // Validación de la nueva contraseña
  body('password')
    .isString().withMessage('La contraseña debe ser una cadena de caracteres.')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres.')
    .matches(/[a-zA-Z]/).withMessage('La contraseña debe contener al menos una letra.')
    .matches(/\d/).withMessage('La contraseña debe contener al menos un número.')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('La contraseña debe contener al menos un carácter especial.'),

  // Validación de la confirmación de la nueva contraseña
  body('confirmPassword')
    .isString()
    .withMessage('La confirmación de la nueva contraseña debe ser una cadena de texto.')
    .bail()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Las contraseñas no coinciden.');
      }
      return true;
    }),


    allValidator,
  
  // Agregar aquí otras validaciones globales si es necesario
];