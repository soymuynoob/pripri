import { QueryTypes, WhereOptions } from 'sequelize';
import { DataBase } from '../../../../database/index';

export const findExpenseByIdService = async ({
  where
}: {
  where: WhereOptions<any>
}) => {
  try {
    return await DataBase.instance.expense.findOne({
      where,
    });
  } catch (err) {
    throw err;
  }
};

// export const getExpenseService = async ({
//   page,
//   limit,
//   order,
//   search,
//   dateInit,
//    dateEnd
// }: {
//   page: number;
//   limit: number;
//   order: string;
//   search: string;
//   dateInit: string;
//   dateEnd: string;
// }) => {
//   try {
//     const offset = (page - 1) * limit;
//     const searchPattern = `%${search}%`;

//     let whereClause = 'WHERE 1=1';
//     const replacements: any = {
//       limit,
//       offset
//     };

//     if (search && search.trim() !== '') {
//       whereClause += `
//         AND (
//           coin.value LIKE :search OR 
//           type_expense.value LIKE :search OR 
//           type_payment.value  LIKE :search OR 
//           expense_for.value LIKE :search OR 
//           e.description LIKE :search OR 
//           e.amount LIKE :search
//         )`;
//       replacements.search = searchPattern;
//     }

//     const dataQuery = `
//       SELECT 
//         e.id, 
//         e.type_coin_id, 
//         coin.value as coin,
//         e.type_expense_id, 
//         type_expense.value as type_expense,
//         e.type_payment_id, 
//         type_payment.value as type_payment,
//         e.expense_for_id, 
//         expense_for.value as expense_for, 
//         e.description, 
//         e.amount,
//         e.status
//       FROM expense AS e
//         INNER JOIN general_variables as coin on (coin.id_code = e.type_coin_id)
//         INNER JOIN general_variables as type_expense on  (type_expense.id_code = e.type_expense_id)
//         INNER JOIN general_variables as type_payment on (type_payment.id_code = e.type_payment_id)
//         INNER JOIN general_variables as expense_for on (expense_for.id_code = e.expense_for_id)
//       ${whereClause}
//       ORDER BY  e.created_date ${order}
//       LIMIT :limit OFFSET :offset;
//     `;

//     const countQuery = `
//       SELECT COUNT(*) as total
//       FROM expense AS e
//         INNER JOIN general_variables as coin on (coin.id_code = e.type_coin_id)
//         INNER JOIN general_variables as type_expense on  (type_expense.id_code = e.type_expense_id)
//         INNER JOIN general_variables as type_payment on (type_payment.id_code = e.type_payment_id)
//         INNER JOIN general_variables as expense_for on (expense_for.id_code = e.expense_for_id)
      
//       ${whereClause};
//     `;

//     const results = await DataBase.instance.sequelize.query(dataQuery, {
//       replacements,
//       type: QueryTypes.SELECT
//     });

//     const countResult: any = await DataBase.instance.sequelize.query(countQuery, {
//       replacements,
//       type: QueryTypes.SELECT
//     });

//     const totalRecords = countResult[0].total;

//     return {
//       results,
//       totalRecords,
//       totalPages: Math.ceil(totalRecords / limit),
//       currentPage: page
//     };
//   } catch (err) {
//     throw err;
//   }
// };


export const getExpenseService = async ({
  page,
  limit,
  order,
  search,
  dateInit,
  dateEnd
}: {
  page: number;
  limit: number;
  order: string;
  search: string;
  dateInit: string;
  dateEnd: string;
}) => {
  try {
    const offset = (page - 1) * limit;
    const searchPattern = `%${search}%`;

    let whereClause = 'WHERE 1=1';
    const replacements: any = {
      limit,
      offset
    };

    // Agregar filtros de búsqueda
    if (search && search.trim() !== '') {
      whereClause += `
        AND (
          coin.value LIKE :search OR 
          type_expense.value LIKE :search OR 
          type_payment.value  LIKE :search OR 
          expense_for.value LIKE :search OR 
          e.description LIKE :search OR 
          e.amount LIKE :search
        )`;
      replacements.search = searchPattern;
    }

    // Agregar filtros de fecha
    if (dateInit && dateEnd) {
      whereClause += `
        AND e.created_date BETWEEN :dateInit AND :dateEnd`;
      replacements.dateInit = dateInit;
      replacements.dateEnd = dateEnd;
    }

    const dataQuery = `
      SELECT 
        e.id, 
        e.type_coin_id, 
        coin.value as coin,
        e.type_expense_id, 
        type_expense.value as type_expense,
        e.type_payment_id, 
        type_payment.value as type_payment,
        e.expense_for_id, 
        expense_for.value as expense_for, 
        e.description, 
        e.amount,
        e.status
      FROM expense AS e
        INNER JOIN general_variables as coin on (coin.id_code = e.type_coin_id)
        INNER JOIN general_variables as type_expense on  (type_expense.id_code = e.type_expense_id)
        INNER JOIN general_variables as type_payment on (type_payment.id_code = e.type_payment_id)
        INNER JOIN general_variables as expense_for on (expense_for.id_code = e.expense_for_id)
      ${whereClause}
      ORDER BY e.created_date ${order}
      LIMIT :limit OFFSET :offset;
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM expense AS e
        INNER JOIN general_variables as coin on (coin.id_code = e.type_coin_id)
        INNER JOIN general_variables as type_expense on  (type_expense.id_code = e.type_expense_id)
        INNER JOIN general_variables as type_payment on (type_payment.id_code = e.type_payment_id)
        INNER JOIN general_variables as expense_for on (expense_for.id_code = e.expense_for_id)
      ${whereClause};
    `;

    const results = await DataBase.instance.sequelize.query(dataQuery, {
      replacements,
      type: QueryTypes.SELECT
    });

    const countResult: any = await DataBase.instance.sequelize.query(countQuery, {
      replacements,
      type: QueryTypes.SELECT
    });

    const totalRecords = countResult[0].total;

    return {
      results,
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
      currentPage: page
    };
  } catch (err) {
    throw err;
  }
};

