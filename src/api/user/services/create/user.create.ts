import CryptoJS from 'crypto-js'
import { UserAttributes } from '../../models/user.model'
import { DataBase } from '../../../../database'
import { momentCustom } from '../../../../utils/moment'

export const createUserService = async ({
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
  created_by,
  code,
}: UserAttributes) => {
  try {
    // Generar una sal aleatoria y encriptar la contraseña
    const salt = CryptoJS.lib.WordArray.random(30)
    const hashpwd = CryptoJS.PBKDF2(password!, salt.toString(), {
      iterations: 10000,
      keySize: 10,
    })

    // Crear el nuevo usuario en la base de datos
    const newUser = await DataBase.instance.user.create({
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
      state: true, // Estado por defecto al crear el usuario
      password: hashpwd.toString(),
      salt: salt.toString(),
      created_by,
      created_date: momentCustom,
      code,
    })

    // Se retornar el usuario creado
    return newUser
  } catch (err) {
    throw err
  }
}

export const changePasswordService = async ({ email, code, password }: any) => {
  try {
    // Generar una sal aleatoria y encriptar la contraseña
    const salt = CryptoJS.lib.WordArray.random(30)
    const hashpwd = CryptoJS.PBKDF2(password!, salt.toString(), {
      iterations: 10000,
      keySize: 10,
    })

    const userData = await DataBase.instance.user.findOne({ where: { email, code } })

    if (!userData) {
      throw new Error('No se encontro usuario con la combinacion de codigo y correo.')
    }
    const newUser = await DataBase.instance.user.update(
      {
        password: hashpwd.toString(),
        salt: salt.toString(),
      },
      { where: { email } }
    )

    return newUser
  } catch (err) {
    throw err
  }
}
