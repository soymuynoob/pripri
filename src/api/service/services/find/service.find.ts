import { QueryTypes, WhereOptions } from 'sequelize';
import { DataBase } from '../../../../database/index';
import { ServiceAttributes } from '../../models/service.model';

export const findServiceByIdService = async ({
  where
}: {
  where: WhereOptions<ServiceAttributes>
}) => {
  try {
    return await DataBase.instance.service.findOne({
      where,
    });
  } catch (err) {
    throw err;
  }
};

// export const getService = async ({
//   page,
//   limit,
//   order,
//   search,
//   all
// }: {
//   page: number;
//   limit: number;
//   order: string;
//   search: string;
//   all: number;
// }) => {
//   try {
//     const offset = (page - 1) * limit;
//     const searchPattern = `%${search}%`;

//     let whereClause = 'WHERE 1=1';
//     whereClause += all === 1 ? "" : ' AND s.status = 1';
//     const replacements: any = {
//       limit,
//       offset
//     };

//     if (search && search.trim() !== '') {
//       whereClause += `
//         AND (
//           s.name LIKE :search OR 
//           level.value LIKE :search OR 
//           s.description LIKE :search
//         )`;
//       replacements.search = searchPattern;
//     }

//     const dataQuery = `
//       SELECT 
//         s.id, 
//         s.name, 
//         s.level_id, 
//         level.value as level,
//         s.description, 
//         s.status
//       FROM service AS s
//         INNER JOIN general_variables as level on (level.id_code = s.level_id)
//       ${whereClause}
//       ORDER BY s.created_date ${order}
//       LIMIT :limit OFFSET :offset;
//     `;

//     const countQuery = `
//       SELECT COUNT(*) as total
//       FROM service AS s
//         INNER JOIN general_variables as level on (level.id_code = s.level_id)
//       ${whereClause};
//     `;
// console.log(dataQuery);

//     const results = await DataBase.instance.sequelize.query(dataQuery, {
//       replacements,
//       type: QueryTypes.SELECT,
//       logging: console.log
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


export const getService = async ({
  page,
  limit,
  order,
  search,
  all,
  dateInit,
  dateEnd
}: {
  page: number;
  limit: number;
  order: string;
  search: string;
  all: number;
  dateInit?: string; // Opcional
  dateEnd?: string; // Opcional
}) => {
  try {
    const offset = (page - 1) * limit;
    const searchPattern = `%${search}%`;

    let whereClause = 'WHERE 1=1';
    whereClause += all === 1 ? "" : ' AND s.status = 1';

    // Agregar filtros de fecha
    if (dateInit && dateEnd) {
      whereClause += `
        AND s.created_date BETWEEN :dateInit AND :dateEnd
      `;
    }

    const replacements: any = {
      limit,
      offset
    };

    if (search && search.trim() !== '') {
      whereClause += `
        AND (
          s.name LIKE :search OR 
          level.value LIKE :search OR 
          s.description LIKE :search
        )`;
      replacements.search = searchPattern;
    }

    // Incluir fechas en los replacements
    if (dateInit && dateEnd) {
      replacements.dateInit = dateInit;
      replacements.dateEnd = dateEnd;
    }

    const dataQuery = `
      SELECT 
        s.id, 
        s.name, 
        s.level_id, 
        level.value as level,
        s.description, 
        s.status
      FROM service AS s
        INNER JOIN general_variables as level on (level.id_code = s.level_id)
      ${whereClause}
      ORDER BY s.created_date ${order}
      LIMIT :limit OFFSET :offset;
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM service AS s
        INNER JOIN general_variables as level on (level.id_code = s.level_id)
      ${whereClause};
    `;

    console.log(dataQuery);

    const results = await DataBase.instance.sequelize.query(dataQuery, {
      replacements,
      type: QueryTypes.SELECT,
      logging: console.log
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

// export const getwidgetService = async () => {
//   try {

//     const dataQuery = `
//         SELECT 
//         -- Conteo de cuántos servicios han sido vinculados a un ticket
//         (SELECT COUNT(*) 
//         FROM ticket 
//         WHERE service_id IS NOT NULL) AS total_servicios_asignados,

//         -- Conteo de cuántos servicios están con status activo
//         (SELECT COUNT(*) 
//         FROM service 
//         WHERE status = 1) AS total_servicios_activos,

//         -- Conteo de cuántos servicios hay en total (sin duplicados, incluyendo activos y desactivados)
//         (SELECT COUNT(DISTINCT id) 
//         FROM service) AS total_servicios,

//         -- Conteo de cuántos tickets hay con servicios que tienen una fecha futura activa
//         (SELECT COUNT(*) 
//         FROM ticket 
//         WHERE DATE(date) >= CURDATE()) AS total_tickets_futuro;

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

export const getwidgetService = async ({
  dateInit,
  dateEnd
}: {
  dateInit?: string; // Opcional
  dateEnd?: string; // Opcional
}) => {
  try {
    // Inicializar la cláusula WHERE para los filtros de fecha
    let dateFilterForTicket = '';
    let dateFilterForFutureTickets = '';
    const replacements: any = {};

    if (dateInit && dateEnd) {
      dateFilterForTicket = `
        AND DATE(date) BETWEEN :dateInit AND :dateEnd
      `;
      dateFilterForFutureTickets = `
        AND DATE(date) BETWEEN :dateInit AND :dateEnd
      `;
      replacements.dateInit = dateInit;
      replacements.dateEnd = dateEnd;
    }

    const dataQuery = `
        SELECT 
        -- Conteo de cuántos servicios han sido vinculados a un ticket
        (SELECT COUNT(*) 
         FROM ticket 
         WHERE service_id IS NOT NULL ${dateFilterForTicket}) AS total_servicios_asignados,

        -- Conteo de cuántos servicios están con status activo
        (SELECT COUNT(*) 
         FROM service 
         WHERE status = 1) AS total_servicios_activos,

        -- Conteo de cuántos servicios hay en total (sin duplicados, incluyendo activos y desactivados)
        (SELECT COUNT(DISTINCT id) 
         FROM service) AS total_servicios,

        -- Conteo de cuántos tickets hay con servicios que tienen una fecha futura activa
        (SELECT COUNT(*) 
         FROM ticket 
         WHERE DATE(date) >= CURDATE() ${dateFilterForFutureTickets}) AS total_tickets_futuro;
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
