import { Router } from "express";
import {
  createGeneralVariablesController,
  findGeneralVariablesByIdCodeController,
  getListGeneralVariablesByRefController,
  getListGeneralVariablesController,
  getwidgetvarController,
  refNorepeatController,
  toggleGeneralVariablesStatusController,
  updateGeneralVariablesController
} from "../controllers/general.variables.controller";

import { allValidator } from "../../../shared/express.validator";
import { createGeneralVariablesValidator, getGeneralvariablesByRef1Validator, idCodeValidator } from "../middleware/general_variables.validator";

export const router: Router = Router();

// Ruta para obtener todas las variables generales
router.get('/all/code',allValidator, getListGeneralVariablesController);

router.get('/all/code/no-repeat',allValidator, refNorepeatController);

// Ruta para obtener una variable general por su código
router.get('/:id_code', idCodeValidator,allValidator, findGeneralVariablesByIdCodeController);

// Ruta para obtener variables generales por ref1
router.get('/ref/:ref', getGeneralvariablesByRef1Validator,allValidator, getListGeneralVariablesByRefController);

// Ruta para crear una nueva variable general
router.post('', createGeneralVariablesValidator,allValidator, createGeneralVariablesController);

// Ruta para actualizar una variable general por su ID
router.put('/:id_code', idCodeValidator,allValidator, updateGeneralVariablesController);

// Ruta para deshabilitar una variable general por su ID
router.delete('/:id_code', idCodeValidator,allValidator, toggleGeneralVariablesStatusController);

// widget 
router.get('/widget/var', allValidator, getwidgetvarController)
