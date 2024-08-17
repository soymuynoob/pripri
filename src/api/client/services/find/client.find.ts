import { QueryTypes, WhereOptions } from 'sequelize'
import { DataBase } from '../../../../database/index'

export const findClientByIdService = async ({
  where
}: {
  where: WhereOptions<any>
}) => {
  try {
    return await DataBase.instance.client.findOne({
      where,
    })
  } catch (err) {
    throw err
  }
}

// export const getClientService = async ({
//   page,
//   limit,
//   order,
//   search,
//   dateInit,
//   dateEnd
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
 
//              c.number_phone_1 LIKE :search OR 
//           c.address LIKE :search OR
//           c.full_name LIKE :search
//         )`;
//       replacements.search = searchPattern;
//     }

//     const dataQuery = `
//       SELECT 
//         c.id, 
//       --  c.name_p, 
//       --  c.name_s, 
//       --  c.lastname_m, 
//       --  c.lastname_p, 
//       --  c.number_document, 
//       --  c.email, 
//         c.number_phone_1, 
//       --  c.number_phone_2, 
//         c.address, 
//       --  type_document.value as type_document, 
//         gender.value as gender,
//         c.full_name,
//         c.full_lastname,
//         c.status
//       FROM client AS c
//       -- INNER JOIN general_variables AS type_document ON c.type_document_id = type_document.id_code
//       INNER JOIN general_variables AS gender ON c.gender_id = gender.id_code
//       ${whereClause}
//       ORDER BY c.created_date ${order}
//       LIMIT :limit OFFSET :offset;
//     `;

//     const countQuery = `
//       SELECT COUNT(*) as total
//       FROM client AS c
//      -- INNER JOIN general_variables AS type_document ON c.type_document_id = type_document.id_code
//       INNER JOIN general_variables AS gender ON c.gender_id = gender.id_code
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
//     console.log(err);

//     throw err;
//   }
// };


export const getClientService = async ({
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
  dateInit?: string; // Cambiado a opcional
  dateEnd?: string; // Cambiado a opcional
}) => {
  try {
    const offset = (page - 1) * limit;
    const searchPattern = `%${search}%`;

    let whereClause = 'WHERE 1=1';
    const replacements: any = {
      limit,
      offset
    };

    if (search && search.trim() !== '') {
      whereClause += `
        AND (
          c.number_phone_1 LIKE :search OR 
          c.address LIKE :search OR
          c.full_name LIKE :search
        )`;
      replacements.search = searchPattern;
    }

    // Agregar filtros de fecha
    if (dateInit && dateEnd) {
      whereClause += `
        AND c.created_date BETWEEN :dateInit AND :dateEnd`;
      replacements.dateInit = dateInit;
      replacements.dateEnd = dateEnd;
    }

    const dataQuery = `
      SELECT 
        c.id, 
        c.number_phone_1, 
        c.address, 
        gender.value as gender,
        c.full_name,
        c.full_lastname,
        c.status
      FROM client AS c
      INNER JOIN general_variables AS gender ON c.gender_id = gender.id_code
      ${whereClause}
      ORDER BY c.created_date ${order}
      LIMIT :limit OFFSET :offset;
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM client AS c
      INNER JOIN general_variables AS gender ON c.gender_id = gender.id_code
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
    console.log(err);
    throw err;
  }
};


export const getwidgetClient = async ({
  dateInit,
  dateEnd
}: {
  dateInit?: string; // Opcional
  dateEnd?: string; // Opcional
}) => {
  try {
    // Inicializar la cláusula WHERE para los filtros de fecha
    let dateFilter = '';
    const replacements: any = {};

    if (dateInit && dateEnd) {
      dateFilter = `
        AND t.created_date BETWEEN :dateInit AND :dateEnd
      `;
      replacements.dateInit = dateInit;
      replacements.dateEnd = dateEnd;
    }

    const dataQuery = `
      SELECT 
        -- 1. Clientes con tickets "Por Confirmar"
        (SELECT COUNT(DISTINCT c.id)
         FROM client c
         JOIN ticket t ON c.id = t.client_id
         JOIN general_variables gv ON t.service_status_id = gv.id_code
         WHERE gv.value = 'POR CONFIRMAR' ${dateFilter}) AS clientes_con_ticket_por_confirmar,
        
        -- 2. Total de clientes
        (SELECT COUNT(*)
         FROM client
         WHERE status = 1) AS total_clientes,
        
        -- 3. Clientes con tickets "Pendiente por Realizar"
        (SELECT COUNT(DISTINCT c.id)
         FROM client c
         JOIN ticket t ON c.id = t.client_id
         JOIN general_variables gv ON t.service_status_id = gv.id_code
         WHERE gv.value = 'POR REALIZAR' ${dateFilter}) AS clientes_con_ticket_pendiente_por_realizar,
        
        -- 4. Clientes con tickets "Pendiente por Pagar"
        (SELECT COUNT(DISTINCT c.id)
         FROM client c
         JOIN ticket t ON c.id = t.client_id
         JOIN general_variables gv ON t.status_payment_id = gv.id_code
         WHERE gv.value = 'POR PAGAR' ${dateFilter}) AS clientes_con_ticket_pendiente_por_pagar,

       
       -- 5. Monto total pendiente por pagar
        (SELECT ROUND(SUM(CAST(t.amount AS DECIMAL(10, 2))), 0)
         FROM ticket t
         JOIN general_variables gv ON t.status_payment_id = gv.id_code
         WHERE gv.value = 'POR PAGAR' ${dateFilter}) AS monto_total_pendiente_por_pagar;
    `;

    const results = await DataBase.instance.sequelize.query(dataQuery, {
      replacements,
      type: QueryTypes.SELECT,
    });

    return {
      ...results[0],
    };
  } catch (err) {
    throw err;
  }
};