// export const getwidgetExpense = async () => {


//   try {

//     const dataQuery = `
//       SELECT 
//     -- Conteo y suma para Egresos
//     (SELECT COUNT(*)
//      FROM expense e
//      JOIN general_variables gv ON e.type_expense_id = gv.id_code
//      WHERE gv.value = 'Egreso' AND e.status = 1) AS conteo_egresos,
    
//     (SELECT SUM(CAST(e.amount AS DECIMAL(10, 2)))
//      FROM expense e
//      JOIN general_variables gv ON e.type_expense_id = gv.id_code
//      WHERE gv.value = 'Egreso' AND e.status = 1) AS suma_egresos,

//     -- Conteo y suma para Ingresos
//     (SELECT COUNT(*)
//      FROM expense e
//      JOIN general_variables gv ON e.type_expense_id = gv.id_code
//      WHERE gv.value = 'Ingreso' AND e.status = 1) AS conteo_ingresos,

//     (SELECT SUM(CAST(e.amount AS DECIMAL(10, 2)))
//      FROM expense e
//      JOIN general_variables gv ON e.type_expense_id = gv.id_code
//      WHERE gv.value = 'Ingreso' AND e.status = 1) AS suma_ingresos;

//     `;

//     const results = await DataBase.instance.sequelize.query(dataQuery, {
//       type: QueryTypes.SELECT,
//     });



//     return {
//       ...results[0],
//     };
//   } catch (err) {
//     throw err;
//   }
// };


export const getwidgetExpense = async ({
  dateInit,
  dateEnd
}: {
  dateInit: string;
  dateEnd: string;
}) => {
  try {
    // Consulta con filtros de fecha
    const dataQuery = `
      SELECT 
        -- Conteo y suma para Egresos
        (SELECT COUNT(*)
         FROM expense e
         JOIN general_variables gv ON e.type_expense_id = gv.id_code
         WHERE gv.value = 'Egreso' AND e.status = 1
           AND e.created_date BETWEEN :dateInit AND :dateEnd) AS conteo_egresos,
        
        (SELECT SUM(CAST(e.amount AS DECIMAL(10, 2)))
         FROM expense e
         JOIN general_variables gv ON e.type_expense_id = gv.id_code
         WHERE gv.value = 'Egreso' AND e.status = 1
           AND e.created_date BETWEEN :dateInit AND :dateEnd) AS suma_egresos,

        -- Conteo y suma para Ingresos
        (SELECT COUNT(*)
         FROM expense e
         JOIN general_variables gv ON e.type_expense_id = gv.id_code
         WHERE gv.value = 'Ingreso' AND e.status = 1
           AND e.created_date BETWEEN :dateInit AND :dateEnd) AS conteo_ingresos,

        (SELECT SUM(CAST(e.amount AS DECIMAL(10, 2)))
         FROM expense e
         JOIN general_variables gv ON e.type_expense_id = gv.id_code
         WHERE gv.value = 'Ingreso' AND e.status = 1
           AND e.created_date BETWEEN :dateInit AND :dateEnd) AS suma_ingresos;
    `;

    const results = await DataBase.instance.sequelize.query(dataQuery, {
      replacements: { dateInit, dateEnd },
      type: QueryTypes.SELECT,
    });

    return {
      ...results[0],
    };
  } catch (err) {
    throw err;
  }
};
