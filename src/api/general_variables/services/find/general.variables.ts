import { DataBase } from '../../../../database'
import { GeneralVariablesAttributes } from '../../models/general.variables.model'
import { Op, QueryTypes, Sequelize } from 'sequelize';

// export const getListGeneralVariablesService = async ({
//   order,
//   page,
//   limit,
//   ref
// }: {
//   order: string,
//   page: number,
//   limit: number,
//   ref: string
// }) => {
//   try {
//     const offset: number = (page - 1) * limit;
// console.log({ref});

//     const { count, rows } = await DataBase.instance.general_variables.findAndCountAll({
//       where: {
//         [Op.or]: [
//           { ref1: { [Op.like]: `${ref}` } },
//           { ref2: { [Op.like]: `${ref}` } },
//           { ref3: { [Op.like]: `${ref}` } },
//           { ref4: { [Op.like]: `${ref}` } }
//         ]
//       },
//       order: [['created_date', order]],
//       limit,
//       offset,
//       logging:console.log
//     });

//     return { page, count, rows };
//   } catch (err) {
//     throw err;
//   }
// };
export const getListGeneralVariablesService = async ({
  order,
  page,
  limit,
  ref
}: {
  order: string,
  page: number,
  limit: number,
  ref: string
}) => {
  try {
    const offset: number = (page - 1) * limit;

    const whereCondition = ref ? {
      [Op.or]: [
        { ref1: { [Op.like]: `%${ref}%` } },  // Añadido el % para buscar en cualquier parte del texto
        { ref2: { [Op.like]: `%${ref}%` } },
        { ref3: { [Op.like]: `%${ref}%` } },
        { ref4: { [Op.like]: `%${ref}%` } }
      ]
    } : {};

    const { count, rows } = await DataBase.instance.general_variables.findAndCountAll({
      where: whereCondition,
      order: [['ref1', order]],
      limit,
      offset,
      logging: console.log
    });

    return { page, count, rows };
  } catch (err) {
    throw err;
  }
};
export const getListGeneralVariablesByRefService = async ({
  ref
}: {
  ref: string
}) => {
  try {

    const whereCondition = ref ? {
      [Op.or]: [
        { ref1: { [Op.like]: `${ref}` } },  // Añadido el % para buscar en cualquier parte del texto
        // { ref2: { [Op.like]: `%${ref}%` } },
        // { ref3: { [Op.like]: `%${ref}%` } },
        // { ref4: { [Op.like]: `%${ref}%` } }
      ]
    } : {};

    const { count, rows } = await DataBase.instance.general_variables.findAndCountAll({
      where: { ...whereCondition, status: 1 }
    });

    return { rows };
  } catch (err) {
    throw err;
  }
};
export const refNorepeatService = async () => {
  try {


    const rows = await DataBase.instance.general_variables.findAll({
      attributes: [
        [Sequelize.fn('DISTINCT', Sequelize.col('ref1')), 'ref1']  // Obtener solo ref1 y sin duplicados
      ],
      logging: console.log
    });

    return { rows };
  } catch (err) {
    throw err;
  }
};

export const findGeneralVariablesByIdCode = async (
  { id_code }: { id_code: number }
): Promise<GeneralVariablesAttributes> => {
  try {
    return (
      await DataBase.instance.general_variables.findOne({
        where: {
          id: id_code,
        },
      })
    )?.get({ plain: true })!
  } catch (err) {
    throw err
  }
}

export const getwidgetVar = async () => {
  try {

    const dataQuery = `
     SELECT 
    (SELECT COUNT(*) 
     FROM general_variables) AS total_variables,

    (SELECT SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) 
     FROM general_variables) AS activos,

    (SELECT SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) 
     FROM general_variables) AS no_activos,

    (SELECT COUNT(DISTINCT ref1) 
     FROM general_variables) AS conteo_ref1_unicos;

    `;

    const results = await DataBase.instance.sequelize.query(dataQuery, {
      type: QueryTypes.SELECT,
    });



    return {
      ...results[0],
    };
  } catch (err) {
    throw err;
  }
};