import { NextFunction, Request, Response } from 'express'
import createError from 'http-errors'
import { changePasswordService, createUserService } from '../services/create/user.create'
import sequelize from 'sequelize'
import { updateUserService } from '../services/update/user.update'
import {
  findRoutesByRoleService,
  findUserWhereService,
  getUserService,
  reportUserMoneyService,
} from '../services/find/user.find'
import { IToken } from '../../auth/interfaz/auth.interfaz'
import ApiResponse from '../../../utils/response.ts/response'
export const addUserController = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.user as IToken

  const {
    name_p,
    name_s,
    lastname_m,
    lastname_p,
    number_document,
    type_document_id,
    email,
    gender_id,
    number_phone_1,
    number_phone_2,
    address,
    birthdate,
    salary,
    level_id,
    rol_id,
    password,
    code
  } = req.body

  try {
    const newUser = await createUserService({
      name_p,
      name_s,
      lastname_m,
      lastname_p,
      number_document,
      type_document_id,
      email,
      gender_id,
      number_phone_1,
      number_phone_2,
      address,
      birthdate,
      salary,
      level_id,
      rol_id,
      password,
      created_by: +userId,
      code
    })
    const { password: _, salt, ...newUserData } = newUser.toJSON()
    ApiResponse.success(res, { newUserData })
  } catch (err: any) {
    if (err instanceof sequelize.ValidationError) {
      return next(createError(400, err))
    }
    next(createError(500, err))
  }
}

export const updateUserController = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.user as IToken
  const {
    name_p,
    name_s,
    lastname_m,
    lastname_p,
    number_document,
    type_document_id,
    email,
    gender_id,
    number_phone_1,
    number_phone_2,
    address,
    birthdate,
    salary,
    level_id,
    rol_id,
    status,
    code
  } = req.body

  const { user_id } = req.params

  try {
    const updatedUser = await updateUserService({
      where: { id: +user_id },
      payload: {
        name_p,
        name_s,
        lastname_m,
        lastname_p,
        number_document,
        type_document_id,
        email,
        gender_id,
        number_phone_1,
        number_phone_2,
        address,
        birthdate,
        salary,
        level_id,
        rol_id,
        status,
        code,
        updated_by: +userId,
      },
    })
    ApiResponse.success(res, updatedUser)
  } catch (err: any) {
    if (err instanceof sequelize.ValidationError) {
      return next(createError(400, err))
    }
    next(createError(500, err))
  }
}

export const toggleUserStatusController = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.user as IToken
  const { state } = req.body
  const { user_id } = req.params

  try {
    const updatedUser = await updateUserService({
      where: { id: +user_id },
      payload: { state, updated_by: +userId },
    })

    const message = state ? 'Usuario habilitado correctamente' : 'Usuario deshabilitado correctamente'
    ApiResponse.success(res, updatedUser)
  } catch (err: any) {
    if (err instanceof sequelize.ValidationError) {
      return next(createError(400, err))
    }
    next(createError(500, err))
  }
}

export const findUserByIdControllers = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.params

  try {
    const user = await findUserWhereService({ where: { id: user_id } })

    if (!user) {
      return next(createError(404, 'Usuario no encontrado'))
    }
    ApiResponse.success(res, user)
  } catch (err: any) {
    if (err instanceof sequelize.ValidationError) {
      return next(createError(400, err))
    }
    next(createError(500, err))
  }
}

export const getUsersController = async (req: Request, res: Response, next: NextFunction) => {
  const { page, limit, order, search, rol } = req.query

  try {
    const users = await getUserService({
      page: +(page || 1),
      limit: +(limit || 50),
      order: (order || 'desc').toString(),
      search: (search || '')?.toString(),
      rol: Number(rol) || 0,
    })
    ApiResponse.success(res, users)
  } catch (err: any) {
    if (err instanceof sequelize.ValidationError) {
      return next(createError(400, err))
    }
    next(createError(500, err))
  }
}
export const reportUserMoneyController = async (req: Request, res: Response, next: NextFunction) => {
  const { dateInit, dateEnd } = req.query

  try {
    const users = await reportUserMoneyService({
      dateInit: (dateInit || '').toString(),
      dateEnd: (dateEnd || '').toString(),
    })
    ApiResponse.success(res, users)
  } catch (err: any) {
    if (err instanceof sequelize.ValidationError) {
      return next(createError(400, err))
    }
    next(createError(500, err))
  }
}
export const changePasswordController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { password ,code, email} = req.body
    const routes = await changePasswordService({ password ,code, email })
    
    ApiResponse.success(res, routes)
  } catch (err: any) {
    if (err instanceof sequelize.ValidationError) next(createError(400, err))
    next(createError(404, err))
  }
}

export const routerRoleController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rol } = req.user as IToken

    const routes = await findRoutesByRoleService({ roleId: rol })
    ApiResponse.success(res, routes)
  } catch (err: any) {
    if (err instanceof sequelize.ValidationError) next(createError(400, err))
    next(createError(404, err))
  }
}
